#!/usr/bin/env node
/**
 * G-38 — Ambiguous-wording gate (P4 sweep enforcement)
 *
 * Bans new occurrences of TBD / FIXME / XXX placeholders and soft-language
 * phrases ("we could", "may want to", "perhaps", "possibly", "ideally",
 * "preferably") in active spec files. RFC-2119 keywords (MUST / MUST NOT /
 * SHOULD / SHOULD NOT / MAY / MAY NOT) are the canonical wording — see
 * spec/01-spec-authoring-guide/20-rfc-2119-wording-policy.md.
 *
 * Allow-listed exemptions:
 *   - spec/18-spec-issues/**           (audits document past wording verbatim)
 *   - spec/**\/_archive*\/**            (archived content, frozen)
 *   - spec/**\/99-consistency-report.md (reports past states)
 *   - error-codes JSON / schemas       (xxx is a numeric format placeholder)
 *   - "TODO(TICKET-ID)" with a ticket reference (per coding guidelines)
 *   - the strings "type:todo", "is:todo", "todo!", "to-do", "TODO/FIXME comments"
 *     (legitimate ItemType / language references)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "spec";
const BANNED = [
  { re: /\bTBD\b/g, label: "TBD" },
  { re: /\bFIXME\b/g, label: "FIXME" },
  { re: /\bXXX\b/g, label: "XXX" },
  { re: /\bwe could\b/gi, label: "we could" },
  { re: /\bmay want to\b/gi, label: "may want to" },
  { re: /\bmight want\b/gi, label: "might want" },
  { re: /\bperhaps\b/gi, label: "perhaps" },
  { re: /\bpossibly\b/gi, label: "possibly" },
  { re: /\bideally\b/gi, label: "ideally" },
  { re: /\bpreferably\b/gi, label: "preferably" },
  { re: /\bshould consider\b/gi, label: "should consider" },
  // P15: bare "consider" used as soft directive (e.g. "consider adding X").
  // Natural-English uses ("MUST consider", "will not consider", "could consider")
  // are filtered by ALLOW_LINE below.
  { re: /\bconsider\b/gi, label: "consider (use MUST/SHOULD/MAY)" },
  { re: /\bmirror cop(y|ies)\b/gi, label: "mirror copy (use 'mirror peer' — F7-3)" },
];

const SKIP_PATH = (p) =>
  p.includes("/_archive") ||
  p.includes("/18-spec-issues/") ||
  p.endsWith("/99-consistency-report.md") ||
  p.includes("/03-error-manage/03-error-code-registry/") ||
  p.endsWith("/20-rfc-2119-wording-policy.md") ||
  p.endsWith("/09-exceptions.md") ||
  p.endsWith("/06-comments-and-documentation.md") ||
  p.endsWith("/06-exemptions-and-checklist.md") ||
  p.endsWith("/06-enforcement.md") ||
  p.endsWith("/18-ai-contract-template.md") ||
  p.endsWith("/09b-mirror-peer-group-model.md"); // canonical glossary that defines the forbidden phrase


const ALLOW_LINE = (line) =>
  /TODO\([A-Z0-9-]+\)/.test(line) ||                // TODO(TICKET-ID)
  /\btype:todo\b|\bis:todo\b|\btodo!\b|\bto-do\b/i.test(line) || // ItemType refs
  /TODO\/FIXME/.test(line) ||                       // policy mention
  /TODO\(P1\)/.test(line) ||
  // "consider" filters: only flag bare soft-directive usage. These patterns are
  // natural English and grammatically distinct from "consider adding X":
  /MUST consider\b/.test(line) ||                   // bound by MUST
  /\bnot consider\b/i.test(line) ||                 // negation ("will not consider")
  /\bconsider(ed|ing|ation|ations)\b/i.test(line) || // morphological forms
  /"consider [^"]*"/.test(line) ||                  // user-facing string literal
  /toast\.\w+\(["']/.test(line);                    // toast/notification strings

const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    if (!full.endsWith(".md")) continue;
    if (SKIP_PATH(full)) continue;

    const lines = readFileSync(full, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (ALLOW_LINE(line)) continue;
      for (const { re, label } of BANNED) {
        re.lastIndex = 0;
        if (re.test(line)) {
          findings.push({ file: relative(".", full), line: i + 1, label, snippet: line.trim().slice(0, 120) });
        }
      }
    }
  }
}

walk(ROOT);

if (findings.length === 0) {
  console.log("✅ G-38: no ambiguous-wording placeholders in active spec");
  process.exit(0);
}

console.error(`❌ G-38: ${findings.length} ambiguous-wording occurrence(s) in active spec:\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line} [${f.label}] ${f.snippet}`);
}
console.error("\nResolve by:");
console.error("  • replacing with RFC-2119 wording (MUST / SHOULD / MAY) per spec/01-spec-authoring-guide/20-rfc-2119-wording-policy.md");
console.error("  • OR converting to a TODO with a ticket id: TODO(PROJ-123)");
console.error("  • OR moving the line to spec/18-spec-issues/ if it documents a past state");
process.exit(1);
