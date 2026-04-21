# ActionType — Transaction Logging Actions

> **Parent:** [00-overview.md](00-overview.md)

42 cases across Core, Post, Auth, Export, Update, Agent, Snapshot domains.

```php
enum ActionType: string
{
    // Core: Upload, UploadActive, UploadInitiated, Enable, Disable, Delete, ...
    // Post: PostCreate, PostUpdate, CategoryCreate, MediaUpload
    // Auth: AuthFailed
    // Export: ExportSelf, ExportPlugin
    // Update: UpdateCheck, UpdateResolve, UpdateDownload, UpdateInstall
    // Agent: AgentAdd, AgentRemove, AgentTest, AgentSync, ...
    // Snapshot: SnapshotCreate, SnapshotRestore, SnapshotDelete, ...

    public function isEqual(self $other): bool { return $this === $other; }

    // Domain prefix checks (str_starts_with, NOT isEqual)
    public function isSnapshot(): bool { return str_starts_with($this->value, 'snapshot_'); }
    public function isAgent(): bool    { return str_starts_with($this->value, 'agent_'); }
    public function isUpdate(): bool   { return str_starts_with($this->value, 'update_'); }

    // Compound case check (uses isEqual)
    public function isLifecycle(): bool
    {
        return $this->isEqual(self::Enable)
            || $this->isEqual(self::Disable)
            || $this->isEqual(self::Delete);
    }
}
```
