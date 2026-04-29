# Self-Update / App-Update — Acceptance Criteria (rollup)

> **Version:** 2.0.0
> **Updated:** 2026-04-26 (UTC+8) — populated from scaffold (polish #3, A-26 wave-2). v1.0.0 was scaffold.
> **Status:** DEFERRED (Go-binary self-updater; WP plugin uses WordPress update server — see legend §2 mapping)
> **Scope:** ⚠️ **Out-of-scope for the current stack** (Go-binary self-updater is not used by the WP plugin runtime; WordPress handles plugin updates via its own update server — see [`spec/15-wp-plugin-how-to/`](../15-wp-plugin-how-to/) and [`spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/`](../13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md)). Preserved as canonical SSOT for any future Go-binary product.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-SELFUPDATEAPPUPDATE-01` … `AT-SELFUPDATEAPPUPDATE-12`

---

## Criteria

### Update flow integrity

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-SELFUPDATEAPPUPDATE-01` | The updater MUST check the configured manifest URL, compare the remote version against the running binary version (semver), and only proceed when the remote is strictly greater. | [`01-self-update-overview.md`](./01-self-update-overview.md), [`02-deploy-path-resolution.md`](./02-deploy-path-resolution.md) |
| `AT-SELFUPDATEAPPUPDATE-02` | Deploy-path resolution MUST be deterministic and never rely on the current working directory; symlinks and renamed binaries are handled explicitly per `02-deploy-path-resolution.md`. | [`02-deploy-path-resolution.md`](./02-deploy-path-resolution.md), [`03-rename-first-deploy.md`](./03-rename-first-deploy.md) |
| `AT-SELFUPDATEAPPUPDATE-03` | Rename-first deploy: the new binary is downloaded next to the live binary, verified, then renamed-into-place atomically; the old binary is preserved for rollback. | [`03-rename-first-deploy.md`](./03-rename-first-deploy.md), [`06-cleanup.md`](./06-cleanup.md) |
| `AT-SELFUPDATEAPPUPDATE-04` | Hand-off from the old process to the new process re-execs cleanly without leaking sockets, file descriptors, or partial writes. | [`05-handoff-mechanism.md`](./05-handoff-mechanism.md) |
| `AT-SELFUPDATEAPPUPDATE-05` | Cleanup removes the prior binary only after the new binary has booted successfully past a documented healthcheck; failed boot triggers rollback. | [`06-cleanup.md`](./06-cleanup.md) |

### Verification & supply chain

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-SELFUPDATEAPPUPDATE-06` | Every downloaded asset is verified against a SHA-256 checksum from a signed manifest before any rename-into-place; verification failure aborts the update — Code Red on bypass. | [`07-release-assets.md`](./07-release-assets.md), [`08-checksums-verification.md`](./08-checksums-verification.md) |
| `AT-SELFUPDATEAPPUPDATE-07` | The release manifest is the SSOT for `Version`, `Channel`, `Url`, `Sha256`, `MinPreviousVersion`; missing or extra keys MUST be rejected. | [`07-release-assets.md`](./07-release-assets.md), [`15-config-file.md`](./15-config-file.md) |

### Versioning & branching (release-versioning subfolder)

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-SELFUPDATEAPPUPDATE-08` | Release versioning rules (auto-bump, tagging, changelog, branch strategy) are owned by [`09-release-versioning/`](./09-release-versioning/00-overview.md); see its rollup [`AT-RELEASEVERSIONING-NN`](./09-release-versioning/97-acceptance-criteria.md). | [`09-release-versioning/`](./09-release-versioning/00-overview.md) |

### Distribution

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-SELFUPDATEAPPUPDATE-09` | Cross-compilation matrix matches the documented platform list; missing a platform is a release-blocking defect. | [`10-cross-compilation.md`](./10-cross-compilation.md) |
| `AT-SELFUPDATEAPPUPDATE-10` | The release pipeline produces install scripts that are idempotent (re-running on an up-to-date system MUST be a no-op) and the updater binary is statically linked or ships its runtime. | [`11-release-pipeline.md`](./11-release-pipeline.md), [`12-install-scripts.md`](./12-install-scripts.md), [`13-updater-binary.md`](./13-updater-binary.md) |
| `AT-SELFUPDATEAPPUPDATE-11` | Network requirements are documented (allow-list of hosts, ports, fallback CDNs) so corp environments can pre-flight; the updater MUST NOT contact undocumented hosts. | [`14-network-requirements.md`](./14-network-requirements.md) |
| `AT-SELFUPDATEAPPUPDATE-12` | The `update` command workflow has a documented dry-run mode that performs all checks short of rename-into-place. | [`16-update-command-workflow.md`](./16-update-command-workflow.md) |

---

## Verification

```bash
grep -rn "AT-SELFUPDATEAPPUPDATE-" spec/14-self-update-app-update/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`09-release-versioning/97-acceptance-criteria.md`](./09-release-versioning/97-acceptance-criteria.md) — Curated child
- [`spec/13-cicd-pipeline-workflows/02-go-binary-deploy/`](../13-cicd-pipeline-workflows/02-go-binary-deploy/00-overview.md) — Producer of artifacts this folder consumes
- [`spec/15-wp-plugin-how-to/10-deployment-patterns/`](../15-wp-plugin-how-to/10-deployment-patterns/00-overview.md) — **Active** WP-plugin update path (current stack)
- `mem://constraints/backend-runtime-deferred` — Why this folder is out-of-scope for the current stack

---

*Populated 2026-04-26 (polish #3, A-26 wave-2) — replaces scaffold; marked out-of-scope-for-current-stack but preserved as reference SSOT.*


---

## Fixtures

Fixtures for every AT row in this file are covered by the global P2g sweep — see [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) (apply the matching pattern by section).
