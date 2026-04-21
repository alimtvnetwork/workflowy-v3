# EndpointType — REST API Endpoint Paths

> **Parent:** [00-overview.md](00-overview.md)

Stores only the path fragment for each REST endpoint. The full WordPress route
is constructed via the `route()` helper, which prepends `/`.

```php
enum EndpointType: string
{
    // Core: Status, Upload, Plugins, ExportSelf, Posts, ...
    // Plugin: PluginFiles, PluginFile, PluginEnable, ...
    // Sync: SyncManifest, Sync
    // Agent: Agents, AgentsAdd, AgentsRemove, ...
    // Snapshot: SnapshotList, SnapshotSchedule, ...

    public function isEqual(self $other): bool { return $this === $other; }

    public function route(): string { return '/' . $this->value; }

    public function isSnapshot(): bool { return str_starts_with($this->value, 'snapshots/'); }
    public function isAgent(): bool    { return str_starts_with($this->value, 'agents'); }
    public function isPlugin(): bool   { return str_starts_with($this->value, 'plugins/'); }
}
```

## Usage in Route Registration

```php
use RiseupAsia\Enums\EndpointType;
use RiseupAsia\Enums\HttpMethodType;

// ❌ FORBIDDEN: Accessing ->value directly for route construction
$safeRegister(EndpointType::Upload->value, [...]);

// ✅ REQUIRED: Use route() helper
$safeRegister(EndpointType::Upload->route(), array(
    'methods'  => HttpMethodType::Post->value,
    'callback' => array($this, 'handleUpload'),
    ...
));
```

## When to Use ->value vs ->route()

| Context | Use | Example |
|---------|-----|---------|
| Route registration (`register_rest_route`) | `->route()` | `EndpointType::Upload->route()` → `'/upload'` |
| Building remote API URLs | `->value` | `$baseUrl . '/' . EndpointType::Upload->value` |
| Logging / display | `->value` or `->name` | `'Endpoint: ' . EndpointType::Upload->value` |
| Domain checks | helpers | `$endpoint->isSnapshot()` |
