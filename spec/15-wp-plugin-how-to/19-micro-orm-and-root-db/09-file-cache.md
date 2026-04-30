# 19.10 FileCache — SQLite-Backed File Hash Cache

> **Parent:** [Phase 19 overview](./00-overview.md)

`FileCache` manages MD5-based file hash caching to avoid re-hashing unchanged files (target: <5 ms cache-hit lookup vs ~50 ms `md5_file()` cold compute on a 1 MB file). It follows the standard **shell class + trait decomposition** pattern.

## Architecture

```
Database/
├── FileCache.php                     ← Shell class (singleton)
└── Traits/
    ├── FileCacheScanTrait.php        ← Directory scanning, manifest building, reconciliation
    └── FileCacheStoreTrait.php       ← Cache CRUD (load, upsert, delete, invalidate)
```

## Shell class

```php
class FileCache {
    use FileCacheScanTrait;
    use FileCacheStoreTrait;

    private static ?FileCache $instance = null;
    private FileLogger $logger;
    private Database $db;

    public static function getInstance(FileLogger $logger, Database $db): static;
}
```

**Dependencies:** Takes both `FileLogger` (for logging) and `Database` (for PDO access and readiness check).

## FileCacheScanTrait — Manifest building

The primary method is `getManifest()`, which builds a complete file manifest for a plugin:

```php
$manifest = $fileCache->getManifest($pluginSlug, $pluginDir, $ignoreRules);
// Returns: [
//   'Files'    => [ ['path' => '...', 'hash' => '...', 'modifiedAt' => '...', 'size' => 123], ... ],
//   'Cached'   => 42,    // Files resolved from cache (~5 ms / file lookup)
//   'Computed'  => 3,     // Files that needed fresh MD5 computation
//   'Removed'   => 1,     // Stale cache entries pruned
// ]
```

### Reconciliation flow

1. **Load cached entries** from SQLite (keyed by `RelativePath`)
2. **Scan directory** recursively, respecting `.riseupuploadignore` rules
3. **For each file on disk:**
   - If cache hit (same `ModifiedAt` + `FileSize`) → use cached hash (fast path)
   - If cache miss → compute `md5_file()`, upsert cache entry (slow path)
4. **Prune stale entries** — cached files no longer on disk are deleted

### Graceful degradation

```php
$isDbUnavailable = ($this->db->isReady() === false);
if ($isDbUnavailable) {
    return $this->fullScan($pluginDir, $ignore);  // No cache, compute all hashes
}
```

If the database isn't ready, `getManifest()` falls back to a full scan without caching — ensuring the feature always works.

## FileCacheStoreTrait — Cache CRUD

| Method | Purpose |
|--------|---------|
| `invalidate($pluginSlug)` | Delete all cache entries for a plugin (returns count) |
| `loadCachedEntries($pluginSlug)` | Load all cached entries as `path → row` map |
| `upsertCacheEntry(...)` | INSERT OR REPLACE a cache entry |
| `deleteCacheEntry($pluginSlug, $path)` | Remove a single stale entry |

**Note:** `invalidate()` and `loadCachedEntries()` use the **Orm fluent builder**, while `upsertCacheEntry()` uses **raw PDO** for the `INSERT OR REPLACE` syntax that the Orm doesn't support. This demonstrates the practical coexistence of both database access patterns.

## Cache table schema

```sql
CREATE TABLE IF NOT EXISTS FileCache (
    Id           INTEGER PRIMARY KEY AUTOINCREMENT,
    PluginSlug   TEXT NOT NULL,
    RelativePath TEXT NOT NULL,
    Md5Hash      TEXT NOT NULL,
    ModifiedAt   TEXT NOT NULL,
    FileSize     INTEGER DEFAULT 0,
    CachedAt     TEXT NOT NULL,
    UNIQUE(PluginSlug, RelativePath)
);
```

## Key patterns demonstrated

| Pattern | Implementation |
|---------|---------------|
| Graceful degradation | Falls back to full scan when DB unavailable |
| Cache invalidation | `invalidate($slug)` clears all entries for a plugin |
| Stale entry pruning | `pruneStaleEntries()` removes files no longer on disk |
| Mixed DB access | Orm for queries, raw PDO for `INSERT OR REPLACE` |
| Semantic guards | `BooleanHelpers::isKeyMissing()` for stale path detection |
