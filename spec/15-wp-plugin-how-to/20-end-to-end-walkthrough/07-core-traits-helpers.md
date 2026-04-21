# 20.7 Step 6 — Core Infrastructure Traits + Helpers

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 3, §3.4** — ResponseTrait (safeExecute)  
> **Phase 3, §3.6** — AuthTrait  
> **Phase 3, §3.8** — TypeCheckerTrait  
> **Phase 5, §5.3** — EnvelopeBuilder  
> **Phase 6, §6.3** — validationError()

---

## 6a. ResponseTrait

**File: `includes/Traits/Core/ResponseTrait.php`**

Contains:
- `safeExecute(callable $callback, string $endpointName): WP_REST_Response` — universal error boundary
- `buildErrorResponse(Throwable $e, string $endpointName): WP_REST_Response` — debug-gated error envelope
- `formatStackFrames(Throwable $e): array` — trace extraction
- `validationError(string $message, WP_REST_Request $request): WP_REST_Response` — 400 errors

Every pattern comes from Phase 4, §4.9 and Phase 6, §6.3.

## 6b. TypeCheckerTrait

**File: `includes/Traits/Core/TypeCheckerTrait.php`**

Copy verbatim from Phase 3, §3.8. Replace namespace `PluginName` → `TaskTracker`.

## 6c. AuthTrait

**File: `includes/Traits/Auth/AuthTrait.php`**

Implements `checkPluginPermission(WP_REST_Request $request)` per Phase 3, §3.6.

## 6d. EnvelopeBuilder

**File: `includes/Helpers/EnvelopeBuilder.php`**

Copy from Phase 7, §7.5. Replace `PluginName` → `TaskTracker`.

## 6e. Other helpers

| Helper | File | Source |
|--------|------|--------|
| `DateHelper` | `Helpers/DateHelper.php` | Phase 4, §4.13 |
| `PathHelper` | `Helpers/PathHelper.php` | Phase 5, §5.1 |
| `ErrorLogHelper` | `Helpers/ErrorLogHelper.php` | Phase 4, §4.11 |
