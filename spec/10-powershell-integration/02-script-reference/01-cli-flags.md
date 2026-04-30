# 1. Command-Line Flags

> **Parent:** [00-overview.md](./00-overview.md)

---

| Short | Long | Type | Description |
|-------|------|------|-------------|
| `-h` | `-help` | Switch | Show help message and exit |
| `-b` | `-buildonly` | Switch | Build frontend only, don't start backend |
| `-s` | `-skipbuild` | Switch | Skip frontend build, only run backend |
| `-p` | `-skippull` | Switch | Skip git pull step |
| `-f` | `-force` | Switch | Force-clean build artifacts and pnpm folders before building; a fresh install runs when `pnpm-lock.yaml` is missing or `node_modules/` was removed |
| `-i` | `-install` | Switch | Install/update dependencies for frontend (pnpm) and backend (go mod), then exit |
| `-r` | `-rebuild` | Switch | Full reset: clean build artifacts, sessions, logs, and error data first, then install, then build/run (frontend install happens after the clean) |
| `-fw` | `-openfirewall` | Switch | Add Windows Firewall rules (requires Admin) |
| `-u` | `-upload` | Switch | Upload default plugin to WordPress via upload-plugin-v2 |
| `-q` | `-qupload` | Switch | Upload plugin to WordPress via QUpload API (upload-plugin-U-Q.ps1) |
| | `-u -q` | Combo | Upload Riseup Asia Uploader via QUpload API (shorthand) |
| `-ua` | `-uploadall` | Switch | ZIP all plugins (except QUpload) and upload each via QUpload API |
| | `-ua -xs 'slug'` | Combo | ZIP + upload all plugins EXCEPT named one(s), comma-separated |
| `-z` | `-zip` | Switch | ZIP default plugin (or specific via `-pp`) |
| `-za` | | Switch | ZIP all plugins in `wp-plugins/` with version numbers |
| `-zq` | `-zipqupload` | Switch | ZIP QUpload plugin |
| `-c` | `-clear` | Switch | Remove all existing ZIP files from `wp-plugins/` before zipping |
| | `-uas` | Switch | Upload ALL plugins to ALL configured sites (multi-site) |
| | `-uas -site 'name'` | Combo | Upload ALL plugins to a specific site by name |
| | `-uas -xs 'name'` | Combo | Upload ALL plugins to all sites EXCEPT named one(s) (comma-separated) |
| `-t` | `-test` | Switch | Run Go backend tests and exit |
| `-pp` | `-pluginpath` | String | Override plugin folder path (use with `-u`, `-q`, `-ua`, or `-z`) |
| | `-site` | String | Target a specific site by name (use with `-uas`) |
| `-xs` | `-exclude` | String | Exclude site(s) by name, comma-separated (use with `-uas`) |
| `-d` | `-deploy` | Switch | Full deploy cycle: git pull → upload all sites → plugin status → build & run |
| `-dbg` | `-debug` | Switch | Enable debug logging for upload |
| `-v` | `-verbose` | Switch | Show detailed debug output |
