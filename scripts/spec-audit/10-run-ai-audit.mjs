#!/usr/bin/env node
// scripts/spec-audit/10-run-ai-audit.mjs
//
// Promotes the AI re-audit (Gemini-2.5-Pro via Lovable AI Gateway) from an
// ad-hoc /tmp script to a versioned, repeatable runner.
//
// Usage:
//   node scripts/spec-audit/10-run-ai-audit.mjs              # auto-detect next version, write JSON
//   node scripts/spec-audit/10-run-ai-audit.mjs --notes "..."  # extra change-context bullets
//   node scripts/spec-audit/10-run-ai-audit.mjs --dry-run      # build prompt, skip API call
//
// Authority: ADR-0029 + ADR-0030 (process maturity); audit-trail row in
//   spec/_GATE-REGISTRY.md; baseline ledger in mem://index.md Core block.
// Artifact location: /mnt/documents/spec-ai-implementability-audit-vN.json
// Exit codes: 0 success, 1 missing API key, 2 gateway error, 3 file-write error.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ARTIFACT_DIR = '/mnt/documents';
const ARTIFACT_PREFIX = 'spec-ai-implementability-audit';
const MODEL = 'google/gemini-2.5-pro';
const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { notes: '', dryRun: false };
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--dry-run') out.dryRun = true;
    if (args[i] === '--notes' && args[i + 1]) { out.notes = args[i + 1]; i += 1; }
  }
  return out;
}

function findPriorAudit() {
  if (!fs.existsSync(ARTIFACT_DIR)) return { version: 1, json: null };
  const files = fs.readdirSync(ARTIFACT_DIR)
    .filter((f) => f.startsWith(ARTIFACT_PREFIX) && f.endsWith('.json'));
  if (files.length === 0) return { version: 1, json: null };
  const versions = files.map((f) => {
    const m = f.match(/-v(\d+)\.json$/);
    return m ? Number(m[1]) : 1;
  });
  const maxVersion = Math.max(...versions);
  const priorPath = path.join(ARTIFACT_DIR, `${ARTIFACT_PREFIX}-v${maxVersion}.json`);
  const fallback = path.join(ARTIFACT_DIR, `${ARTIFACT_PREFIX}.json`);
  const sourcePath = fs.existsSync(priorPath) ? priorPath : fallback;
  const json = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, 'utf8') : null;
  return { version: maxVersion + 1, json, sourcePath };
}

function safeCount(cmd) {
  const result = execSync(cmd, { encoding: 'utf8' }).trim();
  return Number(result) || 0;
}

function gatherCorpusMetrics() {
  return {
    specMarkdownFiles: safeCount("find spec -name '*.md' | wc -l"),
    adrCount: safeCount("ls spec/00-adrs/0[0-9][0-9][0-9]*.md 2>/dev/null | wc -l"),
    acFiles: safeCount("find spec \\( -name '97-acceptance-criteria.md' -o -name '98-acceptance-criteria.md' \\) | wc -l"),
    fixtureFiles: safeCount("find spec -name '97a-acceptance-criteria-fixtures.md' | wc -l"),
    hygieneRunners: safeCount("ls scripts/spec-hygiene/*.mjs 2>/dev/null | wc -l"),
    placeholderFiles: safeCount("grep -rlE '^TODO|^TBD|placeholder' spec --include='*.md' 2>/dev/null | wc -l"),
  };
}

function buildPrompt(prior, metrics, version, extraNotes) {
  const priorBlock = prior.json
    ? `PRIOR AUDIT (v${version - 1}, source: ${prior.sourcePath}):\n${prior.json}`
    : 'PRIOR AUDIT: none — this is the inaugural audit.';
  const notesBlock = extraNotes ? `\nUSER-PROVIDED CHANGE NOTES:\n${extraNotes}\n` : '';
  return `You are auditing WorkFlowy's spec corpus for AI-implementability (can a mediocre AI implement features from spec alone with high confidence?).

${priorBlock}

CURRENT CORPUS METRICS:
- spec/ markdown files: ${metrics.specMarkdownFiles}
- ADRs: ${metrics.adrCount}
- Acceptance-criteria files: ${metrics.acFiles}
- Fixture files (97a-…): ${metrics.fixtureFiles}
- Hygiene runners: ${metrics.hygieneRunners}
- Placeholder/TODO/TBD files (heuristic): ${metrics.placeholderFiles}
${notesBlock}
TASK: Produce audit v${version} as STRICT JSON only (no prose, no markdown fences). Schema:
{
  "overallScore": <int 0-100>,
  "previousScore": <int — the prior overallScore or null if inaugural>,
  "delta": <int>,
  "confidenceTier": "BLOCKING|RISKY|WORKABLE|STRONG|EXCELLENT",
  "tierChange": "<old> → <new>",
  "scopeScoresChanged": [{"scope":"...","oldScore":<int>,"newScore":<int>,"delta":<int>,"reason":"..."}],
  "remainingFindingsUnchanged": ["F-AUDIT-NN: ...", ...],
  "resolvedFindings": [{"id":"F-AUDIT-NN","resolution":"..."}],
  "newFindings": [{"id":"F-AUDIT-NN","title":"...","severity":"LOW|MED|HIGH|CRIT","evidence":"...","remediation":"...","pointsIfFixed":<int>,"effort":"s|m|l"}],
  "verdict": "<one paragraph>",
  "honestAssessment": "<one paragraph — be candid about whether changes were substantive or ceremonial>"
}

Calibration rules:
- Per-task delta cap +1.0 for s/m tasks; bundles of 4 small tasks max +2.0 cumulative.
- Never cross 90 without recommending a full re-audit pass.
- Treat fixtures-as-spec, ADR ratifications, and CI-gate authoring as PROCESS improvements (modest score lift) unless they actually unblock implementation of user-facing features.
- Be honest: if 172 placeholders + ADR AT:MUST 0.11 remain, score should NOT jump significantly.`;
}

async function callGateway(prompt) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.error('FAIL: LOVABLE_API_KEY missing — cannot call AI gateway.');
    process.exit(1);
  }
  const res = await fetch(GATEWAY, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) {
    console.error(`FAIL: gateway returned ${res.status}: ${await res.text()}`);
    process.exit(2);
  }
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? '').replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
}

function writeArtifact(version, content) {
  const outPath = path.join(ARTIFACT_DIR, `${ARTIFACT_PREFIX}-v${version}.json`);
  fs.writeFileSync(outPath, `${content}\n`);
  return outPath;
}

function printSummary(version, content, outPath) {
  const parsed = JSON.parse(content);
  console.log(`\n✅ Audit v${version} written → ${outPath}`);
  console.log(`   Score: ${parsed.previousScore ?? 'n/a'} → ${parsed.overallScore} (Δ ${parsed.delta >= 0 ? '+' : ''}${parsed.delta})`);
  console.log(`   Tier:  ${parsed.tierChange}`);
  console.log(`   Resolved: ${(parsed.resolvedFindings ?? []).length}; New: ${(parsed.newFindings ?? []).length}; Open: ${(parsed.remainingFindingsUnchanged ?? []).length}`);
}

async function main() {
  const { notes, dryRun } = parseArgs();
  const prior = findPriorAudit();
  const metrics = gatherCorpusMetrics();
  const prompt = buildPrompt(prior, metrics, prior.version, notes);
  if (dryRun) {
    console.log(prompt);
    console.log(`\n[DRY-RUN] Would write to ${ARTIFACT_DIR}/${ARTIFACT_PREFIX}-v${prior.version}.json`);
    return;
  }
  const content = await callGateway(prompt);
  try {
    const outPath = writeArtifact(prior.version, content);
    printSummary(prior.version, content, outPath);
  } catch (err) {
    console.error(`FAIL: write/parse error: ${err.message}`);
    console.error(content);
    process.exit(3);
  }
}

main();
