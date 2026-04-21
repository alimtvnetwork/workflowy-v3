# 11.10 Decision Matrix — PHP Templates vs. React

> **Parent:** [00-overview.md](./00-overview.md)

Before implementing the frontend, the developer must decide:

```
┌─────────────────────────────────────────────────────────┐
│  Does the admin UI need complex interactivity?          │
│  (drag-and-drop, real-time updates, shared state)       │
│                                                         │
│  YES → Confirm React with developer → §11.7–§11.9      │
│  NO  → Use PHP templates + partials → §11.2–§11.6      │
│                                                         │
│  HYBRID is also valid:                                  │
│  PHP templates for simple pages (settings, logs)        │
│  React for complex pages (dashboard, visual editors)    │
└─────────────────────────────────────────────────────────┘
```

**The AI must ask the developer before choosing React.** Never default to React without explicit confirmation.

---

## 11.11 Summary Table

| Aspect | Pattern | Reference |
|--------|---------|-----------|
| File size limits | 50–100 ideal, 200 max | [§11.1](./01-file-size-limits.md) |
| Page templates | Orchestrator — set variables, include partials | [§11.3](./03-page-templates-orchestrator.md) |
| Partials | Self-contained, documented variables, max 100 lines | [§11.4](./04-partial-templates.md) |
| Shared partials | `partials/shared/` for cross-page reuse | [§11.2](./02-template-architecture.md), [§11.5](./05-when-to-extract-a-partial.md) |
| Traditional JS/CSS | Per-page files in `assets/css/` and `assets/js/` | [§11.6](./06-traditional-js-css.md) |
| React (optional) | `frontend/` source → `assets/dist/` build output | [§11.7](./07-react-integration.md) |
| Source maps | Dev: included; Production: excluded | [§11.8](./08-source-maps-and-build.md) |
| React enqueuing | `AdminReactAssetsTrait` with `wp-element` dependency | [§11.9](./09-react-asset-enqueuing.md) |
| Decision | Developer must confirm React before implementation | §11.10 |
