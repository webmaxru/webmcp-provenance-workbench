import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, loadGoldenPath, deriveChain, prepareLabel, approveDraft, exportPacket, setAssessment, addEvents, graphHash } from "../src/domain.js";

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
  assert.throws(()=>exportPacket(state,draft.draftHash,"demo-export-1"),/approval_required/);
  const publicGrant=approveDraft(state);assert.deepEqual(Object.keys(publicGrant).sort(),["approved","draftHash"]);
  const first=exportPacket(state,draft.draftHash,"demo-export-1");
  assert.equal(first.replayed,false);assert.equal(state.approval.consumed,true);
  const replay=exportPacket(state,draft.draftHash,"demo-export-1");assert.equal(replay.receiptId,first.receiptId);assert.equal(replay.replayed,true);
  assert.throws(()=>exportPacket(state,draft.draftHash,"demo-export-2"),/approval_required/);
});

test("a graph change revokes approval",()=>{
  const state=createInitialState();loadGoldenPath(state);const draft=prepareLabel(state,state.stateVersion,120);approveDraft(state);
  setAssessment(state,"S4","low",state.stateVersion);
  assert.throws(()=>exportPacket(state,draft.draftHash,"after-change-1"),/approval_required/);
});
