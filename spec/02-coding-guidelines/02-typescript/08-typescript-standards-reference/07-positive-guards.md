# 7. Positive Guards — `isDefined()` / `isDefinedAndValid()` / `isEmpty()`

> **Parent:** [00-overview.md](./00-overview.md)  
> **Cross-language parity:** [Go Standards §IsDefined](../../03-golang/04-golang-standards-reference/00-overview.md)  
> **Canonical:** [No Raw Negations](../../01-cross-language/12-no-negatives.md)

---

Raw `!== null` / `!== undefined` combined with negation or nested validity checks creates cognitive overhead. Use positive guard functions that express intent clearly.

---

## `isDefined()` — Value Existence Check

Returns `true` when the value is not `null` or `undefined`. Replaces `!= null` checks.

```typescript
// ❌ FORBIDDEN: Raw null/undefined checks
if (config !== null && config !== undefined) {
  applyConfig(config);
}

// ❌ FORBIDDEN: Double negation
if (!!config) {
  applyConfig(config);
}

// ✅ REQUIRED: Positive existence check
if (isDefined(config)) {
  applyConfig(config);
}
```

---

## `isDefinedAndValid()` — Existence + Validity Combined

Returns `true` when the value exists AND passes validation. Replaces nested null+validity checks.

```typescript
// ❌ FORBIDDEN: Nested null + validity check
if (config !== undefined) {
  if (config.isValid()) {
    applyConfig(config);
  }
}

// ❌ FORBIDDEN: Compound with null check
if (config != null && config.isValid()) {
  applyConfig(config);
}

// ✅ REQUIRED: Single positive guard
if (isDefinedAndValid(config)) {
  applyConfig(config);
}
```

---

## Implementation — `src/utils/guards.ts`

```typescript
/** Value exists (not null/undefined) */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** Value exists AND passes validation */
export function isDefinedAndValid<T extends { isValid(): boolean }>(
  value: T | null | undefined
): value is T {
  return value !== null && value !== undefined && value.isValid();
}

/** Value is absent (null or undefined) */
export function isEmpty<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined;
}
```

---

## Guard Function Table

| Guard Function | Replaces | Description |
|---------------|----------|-------------|
| `isDefined(x)` | `x !== null && x !== undefined` | Value exists |
| `isDefinedAndValid(x)` | `x != null && x.isValid()` | Value exists AND passes validation |
| `isEmpty(x)` | `x === null \|\| x === undefined` | No value (absent) |

---

## Type Narrowing Benefit

These guards use TypeScript type predicates (`value is T`), providing automatic type narrowing:

```typescript
function processConfig(config: Config | null) {
  // ❌ Without guard — config is still Config | null inside the block
  if (config !== null) {
    config.apply(); // works but no semantic intent
  }

  // ✅ With guard — config is narrowed to Config, AND intent is clear
  if (isDefined(config)) {
    config.apply(); // TypeScript knows config is Config
  }
}
```

---

## Real-World Example

```typescript
// Service layer — checking optional input
function updateSite(input: UpdateSiteInput): Result<Site> {
  if (isDefined(input.config)) {
    if (isDefinedAndValid(input.config)) {
      applyConfig(input.config);
    } else {
      return Result.fail("E3010", "invalid site config");
    }
  }
  // ...
}
```

---

## No Raw Negations Rule

**Never use `!` on a function call in a condition.** Wrap every negative check in a positively named guard function.

```typescript
// ❌ FORBIDDEN
if (!response.ok) { handleError(response); }
if (!array.includes(item)) { array.push(item); }
if (!fs.existsSync(path)) { throw new Error('Missing'); }

// ✅ REQUIRED
if (isResponseFailed(response)) { handleError(response); }
if (isItemMissing(array, item)) { array.push(item); }
if (isFileMissing(path)) { throw new Error('Missing'); }
```

**Utility location:** `src/utils/guards.ts` — see canonical spec for full guard function table.
