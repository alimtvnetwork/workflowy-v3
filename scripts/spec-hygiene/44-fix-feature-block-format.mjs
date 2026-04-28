#!/usr/bin/env node
// P12 — Auto-rewrite G-39 violations into compliant feature-block format.
// R2 fix: convert "(shortcut: KEY)" / "(shortcut: KEY, item-menu, ...)" trailing parentheses
//         into trailing backticked shortcut + drop other meta tags.
// R3 fix: wrap bare "/command" tokens in backticks.

import fs from 'node:fs';

const FILES = [
  'spec/31-app/01-features/05-interactions.md',
  'spec/31-app/01-features/03-layout-structure.md',
  'spec/31-app/01-features/10-today-view.md',
  'spec/31-app/01-features/06-item-context-menu.md',
  'spec/31-app/01-features/09-mirrors.md',
  'spec/31-app/01-features/12-multi-select.md',
  'spec/31-app/01-features/13-templates.md',
  'spec/31-app/01-features/11-trash-view.md',
  'spec/36-user-management/01-account-and-settings.md',
];

// Match a trailing parenthetical that contains "shortcut:" possibly with sibling tokens.
// Examples to handle:
//   "(shortcut: ⌘Z)"
//   "(shortcut: ⌘+Shift+Z on macOS / Ctrl+Y on Windows)"
//   "(item-menu, shortcut: ⌘+Shift+E)"
//   "(item-menu, shortcut: Del / ⌘⌫)"
const TRAILING_PAREN_RE = /\s*\(([^()]*shortcut\s*:\s*[^()]+)\)\s*\.?\s*$/i;

function fixR2Line(line) {
  const m = line.match(TRAILING_PAREN_RE);
  if (!m) return line;
  const inside = m[1];
  // strip everything before "shortcut:"
  const sc = inside.match(/shortcut\s*:\s*(.+)$/i);
  if (!sc) return line;
  const keys = sc[1].trim().replace(/\.$/, '');
  const head = line.slice(0, m.index).replace(/\s+$/, '').replace(/\.$/, '') + '.';
  return `${head} \`${keys}\``;
}

// R3: wrap bare "/word" in backticks. Avoid URLs already covered by gate's allow-list.
const SLASH_BARE_RE = /(^|[\s(])\/([a-z][a-z0-9-]+)\b(?![^`]*`)/g;
const URL_PREFIX_RE = /(https?:|\/wp-json|\/api|\/items|\/sync|\/views|\/trash|\/mirrors|\/shares|\/admin|\/boards|\/bulk|\/templates|\/me|\/search|\/workspaces|\/integrations)/;

function fixR3Line(line) {
  if (URL_PREFIX_RE.test(line)) return line; // gate ignores; leave alone
  return line.replace(SLASH_BARE_RE, (m, pre, word) => `${pre}\`/${word}\``);
}

let totalFixes = 0;
for (const f of FILES) {
  if (!fs.existsSync(f)) { console.warn(`skip missing ${f}`); continue; }
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let fileFixes = 0;
  for (let i = 0; i < lines.length; i++) {
    const orig = lines[i];
    let next = fixR2Line(orig);
    next = fixR3Line(next);
    if (next !== orig) { lines[i] = next; fileFixes++; }
  }
  if (fileFixes) {
    fs.writeFileSync(f, lines.join('\n'));
    console.log(`✓ ${f}  ${fileFixes} fix(es)`);
    totalFixes += fileFixes;
  }
}
console.log(`\nTotal: ${totalFixes} line fix(es) across ${FILES.length} files.`);
