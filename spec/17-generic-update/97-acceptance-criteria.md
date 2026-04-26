# Generic Update — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-26 (UTC+8) — populated from scaffold (polish #3, A-26 wave-2). v1.0.0 was scaffold.
> **Status:** Curated — 9 testable criteria
> **Scope:** ⚠️ **Out-of-scope for the current stack** (Go-binary self-update pattern; WP plugin uses the WordPress update mechanism — see [`spec/15-wp-plugin-how-to/10-deployment-patterns/`](../15-wp-plugin-how-to/10-deployment-patterns/00-overview.md) for the active flow). This folder is the **generic** version of [`spec/14-self-update-app-update/`](../14-self-update-app-update/00-overview.md) — kept as a slimmer reference for forks/embedders. Preserved as canonical SSOT for any future Go-binary product.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-GENERICUPDATE-01` … `AT-GENERICUPDATE-09`

---

## Criteria

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-GENERICUPDATE-01` | The generic-update flow MUST mirror the canonical self-update flow at the algorithmic level (check → download → verify → rename-into-place → handoff → cleanup); divergence between this folder and [`spec/14-self-update-app-update/`](../14-self-update-app-update/00-overview.md) is a defect. | [`01-self-update-overview.md`](./01-self-update-overview.md) + [`spec/14-self-update-app-update/01-self-update-overview.md`](../14-self-update-app-update/01-self-update-overview.md) |
| `AT-GENERICUPDATE-02` | Deploy-path resolution MUST be deterministic and never depend on the current working directory; the same rules as the canonical folder apply. | [`02-deploy-path-resolution.md`](./02-deploy-path-resolution.md) |
| `AT-GENERICUPDATE-03` | Rename-first deploy: download next to the live binary, verify checksum, then rename into place atomically; the old binary is preserved for rollback. | [`03-rename-first-deploy.md`](./03-rename-first-deploy.md) |
| `AT-GENERICUPDATE-04` | Build scripts produce reproducible artifacts (same commit → same SHA-256) on a clean runner. | [`04-build-scripts.md`](./04-build-scripts.md) |
| `AT-GENERICUPDATE-05` | Hand-off MUST re-exec the new binary cleanly; sockets, file descriptors, and pending writes are accounted for. | [`05-handoff-mechanism.md`](./05-handoff-mechanism.md) |
| `AT-GENERICUPDATE-06` | Cleanup removes the previous binary only after the new one has booted past a documented healthcheck; a failed boot triggers rollback to the preserved binary. | [`06-cleanup.md`](./06-cleanup.md) |
| `AT-GENERICUPDATE-07` | Console-safe handoff: any console attached to the old process MUST not be left in a broken state (TTY mode restored, ANSI reset emitted) before re-exec. | [`07-console-safe-handoff.md`](./07-console-safe-handoff.md) |
| `AT-GENERICUPDATE-08` | The `99-consistency-report.md` is regenerated whenever any of the 7 topic files changes and the score MUST be ≥95/100 before merge. | [`99-consistency-report.md`](./99-consistency-report.md) |
| `AT-GENERICUPDATE-09` | A `README.md` at the folder root MUST point readers to the canonical [`spec/14-self-update-app-update/`](../14-self-update-app-update/00-overview.md) for the full pattern; this folder is the slim subset. | [`README.md`](./README.md) |

---

## Verification

```bash
grep -rn "AT-GENERICUPDATE-" spec/17-generic-update/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/14-self-update-app-update/97-acceptance-criteria.md`](../14-self-update-app-update/97-acceptance-criteria.md) — Canonical (full) self-update rollup
- [`spec/15-wp-plugin-how-to/10-deployment-patterns/97-acceptance-criteria.md`](../15-wp-plugin-how-to/10-deployment-patterns/97-acceptance-criteria.md) — **Active** WP-plugin update path (current stack)
- `mem://constraints/backend-runtime-deferred` — Why this folder is out-of-scope for the current stack

---

*Populated 2026-04-26 (polish #3, A-26 wave-2) — replaces scaffold; marked out-of-scope-for-current-stack but preserved as reference SSOT.*
