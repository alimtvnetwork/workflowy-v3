# Log Context Array Keys — camelCase

> **Parent:** [00-overview.md](00-overview.md)

Internal log context array keys (passed to `fileLogger` and `logger` calls) MUST use **camelCase**. This matches the zero-underscore policy for all logic-level identifiers.

```php
// ❌ FORBIDDEN: snake_case log context keys
$this->fileLogger->info('Post created', array('post_id' => $postId));
$this->fileLogger->warn('Duplicate detected', array('duplicate_dir' => $dir));

// ✅ REQUIRED: camelCase log context keys
$this->fileLogger->info('Post created', array('postId' => $postId));
$this->fileLogger->warn('Duplicate detected', array('duplicateDir' => $dir));
```

**Exempt:** Persistence-level keys (wp_options, SQLite `_snapshot_meta` table keys, V13 migration mappings), WordPress API return values (e.g., `$result['term_id']`), and internal markers (e.g., `_invocation_chain`).
