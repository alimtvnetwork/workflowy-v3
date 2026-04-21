# Rule 4 — Blank Line Before `return` or `throw` When Preceded by Other Statements

If a block contains statements before `return` or `throw`, insert **one blank line** before the `return`/`throw`. If `return`/`throw` is the **only statement** in the block, no blank line is needed.

```php
// ── PHP ──────────────────────────────────────────────────────

// ❌ FORBIDDEN: No blank line before return
if (ErrorChecker::isInvalidPdoExtension()) {
    $this->logger->error('PDO/SQLite not available');
    return $this->envelope->error('SQLite support not available', 500);
}

// ✅ REQUIRED: Blank line separates logic from exit
if (ErrorChecker::isInvalidPdoExtension()) {
    $this->logger->error('PDO/SQLite not available');

    return $this->envelope->error('SQLite support not available', 500);
}

// ❌ FORBIDDEN: No blank line before throw
if (PathHelper::isFileMissing($path)) {
    $this->logger->error('File not found: ' . $path);
    throw new RuntimeException('File not found: ' . $path);
}

// ✅ REQUIRED: Blank line before throw
if (PathHelper::isFileMissing($path)) {
    $this->logger->error('File not found: ' . $path);

    throw new RuntimeException('File not found: ' . $path);
}

// ✅ OK: Return is the only statement — no blank line needed
if ($error === null) {
    return false;
}

// ✅ OK: Throw is the only statement — no blank line needed
if ($error === null) {
    throw new InvalidArgumentException('Error required');
}
```

```typescript
// ── TypeScript ───────────────────────────────────────────────

// ❌ FORBIDDEN
const processData = (data: unknown[]) => {
    const filtered = data.filter(isValid);
    return filtered.map(transform);
};

// ✅ REQUIRED
const processData = (data: unknown[]) => {
    const filtered = data.filter(isValid);

    return filtered.map(transform);
};

// ❌ FORBIDDEN: No blank line before throw
const validate = (input: string) => {
    const trimmed = input.trim();
    throw new Error(`Invalid input: ${trimmed}`);
};

// ✅ REQUIRED
const validate = (input: string) => {
    const trimmed = input.trim();

    throw new Error(`Invalid input: ${trimmed}`);
};

// ✅ OK: Return is the only statement
if (!data) {
    return null;
}
```

```go
// ── Go ───────────────────────────────────────────────────────

// ❌ FORBIDDEN
func process(data []Item) apperror.Result[[]Item] {
    filtered := filter(data)
    return apperror.Ok(filtered)
}

// ✅ REQUIRED
func process(data []Item) apperror.Result[[]Item] {
    filtered := filter(data)

    return apperror.Ok(filtered)
}
```

---

*Part of [Blank Lines & Spacing](./00-overview.md) — Rule 4*
