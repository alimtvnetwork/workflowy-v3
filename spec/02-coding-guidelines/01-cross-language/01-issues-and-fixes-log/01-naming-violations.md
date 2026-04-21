# 1. Naming Convention Violations

> **Parent:** [00-overview.md](./00-overview.md)

---

## Issue #01 — snake_case Log Context Keys (Batch G)

**Scope:** 8 PHP files, 17 keys  
**Root Cause:** Log context arrays used `snake_case` keys (`'post_id'`, `'master_dir'`) instead of the required camelCase.  
**Impact:** Inconsistent log output, harder to grep/parse logs across the system.

**Before (❌):**
```php
$this->fileLogger->info('Post created', array('post_id' => $postId));
$this->fileLogger->debug('Backup started', array('master_dir' => $dir));
$this->fileLogger->warn('Upload conflict', array('duplicate_dir' => $path));
```

**After (✅):**
```php
$this->fileLogger->info('Post created', array('postId' => $postId));
$this->fileLogger->debug('Backup started', array('masterDir' => $dir));
$this->fileLogger->warn('Upload conflict', array('duplicateDir' => $path));
```

**Files Fixed:**
- `PostCrudTrait.php`: `post_id` → `postId`
- `CategoryTrait.php`: `term_id` → `termId`
- `UploadZipTrait.php`: `duplicate_dir` → `duplicateDir`, `target_slug` → `targetSlug`, `old_version` → `oldVersion`, `new_version` → `newVersion`, `file_size` → `fileSize`
- `SnapshotExportHandlerTrait.php`: `snapshot_id` → `snapshotId`
- `AgentRemoteCoreTrait.php`: `agent_id` → `agentId`
- `RootDbSchemaTrait.php`: `mysql_version` → `mysqlVersion`, `wp_version` → `wpVersion`
- `DetectorSettingsTrait.php`: `changed_keys` → `changedKeys`
- `IncrementalBackup.php`: `master_dir` → `masterDir`
- `UploadInstallExtractTrait.php`: `target_dir` → `targetDir`

**Prevention:** All log context array keys must use camelCase. See [naming-conventions § Array Key Conventions](../../04-php/03-naming-conventions/03-array-keys.md).

---

## Issue #02 — Legacy Class Naming (`class Riseup_*`)

**Scope:** All PHP class files  
**Root Cause:** Legacy WordPress naming convention used `Riseup_` prefix with underscores (e.g., `class Riseup_Upload_Manager`).  
**Impact:** Violates PSR-4 autoloading, creates inconsistent naming with modern codebase.

**Before (❌):**
```php
class Riseup_Upload_Manager { ... }
class Riseup_Snapshot_Factory { ... }
```

**After (✅):**
```php
namespace RiseupAsia\Upload;
class UploadManager { ... }

namespace RiseupAsia\Snapshot;
class SnapshotFactory { ... }
```

**Prevention:** PSR-4 autoloading enforces PascalCase class names = file names. No `Riseup_` prefix.

---

## Issue #03 — Leading Backslash on Global Types

**Scope:** 16 PHP files  
**Root Cause:** PHP global types like `Throwable`, `PDO`, `Exception` were used with leading backslash (`\Throwable`) instead of being imported via `use`.

**Before (❌):**
```php
catch (\Throwable $e) { ... }
$db = new \PDO($dsn);
```

**After (✅):**
```php
use Throwable;
use PDO;
// ...
catch (Throwable $e) { ... }
$db = new PDO($dsn);
```

**Prevention:** All global types must be imported via `use` statement. `Autoloader.php` is the sole exemption.

---

## Issue #04 — snake_case Method Names in PHP

**Scope:** All PHP trait and class methods  
**Root Cause:** Some methods used `snake_case` (WordPress convention) instead of `camelCase`.

**Before (❌):**
```php
public function get_plugin_file() { ... }
private function handle_upload_error() { ... }
```

**After (✅):**
```php
public function getPluginFile() { ... }
private function handleUploadError() { ... }
```

**Prevention:** Zero-underscore policy. All methods use camelCase. WordPress hook callbacks are the only exemption.
