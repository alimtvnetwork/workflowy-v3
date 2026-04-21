# 5. Configuration

> **Parent:** [Session-Based Logging overview](./00-overview.md)

## 5.1 Config Schema

```json
{
  "logging": {
    "SessionLoggingEnabled": true,
    "ClearLogsOnStartup": false,
    "ClearSessionsOnStartup": false,
    "IncludeDelegatedServerInfo": true
  }
}
```

## 5.2 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SESSION_LOGGING_ENABLED | true | Enable/disable session logging |
| SESSION_RETENTION_DAYS | 7 | Days to retain sessions |
| SESSION_MAX_BODY_SIZE | 51200 | Max body capture in bytes |
| INCLUDE_DELEGATED_INFO | true | Capture delegated request data |
