# 1. RBAC Architecture

> **Parent:** [00-overview.md](./00-overview.md)

---

## Scope Levels

The RBAC system can be implemented at three levels depending on your application architecture:

| Level | Scope | Database Location | Use Case |
|-------|-------|-------------------|----------|
| **Root Level** | Global across all apps | `data/rbac.db` | Multi-tenant platform |
| **App Level** | Scoped to single app | `data/{appName}/rbac.db` | Single-application isolation |
| **Company Level** | Scoped to company within app | `data/{appName}/companies/{companySlug}/rbac.db` | Enterprise multi-tenant |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CASBIN RBAC ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐        │
│   │    ROOT LEVEL      │    │     APP LEVEL      │    │   COMPANY LEVEL    │        │
│   │   data/rbac.db     │    │ data/{app}/rbac.db │    │ data/{app}/co/     │        │
│   │                    │    │                    │    │ {company}/rbac.db  │        │
│   └─────────┬──────────┘    └─────────┬──────────┘    └─────────┬──────────┘        │
│             │                         │                         │                    │
│             └─────────────────────────┴─────────────────────────┘                    │
│                                       │                                              │
│                                       ▼                                              │
│                         ┌─────────────────────────┐                                  │
│                         │     CasbinRule Table    │                                  │
│                         ├─────────────────────────┤                                  │
│                         │ Id, Ptype, V0-V5        │                                  │
│                         │ ─────────────────────── │                                  │
│                         │ p, alice, data1, read   │  ← Policy                       │
│                         │ g, alice, admin         │  ← Role Assignment              │
│                         │ g2, admin, superadmin   │  ← Role Hierarchy               │
│                         └─────────────────────────┘                                  │
│                                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                          REQUEST FLOW                                        │   │
│   │                                                                              │   │
│   │   User Request ──▶ Middleware ──▶ Casbin Enforce() ──▶ Allow/Deny           │   │
│   │                         │                                                    │   │
│   │                         ▼                                                    │   │
│   │              Load policies from SQLite                                       │   │
│   │              Match against model rules                                       │   │
│   │              Return authorization result                                     │   │
│   │                                                                              │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```
