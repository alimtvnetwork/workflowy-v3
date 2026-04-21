# 4. Semantic Versioning

> **Parent:** [00-overview.md](./00-overview.md)

Versions follow [SemVer 2.0.0](https://semver.org):

```
v<major>.<minor>.<patch>[-<prerelease>]
```

| Bump | When | Example |
|------|------|---------|
| Major | Breaking changes | `v1.0.0` → `v2.0.0` |
| Minor | New features (backward-compatible) | `v1.1.0` → `v1.2.0` |
| Patch | Bug fixes only | `v1.2.0` → `v1.2.1` |

## Pre-Release Versions

Pre-release versions use a hyphen suffix following SemVer:

```
v1.2.0-alpha.1    # Early development
v1.2.0-beta.1     # Feature-complete, testing
v1.2.0-rc.1       # Release candidate
```

Pre-release detection in CI:

```bash
IS_PRERELEASE="false"
if [[ "$VERSION" == *-* ]]; then
    IS_PRERELEASE="true"
fi
```
