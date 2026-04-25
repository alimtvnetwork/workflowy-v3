# 03.03 — Update Server Contract (CI/CD Bridge)

> **Version:** 1.0.0
> **Parent:** [`00-overview.md`](./00-overview.md)
> **Updated:** 2026-04-25
> **Canonical source:** [`spec/15-wp-plugin-how-to/10-deployment-patterns/04-update-server.md`](../../15-wp-plugin-how-to/10-deployment-patterns/04-update-server.md)

---

## Purpose

This file is the **CI/CD-side view** of the self-hosted update server contract. It documents only what the **release pipeline must produce** so the in-plugin `WP_Updater` can detect, download, and verify a new version. Detailed PHP-side handling (HTTP filters, transient invalidation) lives in the canonical source above.

---

## Pipeline Output Required by the Updater

After a successful release (stage 8), three URLs MUST resolve:

| URL | Content-Type | Purpose |
|-----|--------------|---------|
| `https://updates.workflowy.example/info.json` | `application/json` | Update manifest (see shape below) |
| `https://updates.workflowy.example/releases/workflowy-v{semver}.zip` | `application/zip` | The plugin artifact from stage 6 |
| `https://updates.workflowy.example/releases/workflowy-v{semver}.zip.sha256` | `text/plain` | The checksum file from stage 7 |

For self-hosted setups, `updates.workflowy.example` typically redirects (301) to the GitHub Release asset URL — the in-plugin updater handles redirects per [`spec/15-wp-plugin-how-to/10-deployment-patterns/06-url-resolution.md`](../../15-wp-plugin-how-to/10-deployment-patterns/06-url-resolution.md).

---

## `info.json` Shape (CI-produced)

The release pipeline MUST emit (or trigger emission of) a JSON manifest matching this exact schema. Field names use `snake_case` per the WP-plugin convention.

```json
{
  "name":         "WorkFlowy",
  "slug":         "workflowy",
  "version":      "0.34.0",
  "tested":       "6.7",
  "requires":     "6.4",
  "requires_php": "8.2",
  "download_url": "https://updates.workflowy.example/releases/workflowy-v0.34.0.zip",
  "checksum_url": "https://updates.workflowy.example/releases/workflowy-v0.34.0.zip.sha256",
  "checksum_alg": "sha256",
  "released_at":  "2026-04-25T10:00:00+08:00",
  "changelog":    "## [0.34.0]\n- F-02 closed: WP-plugin CI/CD packaging spec\n- ..."
}
```

| Field | Source | Validation |
|-------|--------|------------|
| `version` | `package.json` `"version"` | Must match the git tag (minus `v` prefix) |
| `tested` | Manually maintained | Must be a valid WP version string |
| `requires` | Manually maintained | Must be ≤ `tested` |
| `requires_php` | Hardcoded `"8.2"` | Must match the workflow `PHP_VERSION` env |
| `download_url` | Pipeline-generated from `zip-name` output | Must return HTTP 200 within 5s |
| `checksum_url` | Pipeline-generated | Must return the exact SHA-256 of `download_url` content |
| `released_at` | Pipeline timestamp (ISO 8601 + TZ) | Must use UTC+8 (project timezone per `mem://~user`) |
| `changelog` | Extracted by stage 8 (`awk` script) | Must include the `## [version]` heading |

---

## Acceptance Gates (post-release verification)

These gates run **after** the release workflow completes — typically as a follow-up `verify-release.yml` workflow on a `release-published` webhook.

| # | Gate | Check |
|---|------|-------|
| 1 | Manifest reachable | `curl -fsI https://updates.workflowy.example/info.json` returns 200 |
| 2 | Version field matches tag | `jq -r .version info.json` equals `${GITHUB_REF#refs/tags/v}` |
| 3 | Download URL resolves | `curl -fsI "$(jq -r .download_url info.json)"` returns 200 (after redirects) |
| 4 | Checksum verifies | `curl -fs $download_url -o tmp.zip && curl -fs $checksum_url \| sha256sum -c` exits 0 |
| 5 | PHP version compatible | `jq -r .requires_php info.json` ≤ live WP test site's PHP version |

Failure of any gate MUST trigger a release rollback alert (delete the GitHub Release, retain the tag for forensics).

---

## Cross-References

- **In-plugin consumer** (the `WP_Updater` class): [`spec/15-wp-plugin-how-to/10-deployment-patterns/05-self-update-rollback.md`](../../15-wp-plugin-how-to/10-deployment-patterns/05-self-update-rollback.md)
- **`UpdateConfigType` enum**: [`spec/15-wp-plugin-how-to/10-deployment-patterns/07-update-config-enum.md`](../../15-wp-plugin-how-to/10-deployment-patterns/07-update-config-enum.md)
- **URL redirect handling**: [`spec/15-wp-plugin-how-to/10-deployment-patterns/06-url-resolution.md`](../../15-wp-plugin-how-to/10-deployment-patterns/06-url-resolution.md)

---

*Update server contract (CI side) — v1.0.0 — 2026-04-25.*
