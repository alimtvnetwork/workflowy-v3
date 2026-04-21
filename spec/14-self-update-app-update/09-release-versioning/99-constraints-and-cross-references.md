# Constraints & Cross-References

> **Parent:** [00-overview.md](./00-overview.md)

## Constraints

- Version must be bumped in source code **before** tagging.
- Tags must be lightweight (not annotated) unless signing is required.
- Changelog, version constant, and metadata must be updated atomically.
- Pre-release versions use a hyphen suffix: `v1.2.0-beta.1`.
- Version resolution must never fall back to "latest tag" without explicit verification that the tag matches the source `Version`.
- Auto-bump must strip pre-release suffixes before calculating the next version.
- Version detection must fail loudly if the source constant is missing or malformed.

---

## Cross-References

- [Release Assets](../07-release-assets.md) — Asset naming uses the resolved version
- [Checksums & Verification](../08-checksums-verification.md) — Checksum file versioning
- [CI/CD Release Body & Changelog](../../13-cicd-pipeline-workflows/07-release-body-and-changelog.md) — How the release body uses changelog data
- [CI/CD GitHub Release Standard](../../13-cicd-pipeline-workflows/17-github-release-standard.md) — Pre-release detection
- [Self-Update Overview](../01-self-update-overview.md) — How the CLI consumes versioned releases
- [Deploy Path Resolution](../02-deploy-path-resolution.md) — Where the versioned binary is deployed
