# Common Issues and Solutions

> **Parent:** [00-overview.md](./00-overview.md)

## Issue: "Backend disconnected" but server is running

**Symptoms:**
- Go server logs show it's running
- Frontend shows "disconnected" or "connection failed"

**Check:**

1. **Is the API base URL correct?**
   ```typescript
   // Debug: Log the actual URL being called
   console.log('API URL:', getApiBaseUrl());
   ```

2. **Is there a CORS issue?**
   ```typescript
   // Browser console will show CORS errors
   // Check backend for proper CORS headers
   ```

3. **Is the response format correct?**
   ```typescript
   // Check raw response
   fetch('/api/v1/health')
     .then(r => r.text())
     .then(text => console.log('Raw response:', text));
   ```

4. **Is the frontend checking the right field?**
   ```typescript
   // ❌ Wrong: Checking body field for connection status
   const connected = data.status === 'ok';

   // ✅ Correct: Use HTTP status as primary indicator
   const connected = response.ok; // status 200-299
   ```

## Issue: API calls work in development but fail in production

**Symptoms:**
- Works on localhost:3000
- Fails when deployed

**Check:**

1. **Environment variables set correctly?**
   ```typescript
   // Add to production build process
   console.log('Build-time env:', {
     VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
     MODE: import.meta.env.MODE,
   });
   ```

2. **Relative vs absolute URLs?**
   ```typescript
   // ❌ May break in production
   fetch('http://localhost:8080/api/v1/health');

   // ✅ Better: Use relative URL or env var
   fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/health`);
   ```

3. **HTTPS in production, HTTP in dev?**
   ```typescript
   // Ensure WebSocket URL uses correct protocol
   const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
   ```

## Issue: State not updating after API call

**Symptoms:**
- API returns data successfully
- UI doesn't reflect new data

**Check:**

1. **Is state being set correctly?**
   ```typescript
   // Use React Query for automatic cache invalidation
   const queryClient = useQueryClient();

   const mutation = useMutation({
     mutationFn: updateData,
     onSuccess: () => {
       // Invalidate and refetch
       queryClient.invalidateQueries({ queryKey: ['data'] });
     },
   });
   ```

2. **Is the component re-rendering?**
   ```typescript
   // Debug: Add useEffect to track renders
   useEffect(() => {
     console.log('Component rendered with:', data);
   }, [data]);
   ```

## Issue: TypeScript errors with API responses

**Symptoms:**
- Type errors when accessing response data
- `Property 'x' does not exist on type`

**Solution:**

```typescript
// Define response types explicitly
interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

// Use type assertion with validation
function parseHealthResponse(data: unknown): HealthResponse {
  // Validate at runtime
  if (
    typeof data !== 'object' ||
    data === null ||
    !('status' in data) ||
    !('version' in data)
  ) {
    throw new Error('Invalid health response format');
  }

  return data as HealthResponse;
}

// Or use Zod for schema validation
import { z } from 'zod';

const HealthResponseSchema = z.object({
  status: z.string(),
  version: z.string(),
  timestamp: z.string(),
});

type HealthResponse = z.infer<typeof HealthResponseSchema>;

async function getHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/v1/health');
  const data = await response.json();

  return HealthResponseSchema.parse(data.data);
}
```

## Related

- [04-react-query.md](./04-react-query.md) — Cache invalidation patterns
- [08-error-boundary.md](./08-error-boundary.md) — Catching render-time errors
