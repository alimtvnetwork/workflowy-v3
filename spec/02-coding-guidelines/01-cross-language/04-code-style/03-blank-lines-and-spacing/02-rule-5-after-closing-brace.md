# Rule 5 — Blank Line After Closing `}` When Followed by More Code

If code continues after a closing `}` (i.e., not followed by another `}`, `else`, `catch`, or end of function), insert **one blank line** after it. This applies to **all block types**: `if`, `foreach`/`for`/`for...of`, `while`, `switch`, `try`, and any other brace-delimited block.

## 5a — After `if` Blocks

```php
// ── PHP ──────────────────────────────────────────────────────

// ❌ FORBIDDEN: No blank line after block when code follows
if ($this->initialized) {
    return;
}
$this->initialized = true;
add_action(HookType::Init->value, [$this, 'setup']);

// ✅ REQUIRED: Blank line after block when code follows
if ($this->initialized) {
    return;
}

$this->initialized = true;
add_action(HookType::Init->value, [$this, 'setup']);
```

```typescript
// ── TypeScript ───────────────────────────────────────────────

// ❌ FORBIDDEN
if (!user) {
    return;
}
const profile = await fetchProfile(user.id);

// ✅ REQUIRED
if (!user) {
    return;
}

const profile = await fetchProfile(user.id);
```

```go
// ── Go ───────────────────────────────────────────────────────

// ❌ FORBIDDEN
if err != nil {
    return err
}
result := compute()

// ✅ REQUIRED
if err != nil {
    return err
}

result := compute()
```

## 5b — After Loop Blocks (`foreach`, `for`, `while`, `for...of`)

```php
// ── PHP ──────────────────────────────────────────────────────

// ❌ FORBIDDEN: No blank line after foreach when code follows
foreach (array_keys($data) as $col) {
    $setParts[] = "{$col} = ?";
}
$setClause = implode(', ', $setParts);
$sql       = "UPDATE {$table} SET {$setClause} WHERE {$where}";

// ✅ REQUIRED: Blank line separates the loop from subsequent logic
foreach (array_keys($data) as $col) {
    $setParts[] = "{$col} = ?";
}

$setClause = implode(', ', $setParts);
$sql       = "UPDATE {$table} SET {$setClause} WHERE {$where}";
```

```typescript
// ── TypeScript ───────────────────────────────────────────────

// ❌ FORBIDDEN: No blank line after for...of when code follows
for (const item of items) {
    processed.push(transform(item));
}
const result = merge(processed);

// ✅ REQUIRED
for (const item of items) {
    processed.push(transform(item));
}

const result = merge(processed);

// ❌ FORBIDDEN: No blank line after while when code follows
while (queue.length > 0) {
    const task = queue.shift()!;
    execute(task);
}
logCompletion(queue);

// ✅ REQUIRED
while (queue.length > 0) {
    const task = queue.shift()!;
    execute(task);
}

logCompletion(queue);
```

```go
// ── Go ───────────────────────────────────────────────────────

// ❌ FORBIDDEN: No blank line after for range when code follows
for _, item := range items {
    results = append(results, process(item))
}
total := len(results)

// ✅ REQUIRED
for _, item := range items {
    results = append(results, process(item))
}

total := len(results)

// ❌ FORBIDDEN: No blank line after for loop when code follows
for i := 0; i < retries; i++ {
    if err = attempt(ctx); err == nil {
        break
    }
}
logger.Info("retries exhausted", "attempts", retries)

// ✅ REQUIRED
for i := 0; i < retries; i++ {
    if err = attempt(ctx); err == nil {
        break
    }
}

logger.Info("retries exhausted", "attempts", retries)
```

## 5c — After `switch` / `try` Blocks

```php
// ── PHP ──────────────────────────────────────────────────────

// ❌ FORBIDDEN
try {
    $result = $this->execute($sql);
} catch (Throwable $e) {
    $this->logger->error($e->getMessage());
}
$this->cleanup();

// ✅ REQUIRED
try {
    $result = $this->execute($sql);
} catch (Throwable $e) {
    $this->logger->error($e->getMessage());
}

$this->cleanup();
```

## Exception: Consecutive Closing Braces, `else`, `catch`, `finally`

No blank line is needed when a `}` is immediately followed by another `}`, `else`, `catch`, or `finally`:

```php
if (ErrorChecker::isFatalError($error)) {
    $this->logger->fatal($error);
}
// ✅ No blank line — next line is another closing brace
```

```go
if err != nil {
    return err
} // ✅ No blank line — function ends here (outer })
```

---

*Part of [Blank Lines & Spacing](./00-overview.md) — Rule 5*
