#!/usr/bin/env node
/**
 * scripts/spec-hygiene/75-check-license-files-present.mjs
 *
 * Enforces ADR-0032 (License Decision) D1–D3 — the repo root MUST contain:
 *   1. `LICENSE`        — full text of GPL-2.0-or-later
 *   2. `LICENSE-SPEC`   — full text of CC-BY-4.0
 *   3. `TRADEMARK.md`   — project-name policy
 *
 * Tier: CI, **WARN-only** (per `_GATE-GRADUATION-LEDGER.md` row for
 *   `G-32-LICENSE-FILES-PRESENT`).
 *
 * Flip path: when all 3 files are present at repo root for ≥7 consecutive CI
 *   runs, set `STRICT = true` below; runner then exits 1 on any missing file.
 *
 * Spec-only-mode safe: read-only file existence checks, never edits.
 *
 * Style: pure positive guard clauses, no nested ifs, max 15-line bodies.
 */
import { existsSync, statSync, readFileSync } from "node:fs";

const STRICT = false; // flip to `true` when graduation criterion met

const REQUIRED = [
  {
    path: "LICENSE",
    label: "GPL-2.0-or-later (plugin/frontend/scripts)",
    sentinel: /GNU GENERAL PUBLIC LICENSE/i,
    minBytes: 10000,
  },
  {
    path: "LICENSE-SPEC",
    label: "CC-BY-4.0 (spec prose)",
    sentinel: /Creative Commons Attribution 4\.0/i,
    minBytes: 5000,
  },
  {
    path: "TRADEMARK.md",
    label: "Project-name trademark policy",
    sentinel: /WorkFlowy/,
    minBytes: 200,
  },
];

function checkOne(spec) {
  if (!existsSync(spec.path)) return { ok: false, reason: "missing" };
  const size = statSync(spec.path).size;
  if (size < spec.minBytes) return { ok: false, reason: `too small (${size}B < ${spec.minBytes}B)` };
  const text = readFileSync(spec.path, "utf8");
  if (!spec.sentinel.test(text)) return { ok: false, reason: `sentinel /${spec.sentinel.source}/ not found` };
  return { ok: true };
}

function report(results) {
  const failed = results.filter((r) => !r.ok);
  const presentCount = results.length - failed.length;
  console.log(`G-32-LICENSE-FILES-PRESENT: ${presentCount}/${results.length} required files present`);
  for (const r of failed) console.log(`  - ${r.path} (${r.label}): ${r.reason}`);
  return failed.length;
}

function main() {
  const results = REQUIRED.map((spec) => ({ ...spec, ...checkOne(spec) }));
  const failures = report(results);
  if (failures === 0) return process.exit(0);
  if (!STRICT) {
    console.log(`[WARN] ${failures} license file(s) missing — graduation pending per _GATE-GRADUATION-LEDGER.md`);
    return process.exit(0);
  }
  console.error(`[FAIL] ${failures} required license file(s) missing (STRICT mode)`);
  return process.exit(1);
}

main();
