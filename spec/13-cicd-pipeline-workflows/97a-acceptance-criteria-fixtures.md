# CICD Pipeline Workflows — Acceptance Criteria I/O Fixtures

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Concrete companion to [`97-acceptance-criteria.md`](./97-acceptance-criteria.md). Replaces P20 stub seed.
> **Format spec:** [`spec/01-spec-authoring-guide/19-acceptance-criteria-io-table.md`](../01-spec-authoring-guide/19-acceptance-criteria-io-table.md)
> **Spawned by:** `.lovable/plans/00-active.md` § P21.

---

## `AT-CICD-01` — Tag-driven releases only

| Given | A push event whose ref does **not** match `refs/tags/v*`. |
|---|---|
| **When** | Workflow `release.yml` triggers. |
| **Then** | The job named `release` MUST be skipped (`status=skipped`); only `lint` + `test` run. |
| **Negative** | A `push` to `main` that produces a GitHub Release MUST fail the gate. |
| **Test name** | `at_cicd_01_tag_driven_releases_only` |

## `AT-CICD-02` — Concurrency group per ref

| Linter command | `rg -nP "concurrency:\s*\n\s*group:\s*\$\{\{\s*github\.ref\s*\}\}" .github/workflows/release.yml` |
|---|---|
| **Expected exit code** | `0`. |
| **Negative** | Workflow without `concurrency.group: ${{ github.ref }}` MUST fail; a single ref MUST never have two concurrent release runs. |

## `AT-CICD-03` — Version SSOT per archetype

| Given | Browser-extension archetype with `manifest.json` `"version": "1.4.0"`. |
|---|---|
| **When** | Workflow reads version. |
| **Then** | Read step uses `manifest.json` (NOT a duplicate `package.json` `version`); workflow output `Version=1.4.0`. |
| **Negative** | Two version sources for one archetype MUST fail the SSOT gate. |

## `AT-CICD-04` — Asset checksum sidecar

| When | Release pipeline uploads `app-v1.4.0-linux-amd64.tar.gz`. |
|---|---|
| **Then** | A sibling file `app-v1.4.0-linux-amd64.tar.gz.sha256` is uploaded; sha256 inside matches the asset; sidecar mode `0644`. |
| **Negative** | Missing `.sha256` sidecar MUST fail the asset-completeness check. |

## `AT-CICD-05` — Permissions least-privilege

| Linter command | `rg -nP "^permissions:\s*$" .github/workflows/*.yml -A 5 \| rg -P "(contents|packages|id-token):\s*write"` |
|---|---|
| **Expected** | Only `contents: write` (release upload) and `id-token: write` (OIDC) appear; `packages: write` only in publish workflows. No top-level `permissions: write-all`. |
| **Negative** | `permissions: write-all` anywhere MUST fail. |

## `AT-CICD-06` — Release body from CHANGELOG

| Given | `CHANGELOG.md` contains a `## [1.4.0] — 2026-04-28` section. |
|---|---|
| **When** | Release `v1.4.0` is created. |
| **Then** | GitHub Release body equals the markdown between that heading and the next `## [` heading; trailing whitespace trimmed. |
| **Negative** | Release body equal to the auto-generated GitHub commit list MUST fail. |

## `AT-CICD-07` — Pre-release detection

| Given | Tag `v1.4.0-rc.1` is pushed. |
|---|---|
| **When** | Release pipeline runs. |
| **Then** | `gh release create` is called with `--prerelease`; release `prerelease` field = `true`. |
| **Negative** | A `-rc.N` / `-beta.N` / `-alpha.N` tag promoted as a stable release MUST fail. |

## `AT-CICD-08` — Reproducible asset names

| Linter command | `gh release view v1.4.0 --json assets -q '.assets[].name' \| rg -vP '^[a-z0-9-]+-v\d+\.\d+\.\d+(-[a-z0-9.]+)?-(linux\|darwin\|windows)-(amd64\|arm64)\.(tar\.gz\|zip)(\.sha256)?$'` |
|---|---|
| **Expected exit code** | `1` (no non-conforming names). |
| **Negative** | An asset named `app.zip` (no version, no platform) MUST fail. |

## `AT-CICD-09` — Vulnerability scan blocks release

| Given | `trivy` finds at least one `CRITICAL` vulnerability in the built image. |
|---|---|
| **When** | The `vuln-scan` job runs in the release workflow. |
| **Then** | Job exits non-zero; downstream `release` job is skipped (`needs: vuln-scan`). |
| **Negative** | Tag promotion in the presence of an unwaived `CRITICAL` finding MUST fail. |

## `AT-CICD-10` — Audit reports retained

| When | Vulnerability scan completes (pass or fail). |
|---|---|
| **Then** | Workflow uploads `trivy-report.sarif` and `trivy-report.json` as artifacts; retention `≥ 90 days`; SARIF also uploaded to GitHub Code Scanning (`github/codeql-action/upload-sarif`). |
| **Negative** | Scan run with no artifact upload MUST fail the auditability gate. |

---

## Verification

```bash
grep -c "^## \`AT-CICD-" spec/13-cicd-pipeline-workflows/97a-acceptance-criteria-fixtures.md
# expected: 10
node scripts/spec-hygiene/00-run-all.mjs
```

## Related

- [`97-acceptance-criteria.md`](./97-acceptance-criteria.md) — Source AT prose
- [`16-shared-conventions.md`](./16-shared-conventions.md) — Shared CI/CD conventions
- [`17-github-release-standard.md`](./17-github-release-standard.md) — Release standard
- [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md) — Envelope SSOT
