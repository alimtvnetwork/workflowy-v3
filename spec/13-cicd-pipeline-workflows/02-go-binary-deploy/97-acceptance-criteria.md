# Go Binary Deploy — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8) — populated from scaffold (polish #3, A-26 wave-2). v0.1.0 was auto-generated stub.
> **Status:** DEFERRED (out-of-scope for current WP-plugin stack; preserved as canonical SSOT for future Go-binary deploy — see legend §2 mapping)
> **Scope:** ⚠️ **Out-of-scope for the current stack** (chosen runtime is WordPress plugin per S003 / `mem://constraints/backend-runtime-deferred`). Preserved as the canonical SSOT for any future Go-binary deployment effort and as the sibling pattern referenced by [`spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/`](../18-wp-plugin-deploy/00-overview.md).
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-GOBINARYDEPLOY-01` … `AT-GOBINARYDEPLOY-08`

---

## Criteria

### CI pipeline

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-GOBINARYDEPLOY-01` | Every PR runs the documented Go CI pipeline (lint → vet → test → build) and a failing stage blocks merge — no manual override. | [`01-ci-pipeline.md`](./01-ci-pipeline.md) |
| `AT-GOBINARYDEPLOY-02` | The CI pipeline produces a deterministic build artifact (same commit → same SHA-256) on a clean runner. | [`01-ci-pipeline.md`](./01-ci-pipeline.md) |
| `AT-GOBINARYDEPLOY-03` | Test coverage for the production-bound packages MUST meet the threshold defined in `01-ci-pipeline.md`; coverage drop is a hard fail. | [`01-ci-pipeline.md`](./01-ci-pipeline.md) |

### Release pipeline

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-GOBINARYDEPLOY-04` | Release builds use cross-compilation matrix (linux/amd64, linux/arm64, darwin/amd64, darwin/arm64, windows/amd64) per `04-semantic-versioning`/`10-cross-compilation` rules in the parent self-update folder. | [`02-release-pipeline.md`](./02-release-pipeline.md) + [`spec/14-self-update-app-update/10-cross-compilation.md`](../../14-self-update-app-update/10-cross-compilation.md) |
| `AT-GOBINARYDEPLOY-05` | Each released artifact ships with a SHA-256 checksum file and is verified by the updater before activation (Code Red on missing/invalid checksum). | [`02-release-pipeline.md`](./02-release-pipeline.md) + [`spec/14-self-update-app-update/08-checksums-verification.md`](../../14-self-update-app-update/08-checksums-verification.md) |
| `AT-GOBINARYDEPLOY-06` | Release uploads are atomic (tag → upload all artifacts → publish manifest); partial uploads MUST NOT publish the manifest — Code Red. | [`02-release-pipeline.md`](./02-release-pipeline.md) |

### Complete workflow reference

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-GOBINARYDEPLOY-07` | The complete-workflow reference covers every stage end-to-end (commit → CI → release → manifest publish → updater fetch) with no undocumented hops. | [`03-complete-workflow-reference.md`](./03-complete-workflow-reference.md) + [`03a-stage-references-and-layout.md`](./03a-stage-references-and-layout.md) |
| `AT-GOBINARYDEPLOY-08` | Every stage has a documented failure mode with a rollback or "next safe action" — no stage may silently abandon a release in flight. | [`03-complete-workflow-reference.md`](./03-complete-workflow-reference.md) |

---

## Verification

```bash
grep -rn "AT-GOBINARYDEPLOY-" spec/13-cicd-pipeline-workflows/02-go-binary-deploy/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/`](../18-wp-plugin-deploy/00-overview.md) — **Active** WP-plugin equivalent (current stack)
- [`spec/14-self-update-app-update/`](../../14-self-update-app-update/) — Updater consumes these artifacts
- `mem://constraints/backend-runtime-deferred` — Why this folder is out-of-scope for the current stack

---

*Populated 2026-04-26 (polish #3, A-26 wave-2) — replaces scaffold; marked out-of-scope-for-current-stack but preserved as reference SSOT.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../../97a-acceptance-criteria-fixtures.md`](../../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
