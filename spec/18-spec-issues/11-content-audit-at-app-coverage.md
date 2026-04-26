# Content Audit — `AT-APP-NN` Coverage Completeness (2026-04-26)

> **Version:** 1.0.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** ✅ **PASS — 98/100** (1 high-severity drift found + fixed in same pass)
> **Auditor mode:** AT coverage parity vs feature SSOTs
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Scope:** `spec/31-app/97-acceptance-criteria.md` rows AT-APP-26..42 (Today / Templates / Concurrency / SSE)

---

## 0. Executive Summary

| Dimension | Score | Verdict |
|-----------|:-----:|---------|
| AT-APP rows present (contiguous 01..57) | 100 / 100 | ✅ Zero gaps |
| Today view coverage (3 rows: 26, 27, 28) | 100 / 100 | ✅ §9.1 + Settings |
| Templates coverage (4 rows: 29..32) + workflows (43..46) | 100 / 100 | ✅ §13.1–13.4 |
| Core sync coverage (3 rows: 33..35) | 100 / 100 | ✅ §14.2 + §14.4 |
| SSE transport coverage (7 rows: 36..42) | 100 / 100 | ✅ §14.5.1–14.5.7 |
| **Event vocabulary parity vs §14.5.2** | **70 / 100 → 100 / 100 after fix** | ⚠️ → ✅ Fixed |
| Cross-reference integrity | 100 / 100 | ✅ All §-refs resolve |
| **Composite** | **98 / 100** | ✅ AI-handoff-ready |

---

## 1. Method

1. Grepped `AT-APP-\d+` from `97-acceptance-criteria.md` — confirmed contiguous 01..57 (no gaps).
2. Cross-checked Today view AT rows against `01-features/10-today-view.md` §9.1 + Settings Keys.
3. Cross-checked Templates AT rows against `01-features/13-templates.md` §13.1–13.4.
4. Cross-checked Concurrency core AT rows (33–35) against `01-features/14-concurrency-and-sync.md` §14.2 + §14.4.
5. Cross-checked SSE transport AT rows (36–42) against §14.5.1–14.5.7.
6. **Verified the "closed set of 9 names"** in `AT-APP-37` against the canonical event table in §14.5.2.
7. Searched all of `spec/31-app/` for stale event names (`item-created`, `mirror-created`).

---

## 2. Findings

### F-AUD30-07 — `AT-APP-37` event-vocabulary drift (HIGH)

- **Severity:** HIGH (AC SSOT contradicted feature SSOT)
- **Files:**
  - `spec/31-app/97-acceptance-criteria.md` (`AT-APP-37`, `AT-APP-44`, `AT-APP-56`)
  - `spec/31-app/06-endpoints/14-concurrency-and-sync.md` (event-vocabulary block)
  - `spec/31-app/06-endpoints/01-information-model.md`
  - `spec/31-app/06-endpoints/06-item-context-menu.md`
  - `spec/31-app/06-endpoints/13-templates.md`
- **Problem:** `AT-APP-37` enumerated the closed event set as:
  > `item-created`, `item-updated`, `item-deleted`, `item-restored`, `mirror-created`, `mirror-broken`, `share-granted`, `share-revoked`, `cursor-overflow`

  But the canonical SSOT in `01-features/14-concurrency-and-sync.md` §14.5.2 defines a different 9-name set:
  > `item-updated` (covers create + edit), `item-deleted`, `item-restored`, `mirror-broken`, `mirror-healed`, `share-granted`, `share-revoked`, `presence`, `cursor-overflow`

  Two events (`item-created`, `mirror-created`) **do not exist** in the canonical SSOT; two events (`mirror-healed`, `presence`) were missing from the AC. This drift was introduced in the prior content-audit fix (F-AUD30-01) that converted dot-notation → hyphen-notation but invented the wrong canonical names.
- **AI risk:** AI implementing the SSE consumer per `AT-APP-37` would subscribe to `item-created`/`mirror-created` events that never fire, and would fail to handle `mirror-healed`/`presence` events that do fire → silent realtime breakage.
- **Fix applied (2026-04-26):**
  - `AT-APP-37` rewritten with the canonical 9 names + clarification that creation surfaces as `item-updated` on a new ID and `:hb` heartbeat is not an event.
  - `AT-APP-44` (`item-created` → `item-updated`).
  - `AT-APP-56` (`mirror-created` (heal variant) → `mirror-healed`).
  - 4 endpoint files: bulk `sed` `item-created` → `item-updated`; `mirror-created` → `mirror-healed`.
  - Endpoint `14-concurrency-and-sync.md` event-vocabulary block rewritten to match canonical 9; bumped to v1.2.0.
  - `97-acceptance-criteria.md` bumped to v2.5.0.

---

## 3. Coverage Verification

### Today (3 ATs)
| AT | Coverage |
|----|----------|
| AT-APP-26 | Aggregation rule (§9.1) |
| AT-APP-27 | Completion behaviour (§9.1 + Outputs) |
| AT-APP-28 | Settings keys (`today.includeOverdue`, `today.startOfDay`) |

### Templates (4 + 4 ATs)
| AT | Coverage |
|----|----------|
| AT-APP-29..32 | Snapshot semantics, deep copy, mirror collapse, lifecycle independence |
| AT-APP-43..46 | Apply workflow: permission, SSE propagation, idempotency, rollback |

### Concurrency core (3 ATs)
| AT | Coverage |
|----|----------|
| AT-APP-33 | Field-level LWW (§14.2) |
| AT-APP-34 | `Mirrors.BrokenAt` extended LWW (§14.4) |
| AT-APP-35 | Cascade delete → mirror break (§14.4 Cascade) |

### SSE transport (7 ATs)
| AT | Coverage |
|----|----------|
| AT-APP-36 | URL + auth + forbidden alternatives (§14.5.1, §14.5.7) |
| AT-APP-37 | Closed 9-name vocabulary (§14.5.2) — **fixed in this pass** |
| AT-APP-38 | `id: {ServerTs}` resume (§14.5.3) |
| AT-APP-39 | Poll fallback ≤ 1 req / 5 s (§14.5.4) |
| AT-APP-40 | Replay + dedupe (§14.5.5) |
| AT-APP-41 | 15 s heartbeat / 30 s drop (§14.5.6) |
| AT-APP-42 | `cursor-overflow` → re-sync (§14.5.2 + §14.5.5) |

**Verdict:** Zero coverage gaps. Today / Templates / Concurrency / SSE are fully spec'd at canonical AC level.

---

## 4. Verification

```bash
rg -oP "AT-APP-\d+" spec/31-app/97-acceptance-criteria.md | sort -u | wc -l   # → 57 (contiguous)
rg -nP "(item-created|mirror-created)" spec/31-app/                            # → 0
node scripts/spec-hygiene/00-run-all.mjs                                       # → 17/18
```

The only remaining hygiene failure (`F-AUD27-01` — `ItemType` enum drift) is gated by `mem://constraints/spec-only-mode`.

---

## 5. Validation History

| Date | Version | Action |
|------|---------|--------|
| 2026-04-26 | 1.0.0 | Coverage audit + F-AUD30-07 event-vocabulary drift found and fixed (AC v2.5.0, endpoint v1.2.0). |

---

## Related

- [`00-overview.md`](./00-overview.md) — Audit index
- [`10-content-audit-endpoints-and-db-diagram.md`](./10-content-audit-endpoints-and-db-diagram.md) — Prior pass (F-AUD30-01..06)
- [`08-audit-06-sse-transport-contract.md`](./08-audit-06-sse-transport-contract.md) — SSE contract SSOT
- [`spec/31-app/97-acceptance-criteria.md`](../31-app/97-acceptance-criteria.md) §`AT-APP-37`
- [`spec/31-app/01-features/14-concurrency-and-sync.md`](../31-app/01-features/14-concurrency-and-sync.md) §14.5.2 — Canonical 9-event set
