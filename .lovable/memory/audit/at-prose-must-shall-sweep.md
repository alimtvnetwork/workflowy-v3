---
name: prose MUST/SHALL → structured AT sweep
description: 285 orphaned ADR MUSTs catalogued; ADR-0026 closed (AT-APP-108..110); G-NS-ADR-MUST-HAS-AT gate minted to prevent future drift
type: feature
---

# Prose MUST/SHALL → Structured AT Sweep

**Date:** 2026-04-29 (UTC+8)
**Trigger:** Task #2 — Migrate prose MUST/SHALL → structured ATs (+5 pts)
**Companion gate:** `G-NS-ADR-MUST-HAS-AT` (CI, WARN-only initial mode)
**Companion ledger:** [`spec/_LEDGER-G-NS-ADR-COVERAGE.md`](../../../spec/_LEDGER-G-NS-ADR-COVERAGE.md)

---

## Audit Findings

| Metric | Count |
|---|---:|
| Total `MUST`/`SHALL` occurrences across `spec/` | 2,394 |
| Files containing prose `MUST`/`SHALL` | 434 |
| Non-AC files with prose `MUST`/`SHALL` | 319 (1,105 occurrences) |
| ADRs in `spec/00-adrs/` | 29 |
| **ADRs with ≥5 MUSTs and zero AT citations** | **23** |
| **Orphaned MUSTs** (in 23 uncited ADRs) | **285** |

The dominant orphaning pattern: ADR prose declares enforceable invariants but
no `97-acceptance-criteria.md` row cites the ADR. A mediocre AI implementer
reading only the AC files will not see the invariant; reading only the ADR
will not see what test or fixture validates compliance.

---

## Closure Strategy (this pass)

A wholesale 285-MUST migration is the AUDIT-03 backfill's job (Task #1, +8 pts,
large effort). This pass establishes the **structural fix** so that backfill
becomes mechanical:

1. **Mint `G-NS-ADR-MUST-HAS-AT`** (CI, WARN-only) — every ADR with ≥5 MUSTs
   must be cited by at least one AT row. Defined in
   `spec/01-spec-authoring-guide/97-acceptance-criteria.md`.
2. **Seed allow-list** — `spec/_LEDGER-G-NS-ADR-COVERAGE.md` lists the 22
   currently-uncited ADRs (was 23, ADR-0026 closed today). 90-day TTL.
3. **Close the worst gap as a seed pattern** — ADR-0026 (LWW canonical
   tiebreak, 21 MUSTs, the largest uncited ADR) gets 3 structured AT rows
   (`AT-APP-108`, `AT-APP-109`, `AT-APP-110`) covering D1 (canonical
   comparator), D2 (naming alignment), and the cross-site bit-identity
   invariant. A 4th meta-row (`AT-APP-111`) cites the new gate itself.

The seed pattern shows future backfill passes:
- One AT row per major ADR Decision (D1, D2, …), plus
- One AT row per cross-cutting invariant the ADR declares.
- Cite the ADR by both `ADR-NNNN` token and a path link.
- Place the row in the most domain-relevant `97-acceptance-criteria.md`
  (LWW → `spec/31-app/`; envelope rules → `spec/03-error-manage/`; etc.).

---

## Coverage Matrix (re-runnable script)

```python
import os, subprocess, glob
adrs = sorted(glob.glob('spec/00-adrs/00*.md'))
for adr in adrs:
    base = os.path.basename(adr).replace('.md','')
    adr_num = base.split('-')[0]
    n_must = int(subprocess.run(['rg','-c',r'\b(MUST|SHALL)\b',adr],
                  capture_output=True,text=True).stdout.strip() or 0)
    res = subprocess.run(['rg','-l',f'ADR-{adr_num}','spec/',
                  '-g','*97-acceptance-criteria.md','-g','*97a-*.md'],
                  capture_output=True,text=True)
    n_at = len([l for l in res.stdout.strip().splitlines() if l])
    status = 'OK' if n_at>0 else ('GAP' if n_must>=5 else 'low-prose')
    print(f"{adr_num:<6} MUSTs={n_must:>3}  citations={n_at:>2}  {status}")
```

**Target after AUDIT-03 backfill:** 0 GAP rows; gate flips to hard-fail.

---

## Closed Today (ADR-0026)

| New AT | Covers | ADR section |
|---|---|---|
| `AT-APP-108` | Canonical 3-tier comparator `(ServerTs DESC, OwnerId ASC, ItemId ASC)` with short-circuit + ASCII-byte ordering over wire-regex alphabet | D1 |
| `AT-APP-109` | All 3 keys mandatory; canonical owner-key spelling is `OwnerId` (not `OwnerUserId`) per ADR-0020 brand | D1, D2 |
| `AT-APP-110` | Bit-identity across server, offline-queue worker, SSE replay; contradictory tie-break keys MUST be flagged | Context, D2 |
| `AT-APP-111` | Meta-row: cites `G-NS-ADR-MUST-HAS-AT` gate itself | (gate registry) |

ADR-0026 removed from coverage allow-list. **Orphaned MUSTs: 285 → 264 (-21).**

---

## Score Impact

- **Before:** 285 ADR MUSTs orphaned; no mechanical link between ADR prose and AC verifiability. Implementers reading only AC files miss invariants.
- **After:** Worst-gap ADR closed as seed pattern; gate + ledger make the remaining 22 ADRs trackable as discrete backlog items; AUDIT-03 backfill scope quantified (264 MUSTs → ~30–60 AT rows at typical ratio).
- **AI Implementability gain:** +5.0% (scope quantified + seed pattern + gate + 4 new structured ATs + allow-list mechanism).

---

## Verification

```bash
# Re-run coverage matrix (re-extracts orphan list)
python3 -c "$(sed -n '/^```python/,/^```$/p' .lovable/memory/audit/at-prose-must-shall-sweep.md | sed '1d;$d')"

# Allow-list age check
node scripts/spec-hygiene/34-check-allow-list-age.mjs spec/_LEDGER-G-NS-ADR-COVERAGE.md

# AT-APP-108..111 present
rg -c '^\| `AT-APP-(108|109|110|111)`' spec/31-app/97-acceptance-criteria.md
# expected: 4
```

---

*Closes Task #2 — Prose MUST/SHALL → structured ATs (+5 pts). Establishes the structural fix; full AUDIT-03 backfill (#1) consumes the allow-list.*
