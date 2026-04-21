# 6. Changelog Extraction

> **Parent:** [00-overview.md](./00-overview.md)

The release pipeline extracts the relevant section from `CHANGELOG.md` for the release body:

```bash
extract_changelog() {
    local version="$1"
    local changelog="${2:-CHANGELOG.md}"

    if [ ! -f "$changelog" ]; then
        echo "Release $version"
        return
    fi

    local entry
    entry=$(awk -v ver="$version" '
        /^## / {
            if (found) exit
            if (index($0, ver)) found=1
        }
        found { print }
    ' "$changelog" 2>/dev/null)

    if [ -z "$entry" ]; then
        echo "Release $version"
    else
        echo "$entry"
    fi
}

# Usage:
# extract_changelog "v1.3.0" > /tmp/changelog-entry.md
```

## Changelog Format

```markdown
## v1.2.0 — Feature Title (2026-04-08)

### Improvements

- Added feature X for better performance.
- Updated Y to support Z.

### Bug Fixes

- Fixed crash when input is empty.
```

## Synchronization Requirement

Three sources must always be in sync:

| Source | Location | Purpose |
|--------|----------|---------|
| `Version` constant | Source code (`constants.go`) | Compiled into binary |
| `CHANGELOG.md` | Repository root | Human-readable history |
| Release metadata | `.release/latest.json` or tags | CI/CD and tooling |

When bumping a version:
1. Update the `Version` constant in source code.
2. Add the new section to `CHANGELOG.md`.
3. Update any metadata files (e.g., `latest.json`).

All three changes must happen in the **same commit** that is tagged.
