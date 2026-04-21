# 2. Database Schema

> **Parent:** [User-Scoped Isolation overview](./00-overview.md)

---

## User Registry Table (in Root or App DB)

```sql
CREATE TABLE User (
    UserId INTEGER PRIMARY KEY AUTOINCREMENT,
    ExternalId TEXT UNIQUE,                    -- External auth provider ID
    Username TEXT UNIQUE NOT NULL,
    Email TEXT UNIQUE,
    DisplayName TEXT,
    AvatarUrl TEXT,
    CompanyId INTEGER,                         -- NULL for app-level users
    Status TEXT DEFAULT 'active',              -- active, suspended, deleted
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastActiveAt DATETIME,
    FOREIGN KEY (CompanyId) REFERENCES Company(CompanyId)
);

CREATE INDEX IdxUser_ExternalId ON User(ExternalId);
CREATE INDEX IdxUser_CompanyId ON User(CompanyId);
CREATE INDEX IdxUser_Status ON User(Status);
```

---

## User Settings Table (in User's settings.db)

```sql
CREATE TABLE Setting (
    SettingId INTEGER PRIMARY KEY AUTOINCREMENT,
    Key TEXT UNIQUE NOT NULL,
    Value TEXT NOT NULL,
    ValueType TEXT DEFAULT 'string',           -- string, int, bool, json
    Source TEXT DEFAULT 'user',                -- seed, user, admin
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default user settings
INSERT INTO Settings (Key, Value, ValueType, Source) VALUES
('Theme', 'system', 'string', 'seed'),
('Language', 'en', 'string', 'seed'),
('Notifications.Email', 'true', 'bool', 'seed'),
('Notifications.Push', 'true', 'bool', 'seed'),
('Privacy.ShareAnalytics', 'false', 'bool', 'seed');
```

---

## User Database Registry (in Root DB)

```sql
CREATE TABLE UserDbRegistry (
    UserDbRegistryId INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER NOT NULL,
    CompanyId INTEGER,                         -- NULL for app-level
    Category TEXT NOT NULL,                    -- settings, sessions, history, data
    SubCategory TEXT,                          -- Type within category
    EntityId TEXT NOT NULL,
    SequenceNum INTEGER NOT NULL,
    Path TEXT NOT NULL,
    SizeBytes INTEGER DEFAULT 0,
    RecordCount INTEGER DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastAccessedAt DATETIME,
    ExpiresAt DATETIME,                        -- For session cleanup
    Status TEXT DEFAULT 'active',
    FOREIGN KEY (UserId) REFERENCES User(UserId)
);

CREATE INDEX IdxUserDbRegistry_UserId ON UserDbRegistry(UserId);
CREATE INDEX IdxUserDbRegistry_Category ON UserDbRegistry(Category);
CREATE INDEX IdxUserDbRegistry_ExpiresAt ON UserDbRegistry(ExpiresAt);
```
