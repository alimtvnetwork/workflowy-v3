# 16 — Operator Runbooks

> **Version:** 1.1.0
> **Created:** 2026-04-26 (UTC+8)
> **Status:** Active
> **Parent:** [`spec/15-wp-plugin-how-to/00-overview.md`](../00-overview.md)

---

## Purpose

This folder contains **executable operational procedures** — concrete commands, file paths, environment variables, and decision points — that translate the policy SSOTs in `spec/31-app/05-conventions/` into actions a human operator runs at 03:00 during an incident.

A **policy SSOT** says *what* must happen ("integrity check MUST pass"). A **runbook** says *how* — the exact `sqlite3 .pragma integrity_check` command, the exact filesystem path, the exact failure-mode branch.

## Distinction from policy SSOTs

| Document type | Lives in | Audience | Style | Example |
|---|---|---|---|---|
| **Policy SSOT** | `spec/31-app/05-conventions/` | Implementers, auditors | Normative prose, MUST/MAY | "Integrity check MUST pass before mounting." |
| **Runbook** | `spec/15-wp-plugin-how-to/16-operator-runbooks/` | On-call operators | Imperative steps with copy-paste commands | `sqlite3 /var/restore/staging.sqlite 'PRAGMA integrity_check;' \| grep -q '^ok$'` |

A runbook MUST cite the policy SSOT it implements (forward link). The policy SSOT MAY cite the runbook (back link, optional).

## Files

| File | Implements policy | Severity of failure |
|------|---|---|
| [`01-disaster-recovery-restore.md`](./01-disaster-recovery-restore.md) | A-44 (`14-backup-and-dr-policy.md`) §7 | `fatal` — service down |
| [`02-backup-key-rotation.md`](./02-backup-key-rotation.md) | A-44 (`14-backup-and-dr-policy.md`) §5 | `warn` (scheduled) / `fatal` (if retired KEK destroyed before 2-yr overlap expires) |

## Authoring rules

1. **Every step has one verb.** No compound steps.
2. **Every command is copy-pasteable.** Variables in `$ALL_CAPS`, defined at the top.
3. **Every branch is explicit.** "If X, go to step N. Else continue."
4. **Every failure mode lists its rollback.** No silent abort.
5. **Every runbook ends with a post-mortem template link.**
6. **Every runbook MUST be drilled** at the cadence its policy SSOT requires.
7. **No filler prose.** Steps only.

## Hygiene gate

A runbook is **stale** if its referenced policy SSOT version is newer than the runbook's `_(matches A-XX vYY.ZZ.W)_` annotation. The next CI hygiene check (`19-check-runbook-staleness.mjs`, future) will fail builds where runbook ↔ policy versions drift.
