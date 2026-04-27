# Phase 24 — Local WordPress Development Harness

> **Version:** 1.0.0
> **Created:** 2026-04-27 (UTC+8)
> **Status:** Active — closes AUDIT-AI-01 (CRITICAL, +6 pts)
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Related:** [`./09-testing-patterns/03-bootstrap.md`](./09-testing-patterns/03-bootstrap.md), [`./22-quick-start.md`](./22-quick-start.md)

---

## Keywords

`local-dev` · `wp-env` · `harness` · `vite-proxy` · `sqlite` · `cors` · `seed-data`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` parent | ✅ |
| AI Confidence | High |
| Ambiguity | Low |
| Keywords present | ✅ |
| Scoring table | ✅ |
| Acceptance criteria inline | ✅ |

---

## 1. Purpose

A fresh AI session implementing the WorkFlowy WP plugin **MUST** be able to spin up a working WordPress + SQLite + REST environment in under 5 minutes, with a Vite frontend that talks to it without CORS errors or proxy hallucinations.

This document is the **Single Source of Truth** for:
- Which dev-harness tool is canonical (`@wordpress/env`).
- The exact `.wp-env.json` shape, port assignments, and PHP version.
- Vite proxy configuration that points to the harness (no guessing).
- SQLite drop-in setup (WordPress is MySQL-by-default — SQLite needs the official drop-in).
- Seeded demo data for E2E testing.

> **Why this exists:** Without it, AI assistants will (1) try to write `vite.config.ts` proxies pointing at `localhost:8080` when the harness is on `:8888`, (2) hallucinate Docker Compose files, (3) attempt to run WordPress on raw `php -S` which doesn't load `wp-config.php` correctly, and (4) waste hours fighting CORS.

---

## 2. Canonical Stack

| Layer | Tool | Version | Reason |
|-------|------|---------|--------|
| Container orchestration | **`@wordpress/env`** | `^10.0.0` | Official WP-team tool. Wraps Docker. Handles plugin/theme mounting. |
| WordPress core | latest stable | `6.5+` | Pinned via `.wp-env.json` `core` field. |
| PHP | **8.1** | exact | Matches production constraint (`mem://constraints/backend-runtime-deferred`). |
| Database | **SQLite** | via `sqlite-database-integration` plugin | Matches production. **Not MySQL.** See §5. |
| Frontend dev server | Vite | `5.4.x` (pinned) | Already in `mem://architecture/tech-stack`. |
| Node | `20.x` LTS | for `wp-env` CLI |

**Forbidden alternatives** (do not propose these):
- ❌ Local by Flywheel — opaque, no scriptable bring-up.
- ❌ MAMP / XAMPP — manual config drift.
- ❌ `php -S` standalone — doesn't load WP rewrite rules.
- ❌ Lando / DDEV — not the WP-team standard, drifts from prod.
- ❌ Docker Compose hand-rolled — `@wordpress/env` already does this correctly.

---

## 3. File Layout

```
project-root/
├── .wp-env.json              ← harness config (committed)
├── .wp-env.override.json     ← optional per-dev (gitignored)
├── vite.config.ts            ← proxy → :8888
├── plugin/                   ← the WP plugin source (mounted into harness)
│   ├── workflowy.php
│   └── src/
└── tools/
    ├── seed-demo.php         ← idempotent seeder (§7)
    └── reset-db.sh           ← wipe + reseed
```

---

## 4. Canonical `.wp-env.json`

```json
{
  "core": "WordPress/WordPress#6.5",
  "phpVersion": "8.1",
  "plugins": [
    "./plugin",
    "https://downloads.wordpress.org/plugin/sqlite-database-integration.latest-stable.zip"
  ],
  "port": 8888,
  "testsPort": 8889,
  "config": {
    "WP_DEBUG": true,
    "WP_DEBUG_LOG": true,
    "WP_DEBUG_DISPLAY": false,
    "SCRIPT_DEBUG": true,
    "DB_ENGINE": "sqlite",
    "WP_ENVIRONMENT_TYPE": "local"
  },
  "mappings": {
    "wp-content/db.php": "./node_modules/@wordpress/sqlite-database-integration/db.copy"
  }
}
```

**Port contract** — these are not negotiable; downstream code (Vite proxy, E2E tests, runbooks) hard-codes them:

| Port | Service |
|------|---------|
| `8888` | WordPress dev (frontend + REST) |
| `8889` | WordPress tests instance (PHPUnit, Playwright) |
| `5173` | Vite dev server (default) |

---

## 5. SQLite Drop-In Activation

WordPress core targets MySQL. SQLite support comes from the official `sqlite-database-integration` plugin which ships a `db.copy` file that **must** be copied (not symlinked, not required) into `wp-content/db.php`. The `mappings` block in §4 does this automatically on `wp-env start`.

**Verification** — after `npx wp-env start`:

```bash
npx wp-env run cli wp db query "SELECT sqlite_version();"
# expected: a version string like "3.40.x", NOT a MySQL error
```

If you see `Error establishing a database connection`, the drop-in did not load. Re-run `npx wp-env destroy && npx wp-env start`.

---

## 6. Canonical `vite.config.ts` Proxy Block

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // WP REST API — all plugin endpoints live under this namespace
      "/wp-json": {
        target: "http://localhost:8888",
        changeOrigin: true,
        secure: false,
      },
      // SSE stream — disable buffering, long timeout
      "/wp-json/workflowy/v1/sync/stream": {
        target: "http://localhost:8888",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("X-Accel-Buffering", "no");
          });
        },
        timeout: 0, // never timeout SSE
      },
    },
  },
});
```

**Why hard-coded `:8888`** — `.wp-env.json` `port` is `8888`. AI must NOT guess `:8080`, `:80`, or `:8000`. If a developer overrides via `.wp-env.override.json`, they must also update `vite.config.ts` — this is documented in `22-quick-start.md`.

---

## 7. Seeded Demo Data

A bare WP install gives you zero items. E2E tests and the 250-item virtualization budget require a populated tree.

### 7.1 Canonical Seed Script (`tools/seed-demo.php`)

Writes 217 items across all 12 `ItemType` values, with realistic depth (max 6 levels), 3 mirror pairs, 2 shared workspaces, and 5 trash entries.

**Invariants the seeder MUST satisfy** (assertable):

| Invariant | Value |
|-----------|-------|
| Total items | exactly 217 |
| Distinct `ItemType` values present | all 12 from `mem://features/core-mechanics` |
| Max nesting depth | 6 |
| Mirror pairs (`mirror` items pointing at real items) | 3 |
| Shared workspace count | 2 (one public, one invited-user-only) |
| Trash entries | 5 (oldest 28 days, newest 1 day — for trash retention test) |
| Idempotency | re-running produces no duplicates (uses fixed UUIDs derived from a seed integer) |

### 7.2 Invocation

```bash
npx wp-env run cli wp eval-file tools/seed-demo.php
# expected output: "Seed complete: 217 items, 3 mirrors, 2 shares, 5 trashed."
```

### 7.3 Reset

```bash
./tools/reset-db.sh
# = wp-env destroy && wp-env start && wp eval-file tools/seed-demo.php
```

---

## 8. Five-Minute Bring-Up (Operator Runbook)

```bash
# 1. Prereqs
node -v   # ≥ 20.x
docker -v # any recent
git clone <repo> && cd <repo>

# 2. Install
npm install        # pulls @wordpress/env + @wordpress/sqlite-database-integration
bun install        # frontend deps

# 3. Boot WP + SQLite
npx wp-env start   # ~90s on first run (image pull); ~10s thereafter

# 4. Seed
npx wp-env run cli wp eval-file tools/seed-demo.php

# 5. Boot frontend
bun run dev        # Vite on :5173

# 6. Verify
curl http://localhost:8888/wp-json/workflowy/v1/ping
# expected: {"Status":"ok","Attributes":{},"Results":{"pong":true}}

open http://localhost:5173
# expected: outliner shows 217 seeded items
```

**Failure mode catalogue** — when each step fails, what to do:

| Step | Symptom | Fix |
|------|---------|-----|
| 3 | `port 8888 already in use` | `lsof -ti:8888 \| xargs kill -9` then retry |
| 3 | drop-in error | `npx wp-env destroy && npx wp-env start` |
| 4 | `wp: command not found` | always prefix with `npx wp-env run cli` |
| 5 | CORS error in browser console | confirm Vite proxy block §6 is present |
| 6 | `404` on ping | plugin not activated: `npx wp-env run cli wp plugin activate workflowy` |

---

## 9. CI Integration

GitHub Actions workflow uses the **same** `.wp-env.json`:

```yaml
- run: npm ci
- run: npx wp-env start
- run: npx wp-env run cli wp eval-file tools/seed-demo.php
- run: bun run test:e2e
```

No separate "CI config" — the harness is the only source of truth.

---

## 10. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| `AT-HARNESS-01` | `npx wp-env start` brings up WP on `:8888` with SQLite drop-in active in ≤ 120 s on a clean machine. |
| `AT-HARNESS-02` | `wp db query "SELECT sqlite_version();"` returns a SQLite version, not a MySQL error. |
| `AT-HARNESS-03` | `tools/seed-demo.php` is idempotent: running twice produces exactly 217 items, not 434. |
| `AT-HARNESS-04` | Seeded DB contains all 12 `ItemType` values (assertable via `wp db query`). |
| `AT-HARNESS-05` | Vite proxy on `:5173` forwards `/wp-json/*` to `:8888` with no CORS errors in browser console. |
| `AT-HARNESS-06` | SSE proxy block disables `X-Accel-Buffering` (verifiable via `curl -I http://localhost:5173/wp-json/workflowy/v1/sync/stream`). |
| `AT-HARNESS-07` | `tools/reset-db.sh` returns the DB to seeded state in ≤ 30 s. |
| `AT-HARNESS-08` | CI uses the **same** `.wp-env.json` — no parallel "ci-only" config exists in the repo. |

---

## 11. Cross-References

| Topic | Link |
|-------|------|
| Backend runtime decision | [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) |
| Quick start (operator-facing) | [`./22-quick-start.md`](./22-quick-start.md) |
| PHPUnit bootstrap | [`./09-testing-patterns/03-bootstrap.md`](./09-testing-patterns/03-bootstrap.md) |
| SSE PHP implementation (paired) | [`../31-app/05-conventions/32-sse-php-implementation.md`](../31-app/05-conventions/32-sse-php-implementation.md) |
| Audit closure | [`../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md`](../18-spec-issues/12-ai-readiness-audit-round-4-2026-04-27.md) §AUDIT-AI-01 |
