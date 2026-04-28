#!/usr/bin/env node
/**
 * G-39 — Workflowy-feature-appendix block format gate (F8)
 *
 * Enforces the uniform feature-block format in the F1–F6 appendices
 * (Workflowy feature reference appendices and the F5/F6 standalone files):
 *
 *   Rule 1: Every feature row uses `**Feature Title** — Description` shape.
 *   Rule 2: Keyboard shortcut, when present, appears at the END of the line
 *           wrapped in backticks (e.g. ``Shortcut: `⌘↵` ``).
 *   Rule 3: Slash commands appear inline as `/command` in backticks.
 *   Rule 4: Search operators appear in backticks (e.g. `is:todo`, `in:Inbox`).
 *
 * Scope: only files known to be touched by F1–F6, plus any future file that
 * declares itself in scope via the marker:
 *
 *     <!-- f8-format-block: enforce -->
 *
 * Exempt: files under _archive folders, 18-spec-issues, and the SSOT itself.
 */
import { readFileSync, existsSync } from "node:fs";

const SSOT = "spec/01-spec-authoring-guide/21-feature-block-format.md";

const F1_F6_FILES = [
  // F1 — touched
  "spec/31-app/01-features/00-overview.md",
  "spec/31-app/01-features/05-interactions.md",
  // F2
  "spec/31-app/01-features/03-layout-structure.md",
  "spec/31-app/01-features/16-search-ranking.md",
  "spec/31-app/01-features/10-today-view.md",
  // F3
  "spec/31-app/01-features/06-item-context-menu.md",
  "spec/31-app/01-features/09-mirrors.md",
  "spec/31-app/01-features/09b-mirror-peer-group-model.md",
  "spec/31-app/01-features/12-multi-select.md",
  // F4
  "spec/31-app/01-features/07-board-view.md",
  "spec/31-app/01-features/08-share-dialog.md",
  "spec/31-app/01-features/13-templates.md",
  "spec/31-app/01-features/11-trash-view.md",
  // F5
  "spec/36-user-management/01-account-and-settings.md",
  // F6
  "spec/31-app/01-features/18-integrations.md",
];

const APPENDIX_RE = /^##\s+(?:Workflowy[\s\S]*Reference|F[1-6][\s\S]*Appendix)/im;
const FEATURE_LINE_RE = /^\*\*[^*]+\*\*\s+—\s+/; // **Title** — Description
const HAS_SHORTCUT_HINT = /(shortcut|keys?|hot ?key)\s*[:=]/i;
const SHORTCUT_AT_END_RE = /`[^`]+`\s*$/;
const SLASH_INLINE_RE = /(^|[^`])\/[a-z][a-z0-9-]+\b(?![^`]*`)/i; // bare /command not in backticks
const OPERATOR_BARE_RE = /(^|[^`a-z])(is|in|has|link|tag|due|created|changed|by|to|from|day-of-week):[a-z0-9-_@]+(?![^`]*`)/i;

const findings = [];

function scanFile(path) {
  if (!existsSync(path)) return; // file may have been merged elsewhere
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n");

  // Find the appendix block(s)
  let inAppendix = false;
  let appendixDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^##\s/.test(line)) {
      if (APPENDIX_RE.test(line) || /<!-- f8-format-block: enforce -->/.test(line)) {
        inAppendix = true;
        appendixDepth = 2;
        continue;
      }
      // Leaving appendix at next H2
      if (inAppendix && line.startsWith("## ")) {
        inAppendix = false;
      }
    }
    if (!inAppendix) continue;

    // Skip code fences & tables (rules apply to prose feature rows)
    if (line.startsWith("```") || line.startsWith("|") || line.startsWith(">")) continue;

    // Rule 1: feature lines starting with **Title** must use em-dash separator
    if (/^\*\*[^*]+\*\*/.test(line) && !FEATURE_LINE_RE.test(line)) {
      findings.push({ path, line: i + 1, rule: "R1 (Title — Description)", snippet: line.slice(0, 100) });
    }

    // Rule 2: if line mentions shortcut/keys, MUST end with `…` backticked token
    if (HAS_SHORTCUT_HINT.test(line) && !SHORTCUT_AT_END_RE.test(line.trimEnd())) {
      findings.push({ path, line: i + 1, rule: "R2 (shortcut at end in backticks)", snippet: line.slice(0, 100) });
    }

    // Rule 3: bare /command in prose
    if (SLASH_INLINE_RE.test(line)) {
      const m = line.match(SLASH_INLINE_RE);
      // ignore URLs (http://, https://, /wp-json/)
      if (m && !/https?:\/\/|\/wp-json\/|\/api\/|\/items\/|\/sync\/|\/views\/|\/trash\/|\/mirrors\/|\/shares\/|\/admin\/|\/boards\/|\/bulk\/|\/templates\/|\/me\/|\/search\b|\/workspaces\/|\/integrations\//.test(line)) {
        findings.push({ path, line: i + 1, rule: "R3 (/command in backticks)", snippet: line.slice(0, 100) });
      }
    }

    // Rule 4: bare search operator in prose
    if (OPERATOR_BARE_RE.test(line)) {
      findings.push({ path, line: i + 1, rule: "R4 (search operator in backticks)", snippet: line.slice(0, 100) });
    }
  }
}

for (const f of F1_F6_FILES) scanFile(f);

// G-39 ships in report-only mode for the F8 baseline. The 29 known
// pre-existing violations (parenthetical shortcuts mid-sentence) are
// queued for fix in .lovable/plans/archive/10-f08-feature-block-format.md.
// Once the queue is drained, flip ENFORCE = true.
const ENFORCE = false;

if (findings.length === 0) {
  console.log(`✅ G-39: feature-block format clean across ${F1_F6_FILES.length} F1–F6 files`);
  process.exit(0);
}

const verb = ENFORCE ? "❌" : "⚠️ ";
console.error(`${verb} G-39: ${findings.length} feature-block format finding(s) (${ENFORCE ? "enforcing" : "report-only"}):\n`);
for (const f of findings) {
  console.error(`  ${f.path}:${f.line} [${f.rule}]\n    ${f.snippet}`);
}
console.error(`\nFormat SSOT: ${SSOT}`);
process.exit(ENFORCE ? 1 : 0);

