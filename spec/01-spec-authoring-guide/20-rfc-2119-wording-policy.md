# RFC-2119 Wording Policy (SSOT)

> **Version:** 1.1.0
> **Updated:** 2026-04-30 — Bound 5 prose-MUSTs to new `G-WORDING-*` namespace gates (batch-36); registered formerly-orphan `G-38` as canonical `G-WORDING-AMBIGUOUS-LINT` (legacy alias retained pending F-SCOPE-40-FOLLOWUP rename).
> **Status:** ✅ Canonical — enforced by `scripts/spec-hygiene/38-check-ambiguous-wording.mjs` (gate `G-WORDING-AMBIGUOUS-LINT`, legacy alias `G-38`)
> **Parent:** [`./00-overview.md`](./00-overview.md)

**Reserved Gate IDs (this file):** `G-WORDING-AMBIGUOUS-LINT`, `G-WORDING-KEYWORD-DEFINITIONS`, `G-WORDING-SOFT-LANGUAGE-REPLACEMENT`, `G-WORDING-DELIBERATION-REPLACEMENT`, `G-WORDING-UPPERCASE` — see [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) §Domain-WORDING.

---

## Why

Every spec sentence that defines behavior MUST be unambiguous to both AI agents and human implementers (gate `G-WORDING-AMBIGUOUS-LINT`). Words like "should consider", "may want to", "perhaps", "possibly", "ideally", "preferably", "we could", and bare `TBD` / `FIXME` / `XXX` placeholders are forbidden in active spec because they cannot be lint-checked or compiled into acceptance tests.

---

## Canonical keywords (per RFC-2119)

| Keyword | Meaning | Use when |
|---------|---------|----------|
| **MUST** / **MUST NOT** | Absolute requirement / prohibition | Behavior is mandatory; violation is a CI failure (gate `G-WORDING-KEYWORD-DEFINITIONS`) |
| **SHOULD** / **SHOULD NOT** | Strong recommendation; deviation requires written justification | Default behavior with a documented escape hatch |
| **MAY** / **MAY NOT** | Truly optional behavior | Implementer's choice with no compliance impact |

> Always write keywords in **UPPERCASE** when they carry RFC-2119 weight. Lowercase "should"/"may"/"must" inside prose remain allowed for English flow but carry no normative force.

---

## Forbidden phrases (gated by `G-WORDING-AMBIGUOUS-LINT`, legacy alias `G-38`)

| Phrase | Replace with |
|--------|--------------|
| `TBD` | A concrete value, OR a `TODO(TICKET-ID)` with an owning ticket, OR a link to the deciding spec section |
| `FIXME` / `XXX` | `TODO(TICKET-ID)` |
| "we could", "perhaps", "possibly" | `MAY` (if optional) or `MUST` (if required) — gate `G-WORDING-SOFT-LANGUAGE-REPLACEMENT` |
| "may want to", "might want" | `SHOULD` |
| "ideally", "preferably" | `SHOULD` |
| "should consider" | `MUST evaluate` (if mandatory deliberation) or `MAY evaluate` — gate `G-WORDING-DELIBERATION-REPLACEMENT` |

---

## Allow-listed exemptions

The `G-WORDING-AMBIGUOUS-LINT` (legacy alias `G-38`) gate intentionally skips:

- `spec/18-spec-issues/**` — audits document past wording verbatim.
- `spec/**/_archive*/**` — archived content is frozen.
- `spec/**/99-consistency-report.md` — reports past states.
- `spec/03-error-manage/03-error-code-registry/**` — `xxx` / `xxxx` are numeric format placeholders.
- `TODO(TICKET-ID)` and `TODO(P1)` — tracking convention per [`spec/02-coding-guidelines/01-cross-language/04-code-style/06-comments-and-documentation.md`](../02-coding-guidelines/01-cross-language/04-code-style/06-comments-and-documentation.md).
- ItemType references: `type:todo`, `is:todo`, `todo!`, `to-do` (legitimate enum / language values).

---

## Acceptance criteria

| ID | Criterion | Source |
|----|-----------|--------|
| `AT-RFC2119-01` | Active spec files contain zero bare `TBD` / `FIXME` / `XXX` outside the allow-list. | `scripts/spec-hygiene/38-check-ambiguous-wording.mjs` |
| `AT-RFC2119-02` | Active spec files contain zero soft-language phrases ("we could", "perhaps", "possibly", "ideally", "preferably", "may want to", "might want", "should consider"). | same script |
| `AT-RFC2119-03` | RFC-2119 keywords carrying normative weight MUST be uppercase. | reviewer judgement; lower-case use is non-normative — gate `G-WORDING-UPPERCASE` |

---

## Verification

```bash
node scripts/spec-hygiene/38-check-ambiguous-wording.mjs
node scripts/spec-hygiene/00-run-all.mjs
```

---

## Fixtures

This policy is gate-enforced by the hygiene script — the script's pass/fail output IS the fixture. No separate fixtures file required. Per the global P2g sweep opt-out for "narrative-only enforcement docs", see [`../97a-acceptance-criteria-fixtures.md`](../97a-acceptance-criteria-fixtures.md) §"Lint-shape pattern".

---

## Related

- [`./19-acceptance-criteria-io-table.md`](./19-acceptance-criteria-io-table.md) — Fixture format SSOT
- [`./09-exceptions.md`](./09-exceptions.md) — Other allow-listed legacy patterns
- [`../02-coding-guidelines/01-cross-language/04-code-style/06-comments-and-documentation.md`](../02-coding-guidelines/01-cross-language/04-code-style/06-comments-and-documentation.md) — TODO comment policy

---

*Created 2026-04-28 — closes P4 (TBD/should/consider sweep). Two real TBDs resolved before gate activation: `15-wp-plugin-how-to/23-operator-runbooks/01-disaster-recovery-restore.md:308` (post-mortem template now exists at `03-post-mortem-template.md`) and the soft-language audit reference in `18-spec-issues/03-...` (allow-listed under `18-spec-issues/`).*
