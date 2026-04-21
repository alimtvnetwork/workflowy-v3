# 6. Enforcement

> **Parent:** [00-overview.md](./00-overview.md)

---

## TypeScript Configuration

- **Strict mode:** Must be enabled (`"strict": true` in `tsconfig.json`)

## ESLint Rules (REQUIRED)

| Rule | Level |
|------|-------|
| `@typescript-eslint/no-explicit-any` | `error` |
| `@typescript-eslint/no-unsafe-assignment` | `error` |
| `@typescript-eslint/no-unsafe-member-access` | `error` |
| `@typescript-eslint/no-unsafe-call` | `error` |
| `@typescript-eslint/no-unsafe-return` | `error` |

## Code Review Policy

- Any PR introducing `any`, bare `unknown` in public APIs, or magic strings/numbers must be **rejected**.
- **Exceptions** must include:
  - A `// SAFETY:` comment explaining why the rule cannot be followed.
  - A `// TODO:` for removal with a ticket reference.
