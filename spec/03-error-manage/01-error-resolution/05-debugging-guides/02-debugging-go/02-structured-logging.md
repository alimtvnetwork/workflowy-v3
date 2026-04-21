# Structured Logging with zerolog

> **Parent:** [00-overview.md](./00-overview.md)

## Logger Setup

```go
package logger

import (
    "os"
    "time"

    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
)

func Init(debug bool) {
    // Human-readable output for development
    if debug {
        log.Logger = log.Output(zerolog.ConsoleWriter{
            Out:        os.Stderr,
            TimeFormat: time.RFC3339,
        })
        zerolog.SetGlobalLevel(zerolog.DebugLevel)

        return
    }

    // JSON output for production
    zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
    zerolog.SetGlobalLevel(zerolog.InfoLevel)
}
```

## Logging Levels

| Level | Usage | Example |
|-------|-------|---------|
| `Trace` | Extremely detailed, usually off | Loop iterations |
| `Debug` | Development information | Variable values, flow |
| `Info` | Normal operation | Server started, request completed |
| `Warn` | Recoverable issues | Retry attempts, deprecation |
| `Error` | Failures requiring attention | Database error, API failure |
| `Fatal` | Unrecoverable, exits program | Config missing, port in use |

## Logging Patterns

```go
// Simple message
log.Info().Msg("Server started")

// With fields
log.Info().
    Str("method", r.Method).
    Str("path", r.URL.Path).
    Int("status", status).
    Dur("duration", time.Since(start)).
    Msg("Request completed")

// With error
log.Error().
    Err(err).
    Str("operation", "database_query").
    Str("table", "settings").
    Msg("Failed to execute query")

// Contextual logger
reqLogger := log.With().
    Str("request_id", requestId).
    Str("user_id", userId).
    Logger()
reqLogger.Info().Msg("Processing request")
```

## Related

- [05-http-middleware.md](./05-http-middleware.md) — Request-scoped contextual logger
- [07-debug-commands-and-profiling.md](./07-debug-commands-and-profiling.md) — Enabling debug mode
