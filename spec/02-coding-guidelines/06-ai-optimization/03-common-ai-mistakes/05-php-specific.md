# Common AI Mistakes — PHP Specific

> **Version:** 3.2.0  
> **Updated:** 2026-04-20
> **Purpose:** PHP-specific language mistakes

---

## Mistake #11: `\Throwable` in PHP

**Frequency:** Medium  
**Rule:** AH-E4

```php
// ❌ AI GENERATES THIS — leading backslash in catch
try {
    $result = $this->process();
} catch (\Throwable $e) {
    Logger::error($e->getMessage());
}

// ✅ CORRECT — use proper import
use Throwable;

try {
    $result = $this->process();
} catch (Throwable $e) {
    Logger::error($e->getMessage());
}
```

---

## Why This Matters

Leading backslashes in catch blocks are a sign the AI is "guessing" at PHP namespace resolution rather than following the project's explicit import convention. Always use `use` statements for all type references.

---

## Cross-References

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`../../04-php/00-overview.md`](../../04-php/00-overview.md) — PHP conventions

---

*PHP-specific mistakes v3.2.0 — 2026-04-20*
