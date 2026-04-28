# Rust Naming Conventions

> **Version:** 3.1.0  
> **Updated:** 2026-04-16

---

## ⚠️ AI Critical Instruction — Rust Naming Philosophy

```
STOP — READ THIS BEFORE GENERATING ANY RUST CODE.

Rust follows its OWN community naming conventions (RFC 430), NOT the project-wide
PascalCase-everywhere policy. This is an INTENTIONAL, DOCUMENTED EXCEPTION.

The project-wide PascalCase mandate (from 11-key-naming-pascalcase.md and
22-variable-naming-conventions.md) applies to Go, TypeScript, PHP, and C#.
For Rust, the COMMUNITY STANDARD is the default, with exactly TWO exceptions:

EXCEPTION 1 — DATABASE: All database table names, column names, view names,
and index names MUST use PascalCase. This is a cross-language project mandate
that overrides Rust community conventions at the database boundary.

EXCEPTION 2 — ENUM STRING VALUES: When an enum variant serializes to a string
(JSON, database, API wire format), the string value MUST be PascalCase.
The Rust variant name is already PascalCase per RFC 430, so this aligns naturally.

EVERYTHING ELSE follows standard Rust conventions:
  - Functions, methods, variables → snake_case
  - Modules, crates → snake_case
  - Constants, statics → SCREAMING_SNAKE_CASE
  - Types, traits, enums → PascalCase (Rust convention, not project override)
  - Lifetimes → short lowercase ('a, 'ctx)

DO NOT apply Go/TypeScript/PHP PascalCase rules to Rust code.
DO NOT rename snake_case Rust functions to PascalCase.
DO NOT use PascalCase for Rust local variables.
```

---

## Overview

Naming rules for Rust code, aligned with the [Rust API Guidelines (RFC 430)](https://rust-lang.github.io/api-guidelines/naming.html). Rust is the **only language** in this project that follows its community conventions rather than the project-wide PascalCase mandate for identifiers. The rationale: Rust's compiler enforces `snake_case` for functions/variables and `PascalCase` for types via lint warnings, making deviation impractical and counter to the ecosystem.

The two PascalCase exceptions (database and enum string values) exist because those are **cross-system boundaries** where consistency with the rest of the project stack (Go, TypeScript, PHP, C#) matters more than Rust idiom.

---

## Identifier Casing — Complete Reference

| Item | Convention | Example | Notes |
|------|-----------|---------|-------|
| Types, Traits, Enums | `PascalCase` | `BrowserCollector`, `ActivityEvent` | Rust community standard (matches project) |
| Enum variants | `PascalCase` | `ScreenshotTrigger::TabChange` | Rust community standard (matches project) |
| Functions, Methods | `snake_case` | `get_active_window`, `start_daemon` | Rust community standard |
| Local variables | `snake_case` | `session_id`, `dwell_seconds` | Rust community standard |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_BUFFER_SIZE`, `DEFAULT_PORT` | Rust community standard |
| Static variables | `SCREAMING_SNAKE_CASE` | `GLOBAL_CONFIG` | Rust community standard |
| Modules, Crates | `snake_case` | `browser_tracking`, `os_integration` | Rust community standard |
| Trait methods | `snake_case` | `fn is_supported(&self) -> bool` | Rust community standard |
| Type parameters | Single uppercase or `PascalCase` | `T`, `EventType` | Rust community standard |
| Lifetimes | Short lowercase | `'a`, `'ctx` | Rust community standard |
| Feature flags | `kebab-case` | `wayland-support`, `browser-extension` | Cargo convention |
| Macro names | `snake_case!` | `vec!`, `println!` | Rust community standard |

### What This Means for AI

When an AI generates Rust code, it should produce code that looks like **any other idiomatic Rust project**. A Rust developer reading the code should see no surprises. The only places where project-specific conventions override Rust idiom are at the **database** and **serialization** boundaries.

---

## Exception 1: Database Names — PascalCase (Mandatory)

All database identifiers MUST use PascalCase regardless of Rust's naming conventions. This is a **project-wide mandate** that applies to every language, including Rust.

### Table and Column Names

```sql
-- ✅ Correct — PascalCase for all database identifiers
CREATE TABLE BrowserActivities (
    BrowserActivitiesId  INTEGER PRIMARY KEY AUTOINCREMENT,
    SessionId            INTEGER NOT NULL,
    Url                  TEXT,
    Title                TEXT NOT NULL,
    DwellSeconds         REAL NOT NULL,
    StartedAt            TEXT NOT NULL,
    FOREIGN KEY (SessionId) REFERENCES Sessions(SessionsId)
);

-- ❌ Forbidden — snake_case database names
CREATE TABLE browser_activities (
    id          INTEGER PRIMARY KEY,
    session_id  INTEGER NOT NULL,
    url         TEXT
);
```

### Rust Struct ↔ Database Mapping

When a Rust struct maps to a database table, the struct fields use `snake_case` (Rust convention) but the database column names use `PascalCase`:

```rust
// ✅ Correct — Rust fields are snake_case, DB columns are PascalCase
#[derive(Debug, FromRow)]
pub struct BrowserActivity {
    #[sqlx(rename = "BrowserActivitiesId")]
    pub id: i64,

    #[sqlx(rename = "SessionId")]
    pub session_id: i64,

    #[sqlx(rename = "Url")]
    pub url: Option<String>,

    #[sqlx(rename = "Title")]
    pub title: String,

    #[sqlx(rename = "DwellSeconds")]
    pub dwell_seconds: f64,

    #[sqlx(rename = "StartedAt")]
    pub started_at: String,
}
```

```rust
// ❌ Forbidden — using snake_case DB column names
#[derive(FromRow)]
pub struct BrowserActivity {
    pub id: i64,             // Maps to "id" column — wrong
    pub session_id: i64,     // Maps to "session_id" column — wrong
}
```

### SQL Queries in Rust

```rust
// ✅ Correct — PascalCase column names in SQL strings
let activity = sqlx::query_as::<_, BrowserActivity>(
    "SELECT BrowserActivitiesId, SessionId, Url, Title, DwellSeconds, StartedAt
     FROM BrowserActivities
     WHERE SessionId = ?1"
)
.bind(session_id)
.fetch_one(&pool)
.await?;
```

### View Names

```sql
-- ✅ Correct — PascalCase with Vw prefix
CREATE VIEW VwActiveSessionSummary AS
SELECT s.SessionsId, s.StartedAt, COUNT(a.BrowserActivitiesId) AS ActivityCount
FROM Session s
LEFT JOIN BrowserActivities a ON s.SessionsId = a.SessionId
GROUP BY s.SessionsId;
```

---

## Exception 2: Enum String Values — PascalCase (Mandatory)

When an enum variant is serialized to a string (JSON, database column, API response, config file), the **string value must be PascalCase**. This ensures consistency across the entire project stack regardless of which language generated or consumes the data.

### JSON Serialization

```rust
// ✅ Correct — PascalCase variants serialize to PascalCase strings by default
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ScreenshotTrigger {
    Periodic,       // Serializes to: "Periodic"
    TabChange,      // Serializes to: "TabChange"
    AppSwitch,      // Serializes to: "AppSwitch"
    Idle,           // Serializes to: "Idle"
    Manual,         // Serializes to: "Manual"
}
```

Serde's default behavior for PascalCase Rust enum variants produces PascalCase strings, so **no `rename_all` attribute is needed on enums**. This is the one case where Rust convention and the project convention naturally align.

```rust
// ❌ Forbidden — snake_case or SCREAMING_CASE string values
#[derive(Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ScreenshotTrigger {
    TabChange,  // Would serialize to: "tab_change" — WRONG
}

#[derive(Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ScreenshotTrigger {
    TabChange,  // Would serialize to: "TAB_CHANGE" — WRONG
}
```

### Database Storage

When enum values are stored in a database column, the stored string must be PascalCase:

```rust
// ✅ Correct — PascalCase string stored in DB
sqlx::query("INSERT INTO Screenshots (TriggeredBy) VALUES (?1)")
    .bind(serde_json::to_string(&trigger).unwrap().trim_matches('"'))
    // Stores: "TabChange" — correct
    .execute(&pool)
    .await?;
```

### Parsing from External Sources

When parsing enum values from external input (config files, environment variables, CLI args), accept PascalCase and provide clear error messages:

```rust
impl std::str::FromStr for ScreenshotTrigger {
    type Err = String;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value {
            "Periodic" => Ok(Self::Periodic),
            "TabChange" => Ok(Self::TabChange),
            "AppSwitch" => Ok(Self::AppSwitch),
            "Idle" => Ok(Self::Idle),
            "Manual" => Ok(Self::Manual),
            other => Err(format!(
                "invalid ScreenshotTrigger: '{}'. Valid values: Periodic, TabChange, AppSwitch, Idle, Manual",
                other
            )),
        }
    }
}
```

---

---

## Continued

The remaining sections of this document have been moved to [`01a-rust-json-and-decisions.md`](./01a-rust-json-and-decisions.md) (split 2026-04-25 — F-08) to keep this file under 400 lines:

- JSON Struct Serialization — PascalCase Wire Format
- (and following sections)

See the sibling file for the full content.
