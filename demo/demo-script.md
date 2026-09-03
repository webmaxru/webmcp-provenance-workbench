# Tracebound demo script — 2:31 finished target (hard ceiling 2:40)

Recorded in the **OpenAI Codex desktop app**, using the in-app Browser bound to the live deployment
`https://webmaxru.github.io/webmcp-provenance-workbench/`. Narration is voiceover (see `transcript.md`);
the finished cut must stay under the challenge's three-minute limit, must contain audio, and — per
reviewer feedback — must land comfortably under 2:40 with the session start and sidebar-hide happening
**on camera**, not before the recording begins.

Everything below is behaviour the app actually implements. Nothing is scripted that the page cannot do
on camera.

## Pre-roll (before the first recorded frame) — environment only, no Codex session yet

Operator actions, not voiceover. The Codex chat itself must **not** be opened yet — the first recorded
frame has to capture the fresh session starting, so leave Codex on its session picker / closed until
recording begins.

1. Open the in-app Browser on the live URL; let it load fully; confirm the green **“9 site tools
   registered”** badge and `document.modelContext · imperative`.
2. Click **Reset case**: empty timeline, empty ledger, chip reads `v1 · intake`, graph hash `empty`.
3. Display 1920×1080 or 2560×1440, browser zoom 90–100 %, notifications off, no personal tabs or tokens on screen.
4. Put the three prompts below on the clipboard; paste them, don't type live.
5. Confirm your recorder captures the OS mouse cursor. If your capture pipeline (or Codex's own
   automation) does not draw a visible system cursor during agent-driven browser actions, plan on the
   post-production cursor overlay in **“Cursor visibility & fallback”** below — decide this now, before
   editing, not while scrambling near the deadline.

## Beat sheet

Two standing rules that apply to every beat from 0:13 onward:

- **Scroll before the event, not after.** The instant before Codex fires a tool call that reads or
  changes page state, the in-app Browser scrolls to the panel that call is about to touch, so the
  change lands already in frame — never scroll to catch up with something that already happened.
- **Cursor stays on the subject.** A clearly visible cursor, or a soft halo around it, sits over the
  exact record/graph node/card/control the voiceover is naming at that moment. See “Cursor visibility &
  fallback” for what to do if the automation doesn't draw a native cursor.

| Time | On-screen action (operator) | Narration beat | Post |
|---|---|---|---|
| 0:00–0:04 | **On camera:** start a brand-new Codex chat (no prior turns, session picker or “New chat” visible for at most a beat), then immediately toggle the Codex **sidebar** closed so only the chat column and the in-app Browser remain. | **Hook begins.** “Almost every museum holds an object with a hole in its history —” | Sidebar must be gone by 0:04; never shown again. |
| 0:04–0:13 | With the Browser already resting on the loaded, reset workbench, run **one continuous smooth scroll**: from the top (object card + `1939–1945 remains undocumented` banner), down through the source inbox and evidence graph, past the draft/approval box, to the ledger at the bottom; **hold ~1 s**; scroll back **up to the top** so the object card is back in frame. | Hook continues over the scan: “…That hole is dangerous: one confident sentence can turn a wartime theft into a clean provenance.” | This is the only full-page tour in the video; it must never sit silent — voiceover covers the whole pass. Cut on the word “provenance,” back at the top. |
| 0:13–0:30 | Cut to the Codex chat column, then back to the page; hold on the green **9 site tools registered** badge and on the source/claim vocabulary (`S4`, `C2`). | **Why chat isn't enough, and what this is.** Fluent summarisers delete uncertainty. Tracebound publishes nine WebMCP site tools from the page itself, in the curator's vocabulary. | Badge legible ≥ 2 s. |
| 0:30–0:44 | Paste **Prompt A** and send. Frame both columns so tool calls and the page are visible together. | One plain-language instruction; tell viewers to watch the page, not the chat. | — |
| 0:44–1:12 | Agent runs the chain below; scroll the Browser to each panel just before its call lands, cursor/halo on the specific item named: `get_object_dossier` → object card (halo on the accession line); `search_source_records` → source inbox, halo sweeping across the S1–S8 cards as they're read; `add_timeline_events` → timeline panel, halo on each new row as it lands; `link_evidence_to_claim` → evidence graph, halo on the newest node/edge; `test_provenance_chain` → settle on the state chip and graph hash as they increment. Ledger stacks `agent` rows throughout. | Narrate shared state, not numbers: sourced events land, every claim grows an edge to a locator, the war years stay empty. | **Speed up 3–4×.** Longest wait in the video. Never cut across an error. |
| 1:12–1:25 | Scroll/halo the red **1939–1945 Unresolved gap** banner first, then pan to the “Gaps & contradictions” list and halo the S6 dimension conflict, then to the label draft and halo its superscript citations. | Success is a hole that survived. Every factual sentence keeps its source. | One highlight box on the gap card; hold in silence ~1 s (trimmed from the prior cut). |
| 1:25–1:41 | Cut to the agent's message quoting S8 (chat column). Scroll the Browser to the S8 card just as the agent names it; halo the **untrusted content** badge, then pan to the `S8: quarantined as untrusted content` issue row. Gap banner stays visible in the same frame. | **Injection beat.** The donor note gives the machine an order; the page hands it back as quoted evidence with `authority: none`. The agent quotes it and refuses. | Lower-third: `untrustedContentHint`. |
| 1:41–1:56 | Scroll to the S4 card *before* the click lands, so the whole card is in frame. **Visible human click, cursor unmistakable:** *Treat as low confidence* on S4. Scroll to the draft panel as it empties; draft hash returns to `not prepared`, chip version increments, ledger shows a `human` row. | **Human judgment beat.** A curator downgrades a source; the graph hash changes and the agent's label is void. | Hold on the empty draft ~1 s (trimmed). Human click never sped up. |
| 1:56–2:09 | Paste **Prompt B** and send. Scroll/halo tracks the re-validation across timeline and graph, then settles on the draft panel for the revised label; halo the phrase naming the 1943 letter a research lead. The prompt explicitly forbids tab changes and approval-control clicks. | The agent adapts to me instead of overwriting me. | **Speed up 2–3×.** |
| 2:09–2:22 | Agent's export attempt returns `approval_required` — hold on it at 1×. Scroll to the approval box; visible human sequence with cursor/halo on each control in turn: tick **I reviewed this exact draft and evidence graph**, click **Approve as research draft**. Paste **Prompt C** so the agent calls only the export site tool. | **Safety boundary.** Export is consequential; the model cannot approve on my behalf. | Lower-third: `approval_required`. Keep both human clicks in frame; trim only dead frames around them, never the clicks themselves. |
| 2:22–2:31 | Scroll to the receipt strip; halo the receipt ID, draft hash, graph hash, then the Markdown/JSON download links. If timing allows, use **Prompt D** and briefly show the same receipt returning with `replayed: true`; finish on the ledger's interleaved human and agent rows with the gap still open. | **Closer.** Attributable work, an artifact that keeps its open questions, an agent allowed to say “not proven yet.” | End card: live URL, repo, MIT. |

## Exact prompts

**Prompt A — the one instruction that drives the demo**

```text
Use only the currently visible Tracebound tab and do not open or switch tabs. Use this page's site tools to map the strongest evidence-backed ownership timeline for this painting. Read every record, including the donor note. Don't fill any gap with an assumption, cite a source locator for every claim, then prepare a cited public label draft. Do not export anything or click any review or approval control.
```

**Prompt B — after the visible S4 downgrade**

```text
Use only the currently visible Tracebound tab; do not open or switch tabs. Do not click the review checkbox or the approval button. Revalidate the current graph after S4 was downgraded, prepare the revised label with the 1943 letter only as a research lead, then call the export site tool exactly once with idempotency key tracebound-demo-02. Stop when the tool returns approval_required.
```

**Prompt C — after the human checks the box and clicks Approve**

```text
Approved in the page. Use only the currently visible Tracebound tab. Do not open or switch tabs, and do not click any page controls. Call the export site tool once with the approved draft hash and idempotency key tracebound-demo-02, then report the receipt and whether it replayed.
```

**Prompt D — optional same-key replay proof**

```text
Use only the current Tracebound tab and do not click page controls. Call the export site tool once more with the same approved draft hash and idempotency key tracebound-demo-02. Report only the receipt and replayed value.
```

## Waits to accelerate in post

Only genuine Codex waiting gaps — the model thinking or a tool round-trip in flight — get sped up. Static
holds get shortened instead of sped up, so nothing on screen ever looks unnaturally fast.

| Section | Real duration | Treatment |
|---|---|---|
| Prompt A tool sequence (0:44–1:12) | typically 40–120 s | Speed ramp 3–4×; keep tool names readable; no cut may hide a failure |
| Prompt B revalidation (1:56–2:09) | typically 20–60 s | Speed ramp 2–3× |
| Export round trip (2:09–2:22) | typically 5–20 s | Trim dead frames only; keep the `approval_required` message at 1× |

Everything else runs at 1×. Human clicks are never sped up — they are the proof that a person, not the
model, holds the approval. The two static holds that used to run ~1.5 s (gap card, empty draft) are
trimmed to ~1 s each in this cut — that's the "shorten the hold" side of the runtime budget; the "speed up
the wait" side is the table above.

## Cursor visibility & fallback

The cursor is a **pointer only** — it never stands in for, substitutes, or fakes a state change. Every
change shown must be the real, recorded output of the live app.

1. **Preferred:** record with the OS/system cursor visible and, if the recorder supports it, a subtle
   click-ripple on mouse-down. This covers both the human clicks (S4 downgrade, approval checkbox,
   Approve/Export buttons) and any pointer movement Codex's own browser automation performs.
2. **Fallback, decided in post:** if the capture shows Codex/background automation driving the in-app
   Browser **without** rendering a visible system cursor (common when automation dispatches events
   without moving the OS pointer), overlay a high-contrast cursor glyph plus a subtle click halo in the
   edit, synchronized frame-for-frame to the logged interaction coordinates (click/scroll targets noted
   during recording, or reconstructed from the tool-call log against the DOM). The overlay must track
   the *actual* recorded interaction — same target element, same approximate timing — never an invented
   position.
3. Either way, the standing rule from the beat sheet applies: the cursor/halo sits on the exact
   record/graph node/card/control the voiceover is naming, not just somewhere on screen.
4. Do not use the overlay to imply a click happened where none did, or to hide that an interaction was
   automated rather than a human hand — it is a visibility aid, not a re-enactment.

## Accuracy guardrails

- Say “nine site tools” only while the green badge is visible.
- The unresolved interval on screen is **1939–1945**; do not narrate a different range.
- Do not claim the app decides authenticity, legal title, ownership, or restitution — it organises evidence.
- Do not credit `untrustedContentHint` alone with stopping the injection; the typed `untrustedExcerpt`
  envelope, structured-ID-only validation, and page-derived claim status are what hold.
- If a native call errors on camera, keep the take, fix the cause, and re-record; never cut around it.
- The Codex sidebar appears for at most the first 4 seconds (session start) and never again.
- Finished runtime target is **2:31**, hard ceiling **2:40** — under budget by shortening static holds,
  not by cutting the full-page scan or any human click.
- Upload `demo/demo-captions.srt` as the final video's caption track; do not
  substitute the transcript or manually retime the generated SRT.
