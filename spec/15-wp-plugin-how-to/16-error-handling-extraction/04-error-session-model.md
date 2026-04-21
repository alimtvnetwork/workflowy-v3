# 16.4 Error Session Model

> **Parent:** [Phase 16 overview](./00-overview.md)

---

Errors are grouped into **sessions** — a session represents a single request that produced one or more errors. This enables the admin UI to show errors in context rather than as isolated log lines.

## Session Data Structure

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Unique identifier (UUID or timestamp-based) |
| `created_at` | datetime | When the session started |
| `error_count` | int | Number of errors in this session |
| `is_seen` | boolean | Whether admin has dismissed/acknowledged |
| `errors` | array | Individual error entries within the session |

## Admin Actions

| Action | AJAX Handler | Description |
|--------|-------------|-------------|
| Dismiss flash | `dismissFlash` | Mark all unseen errors as seen (badge clears) |
| Clear all | `clearSessions` | Delete all error sessions |
| View details | Modal | Show full error context in modal overlay |
