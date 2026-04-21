# Initialization Order (CRITICAL)

> **Parent:** [00-overview.md](./00-overview.md)

Go CLI services follow a strict initialization order to prevent runtime errors:

1. **STEP 1: Configuration** — Load environment variables and config files FIRST
2. **STEP 2: Directories** — Ensure all required directories exist
3. **STEP 3: Database** — Initialize database connections (Split DB pattern)
4. **STEP 4: Services** — Initialize business logic services
5. **STEP 5: HTTP Server** — Start the server ONLY AFTER all dependencies are ready

```go
func main() {
    // Step 1: Configuration
    cfg, err := config.Load()

    if err != nil {
        log.Fatal().Err(err).Msg("Failed to load configuration")
    }

    // Step 2: Directories
    if err := ensureDirectories(cfg); err != nil {
        log.Fatal().Err(err).Msg("Failed to ensure directories")
    }

    // Step 3: Database
    db, err := database.Connect(cfg.DatabasePath)

    if err != nil {
        log.Fatal().Err(err).Msg("Failed to connect to database")
    }

    defer db.Close()

    // Step 4: Services
    svc := services.New(db, cfg)

    // Step 5: HTTP Server
    server := api.NewServer(svc)
    log.Info().Int("port", cfg.Port).Msg("Starting server")
    log.Fatal().Err(server.ListenAndServe()).Msg("Server stopped")
}
```

## Related

- [02-structured-logging.md](./02-structured-logging.md) — Logger setup used in step 1
- [04-health-check.md](./04-health-check.md) — Verify boot sequence completed
