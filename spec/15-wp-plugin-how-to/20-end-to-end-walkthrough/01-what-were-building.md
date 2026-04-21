# 20.1 What We're Building

> **Parent:** [Phase 20 overview](./00-overview.md)

---

A WordPress REST API plugin that lets an authenticated user:

1. **Create** a task (title, optional priority)
2. **List** all tasks (with pagination)
3. **Complete** a task (set status to `done`)
4. **View admin settings** (enable/disable task notifications)

This covers: bootstrap, autoloader, enums, traits, logging, validation, response envelope, REST endpoints, SQLite database, admin settings page, and testing.

## Plugin identity table

| Key | Value | Phase |
|-----|-------|-------|
| Slug | `task-tracker` | [Phase 1, §1.8](../01-foundation-and-architecture.md) |
| ShortName | `TaskTracker` | — |
| Namespace | `TaskTracker\` | — |
| API namespace | `task-tracker-api/v1` | [Phase 14, §14.1](../14-rest-api-conventions/00-overview.md) |
| Debug constant | `TASK_TRACKER_DEBUG` | [Phase 4, §4.2](../04-logging-and-error-handling/02-debug-mode.md) |
| Log prefix | `[TaskTracker]` | — |
