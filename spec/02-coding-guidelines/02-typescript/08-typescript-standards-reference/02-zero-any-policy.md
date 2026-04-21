# 2. Zero Tolerance for `any` and Untyped Patterns

> **Parent:** [00-overview.md](./00-overview.md)

---

## Rule 2.1: `any` is PROHIBITED everywhere

No exceptions. Not in catch blocks, not in type assertions, not in generic defaults.

```typescript
// ❌ FORBIDDEN — all of these
catch (err: any) { ... }
const x = value as any;
getQueryData<any>(key);
(result as any)?.deleted;
v as any;

// ✅ REQUIRED
catch (err) {
  const message = err instanceof Error ? err.message : String(err);
}
const x = value as SpecificType;
getQueryData<DashboardStats>(key);
```

---

## Rule 2.2: `unknown` is acceptable ONLY at parse boundaries

`unknown` may appear in:
- JSON parsing entry points (immediately narrowed via type guard)
- Error catch blocks (without `: any` annotation — bare `catch (err)`)
- Internal type narrowing functions (e.g., `isEnvelope(obj: unknown)`)

`unknown` MUST NOT appear in:
- Component props, hook return types, store state
- API method return types (use generics instead)
- Exported function signatures

---

## Rule 2.3: `Record<string, unknown>` is PROHIBITED in API signatures

```typescript
// ❌ FORBIDDEN
createRemoteSnapshot: (siteId: number, opts?: Record<string, unknown>) => ...
updateSettings: (settings: Record<string, unknown>) => ...

// ✅ REQUIRED — use specific interfaces
interface CreateSnapshotOptions {
  name?: string;
  scope?: SnapshotScope;
  snapshotType?: SnapshotType;
  parentId?: number;
  tables?: string[];
}
createRemoteSnapshot: (siteId: number, opts?: CreateSnapshotOptions) => ...
```
