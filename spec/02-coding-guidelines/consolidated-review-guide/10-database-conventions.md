# 10. Database Conventions

> **Parent:** [00-overview.md](./00-overview.md)

| Element | Convention | Example |
|---------|-----------|---------|
| Table names | PascalCase | `UserAccounts`, `OrderItems` |
| Column names | PascalCase | `FirstName`, `CreatedAt` |
| Primary key | `{TableName}Id` | `UserId`, `OrderId` |
| Primary key type | `INTEGER PRIMARY KEY AUTOINCREMENT` | Never UUID unless explicitly requested |
| Foreign key | Same name as source PK | `UserId` in `Orders` table |
| JSON keys | PascalCase | `{ "UserId": 1, "FirstName": "John" }` |
| Index names | PascalCase | `IdxUsersEmail` |
| Enum values | PascalCase | `StatusActive`, `RoleAdmin` |

```sql
-- ✅ Correct table definition
CREATE TABLE User (
    UserId     INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName   TEXT NOT NULL,
    Email       TEXT NOT NULL UNIQUE,
    IsActive    INTEGER NOT NULL DEFAULT 1,
    CreatedAt   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Foreign key references the exact PK name
CREATE TABLE Order (
    OrderId    INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId     INTEGER NOT NULL REFERENCES User(UserId),
    TotalAmount INTEGER NOT NULL
);
```

## Related

- [`../01-cross-language/07-database-naming.md`](../01-cross-language/07-database-naming.md) — Full database naming spec
