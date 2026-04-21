# Rule 10 — Blank Line Before Control Structures When Preceded by Statements

When an `if`, `for`, `foreach`/`for...of`, or `while` block is preceded by **one or more non-brace statements** (assignments, function calls, etc.), insert **one blank line** before the control structure. This visually separates "setup" from "decision" logic.

**Exception:** No blank line is needed when the control structure is the first statement in a block or immediately follows another closing `}` (already covered by Rule 5).

```php
// ── PHP ──────────────────────────────────────────────────────

// ❌ FORBIDDEN: No blank line between statement and if
$result = $this->apiRequest($agentId, HttpMethodType::Post->value, $endpoint);
if (is_wp_error($result)) {
    return $result;
}

// ✅ REQUIRED: Blank line before if when preceded by a statement
$result = $this->apiRequest($agentId, HttpMethodType::Post->value, $endpoint);

if (is_wp_error($result)) {
    return $result;
}

// ❌ FORBIDDEN: No blank line between statement and foreach
$items = $this->fetchItems();
foreach ($items as $item) {
    $this->process($item);
}

// ✅ REQUIRED
$items = $this->fetchItems();

foreach ($items as $item) {
    $this->process($item);
}

// ✅ OK: if is the first statement — no blank line needed
public function handle(): void {
    if ($this->isDone()) {
        return;
    }
}

// ✅ OK: if follows a closing brace — Rule 5 applies instead
if ($guardA) {
    return;
}

if ($guardB) {
    return;
}
```

```typescript
// ── TypeScript ───────────────────────────────────────────────

// ❌ FORBIDDEN
const data = await fetchData(url);
if (!data) {
    return null;
}

// ✅ REQUIRED
const data = await fetchData(url);

if (!data) {
    return null;
}
```

```go
// ── Go ───────────────────────────────────────────────────────

// ❌ FORBIDDEN
result, err := doWork(ctx)
if err != nil {
    return err
}

// ✅ REQUIRED
result, err := doWork(ctx)

if err != nil {
    return err
}
```

---

*Part of [Blank Lines & Spacing](./00-overview.md) — Rule 10*
