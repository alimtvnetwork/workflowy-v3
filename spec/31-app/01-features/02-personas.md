# Target User Personas

> **Version:** 2.0.0
> **Updated:** 2026-04-19
> **Parent:** [00-overview.md](./00-overview.md)
> **Template:** [13-feature-file-template.md](../../01-spec-authoring-guide/13-feature-file-template.md)

---

## Overview

This file defines the three target personas for WorkFlowy. Personas are not a runtime feature — they're a design contract every other feature must satisfy. The five mandatory template sections below reframe the personas as inputs to feature decisions, the outputs (success criteria) they expect, the edge cases each persona surfaces, and the acceptance tests + component contract that prove the app meets their needs.

## User Story

As a product designer, I want a single source of truth for who the app is for, so that every feature decision can be tested against concrete persona success criteria.

---

### 0.1 Primary Persona — The Structured Thinker
- **Who**: Knowledge workers, project managers, writers, and students aged 22–45 who organize ideas, tasks, and projects through hierarchical outlines.
- **Pain point**: Existing tools are either too rigid (spreadsheets, Trello) or too unstructured (plain notes). They want infinite depth without UI clutter.
- **Goal**: Capture and restructure thoughts instantly with keyboard-first interaction, then share selectively with collaborators.

### 0.2 Secondary Persona — The Team Collaborator
- **Who**: Small team leads (2–10 people) who share project outlines, meeting notes, or task boards with teammates.
- **Pain point**: Shared documents lose structure. They need view/edit permissions on subtrees without exposing the full workspace.
- **Goal**: Share a branch of their outline with controlled permissions, receive comments, and keep everything synced.

### 0.3 Tertiary Persona — The Quick Capture User
- **Who**: Anyone who needs a low-latency scratchpad (≤500 ms cold-open to first keystroke) — developers jotting TODOs, students capturing lecture notes, writers brainstorming.
- **Pain point**: Apps take too long to open or require too many clicks to start writing.
- **Goal**: Open the app and start typing immediately. Organize later.

---

## Inputs

These are the persona attributes every feature MUST consider when making design decisions.

| Field | Type | Source | Required | Notes |
|-------|------|--------|----------|-------|
| `personaId` | `'structured-thinker' \| 'team-collaborator' \| 'quick-capture'` | Design intent | Yes | Used when prioritizing trade-offs |
| `primaryDevice` | `'desktop' \| 'tablet' \| 'mobile'` | Persona profile | Yes | Structured/Collaborator: desktop. Quick Capture: mobile-first |
| `inputModality` | `'keyboard' \| 'touch' \| 'mixed'` | Persona profile | Yes | Structured: keyboard. Quick Capture: touch. Collaborator: mixed |
| `expectedSubtreeDepth` | `number` | Persona profile | Yes | Structured: ≥10. Collaborator: ≤5. Quick Capture: ≤3 |
| `collaboratorCount` | `number` | Persona profile | Yes | Structured: 0–2. Collaborator: 2–10. Quick Capture: 0 |
| `sessionLength` | `'long' \| 'short' \| 'micro'` | Persona profile | Yes | Structured: long (>15 min). Collaborator: medium. Quick Capture: micro (<2 min) |

## Outputs

The success criteria each persona expects from the app.

| Output | Persisted? | Channel | Notes |
|--------|-----------|---------|-------|
| Time-to-first-bullet (Quick Capture) | ❌ | Performance metric | Target: <500 ms from app open to typing |
| Keyboard-only navigation (Structured) | ❌ | Interaction support | 100% of actions reachable without mouse |
| Subtree share with role (Collaborator) | ✅ SQLite | `shares` table | Per-subtree, per-role grant |
| Comment thread on item (Collaborator) | ✅ SQLite | `comments` table | Threaded, source-bound |
| Infinite-depth render (Structured) | ✅ SQLite | `items` table | No UI cap on nesting depth |
| Mobile-first quick-add (Quick Capture) | ❌ | UI affordance | Always-visible "+" on mobile |

## Edge Cases

1. Structured Thinker reaches 20+ levels of nesting — UI must remain readable; horizontal scroll allowed but indent visual must compress gracefully.
2. Collaborator shares a subtree, then a teammate moves an item out of it — the moved item loses access; toast notifies the actor.
3. Quick Capture user opens the app offline on mobile — app must still accept input and queue per `mem://features/offline-resilience`.
4. Structured Thinker pastes a 5,000-line markdown outline — paste must chunk, render incrementally, and not block the main thread > 100 ms.
5. Collaborator with View access tries to edit — UI must visibly disable edit affordances, not just block on save.
6. Quick Capture user types while sync is failing — input must never be lost; queued locally with a visible pending indicator.
7. Collaborator and another user edit the same item simultaneously — LWW per `08-share-dialog.md` + future M-4 concurrency spec.
8. Structured Thinker zooms 10 levels deep then refreshes — URL must preserve zoom state for direct return.
9. Quick Capture user creates an item then immediately closes the app — change must be persisted within 1.5 s autosave window.
10. Collaborator revokes access to a subtree mid-edit on the recipient's tab — recipient sees "Access removed" toast; subtree unmounts.

## Acceptance Tests

| ID | Given | When | Then | testid |
|----|-------|------|------|--------|
| AT-PERSONAS-01 | Quick Capture persona, cold app load | User clicks app icon | Editable cursor available within 500 ms | `app-ready-marker` |
| AT-PERSONAS-02 | Structured Thinker persona | User performs every documented action via keyboard only | All actions complete without mouse input | `keyboard-action-coverage` |
| AT-PERSONAS-03 | Collaborator persona, shared subtree | User invites a teammate at Edit role | Teammate sees the subtree with Edit affordances enabled | `share-user-row` |
| AT-PERSONAS-04 | Structured Thinker, 20-level nested item | View renders | All 20 levels visible without UI overflow breaking content | `bullet-item` |
| AT-PERSONAS-05 | Collaborator with View access | User attempts to edit content | Contenteditable is disabled; tooltip "View access only" | `view-only-affordance` |
| AT-PERSONAS-06 | Quick Capture user offline | User types into a new item | Item saved to local queue; pending badge visible | `offline-pending-badge` |
| AT-PERSONAS-07 | Structured Thinker pastes 5,000-line markdown | Paste happens | Main thread blocked < 100 ms per chunk; paste completes incrementally | `paste-progress` |
| AT-PERSONAS-08 | Structured Thinker zoomed 10 levels deep | User refreshes browser | URL restores exact zoom state | `zoom-breadcrumb` |
| AT-PERSONAS-09 | Quick Capture user creates item then closes tab within 2 s | Tab closes | On reopen the item is present (autosave within 1.5 s window) | `bullet-item` |
| AT-PERSONAS-10 | Collaborator viewing a shared subtree | Owner revokes access in another tab | Subtree unmounts; toast "Access removed" appears | `access-removed-toast` |

## Component Contract

These are app-wide affordances that exist specifically to satisfy persona requirements.

| Surface | Component path | `data-testid` | Acceptance tests |
|---------|---------------|---------------|------------------|
| App-ready performance marker | `src/lib/perf/AppReadyMarker.ts` | `app-ready-marker` | AT-PERSONAS-01 |
| Keyboard action registry | `src/hooks/useKeyboardActions.ts` | `keyboard-action-coverage` | AT-PERSONAS-02 |
| Shared-user row | `src/components/share/SharedUsersList.tsx` | `share-user-row` | AT-PERSONAS-03 |
| Bullet item (deep nesting) | `src/components/items/BulletItem.tsx` | `bullet-item` | AT-PERSONAS-04, 09 |
| View-only affordance wrapper | `src/components/items/ViewOnlyAffordance.tsx` | `view-only-affordance` | AT-PERSONAS-05 |
| Offline pending badge | `src/components/items/PendingBadge.tsx` | `offline-pending-badge` | AT-PERSONAS-06 |
| Paste progress indicator | `src/components/feedback/PasteProgress.tsx` | `paste-progress` | AT-PERSONAS-07 |
| Zoom breadcrumb (URL-restorable) | `src/components/navbar/Breadcrumbs.tsx` | `zoom-breadcrumb` | AT-PERSONAS-08 |
| Access-removed toast | `src/components/feedback/InfoToast.tsx` | `access-removed-toast` | AT-PERSONAS-10 |

> **Note:** Components are planned paths — none exist yet. Feeds the global component-contract map (M-3).

---

## Related

- [01-information-model.md](./01-information-model.md) — data model that supports all three personas
- [05-interactions.md](./05-interactions.md) — keyboard-first interaction surface (Structured Thinker)
- [08-share-dialog.md](./08-share-dialog.md) — sharing surface (Team Collaborator)
- [10-today-view.md](./10-today-view.md) — quick-capture-friendly daily view (Quick Capture)
- `mem://design/workflowy-model` — core aesthetic + UX inspiration
- `mem://features/offline-resilience` — offline behavior every persona depends on
