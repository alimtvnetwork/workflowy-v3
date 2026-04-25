#!/usr/bin/env node
/**
 * F-08: Split 8 oversized spec files (>400 lines) into smaller siblings.
 * Closes audit finding F-08. Idempotent — skips files already split.
 *
 * Strategy: each entry below names the source file, the heading at which
 * to cut, the new sibling filename, and a short title. Everything from
 * the cut heading (inclusive) to EOF is moved to the sibling. The original
 * gets a pointer paragraph + "Continued in" link inserted at the cut.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const splits = [
  {
    src: "spec/16-generic-cli/15-constants-reference.md",
    cutHeading: "## Naming Quick Reference",
    siblingName: "15a-naming-and-contributors.md",
    siblingTitle: "Constants — Naming Reference & Contributors",
  },
  {
    src: "spec/32-ui-design/01-architecture/05-component-contract-map.md",
    cutHeading: "## Component-Path Index",
    siblingName: "05a-component-path-index.md",
    siblingTitle: "Component-Path Index",
  },
  {
    src: "spec/13-cicd-pipeline-workflows/02-go-binary-deploy/03-complete-workflow-reference.md",
    cutHeading: "## Stage-by-Stage Cross-References",
    siblingName: "03a-stage-references-and-layout.md",
    siblingTitle: "Stage-by-Stage References & Multi-Module Layout",
  },
  {
    src: "spec/03-error-manage/02-error-architecture/07-logging-and-diagnostics/01-react-execution-logger.md",
    cutHeading: "## 9. Performance",
    siblingName: "01a-react-logger-performance-and-roadmap.md",
    siblingTitle: "React Execution Logger — Performance, Best Practices & Roadmap",
  },
  {
    src: "spec/10-powershell-integration/03-integration-guide.md",
    cutHeading: "## CI/CD Integration",
    siblingName: "03a-cicd-and-handoff.md",
    siblingTitle: "PowerShell Integration — CI/CD & AI Handoff",
  },
  {
    src: "spec/15-wp-plugin-how-to/17-data-file-patterns.md",
    cutHeading: "## 17.5 Adding a New Data File",
    siblingName: "17a-data-file-validation-and-checklist.md",
    siblingTitle: "Data File Patterns — Adding Files, Validation & Checklist",
  },
  {
    src: "spec/15-wp-plugin-how-to/18-frontend-javascript-patterns.md",
    cutHeading: "## 18.7 Table Rendering from API Data",
    siblingName: "18a-frontend-tables-urls-and-confirms.md",
    siblingTitle: "Frontend JS Patterns — Tables, URL Builders & Confirm Actions",
  },
  {
    src: "spec/02-coding-guidelines/05-rust/01-naming-conventions.md",
    cutHeading: "## JSON Struct Serialization — PascalCase Wire Format",
    siblingName: "01a-rust-json-and-decisions.md",
    siblingTitle: "Rust Naming — JSON Wire Format, Modules & Decision Tables",
  },
];

let processed = 0;
let skipped = 0;

for (const { src, cutHeading, siblingName, siblingTitle } of splits) {
  if (!existsSync(src)) {
    console.warn(`⚠️  Source not found: ${src}`);
    continue;
  }

  const content = readFileSync(src, "utf8");
  const lines = content.split("\n");
  const cutIdx = lines.findIndex((l) => l.trim() === cutHeading.trim());

  if (cutIdx === -1) {
    console.warn(`⚠️  Cut heading not found in ${src}: "${cutHeading}"`);
    skipped += 1;
    continue;
  }

  const siblingPath = join(dirname(src), siblingName);
  if (existsSync(siblingPath)) {
    skipped += 1;
    continue;
  }

  const head = lines.slice(0, cutIdx).join("\n").replace(/\n+$/, "");
  const tail = lines.slice(cutIdx).join("\n");

  const srcBase = src.split("/").pop();
  const siblingHeader = `# ${siblingTitle}

> **Split from** [\`${srcBase}\`](./${srcBase}) on 2026-04-25 to keep both files under the 400-line guideline (closes F-08).
> **Parent:** [\`00-overview.md\`](./00-overview.md)

---

`;

  const headFooter = `

---

## Continued

The remaining sections of this document have been moved to [\`${siblingName}\`](./${siblingName}) (split 2026-04-25 — F-08) to keep this file under 400 lines:

- ${cutHeading.replace(/^##\s+/, "")}
- (and following sections)

See the sibling file for the full content.
`;

  writeFileSync(siblingPath, siblingHeader + tail);
  writeFileSync(src, head + headFooter);
  processed += 1;
  console.log(`✂️  Split ${src} → ${siblingName}`);
}

console.log(`\n✅ Processed ${processed}; skipped ${skipped}.`);
