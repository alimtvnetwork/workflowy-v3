# Version Flow

> **Parent:** [00-overview.md](./00-overview.md)

---

## Decision diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CW CONFIG VERSION FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  config.seed.json                                                        │
│  ┌─────────────────────────────────────────┐                             │
│  │ {                                       │                             │
│  │   "Version": "1.2.0",                   │ ← Source of truth           │
│  │   "Categories": { ... }                 │                             │
│  │ }                                       │                             │
│  └──────────────────┬──────────────────────┘                             │
│                     │                                                    │
│                     ▼                                                    │
│  ┌─────────────────────────────────────────┐                             │
│  │        Version Change Detected?          │                             │
│  └──────────────────┬──────────────────────┘                             │
│                     │                                                    │
│         ┌───────────┴───────────┐                                        │
│         │                       │                                        │
│         ▼                       ▼                                        │
│   ┌───────────┐          ┌───────────────┐                               │
│   │    NO     │          │     YES       │                               │
│   │ Skip Seed │          │ Merge + Seed  │                               │
│   └───────────┘          └───────┬───────┘                               │
│                                  │                                        │
│                                  ▼                                        │
│                          ┌───────────────┐                               │
│                          │ Update        │                               │
│                          │ CHANGELOG.md  │                               │
│                          └───────────────┘                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Rule

On every app boot:

1. Load `config.seed.json` and parse `Version`.
2. Compare against `ConfigMeta.SeedVersion` in DB.
3. If equal → **skip seed entirely** (no-op).
4. If seed version is greater → **merge new settings** (do not overwrite existing user values), then append to `CHANGELOG.md`.
5. If seed version is lower → reject (config rollback not allowed; bump seed version instead).

See [05-go-implementation.md](./05-go-implementation.md) for the canonical `SeedWithVersionCheck` implementation.
