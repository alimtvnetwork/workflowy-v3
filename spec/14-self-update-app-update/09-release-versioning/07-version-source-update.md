# 7. Version Source Update

> **Parent:** [00-overview.md](./00-overview.md)

After resolving the new version (explicit or auto-bumped), update the source constant:

## Go Implementation — UpdateVersionInSource

```go
import (
    "fmt"
    "os"
    "regexp"
    "strings"
)

// UpdateVersionInSource replaces the Version constant in a Go source file.
func UpdateVersionInSource(filePath, newVersion string) error {
    // Strip v prefix for source constant (source uses "1.2.0", not "v1.2.0")
    clean := strings.TrimPrefix(NormalizeVersion(newVersion), "v")

    data, err := os.ReadFile(filePath)
    if err != nil {
        return fmt.Errorf("read %s: %w", filePath, err)
    }

    pattern := regexp.MustCompile(`(const\s+Version\s*=\s*)"[^"]+"`)
    if !pattern.Match(data) {
        return fmt.Errorf("no Version constant found in %s", filePath)
    }

    updated := pattern.ReplaceAll(data, []byte(fmt.Sprintf(`${1}"%s"`, clean)))
    if err := os.WriteFile(filePath, updated, 0644); err != nil {
        return fmt.Errorf("write %s: %w", filePath, err)
    }

    return nil
}
```

## Bash Implementation

```bash
update_version_in_source() {
    local file="$1"
    local new_version="$2"

    # Strip v prefix for source constant
    local clean="${new_version#v}"

    sed -i "s/const Version = \"[^\"]*\"/const Version = \"$clean\"/" "$file"

    # Verify the update
    if ! grep -q "const Version = \"$clean\"" "$file"; then
        echo "::error::Failed to update version in $file"
        exit 1
    fi

    echo "✅ Updated version to $clean in $file"
}
```
