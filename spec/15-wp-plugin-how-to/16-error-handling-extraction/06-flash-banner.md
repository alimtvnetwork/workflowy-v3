# 16.6 Flash Banner Pattern

> **Parent:** [Phase 16 overview](./00-overview.md)

---

Unseen errors trigger a **flash banner** at the top of the error admin page:

## Requirements

| Requirement | Implementation |
|-------------|----------------|
| Visibility | Show only when `unseen_count > 0` |
| Badge | Display count in tab badge AND menu badge |
| Dismiss | Single click marks all as seen via AJAX |
| Animation | `slideUp(300)` on dismiss, `fadeOut(200)` on badges |
| Persistence | State stored in database, not session/cookie |
