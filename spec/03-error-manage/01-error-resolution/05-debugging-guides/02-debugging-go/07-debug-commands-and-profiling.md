# Debugging Commands, Profiling, and Request Tracing

> **Parent:** [00-overview.md](./00-overview.md)

## Debugging Commands

### Check if server is running

```bash
# Check process
ps aux | grep "cli-name"

# Check port
lsof -i :8080
netstat -tlnp | grep 8080
```

### Test endpoints

```bash
# Health check
curl -s http://localhost:8080/api/v1/health | jq .

# With verbose output
curl -v http://localhost:8080/api/v1/health

# Check response headers
curl -I http://localhost:8080/api/v1/health
```

### Enable debug logging

```bash
# Set environment variable
export DEBUG=true
./cli-name serve

# Or pass flag
./cli-name serve --debug
```

### Check logs

```bash
# If using file logging
tail -f logs/app.log

# If using journald (systemd)
journalctl -u cli-name -f

# Filter by level
journalctl -u cli-name -f | grep -E '"level":"error"'
```

## Performance Profiling

### Enable pprof

```go
import _ "net/http/pprof"

func main() {
    // Expose pprof on separate port
    go func() {
        log.Info().Msg("pprof available at http://localhost:6060/debug/pprof/")
        http.ListenAndServe("localhost:6060", nil)
    }()

    // ... rest of server setup
}
```

### Collect profiles

```bash
# CPU profile (30 seconds)
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# Heap profile
go tool pprof http://localhost:6060/debug/pprof/heap

# Goroutine profile
go tool pprof http://localhost:6060/debug/pprof/goroutine
```

## Request Tracing Pattern

```go
// Add trace ID to all logs for a request
func (h *Handler) ProcessRequest(w http.ResponseWriter, r *http.Request) {
    traceId := r.Header.Get("X-Trace-ID")

    if traceId == "" {
        traceId = uuid.New().String()
    }

    logger := log.With().
        Str("trace_id", traceId).
        Str("operation", "process_request").
        Logger()

    logger.Info().Msg("Starting request processing")

    // Step 1
    logger.Debug().Msg("Step 1: Validating input")

    if err := h.validateInput(r); err != nil {
        logger.Error().Err(err).Msg("Validation failed")
        respondError(w, http.StatusBadRequest, 4001, "Invalid input", err)

        return
    }

    // Step 2
    logger.Debug().Msg("Step 2: Processing data")
    result, err := h.processData(r.Context())

    if err != nil {
        logger.Error().Err(err).Msg("Processing failed")
        respondError(w, http.StatusInternalServerError, 5001, "Processing error", err)

        return
    }

    logger.Info().Msg("Request completed successfully")
    respondSuccess(w, result)
}
```

## Related

- [02-structured-logging.md](./02-structured-logging.md) — zerolog setup
- [05-http-middleware.md](./05-http-middleware.md) — Middleware-level request IDs
