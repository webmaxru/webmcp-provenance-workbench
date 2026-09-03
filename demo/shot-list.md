# Recording shot list

Companion to `demo-script.md` (beats, prompts, speed ramps) and `transcript.md` (voiceover).
Target finished runtime **2:31**, hard ceiling **2:40** with audio, uploaded publicly to YouTube.

## Operator setup — environment prep, before the first frame (Codex session NOT started yet)

1. Bind the in-app Browser to `https://webmaxru.github.io/webmcp-provenance-workbench/` and let it load fully.
2. Verify the green **9 site tools registered** badge and `document.modelContext · imperative`.
   If the badge is not green, stop: the whole demo depends on it.
3. Click **Reset case**. Confirm `v1 · intake`, empty timeline, `graph hash: empty`, empty ledger,
   unchecked approval box.
4. 1920×1080 or 2560×1440, browser zoom 90–100 %, OS and app notifications off, no other tabs, no tokens
   or account details on screen.
5. Prompts A, B, C and optional D from `demo-script.md` on the clipboard. Paste; never type live on camera.
6. Record system/app audio, or record silent and lay the voiceover over the cut. The published video must have audio.
7. Confirm the recorder shows the OS cursor. If Codex's own browser automation won't move the visible
   system pointer, plan for the post-production cursor overlay — see “Cursor visibility & fallback” below.
8. **Leave the Codex chat itself unopened** (session picker, or the app just launched) — Take 1 has to
   capture a fresh session starting on camera, so don't pre-open it during setup.

## Takes

Record each take separately so a single bad response never costs the whole run. Leave two seconds of
handles at both ends of every take. Two standing rules apply from Take 3 onward: **scroll the Browser to
the relevant panel just before Codex's call touches it** (not after), and **keep a visible cursor or
cursor halo on the exact record/graph/card/control the voiceover is naming**.

| # | Take | Length in cut | Notes |
|---|---|---|---|
| 1 | **Fresh session + sidebar hide** — on camera: start a brand-new Codex chat (no prior turns), then immediately toggle the sidebar closed so only the chat column and in-app Browser remain | 4 s | Voiceover hook has already started over this. Sidebar visible for a beat at most, then gone for the rest of the video. |
| 2 | **Full-page scan** — one continuous smooth scroll: top (object card + unresolved-years banner) → down through source inbox and evidence graph → past the draft/approval box → ledger at the bottom; hold ~1 s; scroll back to the top | 9 s | This is the only full-page tour in the video. Voiceover covers the whole pass — never let it run silent. Ends back at the top for the next cut. |
| 3 | **Tooling proof** — chat column, then the green nine-tool badge, then a source card showing `S4` and a claim node `C2` | 17 s | Badge and IDs must be readable at 1080p. |
| 4 | **Prompt A** — paste and send | 14 s | Both columns in frame. |
| 5 | **Mapping run** — dossier read (scroll/halo on object card), record search (halo sweeping S1–S8), event creation (halo on each new timeline row), evidence links (halo on newest graph edge/node), chain validation (settle on state chip + graph hash); ledger stacking `agent` rows | 28 s | **Speed ramp 3–4×.** Longest real wait. Keep tool names legible. Browser scrolls to each panel a beat ahead of its call. |
| 6 | **The result that isn't an answer** — scroll/halo the unresolved gap banner, then the S6 dimension conflict in the issues list, then the cited label's superscripts | 13 s | Single highlight box on the gap card; hold ~1 s in silence (trimmed from a longer hold to protect runtime). |
| 7 | **Injection** — agent message quoting S8, then scroll/halo the S8 card's untrusted badge, then its quarantine row in the issues list, gap still on screen | 16 s | Lower-third `untrustedContentHint`. Do not cut away from the gap while narrating it. |
| 8 | **Human judgment** — scroll to S4 card before the click lands; visible full-speed click on *Treat as low confidence*; scroll to draft panel as it empties, draft hash resets, version chip increments, `human` row appears in the ledger | 15 s | Full-speed click, cursor unmistakable. This shot is the human-in-the-loop proof. Hold on the empty draft ~1 s (trimmed). |
| 9 | **Adaptation** — Prompt B pasted; scroll/halo tracks revalidation across timeline and graph, settles on the draft panel for the revised label naming the 1943 letter a research lead | 13 s | **Speed ramp 2–3×.** Prompt B forbids tab changes and approval-control clicks, then stops at `approval_required`. |
| 10 | **Approval boundary** — `approval_required` on the agent's export attempt, then scroll to the approval box: cursor/halo on checkbox, then *Approve as research draft*. Paste Prompt C so the agent performs only the approved export site-tool call | 13 s | Error message at 1×; lower-third `approval_required`; keep both human clicks in frame, never sped up. |
| 11 | **Receipt and attribution** — scroll/halo the receipt ID with draft and graph hashes, Markdown and JSON links, then pan to the ledger showing interleaved human / agent rows. If timing allows, expand Prompt D's tool result long enough to show the same receipt and `replayed: true` | 9 s | End card over the last two seconds: live URL, repo URL, MIT. |

Running total: 4 + 9 + 17 + 14 + 28 + 13 + 16 + 15 + 13 + 13 + 9 = **151 s (2:31)**, nine seconds under
the 2:40 ceiling.

## Speed ramps

- Take 5 (mapping run): 3–4×. Take 9 (adaptation): 2–3×. Take 10 (approval boundary): trim dead frames only.
- Everything else stays at 1×, and **no human click is ever sped up**.
- A speed ramp may compress a wait; it may never conceal an error, a retry, or a failed call.
- Speed ramps are reserved for genuine Codex waiting gaps (model thinking, tool round-trip in flight).
  The runtime saved elsewhere in this cut (Takes 6 and 8 trimmed from ~1.5 s holds to ~1 s) comes from
  shortening static holds, not from speeding up anything that isn't an actual wait.

## Cursor visibility & fallback

- Preferred: the OS/system cursor is visible on the recording for every human click (S4 downgrade,
  approval checkbox, Approve/Export) and for any pointer movement Codex's own browser automation performs.
- Fallback, decided in the edit: if automation drives the in-app Browser without drawing a visible system
  cursor, overlay a high-contrast cursor glyph with a subtle click halo, synchronized to the actual
  recorded interaction coordinates (note click/scroll targets while recording, or reconstruct from the
  tool-call log against the DOM).
- The overlay is a pointer aid only — it must never imply a click, scroll, or state change that didn't
  happen, and it must never be used to disguise automation as a human hand or vice versa.
- Apply the same "cursor/halo on the exact subject" rule from Takes 3–11 whether the cursor is native or
  overlaid.

## Contingencies

- **A native mutation call fails on camera.** Keep the footage, diagnose, fix, re-record the affected take.
  Do not edit around it and do not narrate behaviour that did not happen.
- **The agent stops after `approval_required`.** That is expected. The human checks the exact-review
  box and clicks **Approve as research draft**, then sends Prompt C. Prompt C forbids browser-control
  clicks and asks for only the export site-tool call.
- **Codex opens or switches tabs, or touches an approval control.** Stop the task immediately and
  discard the affected take. The human edit, approval, and export call must all use one visible
  Tracebound tab.
- **The agent tries to export twice.** Let it. The same idempotency key returns the original receipt, which
  is worth showing if the timing allows.
- **Badge shows fewer than nine tools.** Reload; if it persists, stop and fix registration before recording.
- **The recorder doesn't show a system cursor during automated browser actions.** Don't re-record for this
  alone — apply the post-production cursor overlay from "Cursor visibility & fallback" instead.

## Editing checklist

- Lower-thirds: `search_source_records`, `untrustedContentHint`, `stale_state`, `approval_required`.
- One highlight box only, on the unresolved gap during take 6.
- Confirm the Codex sidebar is visible for no more than the first 4 seconds (take 1) and never reappears.
- Confirm the full-page scan (take 2) has continuous voiceover under it — no silent stretch in the first
  10 seconds.
- Confirm every scroll-to-panel move in takes 5–11 lands *before* the corresponding tool call or state
  change, and that a cursor or cursor halo (native or overlaid per the fallback above) sits on the exact
  item being narrated.
- Audio: normalise voiceover to about −16 LUFS; no music under the injection and approval beats.
- Final pass against `demo-script.md` accuracy guardrails: nine tools, unresolved interval **1939–1945**,
  no authenticity/title/restitution claims, no invented capability.
- Confirm the finished file is **under 2:40** (target 2:31), has audible narration, and is public on
  YouTube before the submission link is pasted into Devpost.
