# Database Error Stack Traces & ORM-Only Policy

> **Parent:** [00-overview.md](./00-overview.md)

## Mandatory Requirements

All database operations MUST use the centralized `DBOperation` wrapper from `pkg/database`. This ensures:

1. **Automatic Stack Trace Capture** — Every error includes the full caller chain
2. **Affected Rows Validation** — Compare expected vs actual rows affected
3. **Table Name Logging** — Every log entry includes the table being operated on
4. **Duration Tracking** — Time taken for each operation

## Stack Trace Format

```text
[ERROR] Database operation completed
  Table: User
  Operation: Create
  ExpectedRows: 1
  AffectedRows: 0
  Duration: 5.678ms
  Error: UNIQUE constraint failed: User.Email
  Stack:
    -> user_repository.go:45 (CreateUser)
    -> auth_service.go:112 (RegisterUser)
    -> auth_handler.go:78 (HandleRegister)
```

## Required Log Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Table` | string | Always | Table name being operated on |
| `Operation` | string | Always | Create/Read/Update/Delete |
| `AffectedRows` | int64 | For writes | Actual rows changed |
| `ExpectedRows` | int | For writes | Expected rows for validation |
| `Duration` | duration | Always | Operation execution time |
| `Stack` | []string | On error | Full caller chain with file:line |
| `Error` | string | On error | Error message |

## Usage Pattern

```go
// All database operations MUST use this pattern
op := database.NewDbOperation("User", database.OpCreate).
    ExpectRows(1)

// EXEMPTED: op.Execute callback uses (int64, error) as internal framework boundary
result := op.Execute(func() (int64, error) {
    tx := r.db.Create(user)

    return tx.RowsAffected, tx.Error
})

if result.Error != nil {
    // Stack trace is automatically logged
    return result.Error
}
```

## Anti-Patterns

```go
// ❌ WRONG: Direct GORM without wrapper
result := r.db.Create(user)

// ❌ WRONG: Raw SQL (forbidden except FTS5/vectors)
r.db.Exec("INSERT INTO User (Id, Email) VALUES (?, ?)", id, email)

// ❌ WRONG: Missing expected rows for write operations
op := database.NewDbOperation("User", database.OpUpdate)
// Missing: .ExpectRows(1)
```

## ORM-Only Policy

### Rule

Use GORM for 99% of database operations. Raw SQL is forbidden except for:
- FTS5 virtual tables (SQLite limitation)
- Vector storage operations (if no ORM support)
- Complex CTEs/recursive queries

### Relationship-First Pattern

Always find the parent model first, then manipulate relationships:

```go
// ❌ WRONG: Raw SQL INSERT
db.Exec("INSERT INTO File (ProjectId, Name) VALUES (?, ?)", projectId, name)

// ✅ CORRECT: Relationship-first
var project Project
db.First(&project, "Id = ?", projectId)
project.Files = append(project.Files, File{Name: name})
db.Save(&project)
```

See full specification: `spec/02-spec-management-software/13-shared-packages/08-pkg-database-operations.md`

## Related

- [06-common-issues.md](./06-common-issues.md) — Database "locked" errors
- [03-error-handling.md](./03-error-handling.md) — Error envelope conventions
