# 00b — Split-DB Architecture Anchor (Normative)

> **Version:** 1.0.0
> **Updated:** 2026-04-30 (UTC+8) — created per F-AUD42-12 to provide a single citable anchor for split-DB scope.
> **Status:** ✅ Normative SSOT — every per-user-data feature/endpoint MUST cite this file (gate **G-23-DATA-ROUTER-API**, db-scope citation enforcement).
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Resolves:** F-AUD42-12 (Split-DB under-cited in `01-features/` and `06-endpoints/`)

---

## 1. Canonical Definitions

| Term | DB File | Scope | Owner | Lifetime |
|------|---------|-------|-------|----------|
| **Root DB** (`root.db`) | one per WordPress install | Cross-workspace identity, sessions, workspace registry, billing | Site admin | Install lifetime |
| **App DB** (`app-{workspace_id}.db`) | one per workspace | All per-workspace item data: nodes, mirrors, shares, trash, templates, search index, queue ledger | Workspace owner | Workspace lifetime |

**Hard rule (split-DB invariant):** No SQL statement may JOIN across `root.db` and any `app-*.db`. Cross-DB reads are performed at the application layer by sequential queries; cross-DB writes are forbidden in a single transaction (see ADR-0019 + F-AUD42-17 cross-DB template apply contract).

## 2. Scope Tags (use in feature/endpoint files)

(gate **G-24-DDL-SINGULAR-LOCKED**) Every feature/endpoint that touches data MUST declare its DB scope using one of:

- `[db-scope: root]` — touches only `root.db` (e.g., login, workspace switch)
- `[db-scope: app]` — touches only the active workspace's `app-{id}.db` (default for item operations)
- `[db-scope: cross-db]` — orchestrates both; MUST cite the cross-DB contract section (gate **G-24-DDL-SINGULAR-LOCKED**)

## 3. Citation Stanza (canonical, copy-paste)

The following block is the **canonical Database Scope stanza** every per-user-data feature/endpoint file MUST include (or an equivalent that names db-scope, the anchor, and the no-cross-DB-JOIN rule):

```markdown
## Database Scope

- **Anchor:** [`07-db-diagram/00b-split-db-anchor.md`](../07-db-diagram/00b-split-db-anchor.md)
- **Scope:** `[db-scope: app]` (or `root` / `cross-db`)
- **Tables:** {list app-DB tables touched}
- **Cross-DB JOINs:** forbidden (split-DB invariant). Cross-DB orchestration, if any, follows ADR-0019.
```

## 4. Gate

`[gate: G-DB-SCOPE-CITED]` — Hygiene gate `scripts/spec-hygiene/75-check-split-db-citations.mjs` (planned) MUST flag any feature/endpoint file under `spec/31-app/01-features/` or `spec/31-app/06-endpoints/` that handles per-user data and lacks a Database Scope stanza referencing this anchor. Excluded: pure UI/visual files (`02-personas.md`, `03-layout-structure.md`, `05a-hotkey-table.md`), index files (`00-overview.md`, `99-consistency-report.md`, `97*` fixtures), and gateway docs (`16-endpoint-at-matrix.md`).

## 5. Related ADRs

- ADR-0019 — Split-DB scope and cross-DB orchestration
- ADR-0023 — Loader↔queue contract (writes target app-DB only)
- ADR-0025 — SSE channels (per-app-DB stream only)

## 6. Keywords

`split-db` · `app-db` · `root-db` · `cross-db` · `scope-anchor` · `f-aud42-12`
