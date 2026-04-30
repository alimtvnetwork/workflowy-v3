# ESLint Rule Authoring — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/35-enforcement-rules/`
> **Status:** Draft (P1 — load-bearing for `AT-ENFORCEMENTRULES-09..11` and gates `G-35-EL-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md) §"Pending Sub-Specs" row 03
> **Siblings:** [`./01-generic-return-types.md`](./01-generic-return-types.md) · [`./02-runtime-validation.md`](./02-runtime-validation.md)

---

## Purpose

Define **how to add a new lint rule** to the in-tree plugin `eslint-plugins/coding-guidelines/`. Every gate prefix `G-35-*` (and many `G-NN-*` from sibling sections) is enforced by exactly one rule in this plugin. Rules outside this plugin are forbidden — third-party rules are configured via `.eslintrc` but custom enforcement MUST live in-tree.

---

## Plugin Layout (closed)

```
eslint-plugins/
  coding-guidelines/
    package.json                     ← name: "@workflowy/coding-guidelines"
    src/
      index.ts                       ← exports { rules: { … } }
      rules/
        no-any.ts                    ← one file per rule
        no-phantom-generic.ts
        preserve-brand.ts
        use-envelope.ts
        …
      tests/
        no-any.test.ts               ← one test file per rule (RuleTester)
        …
      utils/
        getDocsUrl.ts                ← maps rule name → spec URL
```

> **MUST** every custom rule live under `eslint-plugins/coding-guidelines/src/rules/<rule-name>.ts`, exported by `src/index.ts`, with one matching test file under `src/tests/<rule-name>.test.ts` `[gate: G-35-EL-PLUGIN-LAYOUT]`.

---

## Rule File Template (canonical)

```ts
// eslint-plugins/coding-guidelines/src/rules/<rule-name>.ts
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { getDocsUrl } from '../utils/getDocsUrl';

const createRule = ESLintUtils.RuleCreator(getDocsUrl);

export const rule = createRule({
  name: 'rule-name',
  meta: {
    type: 'problem',                                    // 'problem' | 'suggestion' | 'layout'
    docs: {
      description: 'One-sentence summary matching the spec rule.',
      recommended: 'error',
    },
    messages: {
      forbidden: 'Concrete reason this code is rejected. See {{specUrl}}.',
    },
    schema: [],                                          // no options
  },
  defaultOptions: [],
  create(context) {
    return {
      // visitor methods
      TSAnyKeyword(node: TSESTree.TSAnyKeyword) {
        context.report({
          node,
          messageId: 'forbidden',
          data: { specUrl: getDocsUrl('rule-name') },
        });
      },
    };
  },
});
```

> **MUST** every rule use the `ESLintUtils.RuleCreator(getDocsUrl)` factory so the violation message links to the source spec — hand-rolled `module.exports = { … }` rules are forbidden `[gate: G-35-EL-USE-CREATOR]`.

> **MUST** every rule's `meta.docs.description` quote (or paraphrase ≤10 words) the source-spec rule it enforces; bare descriptions like "no any" are forbidden `[gate: G-35-EL-MEANINGFUL-DOCS]`.

---

## Rule Naming Convention

| Pattern | Use when | Example |
|---|---|---|
| `no-<thing>` | Rule forbids a syntax/identifier | `no-any`, `no-phantom-generic`, `no-localstorage` |
| `require-<thing>` | Rule mandates presence of a syntax | `require-strict-schema`, `require-error-boundary` |
| `prefer-<a>-over-<b>` | Rule recommends one of two valid forms | `prefer-discriminated-union-over-intersection` |

> **MUST** every rule name match exactly one of the three patterns above (`no-*`, `require-*`, `prefer-*-over-*`) — names like `enforce-foo`, `check-bar`, `lint-baz` are forbidden `[gate: G-35-EL-NAMING]`.

---

## Test File Template (canonical)

Every rule MUST be tested with `RuleTester` covering ≥3 valid cases and ≥3 invalid cases. The invalid cases MUST include the exact error message id.

```ts
// eslint-plugins/coding-guidelines/src/tests/<rule-name>.test.ts
import { RuleTester } from '@typescript-eslint/rule-tester';
import { rule } from '../rules/<rule-name>';

const ruleTester = new RuleTester({
  languageOptions: { parser: require('@typescript-eslint/parser') },
});

ruleTester.run('<rule-name>', rule, {
  valid: [
    { code: `const x: string = 'ok';` },
    { code: `function f<T>(x: T): T { return x; }` },
    { code: `type Brand = string & { __brand: 'X' };` },
  ],
  invalid: [
    { code: `const x: any = 1;`,           errors: [{ messageId: 'forbidden' }] },
    { code: `function f(x: any) {}`,        errors: [{ messageId: 'forbidden' }] },
    { code: `type T = any;`,                 errors: [{ messageId: 'forbidden' }] },
  ],
});
```

> **MUST** every rule test cover ≥3 valid AND ≥3 invalid cases via `RuleTester`, with each invalid case asserting the exact `messageId` — string-match assertions on `.message` text are forbidden (brittle to copy edits) `[gate: G-35-EL-RULE-TESTER]`.

---

## Registering a Rule

Three-step registration:

1. Add the rule export to `src/index.ts`:

   ```ts
   import { rule as noAny } from './rules/no-any';
   export const rules = { 'no-any': noAny, /* … */ };
   ```

2. Enable it in the project's flat config (`eslint.config.js`):

   ```js
   import codingGuidelines from '@workflowy/coding-guidelines';
   export default [
     {
       plugins: { 'coding-guidelines': codingGuidelines },
       rules: { 'coding-guidelines/no-any': 'error' },
     },
   ];
   ```

3. Add the rule → spec mapping to `eslint-plugins/coding-guidelines/src/utils/getDocsUrl.ts`:

   ```ts
   const SPEC_MAP: Record<string, string> = {
     'no-any': 'spec/35-enforcement-rules/01-generic-return-types.md#r1',
     // …
   };
   export const getDocsUrl = (name: string) =>
     `https://github.com/<org>/<repo>/blob/main/${SPEC_MAP[name] ?? `spec/35-enforcement-rules/`}`;
   ```

> **MUST** every rule be registered in all 3 places (export, flat-config enable, docs-URL map) before merge — a rule present in `src/rules/` but absent from any of the three is forbidden `[gate: G-35-EL-FULL-REGISTRATION]`.

---

## Severity Policy

| Severity | When to use |
|---|---|
| `error` | Default for every rule in this plugin. Blocks CI. |
| `warn` | ONLY during a graduation window per ADR-0031 (`_GATE-GRADUATION-LEDGER.md`). MUST have a target promotion date. |
| `off` | Forbidden in committed config — use `// eslint-disable-next-line` with an inline justification comment instead, on a case-by-case basis. |

> **MUST** every rule ship at `error` severity unless the gate-graduation ledger explicitly lists it as `warn` with a promotion date — `off` in committed config is forbidden `[gate: G-35-EL-NO-OFF]`.

---

## Anti-Patterns

| # | Anti-pattern | Why it fails | Gate |
|---|---|---|---|
| 1 | Rule lives outside `eslint-plugins/coding-guidelines/` | Bypasses the project's enforcement registry. | `G-35-EL-PLUGIN-LAYOUT` |
| 2 | Hand-rolled `module.exports = { … }` rule | Breaks `meta.docs.url` → spec linkback. | `G-35-EL-USE-CREATOR` |
| 3 | Rule name like `enforce-foo` / `check-bar` | Outside the closed naming convention. | `G-35-EL-NAMING` |
| 4 | Test asserts `.message` string content | Brittle; breaks on copy edits. | `G-35-EL-RULE-TESTER` |
| 5 | Rule registered in `src/index.ts` but missing from flat config | Rule never runs in CI; silent. | `G-35-EL-FULL-REGISTRATION` |
| 6 | Rule shipped at `warn` without ledger entry | Permanent `warn` is functionally `off`; rots. | `G-35-EL-NO-OFF` |
| 7 | Single rule covering multiple unrelated concerns | Hard to disable; hard to test. | `G-35-EL-ONE-CONCERN` |

---

## Acceptance-Criteria Binds

| AT id | Rule covered | Assertion summary |
|---|---|---|
| `AT-ENFORCEMENTRULES-09` | Layout + Registration | `node scripts/spec-hygiene/audits/check-eslint-registration.mjs` exits 0; every file in `rules/` is exported AND enabled AND has a docs-URL entry. |
| `AT-ENFORCEMENTRULES-10` | RuleTester coverage | Each `tests/*.test.ts` declares ≥3 valid + ≥3 invalid cases (counted via AST). |
| `AT-ENFORCEMENTRULES-11` | Severity policy | `rg -nP "'(off\|0)'" eslint.config.js` returns 0 hits in committed config. |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md).

---

## Worked Example — Authoring `no-localstorage`

Source spec: ADR-0021 forbids `localStorage` corpus-wide (IndexedDB only).

```ts
// eslint-plugins/coding-guidelines/src/rules/no-localstorage.ts
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { getDocsUrl } from '../utils/getDocsUrl';

const createRule = ESLintUtils.RuleCreator(getDocsUrl);

export const rule = createRule({
  name: 'no-localstorage',
  meta: {
    type: 'problem',
    docs: {
      description: 'localStorage is forbidden corpus-wide; use IndexedDB per ADR-0021.',
      recommended: 'error',
    },
    messages: { forbidden: 'localStorage is forbidden — use IndexedDB. See {{specUrl}}.' },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      'MemberExpression[object.name="localStorage"]'(node: TSESTree.MemberExpression) {
        context.report({ node, messageId: 'forbidden', data: { specUrl: getDocsUrl('no-localstorage') } });
      },
      'MemberExpression[object.name="window"][property.name="localStorage"]'(node: TSESTree.MemberExpression) {
        context.report({ node, messageId: 'forbidden', data: { specUrl: getDocsUrl('no-localstorage') } });
      },
    };
  },
});
```

```ts
// eslint-plugins/coding-guidelines/src/tests/no-localstorage.test.ts
import { RuleTester } from '@typescript-eslint/rule-tester';
import { rule } from '../rules/no-localstorage';

const ruleTester = new RuleTester({ languageOptions: { parser: require('@typescript-eslint/parser') } });

ruleTester.run('no-localstorage', rule, {
  valid: [
    { code: `await idb.get('key');` },
    { code: `const localStorageKeys = ['a','b'];` },              // identifier name reuse, not the API
    { code: `class LocalStorage { /* custom class, not the API */ }` },
  ],
  invalid: [
    { code: `localStorage.getItem('x')`,        errors: [{ messageId: 'forbidden' }] },
    { code: `localStorage.setItem('x','y')`,    errors: [{ messageId: 'forbidden' }] },
    { code: `window.localStorage.removeItem('x')`, errors: [{ messageId: 'forbidden' }] },
  ],
});
```

This rule satisfies all 6 MUSTs above: layout, creator factory, naming (`no-*`), RuleTester coverage (3+3), full registration (when added to index/config/docs map), and `error` severity.

---

## Cross-References

| Reference | Location |
|---|---|
| Generic return types (sibling) | [`./01-generic-return-types.md`](./01-generic-return-types.md) |
| Runtime validation (sibling) | [`./02-runtime-validation.md`](./02-runtime-validation.md) |
| Boundary enforcement (sibling) | `./04-boundary-enforcement.md` (pending) |
| Gate graduation ledger | [`../_GATE-GRADUATION-LEDGER.md`](../_GATE-GRADUATION-LEDGER.md) |
| ADR for warn→strict graduation | ADR-0031 |
| `localStorage` ban | ADR-0021 |

---

## Related

- [`./00-overview.md`](./00-overview.md) — Parent overview (§"Pending Sub-Specs" row 03)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — AT registry
