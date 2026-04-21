# Release Pipeline Log Points

> **Parent:** [16-verbose-logging overview](./00-overview.md)

---

The release workflow emits verbose log entries at each stage.
All entries follow the `prefix: detail` convention.

## Stage Summary

| # | Stage | Prefix | Source File |
|---|-------|--------|-------------|
| 1 | [Version Resolution](#version-resolution-workflowgo) | `version:` | `workflow.go` |
| 2 | [Source Resolution](#source-resolution-gitopsgo) | `source:` | `gitops.go` |
| 3 | [Git Operations](#git-operations-gitopsgo) | `git:` | `gitops.go` |
| 4 | [Asset Collection](#asset-collection-githubgo) | `assets:` | `github.go` |
| 5 | [Staging Directory](#staging-directory-assetsgo) | `staging:` | `assets.go` |
| 6 | [Cross-Compilation](#cross-compilation-assetsgo) | `build:` | `assets.go` |
| 7 | [Compression](#compression-compressgo) | `compress:` | `compress.go` |
| 8 | [Checksums](#checksums-checksumsgo) | `checksum:` | `checksums.go` |
| 9 | [Zip Group Processing](#zip-group-processing-workflowfinalizego) | `zip-group:` | `workflowfinalize.go` |
| 10 | [Ad-Hoc Zip Archives](#ad-hoc-zip-archives-workflowfinalizego) | `ad-hoc-zip:` | `workflowfinalize.go` |
| 11 | [Zip Group Archives](#zip-group-archives-ziparchivego) | `zip-summary:` | `ziparchive.go` |
| 12 | [GitHub Upload](#github-upload-workflowfinalizego-assetsuploadgo) | `github:` / `upload:` | `workflowfinalize.go`, `assetsupload.go` |
| 13 | [Retry](#retry-retrygo) | `retry:` | `retry.go` |
| 14 | [Metadata Persistence](#metadata-persistence-workflowfinalizego) | `metadata:` | `workflowfinalize.go` |
| 15 | [Rollback](#rollback-rollbackgo) | `rollback:` | `rollback.go` |
| 16 | [Autocommit](#autocommit-autocommitgo) | `autocommit:` | `autocommit.go` |

### Version Resolution (`workflow.go`)

Logged when the release version is determined from CLI, bump, or file:

```
version: resolved from CLI argument: v2.5.0
version: current baseline: v2.4.0
version: baseline from latest.json: v2.4.0
version: latest.json unavailable, falling back to git tags
version: resolved via --bump minor: v2.5.0
version: resolved from version.json: v2.5.0
```

### Source Resolution (`gitops.go`)

Logged when the release source ref is determined from `--commit`, `--branch`, or HEAD:

```
source: using commit a1b2c3d4e5f6
source: using branch feature-x (origin/feature-x)
source: using HEAD on branch main
source: using detached HEAD
```

### Git Operations (`gitops.go`)

Logged when branches, tags are created and pushed:

```
git: creating branch release/v2.5.0 from HEAD
git: creating tag v2.5.0
git: pushing branch release/v2.5.0 to origin
git: pushing tag v2.5.0 to origin
```

### Asset Collection (`github.go`)

Logged when user-provided assets are resolved from `--assets`:

```
assets: collected 3 file(s) from directory dist/
assets: gitmap_v2.5.0_linux_amd64
assets: gitmap_v2.5.0_darwin_arm64
assets: gitmap_v2.5.0_windows_amd64.exe
assets: single file build/output.tar.gz
assets: path not found: missing/dir
```

### Staging Directory (`assets.go`)

Logged when the release-assets staging directory is created or removed:

```
staging: created directory assets/staging
staging: removing directory assets/staging
```

### Cross-Compilation (`assets.go`)

Logged before and after each GOOS/GOARCH build:

```
build: linux/amd64 → assets/staging/gitmap_v2.5.0_linux_amd64
build: linux/amd64 complete (4821504 bytes)
build: windows/arm64 failed: unsupported GOARCH
```

### Compression (`compress.go`)

Logged after each asset is compressed into `.zip` or `.tar.gz`:

```
compress: gitmap_v2.5.0_linux_amd64.tar.gz — 4821504 bytes, sha1:a3f9c0...
```

### Checksums (`checksums.go`)

Logged as each file's SHA-256 hash is computed for `checksums.txt`:

```
checksum: gitmap_v2.5.0_linux_amd64.tar.gz  sha256:e3b0c44298fc...
```

### Zip Group Processing (`workflowfinalize.go`)

Logged when persistent zip groups are resolved and built:

```
zip-group: processing group "chrome-extension-v2"
zip-group: 2 group(s) produced 2 archive(s)
```

### Ad-Hoc Zip Archives (`workflowfinalize.go`)

Logged when ad-hoc `-Z` items are bundled:

```
ad-hoc-zip: 3 item(s), bundle=my-bundle
ad-hoc-zip: item src/config.json
ad-hoc-zip: item assets/logo.png
ad-hoc-zip: item docs/
ad-hoc-zip: produced 1 archive(s)
```

### Zip Group Archives (`ziparchive.go`)

Logged after each zip group archive is created:

```
zip-summary: chrome-extension.zip — 12 files, 238471 bytes, sha1:7b2a1f...
```

### GitHub Upload (`workflowfinalize.go`, `assetsupload.go`)

Logged at release creation and per-asset upload:

```
github: creating release v2.5.0 on owner/repo (6 asset(s))
github: release created, id=12345
upload-start: gitmap_v2.5.0_linux_amd64.tar.gz (4821504 bytes)
upload: gitmap_v2.5.0_linux_amd64.tar.gz → HTTP 201
```

### Retry (`retry.go`)

Logged on each failed attempt and before backoff sleep:

```
retry: gitmap_v2.5.0_linux_amd64.tar.gz attempt 1/3 failed: upload error 502: Bad Gateway
retry: gitmap_v2.5.0_linux_amd64.tar.gz sleeping 2s before attempt 2
```

### Metadata Persistence (`workflowfinalize.go`)

Logged when release JSON and latest.json are written after a successful release:

```
metadata: writing .release/v2.5.0.json
metadata: updating latest.json to v2.5.0
metadata: skipping latest.json (pre-release v2.5.0-rc.1)
```

### Rollback (`rollback.go`)

Logged when the release workflow encounters a failure and rolls back
local branches and tags:

```
rollback: starting (branch=release/v2.5.0, tag=v2.5.0, return-to=main)
rollback: switching back to main
rollback: deleting local branch release/v2.5.0
rollback: deleting local tag v2.5.0
```

### Autocommit (`autocommit.go`)

Logged during the post-release auto-commit and push of metadata files:

```
autocommit: starting for v2.5.0 (dry-run=false)
autocommit: 2 release file(s), 0 other file(s)
autocommit: staged 2 file(s)
autocommit: committed "release v2.5.0 metadata"
autocommit: pushed to main
```

---

## Related

- [`03-command-pattern.md`](./03-command-pattern.md) — Command handler pattern
- [`05-constants-and-library-usage.md`](./05-constants-and-library-usage.md) — Constants & library usage

---

*Release pipeline log points v1.0.0 — 2026-04-20*
