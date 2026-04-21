# Version Bumping Rules

> **Parent:** [00-overview.md](./00-overview.md)

The `Version` field in `config.seed.json` follows **semver**. Use this table to choose the bump.

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| New category added | Minor | 1.0.0 → 1.1.0 |
| New setting added | Minor | 1.1.0 → 1.2.0 |
| Default value changed | Patch | 1.2.0 → 1.2.1 |
| Setting deprecated | Patch | 1.2.1 → 1.2.2 |
| Breaking change (setting removed) | Major | 1.2.2 → 2.0.0 |

## Why these rules

- **Minor for additive** — merge logic in [05-go-implementation.md](./05-go-implementation.md) is additive-only, so new settings/categories never break existing installs.
- **Patch for tweaks** — changing a default does not affect users who have already overridden it (only first-time installs see the new default).
- **Major for removals** — removed settings break consumers; bump major and document migration in `CHANGELOG.md`.

## Required when bumping

1. Update `Version` in `config.seed.json`.
2. Add a non-empty `Changelog` field summarizing the change (auto-appended to `CHANGELOG.md` on next boot).
3. Add `AddedIn` to every new category/setting so the UI can highlight them (see [07-ui-integration.md](./07-ui-integration.md)).
