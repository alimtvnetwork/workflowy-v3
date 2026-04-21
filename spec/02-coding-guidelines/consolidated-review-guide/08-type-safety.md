# 8. Type Safety

> **Parent:** [00-overview.md](./00-overview.md)

## Absolute Ban

| Forbidden | Allowed Alternative |
|-----------|-------------------|
| `any` (TS) | Explicit type or generic `<T>` |
| `interface{}` / `any` (Go) | Concrete struct or `[T any]` generic |
| `unknown` (TS) | Only at parse boundaries with type guard |
| `object` (TS) | Typed interface |
| Type assertions (Go) | `typecast.CastOrFail[T]()` or concrete types |

## Use Generics Instead

```go
// ❌ FORBIDDEN — any in exported API
func ProcessData(data interface{}) interface{} { ... }
func FetchResults() (any, error) { ... }

// ✅ REQUIRED — Concrete types or generics
func ProcessData(data PluginDetails) apperror.Result[PluginSummary] { ... }
func FetchResults[T any]() apperror.Result[T] { ... }
```

```typescript
// ❌ FORBIDDEN — any loses all type safety
function process(data: any): any { ... }
function fetchData(): Promise<any> { ... }

// ✅ REQUIRED — Generic with constraint
function process<T extends Processable>(data: T): Result<T> { ... }
function fetchData<T>(endpoint: string): Promise<T> { ... }
```

## Concrete Type Aliases for Generics

When a generic instantiation appears more than once, **create a named type alias**. This improves readability and provides a single place to update if the underlying generic changes.

```go
// ❌ Repeated generic syntax
func GetUser(ctx context.Context, id int64) apperror.Result[User] { ... }
func GetOrder(ctx context.Context, id int64) apperror.Result[Order] { ... }

// ✅ Named aliases
type UserResult = apperror.Result[User]
type OrderResult = apperror.Result[Order]

func GetUser(ctx context.Context, id int64) UserResult { ... }
func GetOrder(ctx context.Context, id int64) OrderResult { ... }
```

```typescript
// ❌ Verbose generics repeated
function fetchUser(id: string): Promise<ApiResponse<User>> { ... }

// ✅ Named alias
type UserResponse = ApiResponse<User>;
function fetchUser(id: string): Promise<UserResponse> { ... }
```

> **Rule:** If a generic instantiation appears more than once → create a named alias.

## Where `any` / `interface{}` Is Acceptable

1. **SQL query args** — `args ...any` in `dbutil` (framework boundary)
2. **Logger variadic params** — `map[string]any` for structured fields (internal only)
3. **Third-party interfaces** — when a library requires `interface{}`

## Discriminated Unions — Named Interfaces Required

Every variant in a discriminated union **must** be a named interface — inline `{ type: ...; payload: ... }` blocks are prohibited. Enum values must use **PascalCase** and be accessed via **dot notation** only.

| Rule | ❌ Prohibited | ✅ Required |
|------|-------------|------------|
| Union variants | Inline `{ type: ...; }` | Named interface per variant |
| Enum values | `ADD_TOAST`, `REMOVE_TOAST` | `AddToast`, `RemoveToast` |
| Enum access | `ActionType["AddToast"]` | `ActionType.AddToast` |

```typescript
// ❌ PROHIBITED — inline types in union
type ToastAction =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "REMOVE_TOAST"; toastId?: string };

// ✅ REQUIRED — named interfaces with PascalCase enum
enum ActionType {
  AddToast = "AddToast",
  UpdateToast = "UpdateToast",
  DismissToast = "DismissToast",
  RemoveToast = "RemoveToast",
}

interface AddToastAction {
  type: ActionType.AddToast;
  toast: ToasterToast;
}

interface UpdateToastAction {
  type: ActionType.UpdateToast;
  toast: Partial<ToasterToast>;
}

interface DismissToastAction {
  type: ActionType.DismissToast;
  toastId?: string;
}

interface RemoveToastAction {
  type: ActionType.RemoveToast;
  toastId?: string;
}

type ToastAction =
  | AddToastAction
  | UpdateToastAction
  | DismissToastAction
  | RemoveToastAction;
```

> **Rule:** If you're writing `| { type: ... }` inline — stop and extract a named interface.

## Related

- [`../02-typescript/12-discriminated-union-patterns.md`](../02-typescript/12-discriminated-union-patterns.md) — Full TS discriminated union spec
