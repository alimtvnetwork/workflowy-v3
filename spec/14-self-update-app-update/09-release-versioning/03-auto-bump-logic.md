# 3. Auto-Bump Logic

> **Parent:** [00-overview.md](./00-overview.md)

When `--bump <level>` is used instead of an explicit version, the system calculates the next version:

## Go Implementation — BumpVersion

```go
import (
    "fmt"
    "strconv"
    "strings"
)

// BumpLevel represents the semantic version component to increment.
type BumpLevel int

const (
    BumpPatch BumpLevel = iota
    BumpMinor
    BumpMajor
)

// ParseBumpLevel converts a string to a BumpLevel.
func ParseBumpLevel(s string) (BumpLevel, error) {
    switch strings.ToLower(s) {
    case "patch":
        return BumpPatch, nil
    case "minor":
        return BumpMinor, nil
    case "major":
        return BumpMajor, nil
    default:
        return 0, fmt.Errorf("invalid bump level: %q (must be major, minor, or patch)", s)
    }
}

// BumpVersion increments the specified component of a semantic version.
// Input version may or may not have a "v" prefix.
// Pre-release suffixes are stripped during bump.
func BumpVersion(current string, level BumpLevel) (string, error) {
    normalized := NormalizeVersion(current)
    clean := strings.TrimPrefix(normalized, "v")

    // Strip pre-release suffix for bump calculation
    base := strings.SplitN(clean, "-", 2)[0]
    parts := strings.Split(base, ".")

    if len(parts) != 3 {
        return "", fmt.Errorf("version %q does not have 3 components", current)
    }

    major, err := strconv.Atoi(parts[0])
    if err != nil {
        return "", fmt.Errorf("invalid major version: %s", parts[0])
    }
    minor, err := strconv.Atoi(parts[1])
    if err != nil {
        return "", fmt.Errorf("invalid minor version: %s", parts[1])
    }
    patch, err := strconv.Atoi(parts[2])
    if err != nil {
        return "", fmt.Errorf("invalid patch version: %s", parts[2])
    }

    switch level {
    case BumpMajor:
        major++
        minor = 0
        patch = 0
    case BumpMinor:
        minor++
        patch = 0
    case BumpPatch:
        patch++
    }

    return fmt.Sprintf("v%d.%d.%d", major, minor, patch), nil
}
```

## Bash Implementation — bump_version

```bash
bump_version() {
    local current="$1"
    local level="$2"

    # Strip v prefix and pre-release suffix
    local base="${current#v}"
    base="${base%%-*}"

    IFS='.' read -r major minor patch <<< "$base"

    case "$level" in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
        *)
            echo "::error::Invalid bump level: $level (must be major, minor, or patch)"
            exit 1
            ;;
    esac

    echo "v${major}.${minor}.${patch}"
}

# Usage:
# bump_version "v1.2.3" "minor"  →  "v1.3.0"
# bump_version "1.0.0" "major"   →  "v2.0.0"
```
