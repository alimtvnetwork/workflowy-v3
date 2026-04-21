# WebSocket Debugging

> **Parent:** [00-overview.md](./00-overview.md)

## Connection State Tracking

```typescript
function useWebSocket(url: string) {
  const [state, setState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log(`WebSocket connecting to: ${url}`);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setState('connected');
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      setState('disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message:', event.data);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { state, ws: wsRef.current };
}
```

## Related

- [02-environment-diagnostics.md](./02-environment-diagnostics.md) — `getWebSocketUrl()` resolution
- [06-console-logging.md](./06-console-logging.md) — Structured WebSocket event logging
