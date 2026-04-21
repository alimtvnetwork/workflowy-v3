# Common Mistakes — PHP Naming

These are real violations found and fixed across the codebase. Use as a checklist to avoid repeating them.

## Mistake 1: snake_case Log Context Keys

```php
// ❌ WRONG — snake_case in log context
$this->fileLogger->info('Post created', array(
    'post_id'    => $postId,     // Wrong
    'master_dir' => $dir,        // Wrong
    'agent_id'   => $agentId,    // Wrong
));

// ✅ CORRECT — camelCase
$this->fileLogger->info('Post created', array(
    'postId'    => $postId,
    'masterDir' => $dir,
    'agentId'   => $agentId,
));
```

## Mistake 2: camelCase or snake_case for DB Column / API Response Keys

```php
// ❌ WRONG — camelCase/snake_case for DB columns
$this->db->insert(TableType::Snapshots->value, array(
    'totalRows'     => $rows,      // Wrong — camelCase
    'trigger_source' => $trigger,  // Wrong — snake_case
    'status'        => $status,    // Wrong — lowercase
));

// ✅ CORRECT — PascalCase matching schema
$this->db->insert(TableType::Snapshots->value, array(
    'TotalRows'     => $rows,
    'TriggerSource' => $trigger,
    'Status'        => $status,
));

// ❌ WRONG — snake_case in API response
$data['plugin_version'] = PluginConfigType::Version->value;
$data['log_hint'] = $this->getLogHint($status);

// ✅ CORRECT — PascalCase in API response
$data['PluginVersion'] = PluginConfigType::Version->value;
$data['LogHint'] = $this->getLogHint($status);
```

## Mistake 3: snake_case Method Names

```php
// ❌ WRONG — WordPress-style snake_case
public function get_plugin_file() { ... }
private function handle_upload_error() { ... }

// ✅ CORRECT — camelCase
public function getPluginFile() { ... }
private function handleUploadError() { ... }
```

## Mistake 4: Missing `Type` Suffix on Enums

```php
// ❌ WRONG — no Type suffix
enum UploadSource: string { ... }
enum Capability: string { ... }

// ✅ CORRECT — Type suffix required
enum UploadSourceType: string { ... }
enum CapabilityType: string { ... }
```

## Mistake 5: Leading Backslash on Global Types

```php
// ❌ WRONG — backslash-qualified
catch (\Throwable $e) { ... }
$db = new \PDO($dsn);

// ✅ CORRECT — import via use
use Throwable;
use PDO;
catch (Throwable $e) { ... }
$db = new PDO($dsn);
```

## Mistake 6: Raw `===` for Enum Comparison

```php
// ❌ WRONG — raw operator
if ($status === StatusType::Success) { ... }

// ✅ CORRECT — isEqual() method
if ($status->isEqual(StatusType::Success)) { ... }
```

## Mistake 7: Uppercase Abbreviations

```php
// ❌ WRONG
$postId = 5;
$fileUrl = '/path';
$hashMD5 = md5($data);

// ✅ CORRECT
$postId = 5;
$fileUrl = '/path';
$hashMd5 = md5($data);
```

---

*Part of [PHP Naming Conventions](./00-overview.md) — common mistakes*
