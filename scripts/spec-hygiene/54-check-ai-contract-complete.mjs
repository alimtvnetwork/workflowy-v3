#!/usr/bin/env node
/**
 * G-00-OVERVIEW-AI-CONTRACT-COMPLETE
 * --------------------------------------------------------------------------
 * Layer-2 of the AI-Contract trio. Locks the canonical 5-subsection schema
 * inside every top-level overview's `## AI Contract` block.
 *
 * Five rules:
 *   1. All five bold-prefix subsections present:
 *      **Purpose**, **Audience**, **Expected AI Output**,
 *      **Out of Scope**, **Definition of Done**.
 *   2. Canonical order (above).
 *   3. Each subsection has a non-empty body.
 *   4. Every `**Out of Scope**` bullet contains a markdown link.
 *   5. Every `**Definition of Done**` bullet cites an `AT-*` ID, `G-*` gate,
 *      script path (`scripts/...`), or runner invocation (`node …`).
 *
 * Tier:  Rules 1+2 hard-fail from day 1 (already enforced by sibling gate
 *        `G-00-OVERVIEW-AI-CONTRACT-PRESENT`-style check via 12-check-required-files).
 *        Rules 3–5 WARN-only here until baseline confirmed clean.
 *
 * SSOT: spec/01-spec-authoring-guide/18-ai-contract-template.md
 * Audit ledger: .lovable/memory/audit/at-overview-ai-contract-complete-gate.md
 *
 * Carve-outs:
 *   - Sub-overviews out of scope (Authoring rule §6).
 *   - Fenced code blocks (```...```) stripped before scanning so the template
 *     file itself doesn't trip the gate.
 *
 * Exits 0 in WARN-only mode for rules 3–5; exits 1 if rules 1+2 fail or once
 * PROMOTED_HARDFAIL flips true.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SPEC = "spec";
const OVERVIEW = "00-overview.md";
const PROMOTED_HARDFAIL = false; // flips true after baseline drain

const CANONICAL = [
  "Purpose",
  "Audience",
  "Expected AI Output",
  "Out of Scope",
  "Definition of Done",
];

function listTopLevelOverviews() {
  const out = [];
  for (const e of readdirSync(SPEC, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (!/^\d{2}-/.test(e.name)) continue;
    const p = join(SPEC, e.name, OVERVIEW);
    try { statSync(p); out.push(p); } catch { /* missing — handled elsewhere */ }
  }
  return out.sort();
}

function stripFences(txt) {
  return txt.replace(/```[\s\S]*?```/g, "");
}

function extractAiContractBlock(txt) {
  // From `## AI Contract` to the next H2 (`^## `) or EOF.
  const m = txt.match(/^##\s+AI Contract\s*$([\s\S]*?)(?=^##\s|\Z)/m);
  return m ? m[1] : null;
}

function parseSubsections(block) {
  // Split on `**<Name>**` markers; capture name + body until next marker.
  const re = /\*\*(Purpose|Audience|Expected AI Output|Out of Scope|Definition of Done)\*\*\s*([\s\S]*?)(?=\n\s*\*\*(?:Purpose|Audience|Expected AI Output|Out of Scope|Definition of Done)\*\*|\Z)/g;
  const found = [];
  let m;
  while ((m = re.exec(block)) !== null) {
    found.push({ name: m[1], body: m[2].trim(), index: m.index });
  }
  return found;
}

const HARDFAIL_LIMIT = 2; // rules 1 & 2
const rule1Fails = [];
const rule2Fails = [];
const rule3Warns = [];
const rule4Warns = [];
const rule5Warns = [];

for (const file of listTopLevelOverviews()) {
  const raw = readFileSync(file, "utf8");
  const txt = stripFences(raw);
  const block = extractAiContractBlock(txt);
  if (block === null) continue; // PRESENT gate handles missing block

  const subs = parseSubsections(block);
  const names = subs.map(s => s.name);

  // Rule 1: all five present.
  const missing = CANONICAL.filter(c => !names.includes(c));
  if (missing.length > 0) {
    rule1Fails.push(`${file}: missing subsection(s): ${missing.join(", ")}`);
    continue; // can't evaluate order/body without all five
  }

  // Rule 2: canonical order.
  const orderOk = CANONICAL.every((c, i) => names[i] === c);
  if (!orderOk) {
    rule2Fails.push(`${file}: subsections out of order. Found [${names.join(", ")}] expected [${CANONICAL.join(", ")}]`);
    continue;
  }

  // Rule 3: non-empty bodies.
  for (const s of subs) {
    if (!s.body || /^—\s*$/.test(s.body) || s.body.length < 10) {
      rule3Warns.push(`${file}: subsection \`**${s.name}**\` body is empty or too short.`);
    }
  }

  // Rule 4: every Out of Scope bullet has a markdown link.
  const oos = subs.find(s => s.name === "Out of Scope");
  if (oos) {
    const bullets = oos.body.split(/\n/).filter(l => /^\s*[-*]\s+/.test(l));
    for (const b of bullets) {
      if (!/\[[^\]]+\]\([^)]+\)/.test(b)) {
        rule4Warns.push(`${file}: Out-of-Scope bullet missing markdown link: ${b.trim().slice(0, 80)}`);
      }
    }
  }

  // Rule 5: every Definition-of-Done bullet cites AT-*, G-*, script path, or `node` runner.
  const dod = subs.find(s => s.name === "Definition of Done");
  if (dod) {
    const bullets = dod.body.split(/\n/).filter(l => /^\s*[-*]\s+/.test(l));
    for (const b of bullets) {
      const ok = /\bAT-[A-Z0-9-]+\b/.test(b)
        || /\bG-[A-Z0-9-]+\b/.test(b)
        || /scripts\/[\w./-]+/.test(b)
        || /\bnode\s+\S+/.test(b);
      if (!ok) {
        rule5Warns.push(`${file}: Definition-of-Done bullet missing AT/G/script/node citation: ${b.trim().slice(0, 80)}`);
      }
    }
  }
}

let exitCode = 0;

if (rule1Fails.length > 0) {
  console.error(`[FAIL] G-00-OVERVIEW-AI-CONTRACT-COMPLETE Rule 1 (all 5 subsections): ${rule1Fails.length} file(s)`);
  for (const m of rule1Fails) console.error("  " + m);
  exitCode = 1;
}
if (rule2Fails.length > 0) {
  console.error(`[FAIL] G-00-OVERVIEW-AI-CONTRACT-COMPLETE Rule 2 (canonical order): ${rule2Fails.length} file(s)`);
  for (const m of rule2Fails) console.error("  " + m);
  exitCode = 1;
}

const warnTier = [
  ["Rule 3 (non-empty bodies)", rule3Warns],
  ["Rule 4 (Out-of-Scope links)", rule4Warns],
  ["Rule 5 (DoD citations)", rule5Warns],
];
let totalWarns = 0;
for (const [label, list] of warnTier) {
  if (list.length === 0) continue;
  totalWarns += list.length;
  console.error(`[WARN] G-00-OVERVIEW-AI-CONTRACT-COMPLETE ${label}: ${list.length} bullet(s)`);
  for (const m of list.slice(0, 20)) console.error("  " + m);
  if (list.length > 20) console.error(`  …and ${list.length - 20} more`);
}

if (PROMOTED_HARDFAIL && totalWarns > 0) exitCode = 1;

if (exitCode === 0) {
  if (totalWarns === 0) {
    console.log("✅ G-00-OVERVIEW-AI-CONTRACT-COMPLETE: all rules pass on every top-level overview.");
  } else {
    console.log(`✅ G-00-OVERVIEW-AI-CONTRACT-COMPLETE Rules 1+2 pass; Rules 3–5 ${totalWarns} WARN(s) (non-blocking until promotion).`);
  }
}
process.exit(exitCode);
