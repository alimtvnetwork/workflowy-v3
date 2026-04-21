#!/usr/bin/env node
/**
 * Install / refresh git hooks for this repo.
 *
 * Copies every file in `scripts/git-hooks/` into `.git/hooks/`, makes it
 * executable, and prints a summary. Re-run idempotently — overwrites
 * existing hooks of the same name without warning (this is the desired
 * behaviour for a versioned hook set).
 *
 * Skips silently if `.git/` does not exist (e.g. during a fresh clone in CI
 * or inside a tarball release where the working tree is not a git repo).
 *
 * Auto-invoked on `npm install` via the `prepare` script in package.json.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, chmodSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = "scripts/git-hooks";
const DEST = ".git/hooks";

// `.git` may be a directory (normal repo), a file (worktrees / submodules /
// sandboxed previews), or absent. We only install when it's a real directory.
if (!existsSync(".git") || !statSync(".git").isDirectory()) {
  console.log("ℹ️  Skipping git hook install — .git is not a directory (worktree, sandbox, or fresh clone).");
  process.exit(0);
}

if (!existsSync(SRC)) {
  console.log(`ℹ️  Skipping git hook install — ${SRC}/ does not exist.`);
  process.exit(0);
}

mkdirSync(DEST, { recursive: true });

const hooks = readdirSync(SRC);
let installed = 0;
for (const name of hooks) {
  const from = join(SRC, name);
  const to = join(DEST, name);
  copyFileSync(from, to);
  // 0o755 — owner rwx, group/other rx
  chmodSync(to, 0o755);
  installed += 1;
}

console.log(`✅ Installed ${installed} git hook(s) into ${DEST}/`);
