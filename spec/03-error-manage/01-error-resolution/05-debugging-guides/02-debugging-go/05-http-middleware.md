# HTTP Request Logging Middleware

> **Parent:** [00-overview.md](./00-overview.md)

```go
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        // Generate request ID
        requestId := r.Header.Get("X-Request-ID")

        if requestId == "" {
            requestId = uuid.New().String()
        }

        // Wrap response writer to capture status
        wrapped := &statusResponseWriter{ResponseWriter: w}

        // Add request ID to context
        ctx := context.WithValue(r.Context(), "request_id", requestId)

        // Set response header
        w.Header().Set("X-Request-ID", requestId)

        // Log request start
        log.Debug().
            Str("request_id", requestId).
            Str("method", r.Method).
            Str("path", r.URL.Path).
            Str("remote_addr", r.RemoteAddr).
            Msg("Request started")

        // Call next handler
        next.ServeHTTP(wrapped, r.WithContext(ctx))

        // Log request completion
        log.Info().
            Str("request_id", requestId).
            Str("method", r.Method).
            Str("path", r.URL.Path).
            Int("status", wrapped.status).
            Dur("duration", time.Since(start)).
            Msg("Request completed")
    })
}

type statusResponseWriter struct {
    http.ResponseWriter
    status int
}

func (w *statusResponseWriter) WriteHeader(status int) {
    w.status = status
    w.ResponseWriter.WriteHeader(status)
}
```

## Related

- [02-structured-logging.md](./02-structured-logging.md) — zerolog patterns used here
- [07-debug-commands-and-profiling.md](./07-debug-commands-and-profiling.md) — Request tracing extension
