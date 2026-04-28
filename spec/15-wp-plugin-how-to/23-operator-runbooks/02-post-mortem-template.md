# Disaster-Recovery Post-Mortem Template

> **Version:** 1.0.0
> **Updated:** 2026-04-28 (UTC+8)
> **Owner:** Operator on call
> **Trigger:** `SYSTEM.RESTORE_INITIATED` audit-row creation (see [`./01-disaster-recovery-restore.md`](./01-disaster-recovery-restore.md) §"Within 7 days")
> **Deadline:** 7 calendar days from restore completion

---

## Header (fill in)

| Field | Value |
|-------|-------|
| Ticket | `OPS-NNNN` |
| Restore audit row | `SYSTEM.RESTORE_INITIATED` row id |
| Tier restored | Tier 0 / Tier 1 / Tier 2 |
| Snapshot age chosen | `<duration>` |
| RPO target → actual | `<target>` → `<actual>` |
| RTO target → actual | `<target>` → `<actual>` |
| Operator on call | `<name>` |
| Reviewers | `<names>` |

---

## Required sections (every post-mortem MUST have these — A-44 §7 step 12)

### 1. Root cause
What failed in production. Concrete, blameless, evidence-linked.

### 2. Why backups were needed
A factual reason. Not "as a precaution" or "out of caution".

### 3. RPO / RTO actually achieved vs target
Numbers, not adjectives. Include the formula used.

### 4. Snapshot age chosen and why
Why this snapshot generation, not a newer or older one.

### 5. Audit-chain rewind acknowledgement (Tier 0 only)
Explicit acknowledgement that the audit chain was rewound, with the affected hash range.

### 6. Action items to prevent recurrence
Each action item MUST have: owner, due date, ticket id, and one of `prevent` / `detect` / `recover` as its category.

---

## Verification

This template is referenced by `01-disaster-recovery-restore.md` line ~308. CI gate `G-37` (`scripts/spec-hygiene/37-check-stale-relative-links.mjs`) ensures the link stays valid.

---

## Related

- [`./01-disaster-recovery-restore.md`](./01-disaster-recovery-restore.md) — Parent runbook
- A-44 §7 step 12 — Post-mortem requirement source

---

*Created 2026-04-28 to close the only remaining `(TBD)` placeholder in active spec (P4).*
