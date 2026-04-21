# Suggestions — Filesystem Contract

> **Version:** 1.0.0
> **Updated:** 2026-04-21
> **Status:** Authoritative. Supersedes the consolidated `.lovable/suggestions.md` (now an index pointer).

---

## Convention

One file per suggestion under `.lovable/memory/suggestions/`.

### Filename

```
NN-slug.md
```

- `NN` — zero-padded sequential id (`01`, `02`, …). **Never reuse** an id.
- `slug` — kebab-case, ≤6 words, descriptive.

> Earlier Lovable proposals used `YYYYMMDD-HHMMSS-suggestion-<slug>.md`. We use `NN-slug.md` instead because:
> 1. it matches the existing `01-name.md` project convention (codified in `user-preferences`);
> 2. ids are stable across timezones;
> 3. order in the filesystem matches order of creation without parsing dates.
>
> Timestamps live **inside** the file (`createdAt` field).

### Required frontmatter / fields

Each file MUST contain (in this order):

```markdown
# SNN — <Title>

- **suggestionId:** SNN
- **createdAt:** YYYY-MM-DD (UTC+8)
- **source:** Lovable | User | Audit
- **affectedProject:** WorkFlowy
- **affectedArea:** <spec folder, code path, or "Process">
- **status:** open | inProgress | done
- **priority:** Critical | High | Medium | Low

## Description
…

## Rationale
…

## Proposed Change
…

## Acceptance Criteria
- [ ] …
- [ ] …

## Completion Notes
*(filled in when status flips to `done`)*
```

### Status transitions

| From | To | Trigger |
|------|----|---------|
| `open` | `inProgress` | Lovable starts work |
| `inProgress` | `done` | All acceptance criteria checked |
| `open` / `inProgress` | (deleted) | User rejects (also add to `.lovable/strictly-avoid.md`) |

### Completion handling

- Flip `status: done` and fill `Completion Notes`.
- **Move** the file into `./completed/` (preserves history; keeps the active folder small).
- Update the index table in this README.

### Index (active suggestions)

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [S01](./01-workflowy-spec-consolidation.md) | Workflowy spec consolidation (10-phase) | High | inProgress |
| [S02](./02-fix-spec-31-36-audit-findings.md) | Fix 5 audit findings in spec 31–36 | Medium | open |
| [S03](./03-fix-49-broken-relative-links.md) | Fix 49 broken relative links | Low | open |
| [S04](./04-ci-gate-overview-and-consistency.md) | CI gate: require overview + consistency report | Medium | open |
| [S05](./05-ci-gate-broken-relative-links.md) | CI gate: fail on broken relative links | Medium | open |
| [S06](./06-move-parallel-spec-folders.md) | Move parallel 22/23/24 into 31-app/ | Low | open |

### Completed

See [`./completed/`](./completed/) — `SC001-frontend-gap-analysis.md` and any future archived items.

---

## Why a single file per suggestion (not one tracker file)

| Benefit | Detail |
|---------|--------|
| **Diffable** | Git history shows exactly when each suggestion changed |
| **Scalable** | A 50-suggestion tracker becomes unreadable; 50 files stay clean |
| **Atomic** | Two AIs editing different suggestions never conflict |
| **Indexable** | The README table above is regenerable from frontmatter |

The user's stored preference for "consolidated files" still applies to **plan.md** and **strictly-avoid.md** — but suggestions scale better as per-file. The `user-preferences` memory was updated this session to reflect this carve-out.
