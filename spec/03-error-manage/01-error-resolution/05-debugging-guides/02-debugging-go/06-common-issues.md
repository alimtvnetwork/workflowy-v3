# Common Issues and Solutions

> **Parent:** [00-overview.md](./00-overview.md)

## Issue: "Connection refused" on startup

**Symptoms:**
- Server appears to start but clients can't connect
- Health check returns "connection refused"

**Check:**
1. Is the server binding to the correct address?
   ```go
   // ❌ Wrong - only localhost
   server.Addr = "localhost:8080"

   // ✅ Correct - all interfaces
   server.Addr = ":8080"
   ```

2. Is the port already in use?
   ```bash
   lsof -i :8080
   ```

3. Is there a firewall blocking the port?

## Issue: 404 on API base URL

**Symptoms:**
- `GET /api/v1` returns 404
- Frontend shows "Backend disconnected"

**Check:**
1. Is there a handler for the base URL?
   ```go
   // Add index route
   r.Get("/api/v1", h.Index)
   r.Get("/api/v1/health", h.Health)
   ```

2. Is the router prefix correct?
   ```go
   r.Route("/api/v1", func(r chi.Router) {
       r.Get("/", h.Index)     // Handles /api/v1
       r.Get("/health", h.Health)
   })
   ```

## Issue: Response format mismatch

**Symptoms:**
- Backend returns 200 OK
- Frontend still shows "disconnected"

**Check:**
1. Is the response using the standard envelope?
   ```go
   // ❌ Wrong
   json.NewEncoder(w).Encode(map[string]string{"status": "ok"})

   // ✅ Correct
   respondSuccess(w, map[string]string{"status": "ok"})
   ```

2. Does the frontend expect the correct structure?
   - Check frontend detection logic
   - Verify it uses HTTP status codes (2xx) as primary indicator

## Issue: CORS errors

**Symptoms:**
- Browser console shows CORS errors
- Requests work from curl but not browser

**Solution:**
```go
func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        origin := r.Header.Get("Origin")

        w.Header().Set("Access-Control-Allow-Origin", origin)
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
        w.Header().Set("Access-Control-Allow-Credentials", "true")

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusOK)

            return
        }

        next.ServeHTTP(w, r)
    })
}
```

## Issue: Database "locked" errors

**Symptoms:**
- SQLite returns "database is locked"
- Concurrent requests fail

**Solution:**
```go
// Configure connection pool for SQLite
db.SetMaxOpenConns(1)  // SQLite only supports one writer
db.SetMaxIdleConns(1)
db.SetConnMaxLifetime(time.Hour)

// Use WAL mode for better concurrency
_, err := db.Exec("PRAGMA journal_mode=WAL")
```

## Related

- [04-health-check.md](./04-health-check.md) — Health endpoint diagnosis
- [08-database-stack-traces.md](./08-database-stack-traces.md) — Database error patterns
