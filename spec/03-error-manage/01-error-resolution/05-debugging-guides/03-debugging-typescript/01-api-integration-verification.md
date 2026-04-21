# API Integration Verification (CRITICAL)

> **Parent:** [00-overview.md](./00-overview.md)

## Endpoint Existence Check

Before implementing any API call, ALWAYS verify:

```typescript
// ❌ WRONG: Assuming endpoint exists
const response = await fetch('/api/v1/health');

// ✅ CORRECT: Verify endpoint exists in backend first
// 1. Check backend router: Is /api/v1/health registered?
// 2. Check handler: Does the handler return expected format?
// 3. Then implement frontend
```

## Response Format Verification

```typescript
// Standard response envelope (ALL backends must use this)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: string;
  };
}

// Correct detection logic
async function fetchWithValidation<T>(url: string): Promise<T> {
  const response = await fetch(url);

  // Primary indicator: HTTP status code (not response body!)
  if (!response.ok) {
    const body = await response.json() as ApiResponse<never>;

    throw new ApiError(
      body.error?.code ?? response.status,
      body.error?.message ?? `HTTP ${response.status}`
    );
  }

  const body = await response.json() as ApiResponse<T>;

  // Secondary check: success field
  if (!body.success) {
    throw new ApiError(
      body.error?.code ?? 0,
      body.error?.message ?? 'Unknown error'
    );
  }

  return body.data!;
}
```

## Connection Status Detection

```typescript
// Health check implementation
interface HealthStatus {
  connected: boolean;
  version?: string;
  latency?: number;
  error?: string;
}

async function checkHealth(baseUrl: string): Promise<HealthStatus> {
  const start = Date.now();

  try {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
      method: HttpMethod.Get,
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    // Use HTTP status as PRIMARY indicator
    if (!response.ok) {
      return {
        connected: false,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      connected: true,
      version: data.data?.version,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

## Related

- [02-environment-diagnostics.md](./02-environment-diagnostics.md) — Diagnose URL resolution
- [03-common-issues.md](./03-common-issues.md) — Disconnect troubleshooting
