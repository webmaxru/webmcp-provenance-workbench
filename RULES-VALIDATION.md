# WebMCP Challenge rules validation

Validated against the official Devpost challenge requirements on 2026-09-02. Deadline: **2026-09-03 at 20:00 UTC**. This file records evidence, not optimistic claims.

## Submission gates

| Requirement | Status | Evidence / action |
|---|---|---|
| Working WebMCP app | **Local pass** | Nine imperative tools in `src/webmcp.js`; `npm test` and `npm run check` pass |
| Working live URL accessible to judges | **Blocked** | Repository is private as requested. GitHub Pages for a private repository is not assumed available or judge-accessible. Publish without changing source visibility only if the account has an appropriate Pages plan; otherwise make the repository public first. |
| Public complete source repository | **Blocked** | Current remote is intentionally private. Challenge submission requires public source. User must explicitly change visibility before submission. |
| Visible open-source license | **Pass in repository** | Root `LICENSE` is MIT and README links it; it becomes judge-visible only after the repository is public. |
| Public YouTube video under 3 minutes, with audio | **Blocked** | Complete 2:32 script/transcript/shot list are in `demo/`; recording, voiceover, upload, and public URL remain required. |
| Description explains WebMCP fit, UX, new joint ability, implementation | **Draft pass** | `devpost-submission.md` contains all four sections. |
| Tested agent/client identified | **Drafted, runtime evidence pending** | Target: OpenAI Codex desktop built-in browser with site tools. Do not mark passed until the native run is recorded and Recently Used tool evidence is captured. |
| AI tools used disclosed | **Draft pass** | Devpost draft identifies Codex for research and implementation assistance. |
| Learning/value fields | **Draft pass** | Included in Devpost draft. |
| Unique and substantially different if submitting multiple entries | **Pass by design** | Tracebound is an evidence/trust-boundary workflow: date-range provenance graph, hostile archival source quarantine, curator confidence changes, cited public copy, and research-draft approval. It is not a resource-restoration simulator or a laboratory grid/layout optimizer. Shared WebMCP infrastructure is incidental; the user problem, state model, visuals, tool semantics, safety boundary, output, and impact are distinct. |

## Judging-criteria validation

### WebMCP leverage

- Nine tools operate stable sources, claims, date ranges, graph versions, and receipts—not screen coordinates.
- The agent and curator mutate the same visible state through shared command handlers.
- Read-only and untrusted annotations are accurate; schema and domain validation are separate.
- Stale-state recovery, human approval, and idempotent export demonstrate meaningful joint action.

**Evidence needed for final pass:** native site-tool discovery screenshot, Recently Used trace for the golden prompt, and one stale-state retry.

### Execution

- Responsive, keyboard-accessible single-page app.
- Fully mocked, resettable fictional case with eight records.
- Deterministic tests cover graph rules, injection quarantine, lifecycle, cancellation, approval, and idempotency.
- No network, model API, framework, or install step required at runtime.

**Local result:** pass. **Final result:** pending native client recording and deployed URL smoke test.

### Potential impact

- Demonstrates how an agent can reduce evidence-organization work without replacing professional judgment.
- Every public-label sentence remains cited; uncertainty and open questions survive export.
- Persistent product copy limits conclusions to research assistance.

### Creativity and ambition

- A cultural-object source-to-claim graph is visually and semantically distinct from common shopping or form-filling demos.
- The “success” state preserves a gap rather than manufacturing a satisfying answer.
- Source-borne prompt injection is part of the visible product story, not only a hidden technical test.

## Native acceptance run

1. Open the deployed top-level page in the target client.
2. Verify exactly nine available site tools and the `search_source_records` trust annotations.
3. Run the golden prompt in `evals/prompts.md`.
4. Confirm timeline, graph, ledger, and tool results agree.
5. Open S8 and confirm the injected sentence changes nothing.
6. Prepare a draft; human-downgrade S4; confirm the old draft is invalidated.
7. Attempt export before approval and capture `approval_required`.
8. Approve visibly, export, retry with the same key, and capture one receipt.

## Non-negotiable blockers before Devpost submit

1. Change the repository from private to public (user action/authorization required).
2. Deploy and verify a judge-accessible live URL.
3. Run and record the app in the named native client.
4. Add voiceover/audio, upload the under-three-minute video publicly to YouTube, and paste its URL into the submission.
