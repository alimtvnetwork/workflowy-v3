#!/usr/bin/env node
/**
 * P18 — Anti-Patterns + Worked-Example injector.
 *
 * For each section that scored < 60 in the P17 audit, append two new
 * subsections to its 00-overview.md:
 *   - "## Anti-Patterns" — 3 bullet points naming specific things the AI
 *     MUST NOT do (taken from the most-cited gaps in the P17 audit).
 *   - "## Worked Example (skeleton)" — a fenced JSON / code block showing
 *     the shape of a canonical output for this section.
 *
 * Idempotent: skips files that already contain the heading "## Anti-Patterns".
 * Runs only on sections enumerated in TARGETS.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const TARGETS = {
  '18-spec-issues': {
    antiPatterns: [
      'Editing a closed audit file in place — once an audit has a Resolution section, it is frozen; corrections go in a new audit file.',
      'Re-using an active rule wording inside an audit — audits document the **past** state verbatim, even when that wording is now banned by gate G-38.',
      'Writing audits without an explicit Resolution section that points to the spec change that closed the issue.',
    ],
    example: {
      lang: 'markdown',
      body: `# Audit NN — <issue title>

> **Date:** YYYY-MM-DD
> **Status:** Closed | Open
> **Severity:** High | Medium | Low

## Finding
<verbatim quote of the inconsistency>

## Resolution
- Edited \`spec/<owning-section>/<file>.md\` to <change>.
- Added gate \`G-NN\` in \`scripts/spec-hygiene/NN-<name>.mjs\` to prevent regression.
- Verified by: \`AT-<SECTION>-NN\` passes.`,
    },
  },
  '02-coding-guidelines': {
    antiPatterns: [
      'Adding a rule without a paired ESLint / PHPStan / phpcs check that enforces it.',
      'Citing a rule without exactly one compliant **and** one non-compliant code example side by side.',
      'Allowing TypeScript `any`, nested `if`s, > 3 params, > 15-line logic blocks, or `else` branches — all are gate-enforced.',
    ],
    example: {
      lang: 'ts',
      body: `// ✅ Compliant — guard clause, max-3-params, no nested if, no else
function publishItem(item: Item, ctx: PublishCtx): PublishResult {
  if (!ctx.isAuthenticated) return { status: 'error', reason: 'unauth' };
  if (item.isArchived) return { status: 'error', reason: 'archived' };
  return repo.publish(item.id);
}

// ❌ Non-compliant — nested if + else + 4 params
function publishItemBad(item, ctx, opts, retry) {
  if (ctx.isAuthenticated) {
    if (!item.isArchived) {
      return repo.publish(item.id, opts, retry);
    } else { return null; }
  }
}`,
    },
  },
  '03-error-manage': {
    antiPatterns: [
      'Throwing a bare `Exception` / `Error` — every error MUST carry an `errorCode` from the registry.',
      'Returning a non-envelope JSON response on error — `Status` MUST be `"error"` and the `Errors` array MUST contain `{code, message, field?}`.',
      'Adding a new error code anywhere except `wp-plugin/includes/Errors/ErrorCode.php` (PHP) and `src/types/errors.ts` (TS), kept in lock-step by gate G-22.',
    ],
    example: {
      lang: 'json',
      body: `{
  "Status": "error",
  "Attributes": { "RequestId": "req_01H..." },
  "Errors": [
    {
      "Code": "ITEM_NOT_FOUND",
      "Message": "Item with id 'abc123' does not exist.",
      "Field": "itemId"
    }
  ],
  "Results": null
}`,
    },
  },
  '36-user-management': {
    antiPatterns: [
      'Storing a role on the user / profile row — roles MUST live in the separate `user_roles` table (privilege-escalation guard).',
      'Checking admin status from `localStorage` / `sessionStorage` or a hardcoded credential — every check MUST go through `Auth::hasRole($userId, $role)` server-side.',
      'Sending the password back in any envelope field — passwords are write-only.',
    ],
    example: {
      lang: 'json',
      body: `{
  "Status": "success",
  "Attributes": { "RequestId": "req_01H..." },
  "Results": {
    "user": {
      "id": "usr_abc",
      "email": "alice@example.com",
      "displayName": "Alice",
      "createdAt": "2026-04-28T10:00:00Z"
    },
    "roles": ["user", "moderator"]
  }
}`,
    },
  },
  '17-generic-update': {
    antiPatterns: [
      'Implementing an updater without declaring the rollback strategy in the same file (hot-rollback / data-rollback / no-rollback).',
      'Mixing schema-version bumps with data migrations in the same updater — split into two updaters chained by version.',
      'Skipping the changelog entry — every shipped update MUST add a row to `CHANGELOG.md` matched by the gate.',
    ],
    example: {
      lang: 'php',
      body: `<?php
final class ItemSchemaUpdater implements UpdateContract {
    public function targetVersion(): string { return '1.4.0'; }
    public function rollbackStrategy(): RollbackStrategy { return RollbackStrategy::HotRollback; }
    public function apply(Connection $db): UpdateResult {
        $db->exec('ALTER TABLE Items ADD COLUMN pinnedAt INTEGER NULL');
        return UpdateResult::success();
    }
    public function rollback(Connection $db): void {
        $db->exec('ALTER TABLE Items DROP COLUMN pinnedAt');
    }
}`,
    },
  },
  '06-seedable-config-architecture': {
    antiPatterns: [
      'Putting secrets in `wp-plugin/seed/config.json` — secrets stay in `wp-config.php`, never in shipped seed files.',
      'Re-running the seeder overwriting user-edited values — the seeder MUST be idempotent and respect user overrides.',
      'Reading config directly from the DB in hot paths — go through `ConfigRegistry::get($key)` so the typed validator runs.',
    ],
    example: {
      lang: 'json',
      body: `{
  "$schema": "../config.schema.json",
  "appearance.theme": { "value": "auto", "type": "enum", "options": ["light", "dark", "auto"] },
  "items.maxPerView": { "value": 250, "type": "int", "min": 50, "max": 1000 },
  "trash.retentionDays": { "value": 30, "type": "int", "min": 1, "max": 365 }
}`,
    },
  },
  '13-cicd-pipeline-workflows': {
    antiPatterns: [
      'Adding a new repo without picking one of the documented archetypes (WP-Plugin / Frontend-SPA / Browser-Extension).',
      'Skipping the `node scripts/spec-hygiene/00-run-all.mjs` step — it is a required check on every workflow.',
      'Hardcoding secrets or registry URLs — those go through repo secrets / org variables.',
    ],
    example: {
      lang: 'yaml',
      body: `name: WP-Plugin CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.1' }
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: composer install --no-progress
      - run: npm ci
      - run: node scripts/spec-hygiene/00-run-all.mjs
      - run: composer test
      - run: npm run test`,
    },
  },
  '14-self-update-app-update': {
    antiPatterns: [
      'Applying an update without first taking a SQLite backup — atomicity gate requires a rollback target.',
      'Hardcoding the update-server URL — it MUST come from `ConfigRegistry::get("update.serverUrl")`.',
      'Skipping signature verification on the downloaded artifact — every update payload MUST be signed.',
    ],
    example: {
      lang: 'php',
      body: `<?php
final class UpdateApplier {
    public function apply(UpdatePackage $pkg): UpdateResult {
        $this->verifySignature($pkg);                  // throws on bad sig
        $backupId = $this->backup->snapshot();          // pre-update snapshot
        try {
            $this->files->extract($pkg->path, PLUGIN_DIR);
            $this->migrator->run();
            return UpdateResult::success($backupId);
        } catch (Throwable $e) {
            $this->backup->restore($backupId);          // atomic rollback
            throw new UpdateFailedException($e);
        }
    }
}`,
    },
  },
  '16-generic-cli': {
    antiPatterns: [
      'Printing free-form text to stdout when `--json` is set — JSON mode MUST emit one valid JSON document and nothing else.',
      'Returning exit 0 on partial failure — exit codes MUST be documented per script and non-zero on any failure.',
      'Using a custom flag style (`-flagName`) — long flags MUST use kebab-case (`--flag-name`).',
    ],
    example: {
      lang: 'json',
      body: `{
  "status": "ok",
  "command": "backup",
  "duration_ms": 1247,
  "result": {
    "snapshot_id": "snap_2026-04-28T10-00-00Z",
    "size_bytes": 4823551,
    "tables_backed_up": 12
  }
}`,
    },
  },
  '05-split-db-architecture': {
    antiPatterns: [
      'Joining across attached SQLite files in raw SQL — every cross-DB read MUST go through a repo method.',
      'Splitting a domain that has < 3 tables — the overhead exceeds the benefit; merge into a related domain instead.',
      'Forgetting to register the split in `wp-plugin/config/db-split.json` — the orchestrator only attaches files declared there.',
    ],
    example: {
      lang: 'json',
      body: `{
  "items": { "file": "items.sqlite", "tables": ["Items", "ItemRevisions", "Mirrors"] },
  "users": { "file": "users.sqlite", "tables": ["Users", "UserRoles", "Sessions"] },
  "audit": { "file": "audit.sqlite", "tables": ["AuditLog"], "rotateMonthly": true }
}`,
    },
  },
  '10-powershell-integration': {
    antiPatterns: [
      'Using `Write-Host` for script output — use `Write-Output` so values are pipeable; reserve `Write-Host` for log lines.',
      'Skipping `[CmdletBinding(SupportsShouldProcess)]` — every mutating script MUST support `-WhatIf` and `-Confirm`.',
      'Hardcoding paths — accept a `-PluginPath` parameter so the script works on any install.',
    ],
    example: {
      lang: 'powershell',
      body: `[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)] [string] $PluginPath,
    [string] $BackupDir = "$env:USERPROFILE\\workflowy-backups"
)
$ErrorActionPreference = 'Stop'
$snap = "snap_$(Get-Date -Format 'yyyy-MM-ddTHH-mm-ss')"
if ($PSCmdlet.ShouldProcess($PluginPath, "Backup to $BackupDir\\$snap")) {
    Copy-Item -Path "$PluginPath\\data" -Destination "$BackupDir\\$snap" -Recurse
    Write-Output @{ status = 'ok'; snapshot_id = $snap } | ConvertTo-Json
}
exit 0`,
    },
  },
};

let drained = 0, skipped = 0;
for (const [folder, cfg] of Object.entries(TARGETS)) {
  const file = `spec/${folder}/00-overview.md`;
  if (!existsSync(file)) { console.log(`  missing  ${folder}`); continue; }
  let body = readFileSync(file, 'utf8');
  if (body.includes('## Anti-Patterns')) {
    console.log(`  skipped  ${folder} (already drained)`);
    skipped++;
    continue;
  }
  // Insert before the AUTO-TOC marker; if absent, append at end.
  const insertion = `\n\n## Anti-Patterns\n\nThe AI MUST NOT:\n${cfg.antiPatterns.map(p => `- ${p}`).join('\n')}\n\n## Worked Example (skeleton)\n\nA canonical, copy-pasteable shape for this section's primary output:\n\n\`\`\`${cfg.example.lang}\n${cfg.example.body}\n\`\`\`\n\n*This is a structural skeleton. Real values come from the section's \`97-acceptance-criteria.md\` row that the AI is implementing.*\n`;
  if (body.includes('<!-- AUTO-TOC:START -->')) {
    body = body.replace('<!-- AUTO-TOC:START -->', insertion + '\n<!-- AUTO-TOC:START -->');
  } else {
    body += insertion;
  }
  writeFileSync(file, body);
  console.log(`  drained  ${folder}`);
  drained++;
}
console.log(`\nDrained ${drained}, skipped ${skipped}, of ${Object.keys(TARGETS).length} targets.`);
