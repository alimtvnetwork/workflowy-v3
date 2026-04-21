# 1. Version Resolution

> **Parent:** [00-overview.md](./00-overview.md)

The version is resolved with a 3-tier priority:

| Priority | Source | Example |
|----------|--------|---------|
| 1 | Explicit CLI argument | `release v1.2.0` |
| 2 | Bump flag | `release --bump minor` (1.1.0 → 1.2.0) |
| 3 | Current version from source | Read from `constants.go` or `version.go` |

## Normalization

All versions are normalized to ensure consistency:

```
1.2.0   → v1.2.0  (auto-prefix v)
v1.2.0  → v1.2.0  (already correct)
v01.2.0 → v1.2.0  (strip zero-padding)
  v1.2.0  → v1.2.0  (trim whitespace)
v1.2.0-beta.1 → v1.2.0-beta.1  (pre-release preserved)
```

## Go Implementation — NormalizeVersion

```go
import (
    "strconv"
    "strings"
)

// NormalizeVersion ensures consistent "vMAJOR.MINOR.PATCH" format.
func NormalizeVersion(v string) string {
    v = strings.TrimSpace(v)
    v = strings.TrimPrefix(v, "v")

    // Split and strip zero-padding from each component
    parts := strings.SplitN(v, "-", 2) // separate pre-release suffix
    components := strings.Split(parts[0], ".")
    for i, c := range components {
        if n, err := strconv.Atoi(c); err == nil {
            components[i] = strconv.Itoa(n) // "01" → "1"
        }
    }

    normalized := "v" + strings.Join(components, ".")
    if len(parts) > 1 {
        normalized += "-" + parts[1] // re-attach pre-release
    }
    return normalized
}

// CompareVersions returns true if a and b represent the same version
// after normalization.
func CompareVersions(a, b string) bool {
    return NormalizeVersion(a) == NormalizeVersion(b)
}
```

## Bash Implementation — normalize_version

```bash
normalize_version() {
    local v="$1"
    v="${v#v}"                  # strip v prefix
    v="$(echo "$v" | xargs)"   # trim whitespace
    echo "v$v"
}

# Usage in post-update verification
old_version="1.2.0"
new_version=$(<binary> version | xargs)

if [[ "$(normalize_version "$new_version")" == "$(normalize_version "$old_version")" ]]; then
    echo " !! Warning: version unchanged after update ($old_version)"
fi
```
