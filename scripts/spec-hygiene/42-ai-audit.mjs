#!/usr/bin/env node
// P10 — Spec AI-readiness audit (round 5, 2026-04-28).
// Scores all 24 top-level spec sections via Lovable AI Gateway with structured tool-call output.
// Six dimensions × 0-100 → composite. Caps per-section input to keep token usage bounded.

import fs from 'node:fs';
import path from 'node:path';

const SPEC_DIR = 'spec';
const MODEL = 'google/gemini-2.5-flash'; // mediocre-AI baseline per rubric
const MAX_CHARS_PER_SECTION = 18000; // cap input
const OUT_MD = '/mnt/documents/spec_ai_audit_FINAL.md';
const OUT_JSON = '/mnt/documents/spec_ai_audit_FINAL.json';
const API_KEY = process.env.LOVABLE_API_KEY;
if (!API_KEY) { console.error('LOVABLE_API_KEY missing'); process.exit(1); }

const SECTIONS = fs.readdirSync(SPEC_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^\d/.test(d.name))
  .map(d => d.name).sort();

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(md|json)$/i.test(e.name)) out.push(p);
  }
  return out;
}

function loadSection(section) {
  const dir = path.join(SPEC_DIR, section);
  const files = walk(dir);
  let total = 0, lines = 0;
  // prioritise overview + acceptance-criteria
  files.sort((a, b) => {
    const score = (p) => /00-overview/.test(p) ? 0 : /9[78]-acceptance/.test(p) ? 1 : /\.md$/.test(p) ? 2 : 3;
    return score(a) - score(b);
  });
  let buf = '';
  for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    lines += c.split('\n').length;
    if (buf.length < MAX_CHARS_PER_SECTION) {
      const remaining = MAX_CHARS_PER_SECTION - buf.length;
      buf += `\n\n=== FILE: ${f} ===\n` + c.slice(0, remaining);
    }
    total++;
  }
  return { section, fileCount: total, lineCount: lines, content: buf };
}

const TOOL = {
  type: 'function',
  function: {
    name: 'submit_score',
    description: 'Submit per-section AI-implementability scores.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      required: ['dimensions', 'composite', 'grade', 'top_issues', 'gaps_to_100'],
      properties: {
        dimensions: {
          type: 'object', additionalProperties: false,
          required: ['completeness', 'unambiguity', 'testability', 'determinism', 'consistency', 'actionability'],
          properties: {
            completeness: { type: 'integer', minimum: 0, maximum: 100 },
            unambiguity: { type: 'integer', minimum: 0, maximum: 100 },
            testability: { type: 'integer', minimum: 0, maximum: 100 },
            determinism: { type: 'integer', minimum: 0, maximum: 100 },
            consistency: { type: 'integer', minimum: 0, maximum: 100 },
            actionability: { type: 'integer', minimum: 0, maximum: 100 }
          }
        },
        composite: { type: 'integer', minimum: 0, maximum: 100 },
        grade: { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
        top_issues: {
          type: 'array', maxItems: 5,
          items: {
            type: 'object', additionalProperties: false,
            required: ['title', 'severity', 'impact', 'why', 'fix'],
            properties: {
              title: { type: 'string' },
              severity: { type: 'integer', minimum: 1, maximum: 10 },
              impact: { type: 'integer', minimum: 1, maximum: 10 },
              why: { type: 'string' },
              fix: { type: 'string' }
            }
          }
        },
        gaps_to_100: { type: 'array', maxItems: 6, items: { type: 'string' } }
      }
    }
  }
};

const SYSTEM = `You audit a software specification for "AI-implementability".
A mediocre AI (Gemini-2.5-Flash class) must implement the section with 100% confidence — no guessing, no hallucination.
Score six dimensions 0-100:
- completeness: every detail needed is present
- unambiguity: no "should/consider/TBD/maybe"
- testability: concrete I/O for every acceptance criterion
- determinism: same input → same code (no design choices left to AI)
- consistency: terminology, naming, file layout match across spec
- actionability: AI knows the next file to create / function to write
Composite = arithmetic mean (rounded). Grade: 90+=A, 80+=B, 70+=C, 60+=D, else F.
Be strict; default penalize for missing concrete examples, missing JSON fixtures, missing file paths.
Call submit_score exactly once.`;

async function score(section, content) {
  const userMsg = `Audit spec section \`${section}\`.\n\n--- BEGIN SECTION ---\n${content}\n--- END SECTION ---`;
  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: userMsg }
    ],
    tools: [TOOL],
    tool_choice: { type: 'function', function: { name: 'submit_score' } }
  };
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text();
    return { error: `HTTP ${res.status}: ${t.slice(0, 200)}` };
  }
  const j = await res.json();
  const tc = j.choices?.[0]?.message?.tool_calls?.[0];
  if (!tc) return { error: 'no tool_call', raw: JSON.stringify(j).slice(0, 300) };
  try { return JSON.parse(tc.function.arguments); }
  catch (e) { return { error: 'parse_fail: ' + e.message }; }
}

const results = [];
console.log(`Auditing ${SECTIONS.length} sections with ${MODEL} ...`);
for (const s of SECTIONS) {
  const sec = loadSection(s);
  process.stdout.write(`  ${s.padEnd(40)} files=${String(sec.fileCount).padStart(3)} lines=${String(sec.lineCount).padStart(5)} ... `);
  const r = await score(s, sec.content);
  if (r.error) console.log(`ERR ${r.error}`);
  else console.log(`composite=${r.composite} (${r.grade})`);
  results.push({ section: s, fileCount: sec.fileCount, lineCount: sec.lineCount, ...r });
}

const scored = results.filter(r => !r.error);
const dims = ['completeness', 'unambiguity', 'testability', 'determinism', 'consistency', 'actionability'];
const aggDims = Object.fromEntries(dims.map(d => [d, Math.round(scored.reduce((a, r) => a + (r.dimensions?.[d] || 0), 0) / scored.length)]));
const composite = Math.round(scored.reduce((a, r) => a + (r.composite || 0), 0) / scored.length);
const grade = composite >= 90 ? 'A' : composite >= 80 ? 'B' : composite >= 70 ? 'C' : composite >= 60 ? 'D' : 'F';

const json = { run: '2026-04-28-P10', model: MODEL, sections_total: SECTIONS.length, sections_scored: scored.length, composite, grade, aggregate_dimensions: aggDims, sections: results };
fs.writeFileSync(OUT_JSON, JSON.stringify(json, null, 2));

const lines = [];
lines.push(`# Spec AI-Implementability Audit — FINAL (Round 5, 2026-04-28, P10)`);
lines.push('');
lines.push(`> Rubric: a **mediocre AI** (${MODEL}) must implement each section with 100% confidence — no guessing, no hallucination.`);
lines.push(`> Method: per-section AI scoring via Lovable AI Gateway with forced \`submit_score\` tool-call output. Six dimensions × 0-100 → composite.`);
lines.push('');
lines.push('## Run summary');
lines.push('');
lines.push(`- **Top-level sections:** ${SECTIONS.length}`);
lines.push(`- **AI-scored:** ${scored.length}`);
lines.push(`- **Errored:** ${results.length - scored.length}`);
lines.push('');
lines.push(`## Aggregate AI-readiness score`);
lines.push('');
lines.push(`**Composite: ${composite}/100** — grade ${grade}`);
lines.push('');
lines.push('| Dimension | Score |\n|---|---:|');
for (const d of dims) lines.push(`| ${d} | ${aggDims[d]} |`);
lines.push('');
lines.push('## Per-section scoreboard');
lines.push('');
lines.push('| Section | Files | Lines | Composite | Grade | C | U | T | D | Cs | A |');
lines.push('|---|---:|---:|---:|:---:|---:|---:|---:|---:|---:|---:|');
for (const r of results) {
  if (r.error) {
    lines.push(`| \`spec/${r.section}\` | ${r.fileCount} | ${r.lineCount} | — | — | — | — | — | — | — | — |`);
  } else {
    const d = r.dimensions;
    lines.push(`| \`spec/${r.section}\` | ${r.fileCount} | ${r.lineCount} | ${r.composite} | ${r.grade} | ${d.completeness} | ${d.unambiguity} | ${d.testability} | ${d.determinism} | ${d.consistency} | ${d.actionability} |`);
  }
}
lines.push('');
lines.push('## Sections below target (composite < 90)');
lines.push('');
const below = scored.filter(r => r.composite < 90).sort((a, b) => a.composite - b.composite);
for (const r of below) {
  lines.push(`### \`spec/${r.section}\` — ${r.composite}/100 (${r.grade})`);
  lines.push('');
  lines.push('**Top issues:**');
  for (const i of (r.top_issues || [])) {
    lines.push(`- **${i.title}** (sev ${i.severity} × imp ${i.impact}). ${i.why} **Fix:** ${i.fix}`);
  }
  lines.push('');
  lines.push('**Gap-to-100 list:**');
  for (const g of (r.gaps_to_100 || [])) lines.push(`- ${g}`);
  lines.push('');
}
lines.push('## Errors');
lines.push('');
const errs = results.filter(r => r.error);
if (!errs.length) lines.push('_None._');
for (const r of errs) lines.push(`- \`${r.section}\`: ${r.error}`);
fs.writeFileSync(OUT_MD, lines.join('\n'));
console.log(`\nWrote ${OUT_MD} and ${OUT_JSON}`);
console.log(`Composite: ${composite}/100 (${grade}) across ${scored.length}/${SECTIONS.length} sections`);
