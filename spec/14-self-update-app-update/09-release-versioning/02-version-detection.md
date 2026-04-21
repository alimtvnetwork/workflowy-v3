# 2. Version Detection from Source

> **Parent:** [00-overview.md](./00-overview.md)

The release system reads the current version from the Go source code. The version constant must follow this pattern:

## Expected Format

```go
// In constants.go or version.go
const Version = "1.2.0"
```

## Detection Script

```bash
detect_version() {
    local source_file="${1:-constants.go}"
    local version

    # Extract version from Go source
    version=$(grep -oP 'const\s+Version\s*=\s*"([^"]+)"' "$source_file" | \
              grep -oP '"[^"]+"' | tr -d '"')

    if [ -z "$version" ]; then
        echo "::error::Could not detect version from $source_file"
        exit 1
    fi

    echo "$version"
}
```

## Go Implementation — DetectVersion

```go
import (
    "fmt"
    "os"
    "regexp"
    "strings"
)

var versionPattern = regexp.MustCompile(`const\s+Version\s*=\s*"([^"]+)"`)

// DetectVersion reads the Version constant from a Go source file.
func DetectVersion(filePath string) (string, error) {
    data, err := os.ReadFile(filePath)
    if err != nil {
        return "", fmt.Errorf("read %s: %w", filePath, err)
    }

    matches := versionPattern.FindSubmatch(data)
    if matches == nil {
        return "", fmt.Errorf("no Version constant found in %s", filePath)
    }

    return NormalizeVersion(string(matches[1])), nil
}
```
