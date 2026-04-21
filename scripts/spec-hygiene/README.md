# Spec Hygiene Guards

> **Version:** 1.0.0  
> **Updated:** 2026-04-19

Automated checks that enforce the rules in
[`spec/01-spec-authoring-guide/02-naming-conventions.md`](../../spec/01-spec-authoring-guide/02-naming-conventions.md).

## Run all

```bash
node scripts/spec-hygiene/00-run-all.mjs
```

## Individual checks

| Script | Enforces |
|--------|----------|
| `01-check-numbering.mjs` | Two-digit prefixes, no duplicates within a folder |
| `02-check-headers.mjs` | Blockquote `> **Version:** / > **Updated:**` form, no `Last Updated:`, no forbidden metadata fields in `00-overview.md` |
| `03-check-links.mjs` | All relative `[..](path)` links resolve to existing files |

## Exit codes

- `0` — clean
- `1` — at least one violation

## CI wiring

Add to your CI workflow (e.g. GitHub Actions):

```yaml
- name: Spec Hygiene
  run: node scripts/spec-hygiene/00-run-all.mjs
```

For local pre-commit (advisory, non-blocking), add to `.husky/pre-commit`:

```bash
node scripts/spec-hygiene/00-run-all.mjs || echo "⚠️  spec-hygiene warnings"
```

## Closing I-18

These guards close hygiene issue **I-18** (no CI check enforces any spec rule).
