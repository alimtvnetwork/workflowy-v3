#!/usr/bin/env node
/**
 * Spec Hygiene Check — Tailwind Token Sync
 *
 * Tailwind v4 reads design tokens from the `@theme` block in
 * `src/index.css`. Components reference those tokens via utility
 * classes such as `bg-background`, `text-foreground`, `mb-md`,
 * `text-h1`, `text-bullet`. If a class names a token that no longer
 * exists in `@theme`, Tailwind silently emits no CSS — no build error,
 * just an invisible regression.
 *
 * This check parses `@theme` to build the legal token catalog, then
 * scans `src/**\/*.{ts,tsx}` for every utility that targets a token
 * scope (color / font-size / spacing / radius) and asserts the token
 * exists. Built-in Tailwind utilities (`flex`, `min-h-screen`, arbitrary
 * `[…]` values, etc.) are ignored.
 *
 * Exit codes:  0 = ok, 1 = unknown token referenced, 2 = source unreadable
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join, extname } from "node:path";

const ROOT = process.cwd();
const CSS_FILE = resolve(ROOT, "src/index.css");
const SRC_DIR = resolve(ROOT, "src");

/** Tailwind utility prefixes whose suffix must resolve to a `@theme` token. */
const COLOR_PREFIXES = ["bg", "text", "border", "ring", "from", "to", "via", "fill", "stroke", "outline", "decoration", "divide", "placeholder", "caret", "accent"];
const SPACING_PREFIXES = ["m", "mx", "my", "mt", "mr", "mb", "ml", "ms", "me", "p", "px", "py", "pt", "pr", "pb", "pl", "ps", "pe", "gap", "gap-x", "gap-y", "space-x", "space-y", "w", "h", "min-w", "min-h", "max-w", "max-h", "size", "top", "right", "bottom", "left", "inset", "inset-x", "inset-y"];
const RADIUS_PREFIXES = ["rounded", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-tl", "rounded-tr", "rounded-bl", "rounded-br"];
const FONT_SIZE_PREFIXES = ["text"];

/** Tokens shipped by Tailwind itself we must not flag. */
const BUILTIN_COLORS = new Set([
  "white", "black", "transparent", "current", "inherit", "auto",
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber",
  "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose",
]);
const BUILTIN_SPACING = new Set([
  "0", "px", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "5", "6", "7",
  "8", "9", "10", "11", "12", "14", "16", "20", "24", "28", "32", "36",
  "40", "44", "48", "52", "56", "60", "64", "72", "80", "96",
  "auto", "full", "screen", "min", "max", "fit", "svh", "lvh", "dvh",
  "1/2", "1/3", "2/3", "1/4", "3/4", "1/5", "2/5", "3/5", "4/5",
]);
const BUILTIN_FONT_SIZE = new Set([
  "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl",
  "8xl", "9xl", "left", "right", "center", "justify", "start", "end",
  "wrap", "nowrap", "balance", "pretty",
]);
const BUILTIN_RADIUS = new Set([
  "", "none", "sm", "md", "lg", "xl", "2xl", "3xl", "full",
]);

function fail(msg) { console.error(`❌ tw-tokens: ${msg}`); process.exit(1); }

function readOrAbort(p) {
  if (!existsSync(p)) { console.error(`❌ tw-tokens: missing ${p}`); process.exit(2); }
  return readFileSync(p, "utf8");
}

/** Parse `@theme` block; returns sets keyed by token category. */
function parseThemeTokens(css) {
  const themeMatch = css.match(/@theme[^{]*\{([\s\S]*?)\n\}/);
  if (!themeMatch) fail("could not find @theme block in index.css");
  const body = themeMatch[1];
  const colors = new Set(), spacing = new Set(), fontSize = new Set(), radius = new Set();
  const re = /--(color|spacing|font-size|radius)-([a-z0-9-]+)\s*:/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const [, kind, name] = m;
    if (kind === "color") colors.add(name);
    else if (kind === "spacing") spacing.add(name);
    else if (kind === "font-size") fontSize.add(name);
    else if (kind === "radius") radius.add(name);
  }
  return { colors, spacing, fontSize, radius };
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if ([".ts", ".tsx"].includes(extname(p))) yield p;
  }
}

/** Strip arbitrary-value brackets, opacity slashes, and modifier prefixes. */
function normalizeUtility(raw) {
  // strip leading variants like "hover:", "md:", "dark:", "group-hover:"
  const noVariants = raw.replace(/^(?:[a-z][a-z0-9-]*:)+/, "");
  // strip trailing /opacity (e.g. text-primary/50)
  const noOpacity = noVariants.split("/")[0];
  // strip trailing ! important
  return noOpacity.replace(/!$/, "");
}

/** Returns null if utility is not token-bound or uses arbitrary value. */
function classify(util, tokens) {
  if (util.includes("[")) return null; // arbitrary value, e.g. text-[14px]
  for (const pref of FONT_SIZE_PREFIXES) {
    const p = pref + "-";
    if (util.startsWith(p)) {
      const suffix = util.slice(p.length);
      if (BUILTIN_FONT_SIZE.has(suffix)) return null;
      if (tokens.fontSize.has(suffix)) return null;
      if (BUILTIN_COLORS.has(suffix.split("-")[0])) return null;
      if (tokens.colors.has(suffix)) return null;
      return { kind: "text", suffix };
    }
  }
  for (const pref of COLOR_PREFIXES) {
    const p = pref + "-";
    if (util.startsWith(p)) {
      const suffix = util.slice(p.length);
      if (BUILTIN_COLORS.has(suffix.split("-")[0])) return null;
      if (tokens.colors.has(suffix)) return null;
      return { kind: pref, suffix };
    }
  }
  for (const pref of SPACING_PREFIXES) {
    const p = pref + "-";
    if (util.startsWith(p)) {
      const suffix = util.slice(p.length);
      if (BUILTIN_SPACING.has(suffix)) return null;
      if (tokens.spacing.has(suffix)) return null;
      return { kind: pref, suffix };
    }
  }
  for (const pref of RADIUS_PREFIXES) {
    if (util === pref) return null;
    const p = pref + "-";
    if (util.startsWith(p)) {
      const suffix = util.slice(p.length);
      if (BUILTIN_RADIUS.has(suffix)) return null;
      if (tokens.radius.has(suffix)) return null;
      return { kind: pref, suffix };
    }
  }
  return null;
}

function extractClasses(source) {
  const out = new Set();
  const re = /className\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    for (const c of m[1].split(/\s+/)) if (c.length > 0) out.add(c);
  }
  return out;
}

function main() {
  const css = readOrAbort(CSS_FILE);
  const tokens = parseThemeTokens(css);
  console.log(`✅ @theme parsed: ${tokens.colors.size} colors, ${tokens.spacing.size} spacing, ${tokens.fontSize.size} font-size, ${tokens.radius.size} radius`);

  const violations = [];
  let scanned = 0;
  for (const file of walk(SRC_DIR)) {
    scanned += 1;
    const text = readFileSync(file, "utf8");
    for (const cls of extractClasses(text)) {
      const u = normalizeUtility(cls);
      const v = classify(u, tokens);
      if (v) violations.push({ file: file.slice(ROOT.length + 1), cls, ...v });
    }
  }

  if (violations.length > 0) {
    console.error(`❌ tw-tokens: ${violations.length} unknown token reference(s)`);
    for (const v of violations) {
      console.error(`   ${v.file}: "${v.cls}" → ${v.kind}-${v.suffix} not in @theme`);
    }
    process.exit(1);
  }
  console.log(`✅ tw-tokens: scanned ${scanned} file(s); all token references resolve`);
}

main();
