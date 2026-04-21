# 8. Release Metadata Files

> **Parent:** [00-overview.md](./00-overview.md)

Maintain a `.release/latest.json` file for programmatic version queries. This file is the **primary mechanism** for the updater binary and build scripts to detect the current published version.

## Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["Version", "Tag", "Date", "Commit"],
  "properties": {
    "Version": {
      "type": "string",
      "description": "Clean semantic version without v prefix",
      "example": "1.2.0"
    },
    "Tag": {
      "type": "string",
      "description": "Git tag with v prefix",
      "example": "v1.2.0"
    },
    "Date": {
      "type": "string",
      "format": "date",
      "description": "UTC release date in YYYY-MM-DD format"
    },
    "Commit": {
      "type": "string",
      "description": "Full or short commit SHA",
      "example": "abc123def456"
    },
    "Assets": {
      "type": "array",
      "description": "List of release asset filenames (optional)",
      "items": { "type": "string" }
    }
  },
  "additionalProperties": false
}
```

## Example

```json
{
    "Version": "1.2.0",
    "Tag": "v1.2.0",
    "Date": "2026-04-08",
    "Commit": "abc123def456",
    "Assets": [
        "gitmap-linux-amd64.tar.gz",
        "gitmap-windows-amd64.zip",
        "gitmap-updater-linux-amd64.tar.gz",
        "docs-site.zip",
        "checksums.txt",
        "install.ps1",
        "install.sh"
    ]
}
```

## Hosting Location

The file lives in the repository at `.release/latest.json` and is committed alongside version bumps. It is **not** a release asset — it is read from the repository's default branch.

## How It's Used

| Consumer | Usage |
|----------|-------|
| Build scripts | Detect current version without parsing Go source |
| Updater binary | **Primary**: uses GitHub API `releases/latest`. **Fallback**: reads `.release/latest.json` from the raw GitHub URL |
| CI pipeline | Verify version synchronization between source, changelog, and metadata |

## Primary vs. Fallback for Updates

The updater binary's version resolution order:

1. **CLI flag** `--version v1.3.0` → use directly
2. **GitHub API** `GET /repos/{owner}/{repo}/releases/latest` → parse `tag_name`
3. **Fallback**: fetch `https://raw.githubusercontent.com/{owner}/{repo}/main/.release/latest.json` → parse `Tag`

The GitHub API is preferred because it always reflects the latest published release. The `latest.json` file is a fallback for environments where the API is blocked or rate-limited.

## Update Script

```bash
update_release_metadata() {
    local version="$1"
    local tag="v${version#v}"
    local commit="${GITHUB_SHA:-$(git rev-parse HEAD)}"
    local date="$(date -u '+%Y-%m-%d')"

    mkdir -p .release
    cat > .release/latest.json << EOF
{
    "Version": "${version#v}",
    "Tag": "$tag",
    "Date": "$date",
    "Commit": "$commit"
}
EOF
    echo "✅ Updated .release/latest.json"
}
```
