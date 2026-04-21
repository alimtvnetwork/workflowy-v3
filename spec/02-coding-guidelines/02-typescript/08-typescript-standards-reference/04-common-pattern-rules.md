# 4. Specific Type Rules for Common Patterns

> **Parent:** [00-overview.md](./00-overview.md)

---

## 4.1: Error handling — structured catch blocks

```typescript
// ✅ The ONLY acceptable catch pattern
try {
  await apiCall();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  // OR for ApiClientError:
  if (isApiClientError(err)) {
    handleApiError(err.apiError);
  } else {
    handleGenericError(message);
  }
}
```

---

## 4.2: React Query — typed query data

```typescript
// ❌ FORBIDDEN
queryClient.getQueryData<any>(["dashboard-stats"]);
(data as any).entries;

// ✅ REQUIRED
queryClient.getQueryData<DashboardStats>(["dashboard-stats"]);
```

---

## 4.3: Component prop drilling — avoid `Record<string, unknown>`

```typescript
// ❌ FORBIDDEN
metadata: Record<string, unknown>;

// ✅ REQUIRED — specific metadata types per domain
interface PublishMetadata {
  pluginName: string;
  version: string;
  filesUpdated: number;
  sessionId?: string;
}

interface SnapshotMetadata {
  snapshotType: SnapshotType;
  tables?: number;
  size?: number;
}

type ActivityMetadata = PublishMetadata | SnapshotMetadata | PluginMetadata | ConfigMetadata | ConnectionMetadata;
```
