# 10.5 Self-Update with Rollback

> **Updated:** 2026-04-19

---

## Update lifecycle

```
1. Admin triggers update (via WP dashboard or AJAX endpoint)
2. Plugin creates backup of current version → wp-content/uploads/plugin-slug/backups/
3. Plugin downloads ZIP from package_url
4. Plugin extracts ZIP to plugin directory
5. Pre-activation validation runs (critical files, syntax check)
6. WordPress activates the new version
7. Post-activation health check runs (classes loaded, hooks registered)
8. On ANY failure at steps 5-7 → automatic rollback from backup
9. On success → backup retained for manual rollback window
```

---

## SelfUpdateStatusType Enum

> **Full definition:** [Phase 2 — 03-self-update-status-enum.md](../02-enums-and-coding-style/03-self-update-status-enum.md)

This enum tracks every possible outcome of the self-update lifecycle. It uses `match`-based metadata methods (see [02-enum-metadata-pattern.md](../02-enums-and-coding-style/02-enum-metadata-pattern.md)) with per-case `is*()` helpers.

Key cases: `Success`, `RolledBack`, `RollbackFailed`, `BackupCreationFailed`, `ExtractionFailed`, `ValidationFailed`, `ActivationException`, `ActivationWpError`, `HealthCheckFailed`, `PluginFileNotFound`, `CriticalFileMissing`, `SyntaxError`, `FileUnreadable`, `DirectoryMissing`, `BootErrorDetected`, `CriticalClassMissing`, `RestHookMissing`.

Domain helpers: `isRollbackReason()`, `isSuccess()`, `label()`, `info()`.

---

## Pre-activation validation (SelfUpdateValidator)

```php
namespace PluginName\Update;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\SelfUpdateStatusType;

final class SelfUpdateValidator
{
    /**
     * Validate the extracted plugin before activation.
     *
     * @param string $pluginDir Path to the extracted plugin directory
     * @return array{valid: bool, errors: list<array{status: SelfUpdateStatusType, file: string}>}
     */
    public function validate(string $pluginDir): array
    {
        $errors = [];
        $criticalFiles = $this->getCriticalFiles();

        foreach ($criticalFiles as $relativePath) {
            $fullPath = $pluginDir . '/' . $relativePath;
            $fileExists = file_exists($fullPath);

            if (!$fileExists) {
                $errors[] = [
                    'status' => SelfUpdateStatusType::CriticalFileMissing,
                    'file'   => $relativePath,
                ];

                continue;
            }

            $isReadable = is_readable($fullPath);

            if (!$isReadable) {
                $errors[] = [
                    'status' => SelfUpdateStatusType::FileUnreadable,
                    'file'   => $relativePath,
                ];

                continue;
            }

            // Syntax check PHP files
            $isPhpFile = (pathinfo($fullPath, PATHINFO_EXTENSION) === 'php');

            if ($isPhpFile) {
                $output = [];
                $exitCode = 0;
                exec("php -l " . escapeshellarg($fullPath) . " 2>&1", $output, $exitCode);
                $hasSyntaxError = ($exitCode !== 0);

                if ($hasSyntaxError) {
                    $errors[] = [
                        'status' => SelfUpdateStatusType::SyntaxError,
                        'file'   => $relativePath,
                    ];
                }
            }
        }

        $hasErrors = (count($errors) > 0);

        return [
            'valid'  => !$hasErrors,
            'errors' => $errors,
        ];
    }

    /**
     * Files that MUST exist for the plugin to function.
     *
     * @return list<string>
     */
    private function getCriticalFiles(): array
    {
        return [
            'plugin-slug.php',
            'includes/Core/Plugin.php',
            'includes/Enums/PluginConfigType.php',
            'vendor/autoload.php',
        ];
    }
}
```

---

## Post-activation health check (SelfUpdateHealthCheck)

```php
namespace PluginName\Update;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\SelfUpdateStatusType;
use PluginName\ErrorHandling\BootErrorCollector;

final class SelfUpdateHealthCheck
{
    /**
     * Run health checks after the new version is activated.
     *
     * @return array{healthy: bool, errors: list<array{status: SelfUpdateStatusType, detail: string}>}
     */
    public function check(): array
    {
        $errors = [];

        // Check 1: Boot errors
        $bootErrors = BootErrorCollector::getErrors();
        $hasBootErrors = (count($bootErrors) > 0);

        if ($hasBootErrors) {
            $errors[] = [
                'status' => SelfUpdateStatusType::BootErrorDetected,
                'detail' => implode('; ', $bootErrors),
            ];
        }

        // Check 2: Critical classes loaded
        $criticalClasses = $this->getCriticalClasses();

        foreach ($criticalClasses as $className) {
            $isLoaded = class_exists($className, false);

            if (!$isLoaded) {
                $errors[] = [
                    'status' => SelfUpdateStatusType::CriticalClassMissing,
                    'detail' => $className,
                ];
            }
        }

        // Check 3: REST hooks registered
        $hasRestHooks = has_action('rest_api_init');

        if (!$hasRestHooks) {
            $errors[] = [
                'status' => SelfUpdateStatusType::RestHookMissing,
                'detail' => 'rest_api_init hook not registered',
            ];
        }

        $hasErrors = (count($errors) > 0);

        return [
            'healthy' => !$hasErrors,
            'errors'  => $errors,
        ];
    }

    /**
     * Classes that must be loaded after activation.
     *
     * @return list<string>
     */
    private function getCriticalClasses(): array
    {
        return [
            'PluginName\\Core\\Plugin',
            'PluginName\\Enums\\PluginConfigType',
            'PluginName\\Logging\\FileLogger',
        ];
    }
}
```

---

## Backup and rollback (UpdateResolverBackupTrait)

```php
namespace PluginName\Update\Traits;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\SelfUpdateStatusType;
use PluginName\Helpers\PathHelper;

trait UpdateResolverBackupTrait
{
    /**
     * Create a backup of the current plugin version.
     *
     * @param string $pluginDir  Current plugin directory
     * @param string $backupDir  Backup destination
     * @return array{success: bool, path: string, status?: SelfUpdateStatusType}
     */
    public function createBackup(string $pluginDir, string $backupDir): array
    {
        $timestamp = gmdate('Ymd_His');
        $backupPath = $backupDir . '/backup_' . $timestamp;

        if (PathHelper::isDirMissing($backupDir)) {
            PathHelper::makeDirectory($backupDir);
        }

        $copied = $this->recursiveCopy($pluginDir, $backupPath);

        if (!$copied) {
            return [
                'success' => false,
                'path'    => '',
                'status'  => SelfUpdateStatusType::BackupCreationFailed,
            ];
        }

        return [
            'success' => true,
            'path'    => $backupPath,
        ];
    }

    /**
     * Restore from backup after a failed update.
     *
     * @param string $backupPath Path to the backup
     * @param string $pluginDir  Plugin directory to restore to
     * @return bool Whether the rollback succeeded
     */
    public function rollback(string $backupPath, string $pluginDir): bool
    {
        $hasBackup = is_dir($backupPath);

        if (!$hasBackup) {
            return false;
        }

        // Remove failed new version
        $this->recursiveDelete($pluginDir);

        // Restore from backup
        return $this->recursiveCopy($backupPath, $pluginDir);
    }

    private function recursiveCopy(string $src, string $dst): bool
    {
        // Implementation: recursive directory copy
        // Uses opendir/readdir pattern with error handling
        // Returns false on any failure
    }

    private function recursiveDelete(string $dir): bool
    {
        // Implementation: recursive directory deletion
        // Uses RecursiveDirectoryIterator
        // Returns false on any failure
    }
}
```

---

*Self-update with rollback — v3.2.0 — 2026-04-19*
