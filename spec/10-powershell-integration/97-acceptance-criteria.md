# PowerShell Integration — Acceptance Criteria

> **Version:** 2.0.0
> **Updated:** 2026-04-25 (UTC+8)
> **Parent:** [`00-overview.md`](./00-overview.md)
> **ID range:** `AT-POWERSHELLINTEGRATION-01..10`
> **Closes:** Audit finding F-03

---

## Purpose

Verifiable acceptance criteria for the PowerShell integration spec, focused on the **WP-plugin boundary** (B1–B8) defined in [`08-wp-plugin-boundary.md`](./08-wp-plugin-boundary.md). Historical Go+React criteria are captured in [`02-script-reference/`](./02-script-reference/00-overview.md) and remain valid for that archetype.

---

## Coverage Map

| ID | Topic | Source |
|----|-------|--------|
| AT-POWERSHELLINTEGRATION-01 | Boundary file present | [`08-wp-plugin-boundary.md`](./08-wp-plugin-boundary.md) |
| AT-POWERSHELLINTEGRATION-02 | PowerShell excluded from plugin ZIP | [`08-wp-plugin-boundary.md` B2](./08-wp-plugin-boundary.md) |
| AT-POWERSHELLINTEGRATION-03 | No `shell_exec('powershell')` in PHP | [`08-wp-plugin-boundary.md` B5](./08-wp-plugin-boundary.md) |
| AT-POWERSHELLINTEGRATION-04 | Cross-platform parity enforced | [`08-wp-plugin-boundary.md` B6 + parity table](./08-wp-plugin-boundary.md) |
| AT-POWERSHELLINTEGRATION-05 | PowerShell scope limited to dev tooling | [`08-wp-plugin-boundary.md` B1, B4](./08-wp-plugin-boundary.md) |
| AT-POWERSHELLINTEGRATION-06 | Historical Go content flagged | [`08-wp-plugin-boundary.md` B7](./08-wp-plugin-boundary.md) |
| AT-POWERSHELLINTEGRATION-07 | Windows-only scripts segregated | [`08-wp-plugin-boundary.md` B8](./08-wp-plugin-boundary.md) |
| AT-POWERSHELLINTEGRATION-08 | Out-of-scope items documented | [`08-wp-plugin-boundary.md` §"Out of Scope"](./08-wp-plugin-boundary.md) |
| AT-POWERSHELLINTEGRATION-09 | Decision matrix unambiguous | [`08-wp-plugin-boundary.md` §"What Goes Where"](./08-wp-plugin-boundary.md) |
| AT-POWERSHELLINTEGRATION-10 | Boundary doc cross-references CI archetype | [`08-wp-plugin-boundary.md` §"Cross-References"](./08-wp-plugin-boundary.md) |

---

## Criteria

### AT-POWERSHELLINTEGRATION-01 — Boundary file exists
```bash
test -f spec/10-powershell-integration/08-wp-plugin-boundary.md
```

### AT-POWERSHELLINTEGRATION-02 — PowerShell artifacts excluded from ZIP
```bash
# After running the release pipeline, none of these may appear in the ZIP:
! unzip -l workflowy-v*.zip | grep -qE "(\.ps1|powershell\.json|spec/10-powershell-integration)"
```
This MUST be enforced by `.distignore` (the canonical `.distignore` already excludes `spec/` wholesale; verify by inspection).

### AT-POWERSHELLINTEGRATION-03 — No PHP-to-PowerShell shell-out
```bash
! grep -rEn "(shell_exec|proc_open|exec|passthru|system)\s*\(\s*['\"][^'\"]*powershell" includes/ 2>/dev/null
```
Returns no matches.

### AT-POWERSHELLINTEGRATION-04 — Cross-platform parity
For every `scripts/*.ps1` there MUST be a matching `scripts/*.sh` or a `package.json` script entry. Verifiable by:
```bash
for ps in scripts/*.ps1; do
  base=$(basename "$ps" .ps1)
  test -f "scripts/${base}.sh" || jq -e --arg k "$base" '.scripts[$k]' package.json
done
```

### AT-POWERSHELLINTEGRATION-05 — Scope limited to dev tooling
PowerShell scripts MUST only invoke commands from rule B4: `bun install`, `bun run build`, `composer install`, or local `zip`. Verifiable by code review against the boundary table.

### AT-POWERSHELLINTEGRATION-06 — Historical Go content flagged
Files `01-configuration-schema.md`, `02-script-reference/`, `03-integration-guide.md`, and `25-multi-site-deployment.md` MUST contain a "WorkFlowy applicability: historical reference only" note in their frontmatter or first section. Verifiable by:
```bash
grep -l "historical reference" spec/10-powershell-integration/{01,03,25}*.md
```
*(Note: this gate is a polish item — flagging the legacy files can be done in a follow-up commit; the boundary doc already captures the rule.)*

### AT-POWERSHELLINTEGRATION-07 — Windows-only scripts segregated
Any Windows-only automation outside the parity table MUST live under `scripts/windows/` (not in the spec folder). Verifiable by absence of `.ps1` files outside `scripts/` and `scripts/windows/`.

### AT-POWERSHELLINTEGRATION-08 — Out-of-scope items documented
The "Out of Scope" section in `08-wp-plugin-boundary.md` MUST list at minimum: Go binary build, pnpm PnP, Windows Firewall, multi-site, PHP-from-PS, production deploy. Verifiable by `grep -c` against the file.

### AT-POWERSHELLINTEGRATION-09 — Decision matrix unambiguous
The "What Goes Where" table MUST cover: plugin runtime, CI/CD, cross-platform dev, Windows-only, frontend build, PHP standards. Six rows minimum.

### AT-POWERSHELLINTEGRATION-10 — Cross-references CI archetype
The boundary doc MUST link to `spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md`. Verifiable:
```bash
grep -q "13-cicd-pipeline-workflows/18-wp-plugin-deploy" spec/10-powershell-integration/08-wp-plugin-boundary.md
```

---

## Verification

```bash
# List all referenced sources in this folder
grep -rn "AT-POWERSHELLINTEGRATION-" spec/10-powershell-integration/

# Run hygiene checks
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`08-wp-plugin-boundary.md`](./08-wp-plugin-boundary.md) — Boundary rules B1–B8
- [`spec/13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md`](../13-cicd-pipeline-workflows/18-wp-plugin-deploy/00-overview.md) — Canonical production pipeline
- [`spec/19-glossary.md`](../19-glossary.md) — Terminology SSOT
- [`spec/20-enums-index.md`](../20-enums-index.md) — Enum registry

*Acceptance criteria v2.0.0 — updated 2026-04-25 (UTC+8) — closes audit gap F-03.*
