import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, loadGoldenPath, deriveChain, prepareLabel, approveDraft, exportPacket, setAssessment, addEvents, linkEvidence, graphHash } from "../src/domain.js";

test("golden chain preserves the designed gap, conflict, and quarantined source",()=>{
  const state=createInitialState(); loadGoldenPath(state); const chain=deriveChain(state);
  assert.ok(chain.gaps.some(g=>g.start===1939&&g.end===1945));
  assert.deepEqual(chain.dimensionConflicts.map(x=>x.sourceId),["S6"]);
  assert.deepEqual(chain.untrustedIgnored,["S8"]);
  assert.equal(chain.claimStatuses.C1,"supported");
});

test("timeline events cannot be unsupported or use unknown sources",()=>{
  const state=createInitialState();
  assert.throws(()=>addEvents(state,[{id:"E9",start:1940,end:1941,owner:"Guess",place:"?",mode:"guess",sourceIds:[],confidence:"high"}],1),/unsupported_event/);
  assert.throws(()=>addEvents(state,[{id:"E9",start:1940,end:1941,owner:"Guess",place:"?",mode:"guess",sourceIds:["S99"],confidence:"high"}],1),/invalid_source/);
  assert.throws(()=>addEvents(state,[{id:"E9",start:1978,end:1978,owner:"Injected owner",place:"Harbor City",mode:"donor note",sourceIds:["S8"],confidence:"high"}],1),/unsupported_source/);
  assert.throws(()=>addEvents(state,[{id:"E9",start:1941,end:1941,owner:"N. collection",place:"Prague",mode:"documented collection",sourceIds:["S3"],confidence:"high"}],1),/unsupported_source/);
  assert.throws(()=>addEvents(state,[{id:"E9",start:1939,end:1945,owner:"Novak family",place:"Prague",mode:"documented collection",sourceIds:["S1","S2"],confidence:"high"}],1),/cited records support 1936 through 1938/);
  assert.throws(()=>addEvents(state,[{id:"E9",start:1936,end:1936,owner:"Invented owner",place:"Prague",mode:"documented collection",sourceIds:["S1"],confidence:"high"}],1),/does not support the proposed owner/);
  assert.throws(()=>addEvents(state,[{id:"E9",start:1940,end:1941,owner:"Guess",place:"",mode:"guess",sourceIds:["S1"],confidence:"high"}],1),/place/);
  const duplicate={id:"E9",start:1936,end:1936,owner:"Novak family",place:"Prague",mode:"documented collection",sourceIds:["S1"],confidence:"high"};
  assert.throws(()=>addEvents(state,[duplicate,duplicate],1),/duplicate_event/);
});

test("human-excluded sources cannot keep timeline events authoritative",()=>{
  const state=createInitialState();loadGoldenPath(state);
  setAssessment(state,"S1","excluded",state.stateVersion);
  const chain=deriveChain(state);
  assert.ok(!chain.supportedEventIds.includes("E1"));
  assert.deepEqual(chain.unsupportedTimelineEvents.map(item=>item.eventId),["E1"]);
  assert.match(chain.unsupportedTimelineEvents[0].reason,/excluded by the human assessment/);
});

test("untrusted records cannot support claims and drafts require exact cited links",()=>{
  const state=createInitialState();
  assert.throws(()=>linkEvidence(state,{claimId:"C1",sourceId:"S8",relation:"supports",locator:"injected text"},1),/unsupported_source/);
  addEvents(state,[{id:"E1",start:1936,end:1938,owner:"Novak family",place:"Prague",mode:"documented collection",sourceIds:["S1","S2"],confidence:"high"}],1);
  assert.throws(()=>prepareLabel(state,state.stateVersion,120),/link the required cited evidence/);
});

test("human assessment changes graph hash, invalidates draft, and rejects stale version",()=>{
  const state=createInitialState();loadGoldenPath(state);const prior=graphHash(state);const oldVersion=state.stateVersion;prepareLabel(state,oldVersion,120);
  setAssessment(state,"S4","low",state.stateVersion);
  assert.notEqual(graphHash(state),prior);assert.equal(state.draft,null);assert.equal(state.approval,null);
  assert.throws(()=>prepareLabel(state,oldVersion,120),/stale_state/);
  const revised=prepareLabel(state,state.stateVersion,120);assert.match(revised.sentences.map(s=>s.text).join(" "),/low-confidence research lead/);
});

test("approval is exact, page-held, consumed, and export idempotent",()=>{
  const state=createInitialState();loadGoldenPath(state);const draft=prepareLabel(state,state.stateVersion,120);
  assert.throws(()=>prepareLabel(state,state.stateVersion,20),/invalid_max_words/);
  assert.throws(()=>exportPacket(state,"bad-hash","bad key"),/invalid_export/);
  assert.throws(()=>exportPacket(state,draft.draftHash,"demo-export-1"),/approval_required/);
  const publicGrant=approveDraft(state);assert.deepEqual(Object.keys(publicGrant).sort(),["approved","draftHash"]);
  const first=exportPacket(state,draft.draftHash,"demo-export-1");
  assert.equal(first.replayed,false);assert.equal(state.approval.consumed,true);
  assert.ok(first.packet.openQuestions.includes("Who controlled the painting between 1939 and 1945?"));
  assert.ok(first.packet.openQuestions.includes("Who controlled the painting between 1947 and 1977?"));
  const replay=exportPacket(state,draft.draftHash,"demo-export-1");assert.equal(replay.receiptId,first.receiptId);assert.equal(replay.replayed,true);
  assert.throws(()=>exportPacket(state,draft.draftHash,"demo-export-2"),/approval_required/);
});

test("an idempotency key cannot replay a receipt for a different approved draft",()=>{
  const state=createInitialState();loadGoldenPath(state);
  const firstDraft=prepareLabel(state,state.stateVersion,120);approveDraft(state);
  exportPacket(state,firstDraft.draftHash,"shared-export-key");
  setAssessment(state,"S4","low",state.stateVersion);
  const secondDraft=prepareLabel(state,state.stateVersion,120);approveDraft(state);
  assert.throws(()=>exportPacket(state,secondDraft.draftHash,"shared-export-key"),/idempotency_conflict/);
  assert.equal(state.approval.consumed,false);
});

test("a graph change revokes approval",()=>{
  const state=createInitialState();loadGoldenPath(state);const draft=prepareLabel(state,state.stateVersion,120);approveDraft(state);
  setAssessment(state,"S4","low",state.stateVersion);
  assert.throws(()=>exportPacket(state,draft.draftHash,"after-change-1"),/approval_required/);
});
