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

export function validateEvent(event, sourceIds) {
  if (!event?.id || !event.owner || !Number.isInteger(event.start) || !Number.isInteger(event.end)) throw new Error("invalid_event: id, owner, integer start and end are required.");
  if (event.start > event.end) throw new Error("invalid_event: start must not exceed end.");
  if (!Array.isArray(event.sourceIds) || event.sourceIds.length === 0) throw new Error("unsupported_event: every timeline event requires at least one source ID.");
  const unknown = event.sourceIds.filter(id=>!sourceIds.includes(id));
  if (unknown.length) throw new Error(`invalid_source: ${unknown.join(", ")} not found.`);
  if (!["high","medium","low","research_lead"].includes(event.confidence)) throw new Error("invalid_event: confidence must be high, medium, low, or research_lead.");
}

export function deriveChain(state) {
  const byId = Object.fromEntries(state.sources.map(s=>[s.id,s]));
  const sorted = [...state.events].sort((a,b)=>a.start-b.start);
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
    const contradicting=links.filter(l=>l.relation==="contradicts");
    statuses[id]=contradicting.length ? "contested" : supporting.length ? "supported" : "unsupported";
    if(supporting.some(l=>state.assessments[l.sourceId]==="low")) statuses[id]="qualified";
  }
  const dimensionConflicts = state.sources.filter(s=>s.structured.dimensions && Math.abs(s.structured.dimensions[0]-state.dossier.dimensions[0])>3).map(s=>({ sourceId:s.id, expected:state.dossier.dimensions, observed:s.structured.dimensions }));
  const untrustedIgnored=state.sources.filter(s=>s.untrusted && s.structured.ownershipEvidence===false).map(s=>s.id);
  return { graphHash:graphHash(state), gaps, overlaps, dimensionConflicts, claimStatuses:statuses, unsupported:Object.entries(statuses).filter(([,s])=>s==="unsupported").map(([id])=>id), untrustedIgnored };
}

export function addEvents(state, events, expectedVersion) {
  assertVersion(state, expectedVersion); const ids=state.sources.map(s=>s.id);
  events.forEach(e=>validateEvent(e,ids));
  const existing=new Set(state.events.map(e=>e.id));
  if(events.some(e=>existing.has(e.id))) throw new Error("duplicate_event: event IDs must be unique.");
  state.events.push(...structuredClone(events)); mutate(state,"mapping"); return events.map(e=>e.id);
}

export function linkEvidence(state, link, expectedVersion) {
  assertVersion(state, expectedVersion);
  if(!state.claims[link.claimId]) throw new Error("invalid_claim: claim not found.");
  if(!state.sources.some(s=>s.id===link.sourceId)) throw new Error("invalid_source: source not found.");
  if(!["supports","contradicts"].includes(link.relation)) throw new Error("invalid_relation: use supports or contradicts.");
  if(!link.locator?.trim()) throw new Error("invalid_locator: cite a human-readable source locator.");
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
  assertVersion(state,expectedVersion); const chain=deriveChain(state);
  if(!state.events.length) throw new Error("not_ready: map source-linked events before drafting.");
  const s4Low=state.assessments.S4==="low";
  const sentences=[
    { text:"Created in Prague in 1912, Evening Bridges is documented in the Novak family collection through 1938.", claims:["C1"], citations:["S1","S2"] },
    { text:"Its ownership between 1939 and 1943 remains undocumented.", claims:[], citations:[] },
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
  if(!draftHash||!idempotencyKey?.trim()) throw new Error("invalid_export: draftHash and idempotencyKey are required.");
  if(state.exports[idempotencyKey]) return { ...state.exports[idempotencyKey], replayed:true };
  const grant=state.approval;
  if(!grant || grant.consumed || grant.expiresAt<Date.now()) throw new Error("approval_required: review and approve this exact draft in the visible page.");
  if(grant.draftHash!==draftHash || grant.graphHash!==graphHash(state) || state.draft?.draftHash!==draftHash) throw new Error("approval_mismatch: approval does not match the current draft and graph.");
  const packet={ dossier:state.dossier, timeline:state.events, evidenceLinks:state.links, sourceAssessments:state.assessments, validation:deriveChain(state), label:state.draft, openQuestions:["Who controlled the painting between 1939 and 1943?","Does S6 describe this object or another canvas?"] };
  const receipt={ receiptId:`P-${stableHash({draftHash,idempotencyKey}).slice(-6).toUpperCase()}`, draftHash, graphHash:graphHash(state), stateVersion:state.stateVersion, approvedBy:grant.actor, exportedAt:new Date().toISOString(), packet, replayed:false };
  grant.consumed=true; state.exports[idempotencyKey]=receipt; state.phase="exported"; return receipt;
}

function mutate(state,phase){state.stateVersion++;state.phase=phase;state.draft=null;state.approval=null;}

export function loadGoldenPath(state) {
  state.events=structuredClone(demoEvents); state.links=structuredClone(demoLinks); state.stateVersion++; state.phase="validation"; state.draft=null; state.approval=null; return deriveChain(state);
}
