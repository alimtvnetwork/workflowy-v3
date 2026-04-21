# 1. Generics First — The Cardinal Rule

> **Parent:** [00-overview.md](./00-overview.md)

---

**Generics are the ONLY acceptable approach for parameterized types.** Never use `any`, `unknown`, `Record<string, unknown>`, or loose interfaces where a generic can express the constraint.

---

## Rule 1.1: All reusable functions MUST be generic

```typescript
// ❌ FORBIDDEN — loose typing
function fetchData(endpoint: string): Promise<unknown> { ... }
function parseResponse(data: unknown): Record<string, unknown> { ... }

// ✅ REQUIRED — generic with constraints
function fetchData<T>(endpoint: string): Promise<T> { ... }
function parseResponse<T extends object>(data: string): T { ... }
```

---

## Rule 1.2: API response types MUST use generic envelope

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

## Rule 1.3: Collection utilities MUST be generic

```typescript
// ❌ FORBIDDEN
function buildQuery(params: Record<string, string | number | undefined>): string { ... }

// ✅ REQUIRED
function buildQuery<T extends Record<string, string | number | undefined | null>>(params: T): string { ... }
```

---

## Rule 1.4: Hook factories MUST propagate generics

```typescript
// ❌ FORBIDDEN
function useApiQuery(key: string): { data: unknown } { ... }

// ✅ REQUIRED
function useApiQuery<T>(key: string[]): { data: T | undefined; isLoading: boolean } { ... }
```
