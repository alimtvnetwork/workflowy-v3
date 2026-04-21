# 3. Step 2 — Database Storage

> **Parent:** [Validation Data Seeding overview](./00-overview.md)

The Root DB (`settings.db`) holds all seeded validation data in a single
generic table. Values are JSON-encoded so any data shape can be stored.

```sql
-- Root DB (settings.db) stores validation data
CREATE TABLE ValidationData (
    ValidationDataId INTEGER PRIMARY KEY AUTOINCREMENT,
    Category TEXT NOT NULL,          -- 'Seo', 'Rag', 'Search'
    Key TEXT NOT NULL,               -- 'TransitionWords', 'StopWords'
    DataType TEXT NOT NULL,          -- 'array', 'map', 'number'
    Value TEXT NOT NULL,             -- JSON encoded
    Version TEXT NOT NULL,           -- Seed version
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(Category, Key)
);

CREATE INDEX IdxValidationDataCategory ON ValidationData(Category);
```

**Why a single generic table:**

- One migration, infinite settings
- Uniform CRUD path
- Easy version diffing
- Cache key is `Category:Key` — trivially flat
