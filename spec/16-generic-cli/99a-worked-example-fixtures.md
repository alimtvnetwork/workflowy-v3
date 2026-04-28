# Worked Example Fixtures — Generic CLI Envelopes (P27)

> **Audit gap closed:** P26 flagged "no per-subcommand I/O envelope tables + 3 stderr error fixtures". This file provides byte-exact stdin/stdout/stderr/exit-code contracts for `AT-GENERICCLI-01..10`.

---

## 1. Subcommand I/O matrix (binding)

| Subcommand | Required flags | stdin | stdout (`--format=json`) | stderr | Exit |
|---|---|---|---|---|---|
| `wf list` | `--workspace=<id>` | (none) | envelope §2.1 | progress lines | 0 / 40 |
| `wf get <itemId>` | — | (none) | envelope §2.2 | (none) | 0 / 41 |
| `wf create` | `--parent=<id>` | JSON node body | envelope §2.3 | (none) | 0 / 42 |
| `wf update <itemId>` | — | JSON patch | envelope §2.4 | (none) | 0 / 43 |
| `wf delete <itemId>` | `--confirm` | (none) | envelope §2.5 | (none) | 0 / 44 |
| `wf search <query>` | — | (none) | envelope §2.6 | (none) | 0 / 45 |
| `wf import <file>` | `--workspace=<id>` | (none) | envelope §2.7 | progress lines | 0 / 46 |
| `wf export` | `--workspace=<id>` | (none) | envelope §2.8 (or raw JSON when `--raw`) | (none) | 0 / 47 |

## 2. Stdout envelopes (`--format=json` — default)

### 2.1 `wf list`
```json
{"Status":"OK","Attributes":{"Workspace":"ws_1","Total":3},"Navigation":{"NextCursor":null},"Results":[
  {"Id":"itm_a","ParentId":"root","Content":"Inbox","ItemType":"node"},
  {"Id":"itm_b","ParentId":"root","Content":"Today","ItemType":"node"},
  {"Id":"itm_c","ParentId":"root","Content":"Backlog","ItemType":"node"}
]}
```

### 2.2 `wf get itm_a`
```json
{"Status":"OK","Attributes":{"FetchedAt":"2026-04-28T10:00:00Z"},"Results":{"Id":"itm_a","ParentId":"root","Content":"Inbox","ItemType":"node","Children":[]}}
```

### 2.3 `wf create --parent=root` (stdin: `{"Content":"New task","ItemType":"node"}`)
```json
{"Status":"OK","Attributes":{"CreatedAt":"2026-04-28T10:00:01Z"},"Results":{"Id":"itm_d","ParentId":"root","Content":"New task","ItemType":"node"}}
```

### 2.4 `wf update itm_a` (stdin: `{"Content":"Inbox (renamed)"}`)
```json
{"Status":"OK","Attributes":{"UpdatedAt":"2026-04-28T10:00:02Z","FieldsChanged":1},"Results":{"Id":"itm_a","Content":"Inbox (renamed)"}}
```

### 2.5 `wf delete itm_a --confirm`
```json
{"Status":"OK","Attributes":{"DeletedAt":"2026-04-28T10:00:03Z","TrashRetentionDays":30},"Results":{"Id":"itm_a","Restored":false}}
```

### 2.6 `wf search "inbox"`
```json
{"Status":"OK","Attributes":{"Query":"inbox","Total":1,"DurationMs":12},"Results":[
  {"Id":"itm_a","Content":"Inbox","Score":0.94,"MatchedField":"content"}
]}
```

### 2.7 `wf import data.opml --workspace=ws_1`
```json
{"Status":"OK","Attributes":{"Source":"data.opml","Format":"opml"},"Results":{"NodesImported":42,"DurationMs":318}}
```

### 2.8 `wf export --workspace=ws_1`
```json
{"Status":"OK","Attributes":{"Workspace":"ws_1","Format":"json","NodeCount":42},"Results":{"Path":"/tmp/wf-export-2026-04-28.json","Bytes":18432}}
```

## 3. Stderr error envelopes (3 binding fixtures)

### 3.1 Missing required flag (exit 60)
```json
{"Status":"ERROR","Errors":[{"Code":"CLI-1001","Message":"--workspace is required for `wf list`","Severity":"FATAL","Field":"--workspace"}],"MethodsStack":["wf.list","cli.parseArgs"]}
```

### 3.2 Conflicting flags (exit 61)
```json
{"Status":"ERROR","Errors":[{"Code":"CLI-1002","Message":"--format=json conflicts with --raw","Severity":"FATAL"}],"MethodsStack":["wf.export","cli.validateFlags"]}
```

### 3.3 Item not found (exit 41)
```json
{"Status":"ERROR","Errors":[{"Code":"CLI-1003","Message":"Item itm_zzz not found in workspace ws_1","Severity":"FATAL","ResourceId":"itm_zzz"}],"MethodsStack":["wf.get","repo.findById"]}
```

## 4. Exit-code table (full enumeration)

| Code | Meaning |
|---:|---|
| 0 | Success |
| 40-47 | Subcommand-specific failures (per matrix §1) |
| 60 | Missing required flag |
| 61 | Conflicting flags |
| 62 | Invalid flag value (e.g., `--format=xml`) |
| 63 | stdin not valid JSON |
| 64 | Workspace not found / permission denied |
| 70 | Network unreachable |
| 71 | Auth token expired |
| 90 | Internal error (open issue) |

## 5. Flag-precedence resolution (4-tier — order is binding)

```
1. Command-line flag       (highest)   --workspace=ws_1
2. Environment variable                WF_WORKSPACE=ws_1
3. Config file                         ~/.config/workflowy/config.json {"Workspace":"ws_1"}
4. Hard-coded default      (lowest)    null → triggers CLI-1001 if required
```

## 6. Anti-patterns

| Anti-pattern | Detected by |
|---|---|
| Help text duplicated between `--help` output and README | gate G-CLI-01 (auto-gen check) |
| Multiple flag libraries imported (e.g., `commander` + `yargs`) | gate G-CLI-02 (single SSOT) |
| Subcommand emits non-PascalCase JSON | gate G-API-01 |
| Error envelope on stdout instead of stderr | gate G-CLI-03 (stdout/stderr separation) |
| `console.log` in non-`--format=text` mode | gate G-CLI-04 |

## 7. Test-name slugs

| Bind | AT id (cited) | Vitest slug |
|---|---|---|
| – | cites `AT-GENERICCLI-01` | `at_genericcli_01_internal_isolation_govet` |
| – | cites `AT-GENERICCLI-02` | `at_genericcli_02_one_file_per_subcommand` |
| – | cites `AT-GENERICCLI-03` | `at_genericcli_03_single_flag_library_ssot` |
| – | cites `AT-GENERICCLI-04` | `at_genericcli_04_flag_precedence_4_tier` |
| – | cites `AT-GENERICCLI-05` | `at_genericcli_05_format_text_json_envelope` |
| – | cites `AT-GENERICCLI-06` | `at_genericcli_06_stderr_error_envelope_cli1003` |
| – | cites `AT-GENERICCLI-07` | `at_genericcli_07_help_autogen_no_duplication` |
| – | cites `AT-GENERICCLI-08` | `at_genericcli_08_rfc3339_date_format` |
| – | cites `AT-GENERICCLI-09` | `at_genericcli_09_15ll_no_nested_if_lint` |
| – | cites `AT-GENERICCLI-10` | `at_genericcli_10_single_sql_open_gate` |
