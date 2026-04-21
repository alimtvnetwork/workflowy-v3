# Rules

> **Parent:** [27-types-folder-convention overview](./00-overview.md)

---

## 3. Rules

### Rule 1: One Definition Per File

Each file contains exactly **one** enum, type alias group, or constant group. The filename matches the type name in PascalCase.

```go
// ❌ FORBIDDEN — multiple unrelated types in one file
// types/Common.go
type ContentType byte
type HttpMethod byte
type LogLevel byte
type SortDirection byte

// ✅ CORRECT — one type per file
// types/ContentType.go
type ContentType byte

// types/HttpMethod.go
type HttpMethod byte
```

### Rule 2: Type Aliases for Repeated Generics

When a generic type is used **3 or more times** with the same parameter, create a type alias.

#### Go

```go
// types/AppResults.go
package types

import "github.com/yourorg/apperror"

// Common Result aliases — use these instead of repeating Result[T]
type BoolResult = apperror.Result[bool]
type StringResult = apperror.Result[string]
type IntResult = apperror.Result[int]
type Int64Result = apperror.Result[int64]

// Domain-specific aliases (add as patterns emerge)
// type PluginResult = apperror.Result[*Plugin]
// type SiteResult = apperror.Result[*Site]
```

```go
// Usage — clean, readable, consistent
func (h *PluginHandler) EnablePlugin(siteId string, slug string) apperror.BoolResult {
    // ...
}

func (h *PluginHandler) GetName(siteId string) apperror.StringResult {
    // ...
}
```

#### TypeScript

```typescript
// types/AppResults.ts
import type { Result } from "@/lib/result"

export type BoolResult = Result<boolean>
export type StringResult = Result<string>
export type NumberResult = Result<number>
export type VoidResult = Result<void>
```

#### C#

```csharp
// Types/AppResults.cs
namespace MyApp.Types;

// Common Result aliases
using BoolResult = AppError.Result<bool>;
using StringResult = AppError.Result<string>;
using IntResult = AppError.Result<int>;
```

### Rule 3: Enums Over Constants for Finite Sets

If a value belongs to a **known, finite set**, use an enum — not string constants.

---

## Related

- [`01-principle-and-structure.md`](./01-principle-and-structure.md) — Folder structure
- [`03-common-type-definitions.md`](./03-common-type-definitions.md) — Common types

---

*Rules v3.2.0 — 2026-04-20*
