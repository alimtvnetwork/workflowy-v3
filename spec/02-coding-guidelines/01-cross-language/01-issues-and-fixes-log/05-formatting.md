# 5. Formatting Violations

> **Parent:** [00-overview.md](./00-overview.md)

---

## Issue #15 — Missing Blank Line Before `return`/`throw`

**Scope:** 22 violations across 12 PHP files  
**Root Cause:** Multi-statement blocks ended with `return`/`throw` without a preceding blank line.

**Before (❌):**
```php
$result = $this->compute($data);
return $result;
```

**After (✅):**
```php
$result = $this->compute($data);

return $result;
```

**Prevention:** Rule 4 in [code-style.md](../04-code-style/00-overview.md). Exception: if `return`/`throw` is the only statement, no blank line needed.

---

## Issue #16 — Functions Exceeding Parameter Limits

**Scope:** 51 signatures across 33 PHP files  
**Root Cause:** Functions with >2 parameters were on a single line instead of one-per-line.

**Before (❌):**
```php
public function processUpload(string $path, string $slug, int $postId, bool $isActive): array {
```

**After (✅):**
```php
public function processUpload(
    string $path,
    string $slug,
    int $postId,
    bool $isActive,
): array {
```

**Prevention:** Rule 9a — signatures with >2 parameters must be one-per-line with trailing comma.

---

## Issue #17 — Nested `if` Blocks

**Scope:** Multiple files across PHP and Go  
**Root Cause:** Developer habit of nesting conditions instead of using early returns.

**Before (❌):**
```php
if ($request !== null) {
    if ($request->hasParam('file')) {
        if ($this->isValidFile($request->getParam('file'))) {
            $this->process($request);
        }
    }
}
```

**After (✅):**
```php
if ($request === null) {
    return;
}

$hasValidFile = $request->hasParam('file')
    && $this->isValidFile($request->getParam('file'));

if ($hasValidFile) {
    $this->process($request);
}
```

**Prevention:** Rule 2 / Rule 7 — zero nested `if`, absolute ban.
