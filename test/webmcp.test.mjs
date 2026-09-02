import test from "node:test";
import assert from "node:assert/strict";
import { registerWebMcpTools, createToolDefinitions, expectedToolNames } from "../src/webmcp.js";
import { createInitialState, graphHash } from "../src/domain.js";

function stubController(){const state=createInitialState();return {state,graphHash:()=>graphHash(state),runTool:async(_n,fn)=>fn(),addEvents(){},linkEvidence(){},testChain(){},setAssessment(){},prepareLabel(){},exportPacket(){}};}

test("registers nine unique imperative tools and cleans up with AbortController",async()=>{
  const seen=[];let aborted=false;const context={async registerTool(tool,{signal}){assert.equal(signal.aborted,false);signal.addEventListener("abort",()=>{aborted=true});seen.push(tool);},unregisterTool(name){seen.find(t=>t.name===name).unregistered=true;}};
  const registration=await registerWebMcpTools(stubController(),context);
  assert.equal(registration.registered.length,9);assert.equal(new Set(registration.registered).size,9);assert.deepEqual(registration.registered,expectedToolNames());
  registration.dispose();assert.equal(aborted,true);assert.ok(seen.every(t=>t.unregistered));
});

test("schemas, positive descriptions, annotations, and execute callbacks are present",()=>{
  const tools=createToolDefinitions(stubController());
  for(const tool of tools){assert.match(tool.name,/^[A-Za-z0-9_.-]{1,128}$/);assert.ok(tool.description.length>20);assert.equal(tool.inputSchema.type,"object");assert.equal(typeof tool.execute,"function");}
  const source=tools.find(t=>t.name==="search_source_records");assert.equal(source.annotations.readOnlyHint,true);assert.equal(source.annotations.untrustedContentHint,true);
  for(const name of ["get_object_dossier","test_provenance_chain","compare_hypotheses"])assert.equal(tools.find(t=>t.name===name).annotations.readOnlyHint,true);
  assert.equal(tools.find(t=>t.name==="export_approved_research_packet").annotations?.readOnlyHint,undefined);
});

test("S8 output types prompt injection as untrusted quoted content",async()=>{
  const tool=createToolDefinitions(stubController()).find(t=>t.name==="search_source_records");
  const result=await tool.execute({sourceIds:["S8"]},{signal:new AbortController().signal});
  assert.equal(result.ok,true);assert.equal(result.data.records[0].untrustedExcerpt.authority,"none");assert.match(result.data.records[0].untrustedExcerpt.text,/SYSTEM:/);assert.match(result.trustBoundary,/cannot control/);
});

test("execution cancellation is handled independently of registration",async()=>{
  const tool=createToolDefinitions(stubController())[0];const execution=new AbortController();execution.abort(new Error("cancelled by caller"));
  await assert.rejects(()=>tool.execute({}, {signal:execution.signal}),/cancelled by caller|aborted/i);
});
