# Worked Example Fixtures — Generic Update Manifest (P27)

> **Audit gap closed:** P26 flagged "manifest schema + atomic-rename trace missing". This file binds `AT-GENERICUPDATE-01..10` to a byte-exact manifest, atomic-rename strace, and healthcheck contract.

---

## 1. Canonical `update.json` manifest

```json
{
  "Status": "OK",
  "Attributes": {
    "Schema": "https://workflowy.local/schemas/update.v1.json",
    "Channel": "stable",
    "GeneratedAt": "2026-04-28T10:00:00Z"
  },
  "Results": {
    "Latest": {
      "Version": "1.4.3",
      "ReleasedAt": "2026-04-27T16:00:00Z",
      "Artifacts": [
        {
          "Os": "linux",
          "Arch": "x64",
          "Url": "https://updates.workflowy.local/workflowy-1.4.3-linux-x64.zip",
          "Bytes": 4823104,
          "Sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
        },
        {
          "Os": "windows",
          "Arch": "x64",
          "Url": "https://updates.workflowy.local/workflowy-1.4.3-windows-x64.zip",
          "Bytes": 5012883,
          "Sha256": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
        }
      ],
      "MinPreviousVersion": "1.4.0",
      "ReleaseNotesUrl": "https://workflowy.local/notes/1.4.3.md"
    }
  }
}
```

## 2. AJV schema (binding contract — `update.v1.json`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["Status", "Attributes", "Results"],
  "properties": {
    "Status": {"const": "OK"},
    "Attributes": {
      "type": "object",
      "required": ["Schema", "Channel", "GeneratedAt"],
      "properties": {
        "Schema": {"type": "string", "format": "uri"},
        "Channel": {"enum": ["stable", "beta", "nightly"]},
        "GeneratedAt": {"type": "string", "format": "date-time"}
      }
    },
    "Results": {
      "type": "object",
      "required": ["Latest"],
      "properties": {
        "Latest": {
          "type": "object",
          "required": ["Version", "ReleasedAt", "Artifacts", "MinPreviousVersion"],
          "properties": {
            "Version": {"type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$"},
            "Artifacts": {
              "type": "array",
              "minItems": 1,
              "items": {
                "type": "object",
                "required": ["Os", "Arch", "Url", "Bytes", "Sha256"],
                "properties": {
                  "Os": {"enum": ["linux", "windows", "macos"]},
                  "Arch": {"enum": ["x64", "arm64"]},
                  "Url": {"type": "string", "format": "uri"},
                  "Bytes": {"type": "integer", "minimum": 1},
                  "Sha256": {"type": "string", "pattern": "^[a-f0-9]{64}$"}
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## 3. Atomic-rename strace (verification of `AT-GENERICUPDATE-03`)

The installer MUST produce this `strace -e openat,renameat2,symlinkat` sequence (order is binding):

```
openat(AT_FDCWD, "/var/lib/workflowy/releases/1.4.3", O_RDONLY|O_DIRECTORY) = 5
symlinkat("releases/1.4.3", AT_FDCWD, "/var/lib/workflowy/current.new") = 0
renameat2(AT_FDCWD, "/var/lib/workflowy/current.new", AT_FDCWD, "/var/lib/workflowy/current", RENAME_EXCHANGE) = 0
close(5) = 0
```

**Negative (FAIL):** `unlink("/var/lib/workflowy/current") + symlink(...)` — non-atomic, leaves a window where `current` doesn't exist.

## 4. Healthcheck contract

```bash
# Request:
curl --max-time 5 -fsSL -H 'Accept: application/json' \
  http://127.0.0.1:8080/wp-json/workflowy/v1/health

# Required response (200):
{
  "Status": "OK",
  "Attributes": {"Version": "1.4.3", "Uptime": 1.2, "DbReady": true},
  "Results": {"Healthy": true}
}

# Failure response (any non-200, OR timeout, OR Healthy:false):
# → triggers ROLLBACK (see spec/14-self-update-app-update/99-worked-example-fixtures.md §2 step 6a)
```

## 5. Reproducible-build verification

```bash
# AT-GENERICUPDATE-04: byte-identical builds across machines
SOURCE_DATE_EPOCH=1714291200 \
  pnpm build --reporter=silent && \
  sha256sum dist/workflowy-*.zip | tee build-1.sha256

# Re-run on a different host — sha256sum MUST match build-1.sha256.
diff build-1.sha256 build-2.sha256   # exit 0 = pass
```

## 6. Exit-code table

| Code | Meaning | Recovery |
|---:|---|---|
| 0 | Manifest valid + applicable update found | proceed to download |
| 30 | Manifest fetch failed (network) | retry with exponential backoff |
| 31 | Manifest schema validation failed | abort, alert release engineer |
| 32 | No applicable artifact for current OS/Arch | log + exit |
| 33 | Current version >= Latest version | exit 0 (no-op is success) |
| 34 | `MinPreviousVersion` violated (skipped a required upgrade) | force-stage intermediate version |

## 7. Anti-patterns

| Anti-pattern | Detected by |
|---|---|
| Manifest with non-PascalCase keys | gate G-API-01 |
| sha256 stored in URL fragment instead of `Sha256` field | gate G-UPD-04 (regex `#sha256=`) |
| `Bytes` as string `"4823104"` instead of integer | AJV schema `type: integer` |
| `unlink + symlink` in installer (non-atomic) | gate G-UPD-01 (AST scan) |

## 8. Test-name slugs

| AT id | Vitest slug |
|---|---|
| `AT-GENERICUPDATE-01` | `at_genericupdate_01_manifest_envelope_pascalcase` |
| `AT-GENERICUPDATE-02` | `at_genericupdate_02_ajv_validates_schema` |
| `AT-GENERICUPDATE-03` | `at_genericupdate_03_atomic_renameat2_trace` |
| `AT-GENERICUPDATE-04` | `at_genericupdate_04_reproducible_build_sha256` |
| `AT-GENERICUPDATE-05` | `at_genericupdate_05_healthcheck_pascalcase_envelope` |
| `AT-GENERICUPDATE-06` | `at_genericupdate_06_exit_codes_table_match` |
| `AT-GENERICUPDATE-07` | `at_genericupdate_07_min_previous_version_gate` |
| `AT-GENERICUPDATE-08` | `at_genericupdate_08_no_unlink_symlink_pattern` |
| `AT-GENERICUPDATE-09` | `at_genericupdate_09_sha256_field_not_url_fragment` |
| `AT-GENERICUPDATE-10` | `at_genericupdate_10_bytes_field_is_integer` |
