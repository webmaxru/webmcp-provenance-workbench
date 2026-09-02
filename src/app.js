import { createInitialState, graphHash, deriveChain, addEvents, linkEvidence, setAssessment, prepareLabel, approveDraft, exportPacket, loadGoldenPath, assertVersion } from "./domain.js";
import { registerWebMcpTools } from "./webmcp.js";

let state=createInitialState();
const $=id=>document.getElementById(id);
const escape=text=>String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

function addLedger(actor,action,summary,before=state.stateVersion,after=state.stateVersion){state.ledger.unshift({time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),actor,action,summary,before,after});}
function envelope(data,changed=true){return {ok:true,data,stateVersion:state.stateVersion,uiChanged:changed,validNextActions:state.draft?["human_review","export_approved_research_packet"]:["test_provenance_chain","prepare_public_label"]};}

const controller={
  get state(){return state}, graphHash:()=>graphHash(state),
  async runTool(name,fn){const before=state.stateVersion;const result=await fn();addLedger("agent",name,result?.data?.summary||"Site tool completed.",before,state.stateVersion);render();return result;},
  addEvents(events,expected){const ids=addEvents(state,events,expected);return envelope({createdEventIds:ids,graphHash:graphHash(state),summary:`Added ${ids.length} source-linked event(s).`});},
  linkEvidence(link,expected){const data=linkEvidence(state,link,expected);return envelope({link:data,derivedStatus:deriveChain(state).claimStatuses[link.claimId],summary:`Linked ${link.sourceId} to ${link.claimId}.`});},
  testChain(expected){assertVersion(state,expected);return envelope({...deriveChain(state),summary:"Validated gaps, conflicts, and claim coverage."},false);},
  setAssessment(sourceId,assessment,expected,rationale){const data=setAssessment(state,sourceId,assessment,expected);return envelope({sourceId,assessment,rationaleCategory:rationale,affectedClaims:Object.keys(data.claimStatuses),validation:data,summary:`Set ${sourceId} to ${assessment}; stale draft and approval revoked.`});},
  prepareLabel(expected,maxWords){const data=prepareLabel(state,expected,maxWords);return envelope({...data,approvalRequired:true,summary:"Prepared a cited, evidence-bound label for human review."});},
  exportPacket(draftHash,idempotencyKey){const receipt=exportPacket(state,draftHash,idempotencyKey);createDownloads(receipt);return envelope({receiptId:receipt.receiptId,draftHash:receipt.draftHash,graphHash:receipt.graphHash,replayed:receipt.replayed,unresolved:receipt.packet.openQuestions,summary:`Export receipt ${receipt.receiptId} created.`});}
};

function render(){
  $("state-chip").textContent=`v${state.stateVersion} · ${state.phase}`;
  const chain=deriveChain(state); $("graph-hash").textContent=state.events.length?chain.graphHash:"empty";
  $("coverage-pill").textContent=`${Object.values(chain.claimStatuses).filter(s=>s!=="unsupported").length} claims mapped`;
  renderTimeline(chain); renderSources(); renderGraph(chain); renderDraft(); renderLedger();
}

function renderTimeline(chain){
  const cards=[]; const sorted=[...state.events].sort((a,b)=>a.start-b.start);
  for(let i=0;i<sorted.length;i++){const event=sorted[i];if(i&&event.start>sorted[i-1].end+1)cards.push(`<article class="timeline-event gap"><time>${sorted[i-1].end+1}–${event.start-1}</time><strong>Unresolved gap</strong><small>No source-linked ownership event</small></article>`);cards.push(`<article class="timeline-event"><time>${event.start}${event.end!==event.start?`–${event.end}`:""}</time><strong>${escape(event.owner)}</strong><small>${escape(event.place)} · ${escape(event.mode)}<br>${event.sourceIds.join(", ")} · ${event.confidence}</small></article>`)}
  if(!cards.length)cards.push(`<article class="timeline-event"><time>1912</time><strong>Created in Prague</strong><small>Known object fact</small></article><article class="timeline-event gap"><time>1936–1978</time><strong>Map the sources</strong><small>The graph is intentionally empty.</small></article>`);
  $("timeline").innerHTML=cards.join("");
  const open=chain.gaps.find(g=>g.start<=1939&&g.end>=1943);$("gap-banner").textContent=open?`${open.start}–${open.end} remains undocumented. The workbench will not invent an owner.`:"The key 1939–1943 gap is still treated as unresolved research, even where leads exist.";
}

function renderSources(){
  $("sources").innerHTML=state.sources.map(s=>{const assessment=state.assessments[s.id]||"normal";return `<article class="source ${s.untrusted?"untrusted":""} ${assessment==="low"?"low":""}"><header><div><span class="meta">${s.id} · ${s.year} · ${escape(s.type.replaceAll("_"," "))}</span><h3>${escape(s.title)}</h3></div><span class="trust-badge">${s.untrusted?"untrusted content":assessment}</span></header><p>${escape(s.excerpt)}</p>${s.id==="S4"?`<button data-assess="S4">${assessment==="low"?"Restore normal confidence":"Treat as low confidence"}</button>`:""}</article>`}).join("");
  document.querySelectorAll("[data-assess]").forEach(btn=>btn.addEventListener("click",()=>{const before=state.stateVersion;const next=state.assessments.S4==="low"?"normal":"low";setAssessment(state,"S4",next,state.stateVersion);addLedger("human","set_source_assessment",`S4 set to ${next}; existing draft invalidated.`,before,state.stateVersion);render();}));
}

function renderGraph(chain){
  if(!state.links.length){$("graph").innerHTML='<div class="node empty-node">No edges yet. Each ownership claim needs a source locator.</div>';}else{$("graph").innerHTML=state.links.map(l=>`<div class="node source-node"><strong>${l.sourceId}</strong><span class="edge">${escape(l.locator)}</span></div><div class="node claim"><strong>${l.claimId}</strong> · ${chain.claimStatuses[l.claimId]}<span class="edge">${escape(state.claims[l.claimId].text)}</span></div>`).join("");}
  const issues=[...chain.gaps.map(g=>`${g.start}–${g.end}: ${g.reason}`),...chain.dimensionConflicts.map(c=>`${c.sourceId}: dimensions ${c.observed.join(" × ")} conflict with ${c.expected.join(" × ")}`),...chain.untrustedIgnored.map(id=>`${id}: quarantined as untrusted content; no ownership evidence`)];
  $("issues").innerHTML=(issues.length?issues:["No validations yet."]).map(i=>`<li>${escape(i)}</li>`).join("");
}

function renderDraft(){
  if(!state.draft){$("draft").className="draft empty";$("draft").textContent="Map the evidence before drafting.";$("draft-hash").textContent="not prepared";}else{$("draft").className="draft";$("draft").innerHTML=state.draft.sentences.map(s=>`${escape(s.text)} ${s.citations.map(c=>`<sup class="citation">${c}</sup>`).join(" ")}`).join(" ");$("draft-hash").textContent=state.draft.draftHash;}
  const current=state.draft&&state.draft.graphHash===graphHash(state);$("approval-check").disabled=!current;$("approve-draft").disabled=!current||!$("approval-check").checked||Boolean(state.approval);$("export-draft").disabled=!state.approval||state.approval.consumed;
  $("approval-status").textContent=state.approval?(state.approval.consumed?"Approval consumed. Same-key retries return the original receipt.":`Approved by human for ${state.approval.draftHash}.`):"Approval is page-held, single-use, and revoked by any graph change.";
}

function renderLedger(){$("ledger").innerHTML=state.ledger.map(e=>`<li><span class="actor">${escape(e.actor)} · ${escape(e.time)}</span><span><strong>${escape(e.action)}</strong><small>${escape(e.summary)} · v${e.before}→v${e.after}</small></span></li>`).join("")||'<li><span class="actor">page</span><span>Waiting for a human or site-tool action.</span></li>';$("ledger-count").textContent=`${state.ledger.length} events`;}

function packetMarkdown(receipt){const p=receipt.packet;return `# Tracebound research packet\n\nReceipt: ${receipt.receiptId}  \nDraft: ${receipt.draftHash}  \nGraph: ${receipt.graphHash}\n\n## Cited label\n\n${p.label.sentences.map(s=>`${s.text}${s.citations.length?` [${s.citations.join(", ")}]`:""}`).join(" ")}\n\n## Timeline\n${p.timeline.map(e=>`- ${e.start}–${e.end}: ${e.owner}, ${e.place} (${e.sourceIds.join(", ")})`).join("\n")}\n\n## Open questions\n${p.openQuestions.map(q=>`- ${q}`).join("\n")}\n\n> Synthetic case. No legal, ethical ownership, authenticity, or restitution conclusion.\n`;}
function createDownloads(receipt){const box=$("receipt");box.classList.remove("hidden");box.innerHTML=`<strong>${receipt.receiptId}</strong> binds draft <span class="mono">${receipt.draftHash}</span> to graph <span class="mono">${receipt.graphHash}</span>. <span id="download-links"></span>`;const links=$("download-links");for(const [name,text,type] of [["Markdown",packetMarkdown(receipt),"text/markdown"],["JSON",JSON.stringify(receipt,null,2),"application/json"]]){const a=document.createElement("a");a.textContent=`Download ${name}`;a.download=`tracebound-${receipt.receiptId}.${name==="JSON"?"json":"md"}`;a.href=URL.createObjectURL(new Blob([text],{type}));a.style.marginLeft=".6rem";links.append(a);}}

$("build-demo").addEventListener("click",()=>{const before=state.stateVersion;loadGoldenPath(state);addLedger("human","build_golden_path","Mapped the strongest supportable chain from mocked records.",before,state.stateVersion);render();});
$("prepare-label").addEventListener("click",()=>{try{const before=state.stateVersion;prepareLabel(state,state.stateVersion,120);addLedger("human","prepare_public_label","Prepared a cautious cited label.",before,state.stateVersion);}catch(e){addLedger("page","validation_error",e.message);}render();});
$("reset-demo").addEventListener("click",()=>{state=createInitialState();addLedger("human","reset","Reset the synthetic dossier.");$("receipt").classList.add("hidden");$("approval-check").checked=false;render();});
$("approval-check").addEventListener("change",renderDraft);
$("approve-draft").addEventListener("click",()=>{try{approveDraft(state,"human");addLedger("human","approve_as_research_draft","Approved exact draft and graph; no legal conclusion.");}catch(e){addLedger("page","approval_error",e.message);}render();});
$("export-draft").addEventListener("click",()=>{try{const key=`human-${state.draft.draftHash}`;const receipt=exportPacket(state,state.draft.draftHash,key);createDownloads(receipt);addLedger("human","export_research_packet",`Created ${receipt.receiptId}.`);}catch(e){addLedger("page","export_error",e.message);}render();});

render();
const registration=await registerWebMcpTools(controller);
if(registration.available && registration.registered.length===9){$("tool-dot").classList.add("live");$("tool-status").textContent="9 site tools registered";$("tool-detail").textContent="document.modelContext · imperative";addLedger("page","webmcp_ready","Nine imperative tools registered.");}
else if(registration.available){$("tool-status").textContent=`${registration.registered.length}/9 tools registered`;$("tool-detail").textContent=registration.errors.map(e=>e.name).join(", ")||"Registration incomplete";}
else{$("tool-status").textContent="WebMCP preview not detected";$("tool-detail").textContent="UI remains fully usable by a human";}
render();
window.addEventListener("pagehide",()=>registration.dispose(),{once:true});
