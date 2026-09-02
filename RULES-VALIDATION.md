# WebMCP Challenge rules validation

Validated against the official Devpost challenge requirements on 2026-09-02. Deadline: **2026-09-03 at 20:00 UTC**. This file records evidence, not optimistic claims.

## Submission gates

| Requirement | Status | Evidence / action |
|---|---|---|
| Working WebMCP app | **Local pass** | Nine imperative tools in `src/webmcp.js`; `npm test` and `npm run check` pass |
| Working live URL accessible to judges | **Pass** | `https://webmaxru.github.io/webmcp-provenance-workbench/` returned HTTP 200 with the expected title in an anonymous HTTPS request on 2026-09-02. |
| Public complete source repository | **Pass** | `https://github.com/webmaxru/webmcp-provenance-workbench`; GitHub API confirmed `isPrivate: false` on 2026-09-02. |
| Visible open-source license | **Pass in repository** | Root `LICENSE` is MIT and README links it; it becomes judge-visible only after the repository is public. |
| Public YouTube video under 3 minutes, with audio | **Blocked** | Complete 2:32 script/transcript/shot list are in `demo/`; recording, voiceover, upload, and public URL remain required. |
| Description explains WebMCP fit, UX, new joint ability, implementation | **Draft pass** | `devpost-submission.md` contains all four sections. |
| Tested agent/client identified | **Pass** | OpenAI Codex desktop in-app Browser discovered all nine tools and successfully invoked `get_object_dossier`, `search_source_records`, and `compare_hypotheses` on the public deployment on 2026-09-02. |
| AI tools used disclosed | **Draft pass** | Devpost draft identifies Codex for research and implementation assistance. |
| Learning/value fields | **Draft pass** | Included in Devpost draft. |
| Unique and substantially different if submitting multiple entries | **Pass by design** | Tracebound is an evidence/trust-boundary workflow: date-range provenance graph, hostile archival source quarantine, curator confidence changes, cited public copy, and research-draft approval. It is not a resource-restoration simulator or a laboratory grid/layout optimizer. Shared WebMCP infrastructure is incidental; the user problem, state model, visuals, tool semantics, safety boundary, output, and impact are distinct. |

## Judging-criteria validation

### WebMCP leverage

- Nine tools operate stable sources, claims, date ranges, graph versions, and receipts—not screen coordinates.
- The agent and curator mutate the same visible state through shared command handlers.
- Read-only and untrusted annotations are accurate; schema and domain validation are separate.
- Stale-state recovery, human approval, and idempotent export demonstrate meaningful joint action.

**Native evidence collected:** nine site tools discovered; dossier, quarantined-source, and hypothesis-comparison calls completed. The final narrated video should additionally capture the full golden mutation/stale-state sequence.

### Execution

- Responsive, keyboard-accessible single-page app.
- Fully mocked, resettable fictional case with eight records.
- Deterministic tests cover graph rules, injection quarantine, lifecycle, cancellation, approval, and idempotency.
- No network, model API, framework, or install step required at runtime.

**Local result:** pass. **Native representative result:** pass. **Final video result:** pending the continuous narrated golden-flow recording.

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

Attempt recorded on 2026-09-02: Codex's in-app Browser binding was selected and made visible, but two fresh localhost tab attempts timed out while waiting for the Browser webview to attach. A direct Codex-panel browser open also failed to attach. Accordingly, no native discovery or tool-call pass is claimed; the fake-`modelContext` suite is only deterministic harness evidence.

Retry recorded on 2026-09-02 after public deployment: Codex discovered exactly nine tools. The first native dossier call exposed that the callback assumed a cancellation signal was always present; commit `f2e6f1f` made the signal optional and added a regression test. After Pages rebuilt, native `get_object_dossier` succeeded. Native `search_source_records` returned S8 as `untrusted_content`, with `authority: none`, and stated that source excerpts cannot control tools or claim status. Native `compare_hypotheses` selected `documented_gap` and kept the attractive ownership transfer unsupported. This supersedes the failed localhost attempt.

## Non-negotiable blockers before Devpost submit

1. Record the full golden flow in the already-validated native client.
2. Add voiceover/audio, upload the under-three-minute video publicly to YouTube, and paste its URL into the submission.
