# Rust Naming — JSON Wire Format, Modules & Decision Tables

> **Split from** [`01-naming-conventions.md`](./01-naming-conventions.md) on 2026-04-25 to keep both files under the 400-line guideline (closes F-08).
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## JSON Struct Serialization — PascalCase Wire Format

All JSON serialization of structs uses PascalCase keys to match the project-wide standard. This is where the `rename_all = "PascalCase"` attribute is necessary because Rust struct fields are `snake_case`:

```rust
// ✅ Correct — derive with rename_all for struct serialization
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct BrowserActivity {
    pub id: i64,
    pub session_id: i64,
    pub url: Option<String>,
    pub title: String,
    pub dwell_seconds: f64,
    pub started_at: String,
}
// Serializes to: { "Id": 1, "SessionId": 42, "Url": "...", "Title": "...", ... }
```

```rust
// ❌ Forbidden — default serde (produces snake_case JSON keys)
#[derive(Serialize)]
pub struct BrowserActivity {
    pub id: i64,           // Would serialize as "id" — wrong
    pub session_id: i64,   // Would serialize as "session_id" — wrong
}
```

### Nested Structs

Every struct that touches serialization must have `rename_all = "PascalCase"`:

```rust
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct SessionSummary {
    pub session_id: i64,
    pub started_at: String,
    pub activities: Vec<BrowserActivity>,  // BrowserActivity also has rename_all
}
```

---

## Meaningful Identifiers

> **Inherited rule:** All identifiers must use full, descriptive names. The abbreviation `ctx` is prohibited — use `context` instead.

| ❌ Forbidden | ✅ Required |
|-------------|------------|
| `ctx` | `context` |
| `cfg` | `config` |
| `mgr` | `manager` |
| `btn` | `button` |
| `evt` | `event` |
| `msg` | `message` |
| `req` | `request` |
| `res` | `response` |
| `cb` | `callback` |
| `idx` | `index` |

**Exception:** Single-letter variables in closures and iterators are acceptable when the scope is ≤ 3 lines:

```rust
// ✅ Acceptable — short closure
let total: f64 = activities.iter().map(|a| a.dwell_seconds).sum();

// ❌ Forbidden — longer closure needs descriptive name
let results: Vec<_> = activities.iter().filter(|activity| {
    activity.dwell_seconds > min_threshold
        && activity.category == UrlCategory::Work
}).collect();
```

---

## Abbreviation Casing

Abbreviations are treated as regular words in PascalCase — only capitalize the first letter:

| ❌ Forbidden | ✅ Required |
|-------------|------------|
| `URLParser` | `UrlParser` |
| `HTTPClient` | `HttpClient` |
| `getJSON` | `get_json` (function) |
| `SQLiteDB` | `SqliteDb` |
| `APIServer` | `ApiServer` |
| `FFIBridge` | `FfiBridge` |
| `WALMode` | `WalMode` |
| `PIDFile` | `PidFile` |

---

## Module Structure

```
src/
├── main.rs                  # Entry point, CLI parsing
├── daemon.rs                # Daemon lifecycle
├── config.rs                # Configuration loading
├── event.rs                 # ActivityEvent enum, EventSender type
├── storage/
│   ├── mod.rs               # Storage engine trait
│   ├── sqlite.rs            # SQLite implementation
│   └── migrations/          # Embedded SQL migrations
├── collectors/
│   ├── mod.rs               # Collector trait, registry
│   ├── browser.rs           # BrowserCollector
│   ├── app_focus.rs         # AppFocusCollector
│   ├── click.rs             # ClickCollector
│   ├── screenshot.rs        # ScreenshotCollector
│   └── idle.rs              # IdleCollector
├── platform/
│   ├── mod.rs               # Platform abstraction layer
│   ├── windows.rs           # #[cfg(target_os = "windows")]
│   ├── linux.rs             # #[cfg(target_os = "linux")]
│   └── macos.rs             # #[cfg(target_os = "macos")]
├── api/
│   ├── mod.rs               # HTTP server setup
│   ├── routes.rs            # Route definitions
│   └── handlers.rs          # Request handlers
└── models/
    ├── mod.rs               # Re-exports
    ├── activity.rs          # BrowserActivity, AppActivity, etc.
    ├── session.rs           # Session model
    └── screenshot.rs        # Screenshot model
```

### Naming Rules

- One type per file when the type is complex (> 50 lines)
- Module files use `snake_case.rs`
- Re-export public items from `mod.rs` for clean import paths
- Group related types in a single file when each is < 20 lines

---

## Quick Decision Table for AI

Use this table to instantly decide which casing to apply:

| Context | Convention | Example |
|---------|-----------|---------|
| Rust function name | `snake_case` | `fn get_active_window()` |
| Rust variable | `snake_case` | `let session_id = 42;` |
| Rust constant | `SCREAMING_SNAKE_CASE` | `const MAX_RETRIES: u32 = 3;` |
| Rust type/struct | `PascalCase` | `struct BrowserActivity` |
| Rust enum variant | `PascalCase` | `ScreenshotTrigger::TabChange` |
| Rust module | `snake_case` | `mod browser_tracking;` |
| JSON key (serde) | `PascalCase` via `rename_all` | `"SessionId": 42` |
| Enum string value (serde) | `PascalCase` (default) | `"TabChange"` |
| Database table name | `PascalCase` | `BrowserActivities` |
| Database column name | `PascalCase` | `DwellSeconds` |
| Database view name | `PascalCase` with `Vw` prefix | `VwActiveSessionSummary` |
| Database primary key | `PascalCase` `{Table}Id` | `BrowserActivitiesId` |
| SQL in Rust string | `PascalCase` identifiers | `"SELECT SessionId FROM Sessions"` |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Cross-Language Function Naming | `../01-cross-language/10-function-naming.md` |
| Abbreviation Casing | `../01-cross-language/04-code-style/00-overview.md` |
| Database Naming (Project-Wide) | `../01-cross-language/07-database-naming.md` |
| Database Conventions | `../../../04-database-conventions/00-overview.md` |
| Cross-Language Guidelines | `../01-cross-language/00-overview.md` |
| PascalCase Key Naming (Other Languages) | `../01-cross-language/11-key-naming-pascalcase.md` |
| Boolean Flag Method Splitting | `../01-cross-language/24-boolean-flag-methods.md` |
| Enum Standards (Cross-Language) | `../../../../11-consolidated-guidelines/04-enum-standards.md` |

---

*Rust naming conventions — v3.1.0 — 2026-04-11*
