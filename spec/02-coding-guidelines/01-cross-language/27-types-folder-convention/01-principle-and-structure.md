# Principle & Folder Structure

> **Parent:** [27-types-folder-convention overview](./00-overview.md)

---

## 1. Principle

Every project must have a **`types/` folder** (or language equivalent) containing shared type definitions, enums, and type aliases. Each definition gets its **own file** — never bundle unrelated types together.

---

## 2. Folder Structure

```
types/
├── ContentType.go          # MIME content types
├── HttpMethod.go           # HTTP methods (Get, Post, Put, Delete)
├── HttpStatus.go           # HTTP status code groups
├── AppResults.go           # Common Result[T] aliases (BoolResult, StringResult)
├── SortDirection.go        # Asc, Desc
├── Environment.go          # Development, Staging, Production
└── LogLevel.go             # Debug, Info, Warn, Error, Fatal
```

**TypeScript equivalent:**
```
types/
├── ContentType.ts
├── HttpMethod.ts
├── HttpStatus.ts
├── AppResults.ts
├── SortDirection.ts
├── Environment.ts
└── LogLevel.ts
```

**PHP equivalent:**
```
types/
├── ContentType.php
├── HttpMethod.php
├── HttpStatus.php
├── SortDirection.php
├── Environment.php
└── LogLevel.php
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-rules.md`](./02-rules.md) — Rules

---

*Principle & structure v3.2.0 — 2026-04-20*
