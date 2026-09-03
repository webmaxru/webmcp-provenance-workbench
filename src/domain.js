import { dossier, sources, demoEvents, demoLinks, claims } from "./seed.js";

export function stableHash(value) {
  const normalize=input=>Array.isArray(input)?input.map(normalize):(input&&typeof input==="object"?Object.fromEntries(Object.keys(input).sort().map(key=>[key,normalize(input[key])])):input);
  const text = JSON.stringify(normalize(value));
  let hash = 2166136261;
  for (let i=0;i<text.length;i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return `h-${(hash >>> 0).toString(16).padStart(8,"0")}`;
}

export function createInitialState() {
  return { dossier, sources:structuredClone(sources), events:[], links:[], claims:structuredClone(claims), assessments:{}, stateVersion:1, phase:"intake", draft:null, approval:null, exports:{}, ledger:[] };
}

export function assertVersion(state, expected) {
  if (expected !== state.stateVersion) throw new Error(`stale_state: expected v${expected}, current state is v${state.stateVersion}. Re-read and retry.`);
}

export function graphSnapshot(state) {
  return { events:state.events, links:state.links, assessments:state.assessments };
}

export function graphHash(state) { return stableHash(graphSnapshot(state)); }

function sourceSupportsEvent(source,event) {
  const structured=source.structured||{};
  const placeMatches=source.origin===event.place||structured.location===event.place;
  if(!placeMatches) return false;
  if(["family_inventory","photograph"].includes(source.type)) {
    return structured.owner===event.owner&&event.mode==="documented collection";
  }
  if(source.type==="auction_catalogue") {
    return event.owner==="Unidentified consignor"&&event.mode==="catalogue appearance";
  }
  if(source.type==="acquisition_card") {
    return structured.owner===event.owner&&structured.transferMode==="purchase"&&event.mode==="museum acquisition";
  }
  return false;
}

function eventSupportIssue(event,sourceMap,assessments,dossierContext) {
  const citedSources=event.sourceIds.map(id=>sourceMap.get(id));
  const unknown=event.sourceIds.filter((id,index)=>!citedSources[index]);
  if(unknown.length) return `invalid_source: ${unknown.join(", ")} not found.`;
  const excluded=event.sourceIds.filter(id=>assessments[id]==="excluded");
  if(excluded.length) return `unsupported_source: ${excluded.join(", ")} is excluded by the human assessment and cannot support a timeline event.`;
  const structurallyUnusable=citedSources.filter(source=>source.untrusted||source.structured?.ownershipEvidence===false||source.structured?.storageOnly||source.structured?.ownerAmbiguous||source.structured?.identityUncertain);
  if(structurallyUnusable.length) return `unsupported_source: ${structurallyUnusable.map(source=>source.id).join(", ")} contains no authority-bearing ownership evidence and cannot support a timeline event.`;
  const mismatched=citedSources.filter(source=>!sourceSupportsEvent(source,event));
  if(mismatched.length) return `unsupported_event: ${mismatched.map(source=>source.id).join(", ")} does not support the proposed owner, place, and mode.`;
  const sourceYears=citedSources.map(source=>source.year);
  const firstSupportedYear=Math.min(...sourceYears);
  const lastSupportedYear=Math.max(...sourceYears);
  const documentedCurrentHolding=event.end===2026&&event.owner===dossierContext.knownLocation&&citedSources.some(source=>source.type==="acquisition_card"&&source.structured?.owner===event.owner);
  if(event.start!==firstSupportedYear||(!documentedCurrentHolding&&event.end!==lastSupportedYear)) {
    return `unsupported_event: the cited records support ${firstSupportedYear}${firstSupportedYear===lastSupportedYear?"":` through ${lastSupportedYear}`}, not ${event.start} through ${event.end}.`;
  }
  return null;
}

export function validateEvent(event, sources, assessments={}, dossierContext=dossier) {
  if (!event || typeof event !== "object" || Array.isArray(event)) throw new Error("invalid_event: each event must be an object.");
  if (!/^E[0-9]+$/.test(event.id || "")) throw new Error("invalid_event: id must match E followed by digits.");
  for (const field of ["owner","place","mode"]) {
    if (typeof event[field] !== "string" || !event[field].trim() || event[field].length > 80) throw new Error(`invalid_event: ${field} must be a non-empty string of at most 80 characters.`);
  }
  if (!Number.isInteger(event.start) || !Number.isInteger(event.end) || event.start < 1912 || event.end > 2026) throw new Error("invalid_event: start and end must be integer years from 1912 through 2026.");
  if (event.start > event.end) throw new Error("invalid_event: start must not exceed end.");
  if (!Array.isArray(event.sourceIds) || event.sourceIds.length === 0 || event.sourceIds.length > 8) throw new Error("unsupported_event: every timeline event requires one to eight source IDs.");
  if (new Set(event.sourceIds).size !== event.sourceIds.length) throw new Error("invalid_event: source IDs must be unique within an event.");
  const byId=new Map(sources.map(source=>[source.id,source]));
  const supportIssue=eventSupportIssue(event,byId,assessments,dossierContext);
  if(supportIssue) throw new Error(supportIssue);
  if (!["high","medium","low","research_lead"].includes(event.confidence)) throw new Error("invalid_event: confidence must be high, medium, low, or research_lead.");
}

export function deriveChain(state) {
  const sourceMap=new Map(state.sources.map(source=>[source.id,source]));
  const eventSupport=state.events.map(event=>({ event, issue:eventSupportIssue(event,sourceMap,state.assessments,state.dossier) }));
  const supportedEvents=eventSupport.filter(item=>!item.issue).map(item=>item.event);
  const unsupportedTimelineEvents=eventSupport.filter(item=>item.issue).map(item=>({ eventId:item.event.id, reason:item.issue }));
  const sorted = [...supportedEvents].sort((a,b)=>a.start-b.start);
  const gaps=[]; const overlaps=[];
  for(let i=1;i<sorted.length;i++) {
    const prev=sorted[i-1], next=sorted[i];
    if(next.start > prev.end+1) gaps.push({ start:prev.end+1, end:next.start-1, reason:"No source-linked ownership event" });
    if(next.start <= prev.end && next.owner !== prev.owner) overlaps.push({ first:prev.id, second:next.id, reason:"Different owners overlap" });
  }
  const statuses={};
  for(const [id,claim] of Object.entries(state.claims)) {
    const links=state.links.filter(l=>l.claimId===id);
    const supporting=links.filter(l=>l.relation==="supports" && state.assessments[l.sourceId]!=="excluded");
    const contradicting=links.filter(l=>l.relation==="contradicts" && state.assessments[l.sourceId]!=="excluded");
    statuses[id]=contradicting.length ? "contested" : supporting.length ? "supported" : "unsupported";
    if(supporting.some(l=>state.assessments[l.sourceId]==="low")) statuses[id]="qualified";
  }
  const dimensionConflicts = state.sources.filter(s=>s.structured.dimensions && Math.abs(s.structured.dimensions[0]-state.dossier.dimensions[0])>3).map(s=>({ sourceId:s.id, expected:state.dossier.dimensions, observed:s.structured.dimensions }));
  const untrustedIgnored=state.sources.filter(s=>s.untrusted && s.structured.ownershipEvidence===false).map(s=>s.id);
  return { graphHash:graphHash(state), gaps, overlaps, dimensionConflicts, claimStatuses:statuses, unsupported:Object.entries(statuses).filter(([,s])=>s==="unsupported").map(([id])=>id), untrustedIgnored, supportedEventIds:supportedEvents.map(event=>event.id), unsupportedTimelineEvents };
}

export function addEvents(state, events, expectedVersion) {
  assertVersion(state, expectedVersion);
  if (!Array.isArray(events) || events.length === 0 || events.length > 8) throw new Error("invalid_events: provide one to eight timeline events.");
  events.forEach(e=>validateEvent(e,state.sources,state.assessments,state.dossier));
  const existing=new Set(state.events.map(e=>e.id));
  const incomingIds=events.map(e=>e.id);
  if(new Set(incomingIds).size!==incomingIds.length || incomingIds.some(id=>existing.has(id))) throw new Error("duplicate_event: event IDs must be unique.");
  state.events.push(...structuredClone(events)); mutate(state,"mapping"); return events.map(e=>e.id);
}

export function linkEvidence(state, link, expectedVersion) {
  assertVersion(state, expectedVersion);
  if(!link || typeof link!=="object" || Array.isArray(link)) throw new Error("invalid_link: provide an evidence-link object.");
  if(!state.claims[link.claimId]) throw new Error("invalid_claim: claim not found.");
  const source=state.sources.find(s=>s.id===link.sourceId);
  if(!source) throw new Error("invalid_source: source not found.");
  if(source.untrusted || source.structured?.ownershipEvidence===false) throw new Error("unsupported_source: this record contains no authority-bearing evidence and cannot support or contradict a claim.");
  if(!["supports","contradicts"].includes(link.relation)) throw new Error("invalid_relation: use supports or contradicts.");
  if(typeof link.locator!=="string" || link.locator.trim().length<2 || link.locator.length>100) throw new Error("invalid_locator: cite a source locator from 2 to 100 characters.");
  if(!state.links.some(l=>l.claimId===link.claimId&&l.sourceId===link.sourceId&&l.relation===link.relation)) state.links.push(structuredClone(link));
  mutate(state,"mapping"); return link;
}

export function setAssessment(state, sourceId, assessment, expectedVersion) {
  assertVersion(state,expectedVersion);
  if(!state.sources.some(s=>s.id===sourceId)) throw new Error("invalid_source: source not found.");
  if(!["normal","low","excluded"].includes(assessment)) throw new Error("invalid_assessment: use normal, low, or excluded.");
  state.assessments[sourceId]=assessment; mutate(state,"validation"); return deriveChain(state);
}

export function prepareLabel(state, expectedVersion, maxWords=120) {
  assertVersion(state,expectedVersion);
  if(!Number.isInteger(maxWords) || maxWords<70 || maxWords>140) throw new Error("invalid_max_words: maxWords must be an integer from 70 through 140.");
  const chain=deriveChain(state);
  if(!state.events.length) throw new Error("not_ready: map source-linked events before drafting.");
  const requiredEvidence=[
    {claimId:"C1",sourceId:"S1",relation:"supports"},
    {claimId:"C1",sourceId:"S2",relation:"supports"},
    {claimId:"C2",sourceId:"S5",relation:"supports"},
    {claimId:"C3",sourceId:"S6",relation:"contradicts"},
    {claimId:"C4",sourceId:"S7",relation:"supports"}
  ];
  const missingEvidence=requiredEvidence.filter(required=>!state.links.some(link=>link.claimId===required.claimId&&link.sourceId===required.sourceId&&link.relation===required.relation&&state.assessments[link.sourceId]!=="excluded"));
  if(missingEvidence.length) throw new Error(`not_ready: link the required cited evidence before drafting (${missingEvidence.map(item=>`${item.claimId}/${item.sourceId}/${item.relation}`).join(", ")}).`);
  const s4Low=state.assessments.S4==="low";
  const openGap=chain.gaps.find(g=>g.start<=1939&&g.end>=1943)||chain.gaps[0];
  const sentences=[
    { text:"Created in Prague in 1912, Evening Bridges is documented in the Novak family collection through 1938.", claims:["C1"], citations:["S1","S2"] },
    { text:openGap?`Its ownership between ${openGap.start} and ${openGap.end} remains undocumented.`:"Its ownership before the 1946 catalogue appearance remains undocumented.", claims:[], citations:[] },
    { text:"The painting appears in an illustrated Zurich catalogue in 1946.", claims:["C2"], citations:["S5"] },
    { text:`A 1943 consignment letter is ${s4Low?"retained only as a low-confidence research lead":"an unresolved research lead"}; its seller is unidentified.`, claims:[], citations:["S4"] },
    { text:"A 1952 customs record gives conflicting dimensions and may refer to a different object.", claims:["C3"], citations:["S6"] },
    { text:"Harbor Museum acquired the painting in 1978.", claims:["C4"], citations:["S7"] }
  ];
  let kept=[]; let count=0; for(const s of sentences){const words=s.text.split(/\s+/).length;if(count+words<=maxWords){kept.push(s);count+=words;}}
  const content={ audience:"general_public", sentences:kept, graphHash:chain.graphHash, stateVersion:state.stateVersion, unsupportedFactualSentences:0, openGaps:chain.gaps };
  content.draftHash=stableHash(content); state.draft=content; state.approval=null; state.phase="drafting"; return content;
}

export function approveDraft(state, actor="human") {
  if(!state.draft) throw new Error("not_ready: prepare a draft first.");
  if(state.draft.graphHash!==graphHash(state)) throw new Error("stale_draft: graph changed; prepare a new draft.");
  state.approval={ draftHash:state.draft.draftHash, graphHash:graphHash(state), stateVersion:state.stateVersion, actor, expiresAt:Date.now()+10*60_000, consumed:false };
  state.phase="approval"; return { approved:true, draftHash:state.draft.draftHash };
}

export function exportPacket(state, draftHash, idempotencyKey) {
  if(typeof draftHash!=="string" || !/^h-[a-f0-9]{8}$/.test(draftHash)) throw new Error("invalid_export: draftHash must match h- followed by eight lowercase hexadecimal characters.");
  if(typeof idempotencyKey!=="string" || idempotencyKey.length<8 || idempotencyKey.length>80 || !/^[A-Za-z0-9._-]+$/.test(idempotencyKey)) throw new Error("invalid_export: idempotencyKey must be 8 to 80 letters, digits, dots, underscores, or hyphens.");
  const currentGraphHash=graphHash(state);
  const requestFingerprint=stableHash({ draftHash, graphHash:currentGraphHash });
  const prior=state.exports[idempotencyKey];
  if(prior) {
    if(prior.requestFingerprint!==requestFingerprint) throw new Error("idempotency_conflict: this key was already used for a different draft or evidence graph.");
    return { ...prior.receipt, replayed:true };
  }
  const grant=state.approval;
  if(!grant || grant.consumed || grant.expiresAt<Date.now()) throw new Error("approval_required: review and approve this exact draft in the visible page.");
  if(grant.draftHash!==draftHash || grant.graphHash!==currentGraphHash || state.draft?.draftHash!==draftHash) throw new Error("approval_mismatch: approval does not match the current draft and graph.");
  const validation=deriveChain(state);
  const supportedEventIds=new Set(validation.supportedEventIds);
  const openQuestions=validation.gaps.map(gap=>`Who controlled the painting between ${gap.start} and ${gap.end}?`);
  openQuestions.push("Does S6 describe this object or another canvas?");
  const packet={ dossier:state.dossier, timeline:state.events.filter(event=>supportedEventIds.has(event.id)), evidenceLinks:state.links, sourceAssessments:state.assessments, validation, label:state.draft, openQuestions };
  const receipt={ receiptId:`P-${stableHash({draftHash,idempotencyKey}).slice(-6).toUpperCase()}`, draftHash, graphHash:currentGraphHash, stateVersion:state.stateVersion, approvedBy:grant.actor, exportedAt:new Date().toISOString(), packet, replayed:false };
  grant.consumed=true; state.exports[idempotencyKey]={ requestFingerprint, receipt }; state.phase="exported"; return receipt;
}

function mutate(state,phase){state.stateVersion++;state.phase=phase;state.draft=null;state.approval=null;}

export function loadGoldenPath(state) {
  state.events=structuredClone(demoEvents); state.links=structuredClone(demoLinks); state.stateVersion++; state.phase="validation"; state.draft=null; state.approval=null; return deriveChain(state);
}
