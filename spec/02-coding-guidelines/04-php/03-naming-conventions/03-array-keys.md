# Array Key Conventions

## Log Context Keys — camelCase

Internal log context array keys (passed to logger calls) MUST use **camelCase**:

```php
// ✅ REQUIRED
$this->fileLogger->info('Post created', array('postId' => $postId));
$this->fileLogger->warn('Duplicate detected', array('duplicateDir' => $dir, 'targetSlug' => $slug));
$this->fileLogger->debug('Agent API request', array('agentId' => $id, 'method' => $method));
```

## Database Column Keys — PascalCase

Array keys referencing database columns (inserts, updates, WHERE conditions) MUST use **PascalCase** to match the schema:

```php
// ✅ REQUIRED
$this->db->insert(TableType::Transactions->value, array('PluginSlug' => $slug, 'CreatedAt' => $now));
```

## API Response Keys — PascalCase

Array keys in REST API responses (success payloads, error enrichment, health checks) MUST use **PascalCase**:

```php
// ❌ WRONG — snake_case in API response
return new WP_REST_Response([
    'plugin_version' => PluginConfigType::Version->value,  // Wrong
    'timestamp' => gmdate('c'),                            // Wrong
    'log_hint' => $this->getLogHint($status),              // Wrong
]);

// ✅ CORRECT — PascalCase in API response
return new WP_REST_Response([
    'PluginVersion' => PluginConfigType::Version->value,
    'Timestamp' => gmdate(DateFormatType::Iso8601->value),
    'LogHint' => $this->getLogHint($status),
]);
```

## Persistence-Level Keys — Exempt

WordPress `wp_options` keys, SQLite `_snapshot_meta` keys, and external API response keys retain their native casing (typically snake_case). These are **not** subject to the PascalCase rule.

---

*Part of [PHP Naming Conventions](./00-overview.md) — array key conventions*
