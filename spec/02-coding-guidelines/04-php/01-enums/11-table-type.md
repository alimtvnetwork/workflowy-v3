# TableType + LogColumnType — SQLite Names (PascalCase)

> **Parent:** [00-overview.md](00-overview.md)

All custom SQLite table and column names use **PascalCase** values. This aligns with the [cross-language database naming convention](../../01-cross-language/07-database-naming.md).

## TableType — SQLite Table Names

```php
enum TableType: string
{
    case Transactions     = 'Transactions';
    case AgentSites       = 'AgentSites';
    case AgentActions     = 'AgentActions';
    case Snapshots        = 'Snapshots';
    case SnapshotProgress = 'SnapshotProgress';
    case SnapshotJobs     = 'SnapshotJobs';
    case SnapshotSettings = 'SnapshotSettings';
    case SnapshotExports  = 'SnapshotExports';
    case FileCache        = 'FileCache';
    case RemotePluginsCache = 'RemotePluginsCache';
    case ErrorSessions    = 'ErrorSessions';
    case FlashState       = 'FlashState';

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }

    public function isSnapshot(): bool { return str_starts_with($this->value, 'Snapshot'); }
    public function isAgent(): bool    { return str_starts_with($this->value, 'Agent'); }
}
```

## LogColumnType — Log Table Column Names

Enum for type-safe access to Transactions table columns. Used by `LogValueTrait` for `logValue()` / `logString()` calls.

```php
enum LogColumnType: string
{
    case Id            = 'Id';
    case Action        = 'Action';
    case PluginSlug    = 'PluginSlug';
    case PluginFile    = 'PluginFile';
    case PluginVersion = 'PluginVersion';
    case PostId        = 'PostId';
    case Status        = 'Status';
    case Details       = 'Details';
    case ErrorMsg      = 'ErrorMsg';
    case UserLogin     = 'UserLogin';
    case UserId        = 'UserId';
    case IpAddress     = 'IpAddress';
    case TriggeredBy   = 'TriggeredBy';
    case UploadSource  = 'UploadSource';
    case SourceMachine = 'SourceMachine';
    case CreatedAt     = 'CreatedAt';

    public function isEqual(self $other): bool { return $this === $other; }
    public function isOtherThan(self $other): bool { return $this !== $other; }
    public function isAnyOf(self ...$others): bool { return in_array($this, $others, true); }
}
```
