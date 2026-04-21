# 2. Database Casing Violations

> **Parent:** [00-overview.md](./00-overview.md)

---

## Issue #05 — snake_case Table Names (V13 Migration)

**Scope:** 12 SQLite tables  
**Root Cause:** Original schema used snake_case table names (`agent_sites`, `snapshot_progress`).  
**Impact:** Inconsistent with PascalCase standard, cross-language enum mismatch.

**Before (❌):**
```sql
CREATE TABLE transactions (...);
CREATE TABLE agent_sites (...);
CREATE TABLE snapshot_progress (...);
```

**After (✅):**
```sql
ALTER TABLE transactions RENAME TO Transactions;
ALTER TABLE agent_sites RENAME TO AgentSites;
ALTER TABLE snapshot_progress RENAME TO SnapshotProgress;
```

**Prevention:** `TableType` enum values must match PascalCase schema. Migration v13 handles legacy renames.

---

## Issue #06 — snake_case Column Names (V13 Migration)

**Scope:** ~50 columns across 12 tables  
**Root Cause:** Columns used `snake_case` (`plugin_slug`, `created_at`, `agent_site_id`).

**Before (❌):**
```sql
SELECT plugin_slug, created_at FROM transactions WHERE agent_site_id = ?
```

**After (✅):**
```sql
SELECT PluginSlug, CreatedAt FROM Transactions WHERE AgentSiteId = ?
```

**Prevention:** All SQL queries must use PascalCase column names. `LogColumnType` enum provides type-safe column access.

---

## Issue #07 — PHP Consumer Code Using Old Column Names

**Scope:** 9 PHP files  
**Root Cause:** After V13 migration renamed columns to PascalCase, consumer code still used old snake_case keys in arrays and SQL.

**Before (❌):**
```php
$record = array(
    'plugin_slug' => $slug,
    'created_at'  => $now,
    'status'      => 'success',
);
```

**After (✅):**
```php
$record = array(
    'PluginSlug' => $slug,
    'CreatedAt'  => $now,
    'Status'     => StatusType::Success->value,
);
```

**Prevention:** DB insert/update arrays must use PascalCase keys matching the schema. This caused null-value regressions when code used old keys.

---

## Issue #08 — ImportExecutionTrait buildSnapshotRecord Inconsistency

**Scope:** 1 file, 11 keys  
**Root Cause:** `buildSnapshotRecord()` used a mix of camelCase and lowercase keys for DB column names.  
**Impact:** Silent data loss — PDO/SQLite ignores unrecognized column names, resulting in NULL values.

**Before (❌):**
```php
return array(
    'sequence'      => $this->manager->getNextSequence(),
    'filename'      => basename($destDir),
    'totalRows'     => $metadata['total_rows'] ?? 0,
    'triggerSource'  => SnapshotTriggerType::Api->value,
    'importSource'   => json_encode($meta),
);
```

**After (✅):**
```php
return array(
    'Sequence'      => $this->manager->getNextSequence(),
    'Filename'      => basename($destDir),
    'TotalRows'     => $metadata['total_rows'] ?? 0,
    'TriggerSource' => SnapshotTriggerType::Api->value,
    'ImportSource'  => json_encode($meta),
);
```

**Prevention:** Every array key used in `$this->db->insert()` or `$this->db->update()` must be PascalCase.
