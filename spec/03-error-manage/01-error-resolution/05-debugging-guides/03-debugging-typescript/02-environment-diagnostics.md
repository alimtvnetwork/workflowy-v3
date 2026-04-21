# Environment Variable Diagnostics

> **Parent:** [00-overview.md](./00-overview.md)

## Show Raw vs Resolved Values

```typescript
// DiagnosticsPanel component
interface DiagnosticsData {
  raw: Record<string, string | undefined>;
  resolved: Record<string, string>;
  origin: string;
  timestamp: string;
}

function getDiagnostics(): DiagnosticsData {
  return {
    raw: {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_API_PORT: import.meta.env.VITE_API_PORT,
      NODE_ENV: import.meta.env.MODE,
    },
    resolved: {
      apiBaseUrl: getApiBaseUrl(), // After fallback logic
      wsUrl: getWebSocketUrl(),
      origin: window.location.origin,
    },
    origin: window.location.origin,
    timestamp: new Date().toISOString(),
  };
}

// Display in error modals
function ErrorModal({ error, diagnostics }: ErrorModalProps) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connection Error</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>

          <Collapsible>
            <CollapsibleTrigger>Show Diagnostics</CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Related

- [01-api-integration-verification.md](./01-api-integration-verification.md) — `getApiBaseUrl()` consumer
- [03-common-issues.md](./03-common-issues.md) — Production env-var troubleshooting
