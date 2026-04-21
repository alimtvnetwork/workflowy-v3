# 5. Timing Output & Exit Codes

> **Parent:** [00-overview.md](./00-overview.md)

---

## Timing Output

The script tracks time for each step:

```
========================================
  WP Plugin Publish - Build & Run Script
========================================

[1/5] Pulling latest changes from git...
  ✓ Git pull complete
  ⏱ 1.2s

[2/5] Checking prerequisites...
  ✓ Go found: go version go1.21.0 windows/amd64
  ✓ Node.js found: v20.10.0
  ✓ pnpm found: 8.12.0
  ⏱ 0.3s

[3/5] Installing dependencies (pnpm PnP)...
  Store path: .pnpm-store
  ✓ Dependencies installed
  ⏱ 5.2s

[4/5] Building React frontend...
  Running pnpm build...
  ✓ Frontend built successfully
  ⏱ 12.5s

[5/5] Starting Go backend...
========================================
  WP Plugin Publish starting...
  Open: http://localhost:8080
  Press Ctrl+C to stop
  Build time: 19.2s
========================================
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Prerequisites installation failed |
| 2 | pnpm install failed |
| 3 | pnpm build failed |
| 4 | Go run failed |
| 5 | Config file not found |
| 6 | Config validation failed |
