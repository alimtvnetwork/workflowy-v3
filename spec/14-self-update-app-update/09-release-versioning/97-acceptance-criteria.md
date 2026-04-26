# Release Versioning — Acceptance Criteria

> **Version:** 1.0.0
> **Updated:** 2026-04-26 (UTC+8) — populated from scaffold (polish #3, A-26 wave-2). v0.1.0 was auto-generated stub.
> **Status:** Curated — 12 testable criteria
> **Scope:** ⚠️ **Out-of-scope for the current stack** (parent self-update folder is Go-binary; WP plugin uses WordPress's own version mechanism — see [`spec/15-wp-plugin-how-to/10-deployment-patterns/`](../../15-wp-plugin-how-to/10-deployment-patterns/00-overview.md) for the active versioning rules). Preserved as canonical SSOT for any future Go-binary product.
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## ID Range

`AT-RELEASEVERSIONING-01` … `AT-RELEASEVERSIONING-12`

---

## Criteria

### Version resolution & detection

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-RELEASEVERSIONING-01` | Version resolution at runtime MUST return the exact version embedded at build time (e.g., via `-ldflags`); a binary that returns "dev" or "unknown" outside local builds is a release-blocking defect. | [`01-version-resolution.md`](./01-version-resolution.md) |
| `AT-RELEASEVERSIONING-02` | Version detection from a release artifact MUST match the version encoded in the release manifest entry; mismatch aborts the release. | [`02-version-detection.md`](./02-version-detection.md) |

### Auto-bump & SemVer

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-RELEASEVERSIONING-03` | Auto-bump logic derives the next version from commit footers / changelog entries deterministically: `BREAKING:` → major, `feat:` → minor, `fix:` → patch. Missing or ambiguous footers default to **patch** with a CI warning, not a silent no-bump. | [`03-auto-bump-logic.md`](./03-auto-bump-logic.md) |
| `AT-RELEASEVERSIONING-04` | Version strings MUST follow strict SemVer 2.0 (`MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`); allowed prerelease identifiers are `alpha`, `beta`, `rc` (no `dev`, `nightly`, `next` in tags). | [`04-semantic-versioning.md`](./04-semantic-versioning.md) |

### Tagging & changelog

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-RELEASEVERSIONING-05` | Git tags use the exact form `v{semver}` (lowercase `v`, no extra prefix); annotated tags only — lightweight tags are forbidden in release pipelines. | [`05-tagging.md`](./05-tagging.md) |
| `AT-RELEASEVERSIONING-06` | Changelog extraction parses the Keep-a-Changelog 1.1 sections under the version heading; an empty Unreleased section blocks the release with a Code Red. | [`06-changelog-extraction.md`](./06-changelog-extraction.md) |

### Source-of-truth update

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-RELEASEVERSIONING-07` | The version source file (e.g., `version.go` or equivalent) is updated **byte-identically** in the same commit as the tag; CI verifies parity between tag, source file, and any `package.json`/`composer.json` mirrors. | [`07-version-source-update.md`](./07-version-source-update.md) |

### Release metadata

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-RELEASEVERSIONING-08` | The release-metadata payload includes `Version`, `ReleasedAt` (UTC ISO-8601), `GitSha`, `Channel`, and per-artifact `Sha256`; missing or out-of-order keys fail validation. | [`08-release-metadata.md`](./08-release-metadata.md) |

### Branch strategy

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-RELEASEVERSIONING-09` | Release branches follow the documented strategy (e.g., `release/x.y`); main branch never receives release-only commits, and back-ports use cherry-pick with the original commit SHA recorded. | [`09-release-branch-strategy.md`](./09-release-branch-strategy.md) |
| `AT-RELEASEVERSIONING-10` | Hotfix releases bump the patch number on the corresponding `release/x.y` branch and MUST be merged forward to main before the next minor cuts. | [`09-release-branch-strategy.md`](./09-release-branch-strategy.md) |

### Cross-cutting

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-RELEASEVERSIONING-11` | A release MUST NOT publish if any of: SemVer parse fails, tag/source mismatch, missing Sha256, empty changelog section, or required CI status not green. Any one is a hard stop. | All 9 topic files |
| `AT-RELEASEVERSIONING-12` | Constraints and cross-references in [`99-constraints-and-cross-references.md`](./99-constraints-and-cross-references.md) MUST stay in sync with the parent self-update rules; the constraints file is regenerated whenever a topic file changes. | [`99-constraints-and-cross-references.md`](./99-constraints-and-cross-references.md) |

---

## Verification

```bash
grep -rn "AT-RELEASEVERSIONING-" spec/14-self-update-app-update/09-release-versioning/
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../97-acceptance-criteria.md`](../97-acceptance-criteria.md) — Self-update rollup (`AT-SELFUPDATEAPPUPDATE-08` delegates here)
- [`spec/15-wp-plugin-how-to/10-deployment-patterns/97-acceptance-criteria.md`](../../15-wp-plugin-how-to/10-deployment-patterns/97-acceptance-criteria.md) — **Active** SemVer + version-mirror rules for the WP plugin
- `mem://constraints/backend-runtime-deferred` — Why this folder is out-of-scope for the current stack

---

*Populated 2026-04-26 (polish #3, A-26 wave-2) — replaces scaffold; marked out-of-scope-for-current-stack but preserved as reference SSOT.*
