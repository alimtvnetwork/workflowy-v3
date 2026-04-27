# 19 — Mirror flow cross-reference asymmetry

**Date:** 2026-04-27
**Task:** F21 — Bidirectional Related links between mirror flows
**Mode:** No-questions (auto-resolved)

## Discovery

Going into F21, I expected a simple "add 09 → 08 reverse link". Audit found:

| File | Pre-F21 link to 08 | Pre-F21 link to 09 | Pre-F21 link to 10 |
|------|:---:|:---:|:---:|
| `08-mirror-detach-flow.md` | self | ❌ missing | ❌ missing |
| `09-mirror-create-flow.md` | ✅ present (terse) | self | ❌ missing |
| `10-migration-execution-flow.md` | ✅ present | ✅ present | self |

So 08 was the only file orphaned from the new mirror-flow trio (created in F11/F16/F17). 09 and 10 already linked correctly.

## Decisions auto-made

1. **How to label the 08↔09 relationship?** → "**inverse path**" with the explicit semantic ("create grows ≥2 members, detach shrinks; both share the auto-dissolve trigger when membership would fall to 1"). This is more precise than 09's pre-existing "inverse path; same group's auto-dissolve trigger" which I also tightened to match.

2. **How to label the 08↔10 and 09↔10 relationships?** → For 08↔10: "10's singleton sweep mimics this flow's auto-dissolve". For 09↔10: "10 batch-creates the same `MirrorPeerGroup`/`MirrorPeerGroupMember` invariants this runtime flow enforces per-row". Each link explains *why* a reader would jump between them.

3. **Bump version?** → Yes, both files v1.0.0→v1.1.0. Patch would also be valid (no semantic change), but the front-matter convention in this folder uses minor-bump for any documentation expansion (per F11/F16 precedent).

4. **Touch `10-migration-execution-flow.md`?** → No. Already correctly cross-references both 08 and 09.

## What was NOT changed

- `00-overview.md` dispatch table — unchanged. The cross-references are file-level, not overview-level.
- Other workflow files (`05`, `06`, `07`) — left alone. Their existing terse links to 08 are accurate; they don't need to mention 09/10 because they're operationally unrelated to mirror create/migrate.
- Source-level features (`01-features/09b-mirror-peer-group-model.md`) — left alone; F21 is workflow-folder-only by scope.
