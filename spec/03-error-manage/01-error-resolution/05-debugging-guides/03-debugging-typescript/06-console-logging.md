# Console Logging Best Practices

> **Parent:** [00-overview.md](./00-overview.md)

## Structured Logging

```typescript
// Logger utility
const logger = {
  debug: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, data ?? '');
    }

  },

  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data ?? '');
  },

  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data ?? '');
  },

  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error ?? '');
  },

  api: (method: string, url: string, status: number, duration: number) => {
    const emoji = status >= 400 ? '❌' : '✅';
    console.log(`${emoji} [API] ${method} ${url} → ${status} (${duration}ms)`);
  },
};

// Usage
logger.api('GET', '/api/v1/health', 200, 45);
logger.error('Failed to fetch settings', error);
```

## Request/Response Logging

```typescript
// API client with logging
async function apiRequest<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const start = Date.now();

  logger.debug(`Request: ${method} ${url}`, body);

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    const duration = Date.now() - start;

    logger.api(method, url, response.status, duration);
    logger.debug(`Response:`, data);

    if (!response.ok) {
      throw new ApiError(data.error?.code ?? response.status, data.error?.message);
    }

    return data.data;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`Request failed: ${method} ${url} (${duration}ms)`, error);

    throw error;
  }
}
```

## Related

- [07-browser-devtools.md](./07-browser-devtools.md) — Filtering structured logs in DevTools
- [01-api-integration-verification.md](./01-api-integration-verification.md) — Underlying fetch pattern
