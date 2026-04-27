# Task Counter — No-Questions Mode

**Status:** 🟢 ACTIVE
**Activated:** 2026-04-27
**Tasks completed: 9 / 40**

---

## Log

| # | Date | Task summary | Ambiguities logged |
|---|------|--------------|--------------------|
| 01 | 2026-04-27 | Spec consolidation pass (F1+F2+F3): bumped 7 parent SSOTs with addendum cross-refs, refreshed 99-consistency-report.md to v2.2.0 (inventory 18→27), added §8 footnote to round-4 audit linking B1–B4 work, updated spec-index.md version cells. | 1 (`01-audit-already-closed.md`) |
| 02 | 2026-04-27 | Registered 50 new ATs (`AT-APP-58..107`) from B1–B4 addendums in canonical `spec/31-app/97-acceptance-criteria.md` (v2.6.0); added 8 dispatch rows + validation history to `spec/31-app/01-features/97-acceptance-criteria.md` (v2.2.0). | 1 (`02-at-prefix-mgp-vs-mpg.md`) |
| 03 | 2026-04-27 | F4 SQL DDL audit: added `ReaperRuns` table (B4/11b) to `02-app-schema.sql` v2.1.0; added `IdxItem_UpdatedAt`, `IdxItem_LiveByUpdatedAt` (partial), `IdxReaperRuns_RanAt`, plus commented FTS5 template to `03-app-indexes.sql` v2.1.0; added Naming Bridge section to sql/`00-overview.md` v2.1.0 documenting `Item↔Items`, `Content↔Title`, `FractionalIndex↔SortOrder` aliases. | 1 (`03-ddl-naming-bridge.md`) |
| 04 | 2026-04-27 | F6 endpoint contracts: created 4 endpoint files — `11b-trash-reaper.md` (EP-REAPER-RUN, EP-REAPER-RUNS-LIST), `15-search.md` (EP-SEARCH-QUERY), `14b-sync-replay.md` (EP-SYNC-REPLAY), `09b-mirror-peer-group.md` (EP-MIRRORS-GROUP-GET, EP-MIRRORS-DETACH). Bumped `16-endpoint-at-matrix.md` v1.0.0→v1.1.0 (41→47 endpoints, 6 new rows, coverage counts updated). Added addendum-files note to `00-overview.md`. | 1 (`04-at-prefix-for-new-endpoints.md`) |
| 05 | 2026-04-27 | F7 ERD refresh: bumped `03-app-db-erd.md` v1.0.0→v1.1.0 — added `MirrorPeerGroup`, `MirrorPeerGroupMember`, `ReaperRuns` entities + relationships; deprecated legacy `Mirror` (kept for back-compat). Bumped `06-indexes.md` v1.0.0→v1.1.0 — added 4 new indexes (`IdxItem_UpdatedAt`, `IdxItem_LiveByUpdatedAt` partial, `IdxReaperRuns_RanAt`, `IdxMirrorPeerGroupMember_ItemId` UNIQUE partial, `IdxMirrorPeerGroupMember_GroupId`); added 4 endpoints + edges to flowchart; reversed prior "NOT needed" stance on `IdxItem_UpdatedAt`. | 1 (`05-mirror-table-deprecation.md`) |
| 06 | 2026-04-27 | F8 G-29 gate: created algorithm SSOT `22-g29-endpoint-matrix-coverage-gate.md` v1.0.0; shipped runner `scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs` (148 lines, exit 0/1/2, 4-axis check: orphan-endpoint, phantom-row, missing-at-citation, duplicate-row); registered G-29 in `02-ci-quality-gates.md` and `scripts/spec-hygiene/00-run-all.mjs`. Gate caught + fixed pre-existing matrix drift (3 ID renames + 1 missing `EP-TRASH-PURGE-ALL` row). Final state: ✅ 48 declared, 48 matrixed, all paired with ≥1 AT. | 1 (`06-matrix-prexisting-drift.md`) |
| 07 | 2026-04-27 | F9 AT citation fix: discovered + fixed 7 wrong AT-APP citations in 4 endpoint files created in F6 (numbers off by 3–10 from canonical registry). Fixed `11b-trash-reaper.md` (78→81..84, 81→85), `14b-sync-replay.md` (90..94→97..102), `15-search.md` (100..103→103..107), `09b-mirror-peer-group.md` (`AT-MGP-58..62` invented → `AT-APP-58,60,65` + `AT-APP-61,63,64`). Replaced bad `AT-APP-24, AT-TRASH-07` for `EP-TRASH-PURGE-ALL` with correct `AT-APP-19, AT-TRASH-08, AT-TRASH-09`. G-29 still ✅ green. | 1 (`07-at-citation-drift.md`) |
| 08 | 2026-04-27 | F10 G-30 gate: created algorithm SSOT `23-g30-at-citation-validity-gate.md` v1.0.0; shipped runner `scripts/spec-hygiene/30-check-at-citation-validity.mjs` (190 lines) supporting three declaration shapes — single-ID (backticked or plain), backticked range (`AT-APPF-01..05` enumeration), and open-prefix placeholder (`AT-INFO-NN` series licensing). Caught + fixed two regex bugs during dev (digit-swallowing prefix, missed un-backticked first cells). Registered in `02-ci-quality-gates.md` row G-30 + `00-run-all.mjs`. Gate is green: 856 closed IDs + 32 open prefixes covering 163 unique citations across 201 sites. Negative-tested with bogus `AT-BOGUS-99` injection (correctly exits 1). | 1 (`08-at-open-prefix-licensing.md`) |

---

## Notes

- Increment after each completed user task.
- One row per task, even if the task logged zero ambiguities.
- When count reaches **40**, set Status to 🔴 EXPIRED and notify the user to review the ambiguity folder.
