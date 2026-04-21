# 10.1 Versioning Strategy

> **Updated:** 2026-04-19

---

## Semantic Versioning

All plugins follow [SemVer 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
  │      │     └── Bug fixes, typo corrections, no API changes
  │      └──────── New features, backward-compatible
  └─────────────── Breaking changes to REST API, database schema, or hook contracts
```

---

## Version Source of Truth

The version is declared in **exactly two places** and must always match:

| Location | Example | Read by |
|----------|---------|---------|
| Main plugin file header | `* Version: 2.31.0` | WordPress core |
| `PluginConfigType::Version` enum case | `case Version = '2.31.0'` | All plugin code |

**Rule:** Every code change requires a minor version bump (per project versioning policy). The `.release` folder is exempt.

---

## Version Bump Checklist

```
1. Update main plugin file header → Version: X.Y.Z
2. Update PluginConfigType::Version → case Version = 'X.Y.Z'
3. Update CHANGELOG.md → add entry under ## [X.Y.Z] - YYYY-MM-DD
4. If composer.json has a version field → update it too
5. Commit with message: "Bump version to X.Y.Z"
```

---

*Versioning strategy — v3.2.0 — 2026-04-19*
