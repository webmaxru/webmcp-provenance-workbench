# Threat model and limitations

## Assets and trust boundaries

- **Human research judgment:** source assessments and exact-draft approval belong to the curator.
- **Structured graph:** event, claim, source, and locator identities are application-controlled.
- **Source text:** every excerpt is evidence content. S8 is explicitly adversarial.
- **Agent:** useful but not authoritative; it proposes tool inputs and prose.
- **Export receipt:** binds a human-reviewed draft hash to the contemporaneous graph hash.

## Defenses demonstrated

| Threat | Control | Test evidence |
|---|---|---|
| Source-borne prompt injection | `untrustedContentHint`; typed `untrustedExcerpt`; `authority: none`; no excerpts accepted as control fields | `S8 output types prompt injection…` |
| Fabricated ownership event | At least one known source required; strict event rules | `timeline events cannot be unsupported…` |
| Agent self-certifies support | Claim status is derived; no status input exists | domain chain test |
| Stale co-edit overwrites human judgment | Exact `stateVersion` on every mutation | stale-version test |
| Approval reused after change | Graph/draft hashes; mutations revoke grant | graph-change test |
| Duplicate consequential action | Idempotency map returns original receipt | approval/idempotence test |
| Registration leak | AbortController registration lifetime; transitional cleanup | fake-modelContext lifecycle test |
| Cancelled execution continues | Per-invocation `signal.throwIfAborted()` | cancellation test |

## Honest limitations

- The dataset is bounded and fictional; the app does not ingest real archives.
- Rules test evidence structure and contradictions, not historical truth.
- `untrustedContentHint` is a client hint, not a universal prompt-injection defense.
- The FNV-style hashes are deterministic state fingerprints, not cryptographic signatures.
- Approval is in-memory and lasts only for the page session.
- Export produces local browser artifacts; it does not sign or publish records.
- The app makes no authenticity, title, legal, ethical-ownership, or restitution decision.
- Native WebMCP requires a compatible visible secure browser/client; tests use a fake model context for deterministic registration coverage.
