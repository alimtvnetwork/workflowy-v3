#!/usr/bin/env node
// P13 — Append placeholder definition rows for the 30 remaining genuine orphan AT citations.
// Each stub uses the H3 heading form already understood by 40-generate-contract-json.mjs.
// Body marks the row as 📝 P13-stub so P2 can replace it with real Given/When/Then content.
import fs from 'node:fs';

const STUBS = [
  // file → array of {id, title}
  { file: 'spec/31-app/06-endpoints/97-acceptance-criteria.md', items: [
    { id: 'AT-ENDPOINTS-01', title: 'Endpoint coverage — Information model' },
    { id: 'AT-ENDPOINTS-08', title: 'Endpoint coverage — Personas' },
    { id: 'AT-ENDPOINTS-09', title: 'Endpoint coverage — Item context menu (duplicate)' },
    { id: 'AT-ENDPOINTS-13', title: 'Endpoint coverage — Board view (projection)' },
    { id: 'AT-ENDPOINTS-15', title: 'Endpoint coverage — Share dialog (list shares)' },
    { id: 'AT-ENDPOINTS-20', title: 'Endpoint coverage — Mirrors (create)' },
    { id: 'AT-ENDPOINTS-23', title: 'Endpoint coverage — Today view' },
    { id: 'AT-ENDPOINTS-24', title: 'Endpoint coverage — Trash list' },
    { id: 'AT-ENDPOINTS-28', title: 'Endpoint coverage — Search' },
    { id: 'AT-ENDPOINTS-32', title: 'Endpoint coverage — Templates' },
    { id: 'AT-ENDPOINTS-37', title: 'Endpoint coverage — Multi-select bulk ops' },
    { id: 'AT-ENDPOINTS-40', title: 'Endpoint coverage — Concurrency / sync' },
  ]},
  { file: 'spec/36-user-management/97-acceptance-criteria.md', items: [
    { id: 'AT-USR-01', title: 'Settings panel auto-save' },
    { id: 'AT-USR-03', title: 'Set password flow' },
    { id: 'AT-USR-09', title: 'Restore from backup' },
    { id: 'AT-USR-11', title: 'Theme selection persistence' },
    { id: 'AT-USR-14', title: 'Referrals' },
    { id: 'AT-USR-15', title: 'Help / Report a bug' },
  ]},
  { file: 'spec/15-wp-plugin-how-to/23-operator-runbooks/97-acceptance-criteria.md', items: [
    { id: 'AT-OPERATORRUNBOOKS-01', title: 'Disaster-recovery restore runbook covers all steps' },
    { id: 'AT-OPERATORRUNBOOKS-02', title: 'Backup-key rotation runbook covers all steps' },
    { id: 'AT-OPERATORRUNBOOKS-03', title: 'Post-mortem template covers all sections' },
  ]},
  { file: 'spec/13-cicd-pipeline-workflows/97-acceptance-criteria.md', items: [
    { id: 'AT-CICD-11', title: 'Browser-Extension archetype reference' },
    { id: 'AT-CICD-14', title: 'Go-Binary archetype reference' },
  ]},
  { file: 'spec/03-error-manage/97-acceptance-criteria.md', items: [
    { id: 'AT-ERRCODE-01', title: 'Every error code in registry has a PHP enum case' },
    { id: 'AT-ERRCODE-08', title: 'Every error code has a fixture envelope' },
  ]},
  { file: 'spec/31-app/01-features/97-acceptance-criteria.md', items: [
    { id: 'AT-INFO-08', title: 'Information-model edge case (P13-stub)' },
    { id: 'AT-LAYOUT-13', title: 'Layout-structure edge case (P13-stub)' },
    { id: 'AT-LAYOUT-99', title: 'Layout-structure placeholder (P13-stub)' },
    { id: 'AT-MIRROR-07', title: 'Mirror peer-group edge case (P13-stub)' },
    { id: 'AT-BOARD-99', title: 'Board view placeholder (P13-stub)' },
  ]},
  { file: 'spec/04-database-conventions/06-rest-api-format/97-acceptance-criteria.md', items: [
    { id: 'AT-ENV-01', title: 'Response uses universal envelope with PascalCase keys' },
    { id: 'AT-ENV-02', title: '`Status` is one of `success` / `error` only' },
  ]},
  { file: 'spec/31-app/05-conventions/97-acceptance-criteria.md', items: [
    { id: 'AT-AUTH-01', title: 'Every authenticated route calls Auth::hasRole server-side' },
    { id: 'AT-RATE-01', title: 'Endpoint respects per-tier rate limits (returns 429 on breach)' },
  ]},
];

// Build relative-path prefixes from the target file's depth so the auto-stamp
// links resolve correctly regardless of nesting.
function relToRoot(file) {
  const parts = file.split('/').slice(0, -1); // drop filename
  return '../'.repeat(parts.length);
}
function relToSpec(file) {
  const parts = file.split('/').slice(0, -1);
  return '../'.repeat(Math.max(parts.length - 1, 0));
}

let total = 0;
for (const { file, items } of STUBS) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `# Acceptance Criteria\n\n> Scaffold file created by P13 to host stub rows. Real criteria land here during P2.\n`);
  }
  let body = fs.readFileSync(file, 'utf8');
  if (body.includes('## P13 stub rows')) continue; // idempotent
  const upRoot = relToRoot(file);
  const upSpec = relToSpec(file);
  body += `\n\n---\n\n## P13 stub rows\n\n> Auto-appended by [\`scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs\`](${upRoot}scripts/spec-hygiene/45-append-p13-orphan-stubs.mjs) on 2026-04-28 to close orphan AT citations surfaced by [\`40-generate-contract-json.mjs\`](${upRoot}scripts/spec-hygiene/40-generate-contract-json.mjs). Each row is a **placeholder definition** — replace the body with concrete Given/When/Then + JSON fixture during P2 (I/O table conversion). Do **not** delete a row without first removing every citation of its ID elsewhere in spec/.\n`;
  for (const { id, title } of items) {
    if (new RegExp(`^### ${id} `, 'm').test(body)) continue;
    body += `\n### ${id} — ${title}\n\n📝 **P13-stub.** Definition pending. Replace this block with:\n- Given/When/Then prose\n- JSON request + envelope-shaped response (PascalCase \`Status\`/\`Attributes\`/\`Results\`) per [\`spec/04-database-conventions/06-rest-api-format/\`](${upSpec}04-database-conventions/06-rest-api-format/).\n- A pointer to the test that enforces it (Vitest or PHPUnit), test name **MUST** start with this AT id.\n`;
    total++;
  }
  fs.writeFileSync(file, body);
  console.log(`✓ ${file}  +${items.length} stub(s)`);
}
console.log(`\nWrote ${total} P13 stub row(s) total.`);
