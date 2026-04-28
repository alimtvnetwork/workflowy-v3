# F7 — Reconciliation Log: 12 Flags from F1–F6

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** ✅ Reconciled — every flag has a concrete resolution + spec citation
> **Predecessors:** [`./04-f01-rollup-enrichment.md`](./04-f01-rollup-enrichment.md) … [`./07-f04-highlighter-pin.md`](./07-f04-highlighter-pin.md) and the F5/F6 entries in [`../00-active.md`](../00-active.md) §F1–F6
> **Active-plan reference:** [`../00-active.md`](../00-active.md) §F7

---

## What this file is

During the Workflowy-feature-reference merge (F1–F6), each pass surfaced reconciliation flags where the merged content touched an adjacent SSOT (data model, hotkey table, endpoint matrix, error registry, design system). This log resolves all **12 flags**, each with: source pass, conflict statement, resolution, owning SSOT after reconciliation, and verification.

> **Decision rule applied uniformly:** if both sides are factually correct, the canonical SSOT wins and the appendix gets a "see SSOT" pointer. If the appendix surfaces a genuine gap, the SSOT is amended. No flag is left as "TBD" — see G-38 (`scripts/spec-hygiene/38-check-ambiguous-wording.mjs`).

---

## Flag inventory & resolution

### F1-1 — Hotkey appendix rows must appear in canonical `AT-HK-*` table
- **Source:** F1 pass (active-plan §F1).
- **Conflict:** `01-features/05-interactions.md` Workflowy hotkey appendix lists shortcuts that must be cross-referenced into the canonical hotkey AT range.
- **Resolution:** SSOT wins. Appendix rows MUST cite an `AT-HK-*` id; rows without an id are added to the canonical table in the same PR. Enforced by `scripts/spec-hygiene/30-check-at-citation-validity.mjs` (every `AT-HK-NN` reference must resolve).
- **Owning SSOT after reconciliation:** [`spec/31-app/01-features/05-interactions.md`](../../spec/31-app/01-features/05-interactions.md) (canonical hotkey table).
- **Verification:** `node scripts/spec-hygiene/30-check-at-citation-validity.mjs`.

### F2-1 — `is:mirror` search operator semantics under the peer-group model
- **Source:** F2 pass.
- **Conflict:** Workflowy's `is:mirror` filter assumes per-row mirror flag; WorkFlowy uses peer-group relations (`mem://features/mirroring`).
- **Resolution:** `is:mirror` MUST mean "row is a member of a `MirrorPeerGroup` with ≥2 peers". Singleton groups are dissolved by detach (per `mem://features/mirroring`), so they never match. Documented in [`spec/31-app/01-features/16-search-ranking.md`](../../spec/31-app/01-features/16-search-ranking.md) Workflowy appendix and the search ranking SSOT.
- **Owning SSOT:** `mem://features/mirroring` + `spec/31-app/01-features/16-search-ranking.md`.
- **Verification:** `AT-MPG-*` and search-ranking ATs cite this rule.

### F2-2 — Recurring date chips (v1 out-of-scope)
- **Source:** F2 pass.
- **Conflict:** Workflowy supports recurring date chips (`every Monday`, etc.); WorkFlowy v1 does not.
- **Resolution:** Hard-deferred from v1. Recorded in [`spec/31-app/01-features/10-today-view.md`](../../spec/31-app/01-features/10-today-view.md) appendix as "Workflowy parity: NOT in v1 — see roadmap". A future task ticket (`P11+`) MUST own re-introduction; date parser MUST currently reject recurrence syntax with a typed error so the gap is loud.
- **Owning SSOT:** [`spec/31-app/04-roadmap/`](../../spec/31-app/04-roadmap/) (deferred-features list).
- **Verification:** `AT-TODAY-*` ATs assert non-recurring date chips only.

### F3-1 — Slash→handler binding linter
- **Source:** F3 pass.
- **Conflict:** Slash-command appendix in `06-item-context-menu.md` lists commands without proving each binds to a real React handler / PHP route.
- **Resolution:** Add a hygiene gate (planned `G-39`) that walks the slash-command table and asserts each `/command` has (a) a row in `spec/31-app/06-endpoints/16-endpoint-at-matrix.md` OR (b) a UI-only marker. Until G-39 lands, the binding is enforced by reviewer judgement during PR.
- **Owning SSOT:** [`spec/31-app/01-features/06-item-context-menu.md`](../../spec/31-app/01-features/06-item-context-menu.md) (canonical slash table) + endpoint matrix.
- **Verification:** Manual review now; `scripts/spec-hygiene/39-check-slash-command-binding.mjs` is the future automation hook (tracked as P11 follow-up).

### F3-2 — "mirror copy" forbidden-phrase scan
- **Source:** F3 pass.
- **Conflict:** Workflowy reference text uses "mirror copy" interchangeably with "mirror"; WorkFlowy's peer-group model has no "copy" — every peer is a first-class member.
- **Resolution:** "mirror copy" is a banned phrase in active spec (mirrors are peers, not copies). Added to the same allow-list infrastructure as G-38 by extending the BANNED list in `scripts/spec-hygiene/38-check-ambiguous-wording.mjs` (see Verification below). Existing usages in `_archive*` and `18-spec-issues/` remain (historical record).
- **Owning SSOT:** `mem://features/mirroring` (vocabulary policy).
- **Verification:** G-38 now also bans `"mirror copy"`. `node scripts/spec-hygiene/38-check-ambiguous-wording.mjs`.

### F3-3 — Mirror peer-group founder semantics
- **Source:** F3 pass.
- **Conflict:** Workflowy text implies the original item is the "source"; WorkFlowy treats the founding row as the **first peer** with no special privileges (per `mem://features/mirroring`).
- **Resolution:** Documented in [`spec/31-app/01-features/09b-mirror-peer-group-model.md`](../../spec/31-app/01-features/09b-mirror-peer-group-model.md) §"Vocabulary policy". The `MirrorPeerGroupMember.IsFounder` column is informational only (LWW tiebreak in concurrent detach scenarios per the same memory) and MUST NOT be used for permission decisions.
- **Owning SSOT:** `mem://features/mirroring` + `09b-mirror-peer-group-model.md`.
- **Verification:** `AT-MPG-01..10` cover the bidirectional/no-source-privilege rules.

### F4-1 — Card-drop-zone uses the same fractional-sort patch as list
- **Source:** F4 pass.
- **Conflict:** Board view's drag-and-drop could plausibly use a separate sort algorithm; F4 flagged the need to confirm parity.
- **Resolution:** Confirmed: board cards reuse the canonical fractional-sort algorithm (`mem://features/editor-core` — drag-and-drop, fractional sorting). [`spec/31-app/01-features/07-board-view.md`](../../spec/31-app/01-features/07-board-view.md) Workflowy appendix carries the explicit "uses same patch shape as list move (`EP-ITEMS-MOVE`)" note.
- **Owning SSOT:** `mem://features/editor-core`.
- **Verification:** `AT-BOARD-03/04` reference the same fractional-sort assertions as list moves.

### F4-2 — Public-link URL pattern → WP REST `/s/<token>`
- **Source:** F4 pass.
- **Conflict:** Public share URL shape was unspecified; Workflowy uses opaque tokens.
- **Resolution:** Canonical pattern: `https://<host>/s/<token>` resolved by the WP plugin REST endpoint `EP-SHARES-PUBLIC` (`POST /shares/{id}/public`). Token is a 22-char base32 ULID-derived value. Documented in [`spec/31-app/01-features/08-share-dialog.md`](../../spec/31-app/01-features/08-share-dialog.md) and [`spec/31-app/06-endpoints/97b-endpoint-envelope-fixtures.md`](../../spec/31-app/06-endpoints/97b-endpoint-envelope-fixtures.md) §`EP-SHARES-PUBLIC`.
- **Owning SSOT:** Endpoint matrix + envelope fixtures.
- **Verification:** `AT-SHARE-05/06` assert URL shape; G-29 (endpoint-matrix coverage) confirms route exists.

### F4-3 — `comment_root_id` FK in unified Node interface
- **Source:** F4 pass.
- **Conflict:** Workflowy comments thread off any item; the unified Node interface (`mem://architecture/data-model`: `id, parentId, content, itemType`) does not carry a `comment_root_id` field.
- **Resolution:** Comments are stored as a **separate `Comments` table** (not a Node `itemType`), each row holding `CommentRootId` (FK → `Items.Id`) plus `ThreadParentId` (self-FK). This keeps the Node interface intact — comments are NOT items. Recorded in [`spec/04-database-conventions/02-schema-design.md`](../../spec/04-database-conventions/02-schema-design.md) and the unified-Node memory note (no change needed; reaffirmation only).
- **Owning SSOT:** `mem://architecture/data-model` (unchanged) + `spec/04-database-conventions/02-schema-design.md` (Comments table).
- **Verification:** ItemType enum stays at 12 values (G-15 enum-sync gate).

### F4-4 — WP cron via `wp_schedule_event`
- **Source:** F4 pass.
- **Conflict:** Trash 30-day reaper needs a scheduler; Workflowy doesn't specify the host platform.
- **Resolution:** WP plugin uses `wp_schedule_event('daily', 'workflowy_trash_reaper')` registered at plugin activation; manual run via `EP-REAPER-RUN`. Documented in [`spec/31-app/01-features/11b-trash-reaper.md`](../../spec/31-app/01-features/11b-trash-reaper.md) and [`spec/15-wp-plugin-how-to/08-wordpress-integration-patterns/`](../../spec/15-wp-plugin-how-to/08-wordpress-integration-patterns/).
- **Owning SSOT:** `mem://features/trash-logic` (30-day retention) + `11b-trash-reaper.md`.
- **Verification:** `AT-APP-81..85` cover reaper run + audit log.

### F5-1 — Settings endpoints must register in `spec/31-app/06-endpoints/`
- **Source:** F5 pass.
- **Conflict:** F5 created [`spec/36-user-management/01-account-and-settings.md`](../../spec/36-user-management/01-account-and-settings.md) with a 12-row REST surface, but those endpoints were not yet in the canonical endpoint matrix.
- **Resolution:** Added a follow-up requirement: the 12 `/wp-json/workflowy/v1/me/*` routes MUST appear as rows in [`spec/31-app/06-endpoints/16-endpoint-at-matrix.md`](../../spec/31-app/06-endpoints/16-endpoint-at-matrix.md) before any P5 promotion of `36-user-management` from scaffold. Tracked as a P5 prerequisite (see "Open follow-ups" below).
- **Owning SSOT:** Endpoint matrix.
- **Verification:** G-29 (`scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs`) will fail if any `EP-ME-*` symbol is referenced without a matrix row.

### F5-2 — MFA enrolment recovery-code download flow must match design-system modal-blocking pattern
- **Source:** F5 pass.
- **Conflict:** Recovery-code download is a one-time-show flow; needed to confirm it uses the canonical modal-blocking pattern (not a toast or non-blocking sheet).
- **Resolution:** MUST use the design-system "blocking modal with explicit acknowledgement" pattern from [`spec/07-design-system/`](../../spec/07-design-system/) (button labelled "I have saved my recovery codes" required before dismiss; close-X disabled until acknowledged). Documented in [`spec/36-user-management/01-account-and-settings.md`](../../spec/36-user-management/01-account-and-settings.md) §"Account & Identity → MFA".
- **Owning SSOT:** Design system modal patterns.
- **Verification:** `AT-USR-*` ATs (reserved range) cover the acknowledgement gate.

---

## Resolution summary

| # | Flag | Source | Resolution mode | Owning SSOT after reconciliation |
|---|------|--------|-----------------|----------------------------------|
| 1 | Hotkey appendix → AT-HK-* | F1 | Cite SSOT | `01-features/05-interactions.md` |
| 2 | `is:mirror` semantics | F2 | Document peer-group meaning | `mem://features/mirroring` + search ranking |
| 3 | Recurring date chips | F2 | Defer to roadmap | `04-roadmap/` |
| 4 | Slash→handler binding | F3 | Manual review now, G-39 later | endpoint matrix + slash table |
| 5 | "mirror copy" forbidden | F3 | Extend G-38 BANNED list | `mem://features/mirroring` |
| 6 | Mirror founder semantics | F3 | Informational `IsFounder` only | `09b-mirror-peer-group-model.md` |
| 7 | Card-drop fractional sort | F4 | Confirm parity (no change needed) | `mem://features/editor-core` |
| 8 | Public-link URL pattern | F4 | Document `/s/<token>` route | endpoint matrix + envelope fixtures |
| 9 | `comment_root_id` FK | F4 | Separate `Comments` table | schema-design + data-model memory |
| 10 | Trash reaper WP cron | F4 | `wp_schedule_event` daily | `11b-trash-reaper.md` |
| 11 | Settings endpoints in matrix | F5 | Required before P5 promotion | endpoint matrix |
| 12 | MFA recovery-code modal | F5 | Blocking-modal pattern | design system + `36-user-management/01-…` |

---

## Open follow-ups (escalated, not deferred)

These are concrete tickets carried forward — none are "TBD":

1. **P5-prereq (from F5-1):** add 12 `/me/*` endpoint rows to [`spec/31-app/06-endpoints/16-endpoint-at-matrix.md`](../../spec/31-app/06-endpoints/16-endpoint-at-matrix.md) before promoting `36-user-management` from scaffold.
2. **P11-candidate (from F3-1):** implement `scripts/spec-hygiene/39-check-slash-command-binding.mjs` to automate slash→endpoint cross-checks.
3. **Roadmap entry (from F2-2):** add "recurring date chips" to [`spec/31-app/04-roadmap/`](../../spec/31-app/04-roadmap/) as a v2 candidate.

---

## Verification

```bash
# Hygiene must pass after the BANNED-phrase extension (F3-2)
node scripts/spec-hygiene/38-check-ambiguous-wording.mjs

# AT citations resolve (F1-1)
node scripts/spec-hygiene/30-check-at-citation-validity.mjs

# Endpoint matrix coverage (F4-2, F5-1)
node scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs

# Enum sync (F4-3 — confirms 12-value ItemType unchanged)
node scripts/spec-hygiene/15-check-enums-in-sync.mjs

# Full suite
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`../00-active.md`](../00-active.md) — Active plan with F1–F6 task summaries
- [`./04-f01-rollup-enrichment.md`](./04-f01-rollup-enrichment.md) — F1 archive
- [`./05-f02-wp-plugin-cicd.md`](./05-f02-wp-plugin-cicd.md) — F2 archive
- [`./06-f03-powershell-boundary.md`](./06-f03-powershell-boundary.md) — F3 archive
- [`./07-f04-highlighter-pin.md`](./07-f04-highlighter-pin.md) — F4 archive

---

*Created 2026-04-28 — closes F7 by reconciling all 12 flags with concrete resolutions and owning SSOTs.*
