# Rules P2, P3, P3b — Negation Elimination & Dual Boolean Fields

> **Parent:** [00-overview.md](./00-overview.md)

## 2.1 — Named Boolean Variables (P2)

Replace inline `!` negation with named positive-logic variables:

```go
// ❌ Inline negation
if !user.IsAdmin() && !request.IsInternal() {
    return ErrForbidden
}

// ✅ Named positive logic
isExternalNonAdmin := user.IsRegular() && request.IsExternal()
if isExternalNonAdmin {
    return ErrForbidden
}
```

## 2.2 — `IsDefined()` and `IsDefinedAndValid()` Guards

Every struct that can be nil or absent **must** implement `IsDefined()` for positive existence checks. If validation logic exists, also implement `IsDefinedAndValid()`:

```go
// ❌ FORBIDDEN — raw nil check
if config != nil && config.IsValid() {
    applyConfig(config)
}

// ✅ REQUIRED — positive combined guard
if config.IsDefinedAndValid() {
    applyConfig(config)
}
```

Implementation pattern:

```go
func (c *Config) IsDefined() bool {
    return c != nil
}

func (c *Config) IsDefinedAndValid() bool {
    return c != nil && c.validate() == nil
}
```

> **Note:** On `apperror.Result[T]`, `IsDefined()` is already built-in. `IsSafe()` serves the same purpose as `IsDefinedAndValid()` (value exists AND no error).

## 2.3 — Positive Counterpart Variables (Rule P3)

When a negated boolean (`!isX`) must be used in any expression, **first** create a positive counterpart variable on a separate line. The negated form must **never** appear directly in a compound condition.

**The priority is always: determine what the positive meaning of the negation is, name it, then use it.**

```go
// ❌ FORBIDDEN — negated boolean used directly in compound condition
isLiveRunWithDeletions := !isDryRun && totalDeleted > 0

// ❌ FORBIDDEN — explicit == false is low priority, still obscure intent
isLiveRunWithDeletions := isDryRun == false && totalDeleted > 0

// ✅ REQUIRED — create the positive counterpart FIRST, then compose
isLiveRun := !isDryRun
hasDeletions := totalDeleted > 0
isLiveRunWithDeletions := isLiveRun && hasDeletions

if isLiveRunWithDeletions {
    commitDeletions()
}
```

**Key principle:** Ask yourself: *"What does `!isDryRun` actually mean?"* — it means the run is live. Name it `isLiveRun`. This makes the compound condition read as plain English: `isLiveRun && hasDeletions`.

More examples:

```go
// ❌ FORBIDDEN — what does !isPending mean? Name it.
if !isPending && hasResults {
    processResults()
}

// ✅ REQUIRED — isPending negated = isCompleted or isProcessed
isProcessed := !isPending
isReadyToProcess := isProcessed && hasResults

if isReadyToProcess {
    processResults()
}
```

## 2.3.1 — Dual Boolean Field Rule (Rule P3b)

When a single boolean source is consumed in both its positive and negative forms within a scope, **both named variables must be declared together** as a pair on consecutive lines before any conditional usage. This is the "dual boolean field" pattern.

**Rationale:** Scattered negations (`!isX`) throughout a function make it impossible to audit the polarity of conditions at a glance. Declaring both forms upfront creates a self-documenting "boolean vocabulary" for the scope.

```go
// ❌ FORBIDDEN — negation scattered, dual form not declared upfront
isProjectExists := pathutil.IsDir(projectDir)

if isProjectExists {
    loadProject(projectDir)
}

// ... 20 lines later ...
if !isProjectExists {   // reader must mentally negate
    createProject(projectDir)
}

// ✅ REQUIRED — dual boolean fields declared together
isProjectExists := pathutil.IsDir(projectDir)
isProjectMissing := !isProjectExists

if isProjectExists {
    loadProject(projectDir)
}

// ... 20 lines later ...
if isProjectMissing {    // instantly clear
    createProject(projectDir)
}
```

**Struct fields follow the same rule.** If a struct exposes a boolean, the opposite meaning must be available via a method — never force callers to negate:

```go
// ❌ FORBIDDEN — callers forced to negate
type Session struct {
    IsAuthenticated bool
}

// caller writes: if !session.IsAuthenticated { ... }  ← negation!

// ✅ REQUIRED — dual accessors
type Session struct {
    IsAuthenticated bool
}

func (s *Session) IsAnonymous() bool {
    return !s.IsAuthenticated
}

// caller writes: if session.IsAnonymous() { ... }  ← positive!
```

**When to create dual fields:**

| Scenario | Required? |
|----------|-----------|
| Both `isX` and `!isX` used in same function | ✅ Yes — declare both upfront |
| Only positive form used | ❌ No — single variable sufficient |
| Only negative form used | ✅ Yes — declare positive first, then negate |
| Struct boolean accessed by multiple callers | ✅ Yes — provide dual accessor methods |

## Related

- [03-positive-counterparts.md](./03-positive-counterparts.md) — Counterpart methods and enum comparisons
- [04-mixed-polarity-and-inline.md](./04-mixed-polarity-and-inline.md) — Rules P6, P7
