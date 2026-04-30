# AI Build Walkthrough — End-to-End Smoke Test (P9)

> **Version:** 1.0.0
> **Updated:** 2026-04-28 (UTC+8)
> **Status:** Active — normative example
> **Predecessor outputs:** [P6 contract.json](./22-contract-json.md), [P7 skeletons](./15-wp-plugin-how-to/skeletons/00-overview.md)

---

## AI Contract

**Purpose** — Prove that the spec + `contract.json` + P7 skeletons let an AI agent one-shot a complete vertical slice (spec → PHP route → React component) **without reading any source code**, citing only stable IDs (`AT-*`, `EP-*`, enum names, mem:// pointers). Pass criterion: every step below resolves to ≥1 cited SSOT row whose `Required SSOT` cell is non-empty AND the cited file exists at the stated path. If any step cannot be executed verbatim under that criterion, the spec has a gap and the failing step's `Required SSOT` row is the bug.

**Audience** — Any AI agent or human implementer building their first WorkFlowy feature; spec auditor running P10.

**Expected AI Output** —
- A working `views/today` REST handler in `RestRoutes.generated.php` (P7 emits the stub; this walkthrough fills it)
- A working `<TodayView />` React component under `src/views/today/`
- Vitest test suite covering `AT-TODAY-01..14`
- Zero deviations from the cited SSOT files

**Out of Scope** —
- Performance optimization beyond the 250-item view limit (`mem://architecture/data-model`)
- Multi-user share semantics → [`08-share-dialog`](./31-app/01-features/08-share-dialog.md)
- New endpoints — this walkthrough uses ONLY `EP-VIEWS-TODAY` (already in contract.json)

**Definition of Done** —
- All 7 steps below cite at least one `AT-*` or `EP-*` from `spec/contract.json`
- Final step verifies `AT-TODAY-01..14` all pass per [`31-app/01-features/10-today-view.md`](./31-app/01-features/10-today-view.md) §Acceptance Tests
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0
- An AI agent following these steps produces working code in one pass without re-reading the spec markdown (only `contract.json` + the cited SSOT files)

> Authoring rules: see [`spec/01-spec-authoring-guide/18-ai-contract-template.md`](./01-spec-authoring-guide/18-ai-contract-template.md).

---

## Chosen feature: Today View

| Aspect | Value | Source |
|--------|-------|--------|
| Spec file | [`31-app/01-features/10-today-view.md`](./31-app/01-features/10-today-view.md) | F2 merge |
| Endpoint | `EP-VIEWS-TODAY` — `GET views/today` | `contract.json#endpoints` |
| Acceptance tests | `AT-TODAY-01..14` (14 IDs) | `contract.json#acceptance_tests` |
| Enums consumed | `ItemType`, `SortDirectionType`, `TrashRetentionType` | `contract.json#enums` |
| Mem rules | `mem://features/trash-logic` (excludes trashed), `mem://features/mirroring` (mirrors surface as peers), `mem://features/offline-resilience` (LWW on conflict) | — |

Why Today View: smallest non-trivial feature that exercises (a) a single REST endpoint, (b) the canonical envelope, (c) timezone logic, (d) mirror semantics, (e) trash exclusion, (f) the 250-item cap.

---

## Step 1 — Resolve the contract slice

**AI action:** read `spec/contract.json` and pluck the relevant rows.

```bash
jq '.endpoints[] | select(.id == "EP-VIEWS-TODAY")' spec/contract.json
jq '[.acceptance_tests[] | select(.id | startswith("AT-TODAY-"))] | length' spec/contract.json   # → 14
jq '.enums[] | select(.name == "ItemType") | .values' spec/contract.json
```

**Required SSOT:** `spec/contract.json` only. No markdown read.

**Stop condition:** if `length` ≠ 14 OR `EP-VIEWS-TODAY` missing → re-run [`P6 generator`](../scripts/spec-hygiene/40-generate-contract-json.mjs) before proceeding.

---

## Step 2 — Read the canonical AC table

**AI action:** open the single SSOT for behavior — [`31-app/01-features/10-today-view.md`](./31-app/01-features/10-today-view.md) §Acceptance Tests — and bind each `AT-TODAY-NN` row to a concrete I/O fixture.

| AT | Definition | Test name |
|----|-----------|-----------|
| `AT-TODAY-01` | User has items assigned today + overdue | `groups overdue and today separately` |
| `AT-TODAY-02` | No items due or overdue | `renders empty state copy` |
| `AT-TODAY-08` | Item TZ is today in user TZ but yesterday in UTC | `applies user TZ for date bucket` |
| `AT-TODAY-10` | Item is a mirror | `mirror surfaces under its parent breadcrumb only once` |
| `AT-TODAY-11` | View is open at 23:59 local | `view re-buckets when local clock crosses midnight` |
| `AT-TODAY-13` | Network drops | `falls back to last cached snapshot + offline badge` |

**Required SSOT:** `10-today-view.md` (single file).

---

## Step 3 — Wire the PHP handler (uses P7 skeleton)

**AI action:** open the auto-generated stub in [`15-wp-plugin-how-to/skeletons/php/RestRoutes.generated.php`](./15-wp-plugin-how-to/skeletons/php/RestRoutes.generated.php), find `handle_views_today`, and replace the 501 stub body with the implementation. Do NOT edit the registration block — it is already correct.

```php
public static function handle_views_today(\WP_REST_Request $request): \WP_REST_Response {
    $userId   = get_current_user_id();
    $tz       = $request->get_param('tz') ?? 'UTC';      // AT-TODAY-08
    $cursor   = $request->get_param('cursor');           // pagination per AT-TODAY-09 (500 overdue)
    $limit    = 250;                                     // mem://architecture/data-model — view cap

    $service  = new TodayViewService();
    $results  = $service->collect($userId, $tz, $cursor, $limit);

    return new \WP_REST_Response([
        'Status'     => ['Code' => 200, 'Message' => 'Ok'],
        'Attributes' => [
            'EndpointId'  => 'EP-VIEWS-TODAY',
            'UserTimezone'=> $tz,
            'NextCursor'  => $results['nextCursor'],
            'TotalToday'  => $results['totalToday'],
            'TotalOverdue'=> $results['totalOverdue'],
        ],
        'Results'    => $results['items'],   // [{ id, parentId, content, itemType, dueAt, isOverdue }]
    ], 200);
}
```

**Required SSOT:**
- envelope shape → `mem://architecture/tech-stack` (PascalCase keys; Status/Attributes/Results mandatory)
- `itemType` enum values → `contract.json#enums.ItemType`
- 250-cap → `mem://architecture/data-model`
- exclude trashed rows → `mem://features/trash-logic` (handled inside `TodayViewService::collect`)
- mirror peer dedup → `mem://features/mirroring` + [`09b-mirror-peer-group-model.md`](./31-app/01-features/09b-mirror-peer-group-model.md)

---

## Step 4 — Wire the TS API call (uses P7 skeleton)

**AI action:** the typed method already exists in [`32-ui-design/skeletons/ts/api-client.generated.ts`](./32-ui-design/skeletons/ts/api-client.generated.ts) as `viewsToday(): Promise<AxiosResponse<ApiEnvelope<unknown>>>`. Refine the `unknown` to a concrete result shape in a sibling non-generated file:

```ts
// src/views/today/today.types.ts
import type { ItemType } from '@/skeletons/ts/enums.generated';

export interface TodayItem {
  id: string;
  parentId: string;
  content: string;
  itemType: ItemType;
  dueAt: string;          // ISO 8601, server-side already TZ-bucketed
  isOverdue: boolean;
}

export interface TodayAttributes {
  EndpointId: 'EP-VIEWS-TODAY';
  UserTimezone: string;
  NextCursor: string | null;
  TotalToday: number;
  TotalOverdue: number;
}
```

**Required SSOT:** the contract envelope keys cited in step 3; no further markdown read.

---

## Step 5 — Author the React component

**AI action:** create `src/views/today/TodayView.tsx`. Keep logic ≤ 15 lines per function (`mem://constraints/coding-guidelines`); zero `any`; max 3 params. Render:

1. Two grouped lists: **Overdue** then **Today** (per `AT-TODAY-01`, `AT-TODAY-04`)
2. Empty state copy per `AT-TODAY-02`
3. Breadcrumb hover row (clickable per `AT-TODAY-12`)
4. Mirror badge when `itemType === ItemType.Bullet && isPartOfMirrorGroup` (per `AT-TODAY-10`, see also the diagram in [`09b-mirror-peer-group-model.md`](./31-app/01-features/09b-mirror-peer-group-model.md))
5. Offline banner when `useOfflineSnapshot()` returns stale data (per `AT-TODAY-13`, `mem://features/offline-resilience`)

State management rule: a single React Query cache keyed on `['views', 'today', userTz]`; refetch on visibility change to satisfy `AT-TODAY-11` (midnight rollover).

**Required SSOT:** [`31-app/01-features/10-today-view.md`](./31-app/01-features/10-today-view.md) §Component Contract (single source).

---

## Step 6 — Author the Vitest suite

**AI action:** create `src/views/today/TodayView.test.tsx`. Each test name MUST start with the AT id so failures map back to the contract:

```ts
it('AT-TODAY-01: groups overdue and today separately', async () => { /* … */ });
it('AT-TODAY-02: renders empty state copy', async () => { /* … */ });
it('AT-TODAY-08: applies user TZ for date bucket', async () => { /* … */ });
it('AT-TODAY-10: mirror surfaces once per parent breadcrumb', async () => { /* … */ });
it('AT-TODAY-11: re-buckets when local clock crosses midnight', async () => { /* … */ });
it('AT-TODAY-13: falls back to cached snapshot when network drops', async () => { /* … */ });
// … one per AT-TODAY-NN
```

**Test fixtures source:** [`31-app/01-features/10-today-view.md`](./31-app/01-features/10-today-view.md) §Inputs / §Outputs / §Edge Cases (already lists every fixture body).

---

## Step 7 — Verify the slice closes the contract

**AI action:** run the full hygiene + test pipeline.

```bash
node scripts/spec-hygiene/00-run-all.mjs                      # spec hygiene
node scripts/spec-hygiene/40-generate-contract-json.mjs       # contract refresh
node scripts/spec-hygiene/41-generate-skeletons.mjs           # skeleton refresh
bunx vitest run src/views/today                               # 14 tests, all green
```

**Stop condition:** every `AT-TODAY-NN` MUST appear in at least one `it(...)` name AND that test MUST pass. Map back to the contract:

```bash
jq -r '.acceptance_tests[] | select(.id | startswith("AT-TODAY-")) | .id' spec/contract.json \
  | while read at; do grep -qF "$at:" src/views/today/TodayView.test.tsx || echo "MISSING $at"; done
```

Empty output ⇒ slice closed. Any `MISSING AT-TODAY-NN` ⇒ go back to step 6.

---

## Self-test of this walkthrough

| Property | How verified | Status |
|----------|--------------|--------|
| Cites only stable IDs | `grep -oE 'AT-[A-Z]+-[0-9]+\|EP-[A-Z-]+' spec/23-ai-build-walkthrough.md` matches `contract.json` | ✅ |
| All `AT-TODAY-NN` covered | step 7 closes-the-loop check | ✅ |
| Zero source-code reads required | every required path is a `spec/…` or `mem://` URL | ✅ |
| Reproducible | re-running steps 3–7 idempotent (skeletons regenerated, tests deterministic) | ✅ |

---

## Failure modes (what proves a spec gap)

| Symptom in walkthrough | Spec gap | Owning ticket |
|-----------------------|----------|---------------|
| Step 1 jq returns 0 ATs | `contract.json` regen drift | run [`40-generate-contract-json.mjs`](../scripts/spec-hygiene/40-generate-contract-json.mjs) |
| Step 3 needs a value not in `mem://` or `spec/…` | Missing SSOT | open [`spec/18-spec-issues/`](./18-spec-issues/) entry |
| Step 5 needs a UI rule not in `10-today-view.md` §Component Contract | AT incomplete | extend the AC row + regen contract |
| Step 6 produces a test name without an `AT-` prefix | Test-AT mapping rule violated | fix in `src/views/today/TodayView.test.tsx` |

---

## Related

- [`22-contract-json.md`](./22-contract-json.md) — Source contract (P6)
- [`15-wp-plugin-how-to/skeletons/00-overview.md`](./15-wp-plugin-how-to/skeletons/00-overview.md) — PHP skeletons (P7)
- [`32-ui-design/skeletons/00-overview.md`](./32-ui-design/skeletons/00-overview.md) — TS skeletons (P7)
- [`31-app/01-features/10-today-view.md`](./31-app/01-features/10-today-view.md) — Today View SSOT
- [`01-spec-authoring-guide/18-ai-contract-template.md`](./01-spec-authoring-guide/18-ai-contract-template.md) — AI Contract template

---

*Created 2026-04-28 — closes P9. Re-run as part of P10 to re-validate the spec is still walkthrough-complete.*
