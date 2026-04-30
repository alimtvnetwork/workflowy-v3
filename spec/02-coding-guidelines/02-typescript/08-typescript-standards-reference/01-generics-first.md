# 1. Generics First — The Cardinal Rule

> **Parent:** [00-overview.md](./00-overview.md)

---

**Generics are the ONLY acceptable approach for parameterized types.** Never use `any`, `unknown`, `Record<string, unknown>`, or loose interfaces where a generic can express the constraint.

> **Gate umbrella:** `G-CG-TS-GENERICS-FIRST` (DOC-NORM) — composed of `G-CG-TS-GEN-REUSABLE-FN` (R1.1), `G-CG-TS-GEN-API-ENVELOPE` (R1.2), `G-CG-TS-GEN-COLLECTION-UTIL` (R1.3), `G-CG-TS-GEN-HOOK-FACTORY` (R1.4). Composes with `G-02-NO-ANY` (forbids the failure-mode escape hatch).

---

## Rule 1.1: All reusable functions MUST be generic — `G-CG-TS-GEN-REUSABLE-FN`

```typescript
// ❌ FORBIDDEN — loose typing
function fetchData(endpoint: string): Promise<unknown> { ... }
function parseResponse(data: unknown): Record<string, unknown> { ... }

// ✅ REQUIRED — generic with constraints
function fetchData<T>(endpoint: string): Promise<T> { ... }
function parseResponse<T extends object>(data: string): T { ... }
```

---

## Rule 1.2: API response types MUST use generic envelope — `G-CG-TS-GEN-API-ENVELOPE`

```typescript
// ❌ FORBIDDEN
interface RawEnvelope {
  Results: unknown[];
}

// ✅ REQUIRED
interface RawEnvelope<T = never> {
  Status: EnvelopeStatus;
  Attributes: EnvelopeAttributes;
  Results: T[];
  Navigation?: EnvelopeNavigation;
  Errors?: EnvelopeErrors;
}
```

---

## Rule 1.3: Collection utilities MUST be generic — `G-CG-TS-GEN-COLLECTION-UTIL`

```typescript
// ❌ FORBIDDEN
function buildQuery(params: Record<string, string | number | undefined>): string { ... }

// ✅ REQUIRED
function buildQuery<T extends Record<string, string | number | undefined | null>>(params: T): string { ... }
```

---

## Rule 1.4: Hook factories MUST propagate generics — `G-CG-TS-GEN-HOOK-FACTORY`

```typescript
// ❌ FORBIDDEN
function useApiQuery(key: string): { data: unknown } { ... }

// ✅ REQUIRED
function useApiQuery<T>(key: string[]): { data: T | undefined; isLoading: boolean } { ... }
```
