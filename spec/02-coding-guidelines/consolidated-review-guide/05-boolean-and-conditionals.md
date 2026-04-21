# 5. Boolean & Conditionals

> **Parent:** [00-overview.md](./00-overview.md)

## Rules

1. **No nested `if`** — flatten with early returns (guard clauses).
2. **No negation (`!`)** on function calls — use semantic inverse methods.
3. **Max 2 conditions** per `if` expression.
4. **Never mix `&&` and `||`** in one expression.
5. **Never mix positive and negative** (`isX && !isY` is forbidden).
6. **No `else` after `return`/`throw`/`continue`/`break`**.
7. **Keep cyclomatic complexity low** — one path through the function, guard and exit early.

## Zero Nested `if` — The Inverse Guard Pattern

The idea: **invert the condition, exit the function, continue on the happy path.** This keeps every function a single straight line — no indentation pyramids, no cognitive load.

```go
// ❌ CODE RED — Nested if = pyramid of doom
func ProcessPlugin(ctx context.Context, id int64) apperror.Result[Plugin] {
    plugin := s.repo.GetById(ctx, id)
    if plugin.IsSafe() {
        if plugin.Value().IsActive() {
            if plugin.Value().HasValidLicense() {
                return buildOutput(plugin.Value())
            }
        }
    }

    return apperror.FailNew[Plugin]("E9001", "processing failed")
}

// ✅ REQUIRED — Flat guards, inverse conditions, early exit
func ProcessPlugin(ctx context.Context, id int64) apperror.Result[Plugin] {
    plugin := s.repo.GetById(ctx, id)

    if plugin.HasError() {
        return apperror.Fail[Plugin](plugin.AppError())
    }

    if plugin.Value().IsInactive() {
        return apperror.FailNew[Plugin]("E9002", "plugin is inactive")
    }

    if plugin.Value().HasInvalidLicense() {
        return apperror.FailNew[Plugin]("E9003", "license is invalid")
    }

    return buildOutput(plugin.Value())
}
```

```typescript
// ❌ CODE RED — Nested conditions
function processOrder(order: Order | null): Result<Receipt> {
    if (order) {
        if (order.isValid()) {
            if (order.items.length > 0) {
                return createReceipt(order);
            }
        }
    }

    return fail("invalid order");
}

// ✅ REQUIRED — Guard, exit, continue
function processOrder(order: Order | null): Result<Receipt> {
    if (!order) {
        return fail("order is missing");
    }

    if (order.isInvalid()) {
        return fail("order is invalid");
    }

    if (order.items.length === 0) {
        return fail("order has no items");
    }

    return createReceipt(order);
}
```

## Boolean Complexity

```go
// ❌ Mixed operators — impossible to read
if (isReady && hasPermission) || (isAdmin && !isBlocked) { ... }

// ✅ Named booleans — one concern each
isAuthorizedUser := isReady && hasPermission
isPrivilegedAdmin := isAdmin && isUnblocked

if isAuthorizedUser {
    process()
}
if isPrivilegedAdmin {
    process()
}
```

```typescript
// ❌ Complex condition
if (isReady && !isBlocked && (hasPermission || isAdmin)) { ... }

// ✅ Extract to named boolean
const canProceed = isReady && hasPermission;
const isPrivileged = isReady && isAdmin;

if (!canProceed && !isPrivileged) {
    return;
}
```
