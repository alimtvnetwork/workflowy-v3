# 16.14 Checklist

> **Parent:** [Phase 16 overview](./00-overview.md)

---

- [ ] `ErrorType` class with `FATAL_TYPES`, `WARNING_TYPES`, `RECOVERABLE_TYPES`, `TYPE_LABELS`
- [ ] `InitHelpers::errorLogWithPrefix()` and `errorLog()` for Tier 1 logging
- [ ] `FileLogger` for Tier 2 structured logging (Phase 4)
- [ ] `ErrorResponse` class with `logAndReturn()`, `logAndReturnFalse()`, `logAndReturnEnvelope()`, `logAndReturnWpError()`
- [ ] `error-logs` and `error-sessions` REST endpoints
- [ ] Error log retrieval settings with 3-level resolution (request → stored → defaults)
- [ ] Error session model with `is_seen` tracking
- [ ] `ErrorSessions` SQLite table migration with indexes (§16.13)
- [ ] `AdminErrorAjaxTrait` with read/clear/clear-all handlers
- [ ] `admin-errors.php` orchestrator template with 4 partials
- [ ] Flash banner with AJAX dismiss
- [ ] Auto-refresh with stop-on-modal behavior
- [ ] `safeExecute` wrapper on all REST handlers
- [ ] Error notification settings in `OptionNameType`
- [ ] Admin menu error count badge (Phase 8, §8.1)
- [ ] No forbidden error patterns in codebase (see Phase 4, §4.8, Rule 6)
