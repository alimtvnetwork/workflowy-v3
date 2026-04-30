# Submission Flow — Sub-Spec

> **Version:** 1.0.0 — authored 2026-04-30
> **Owner section:** `spec/33-feedback-report/`
> **Status:** Draft (P1 — load-bearing for `AT-FEEDBACKREPORT-05..08` and gates `G-33-SF-*`).
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Sibling (consumed):** [`./01-data-model.md`](./01-data-model.md) — schema, enums, Diagnostics shape

---

## AI Contract

**Purpose** — Define the **end-to-end submission flow** from Navbar entry point to server persistence: form composition, client-side validation, optional screenshot capture, diagnostics auto-attachment, optimistic UI, retry behavior, and the single REST endpoint contract.

**Audience** — Frontend engineer building the form + Navbar entry; backend engineer authoring `EP-FEEDBACK-CREATE`.

**Expected AI Output** —
- `src/features/feedback/FeedbackButton.tsx` (Navbar entry)
- `src/features/feedback/FeedbackForm.tsx` (Dialog + form fields)
- `src/features/feedback/captureDiagnostics.ts` (pure function, clock-injected)
- `src/features/feedback/captureScreenshot.ts` (consent-gated, opaque blob upload)
- `src/features/feedback/submitFeedback.ts` (single egress, action-tier per ADR-0023)
- `wp-plugin/includes/Rest/FeedbackController.php` — `POST /feedback` (`EP-FEEDBACK-CREATE`)

**Out of Scope** —
- Schema, enums, transition matrix → [`./01-data-model.md`](./01-data-model.md)
- Admin inbox & status transitions → [`./03-admin-review-ui.md`](./03-admin-review-ui.md)
- Retention purge → [`./04-retention-and-export.md`](./04-retention-and-export.md)

**Definition of Done** —
- `AT-FEEDBACKREPORT-05..08` (Navbar entry, validation, optimistic close, retry-on-fail) all pass.
- Submission never blocks the editor thread (verified by perf assertion).
- `node scripts/spec-hygiene/00-run-all.mjs` exits 0.

---

## Navbar Entry (FR-1)

| Invariant | Gate |
|---|---|
| The Feedback button is rendered in `<NavbarPrimary>`, slot `right-cluster`, position penultimate (immediately left of user-menu) | `G-33-SF-NAVBAR-SLOT` |
| Reachable from **every** authenticated route — no per-route mount | `G-33-SF-GLOBAL-MOUNT` |
| Icon: `MessageSquare` from `lucide-react` (per Core: lucide is sole icon source; no emoji glyphs) | `G-33-SF-LUCIDE-ICON` |
| Keyboard shortcut: `Mod+Shift+/` opens the dialog (registered through global hotkey registry, not inline `addEventListener`) | `G-33-SF-HOTKEY-REGISTRY` |
| Button is rendered inside `<NavbarBoundary>` (one of the 8 named error boundaries per ADR-0017) — a crash MUST NOT take down the navbar | `G-33-SF-BOUNDARY-NAMED` |

> **Forbidden:** floating-action-button (FAB) overlays, in-route inline buttons, "shake-to-report" gestures, or any entry point that bypasses the global Navbar mount.

---

## Form Composition

The form is a shadcn/Radix `<Dialog>` (per Core: shadcn+Radix is sole component base) containing four controlled fields backed by **the same Zod schema** that gates the server (imported from `feedback.schema.ts`, the SSOT defined in `./01-data-model.md`).

| Field | Component | Validation (client + server, identical) | Gate |
|---|---|---|---|
| `FeedbackType` | `<RadioGroup>` with 4 options | One of `Bug`/`Idea`/`Praise`/`Question` | `G-33-DM-ENUM-CLOSED` |
| `Title` | `<Input>` | 1..120 chars, trimmed | `G-33-DM-LENGTH-MIRROR` |
| `Body` | `<Textarea>`, 6 rows | 1..2000 chars, trimmed | `G-33-DM-LENGTH-MIRROR` |
| `IncludeScreenshot` | `<Checkbox>` (default unchecked) | Boolean — explicit opt-in (consent-gated) | `G-33-SF-SCREENSHOT-OPT-IN` |

| Invariant | Gate |
|---|---|
| Form state lives in a single `useReducer` (not 4 `useState`s) — keeps re-renders predictable | `G-33-SF-SINGLE-REDUCER` |
| Submit button is disabled while `formState.status === 'submitting'` AND any field is invalid | `G-33-SF-DISABLE-WHILE-PENDING` |
| Character counters render only when `length > 0.8 * max` — avoids visual noise | `G-33-SF-COUNTER-THRESHOLD` |
| Field errors render via `<FormMessage>` adjacent to the field — never via a global toast | `G-33-SF-INLINE-ERRORS` |
| Dialog is dismissible via `Esc` AND backdrop click only when `formState.status !== 'submitting'` (prevents lost-typing) | `G-33-SF-DISMISS-GUARD` |

---

## Diagnostics Capture (FR-3)

`captureDiagnostics({ clock, router, errorBoundaryRegistry })` is a **pure function** that returns a `Diagnostics` object (validated by the `.strict()` Zod schema from [`./01-data-model.md`](./01-data-model.md)).

| Invariant | Gate |
|---|---|
| Pure function — no side effects, no `Date.now()`, no `window.location` (all dependencies injected per ADR-0027) | `G-33-SF-DIAG-PURE` |
| `RouteHref` is the current router path with **query string stripped** before capture (PII-defense-in-depth) | `G-33-DM-ROUTE-NO-QUERY` |
| `BreadcrumbPath` is derived from the route loader's mirror snapshot — never re-fetched | `G-33-SF-DIAG-FROM-MIRROR` |
| `LastErrorBoundary` is read from the named-boundary registry (one of the 8 per ADR-0017), not from a global `window.__lastError` | `G-33-SF-LAST-BOUNDARY-FROM-REGISTRY` |
| `OfflineQueueDepth` is read from the FIFO queue per ADR-0023 (action-tier read; never triggers a fetch) | `G-33-SF-QUEUE-DEPTH-LOCAL` |
| Capture latency p95 ≤ **8 ms** (must fit inside the 16 ms loader budget if the form mounts mid-navigation) | `G-33-SF-CAPTURE-BUDGET` |

> **Forbidden in Diagnostics capture:** reading `localStorage`/`sessionStorage` (forbidden anyway per ADR-0021); accessing `document.cookie`; calling any network endpoint; reading `navigator.geolocation`.

---

## Screenshot Capture (Opt-In)

| Invariant | Gate |
|---|---|
| Capture is **opt-in only** — `IncludeScreenshot` defaults to `false`; checkbox label includes the words "Attach a screenshot of the current view" | `G-33-SF-SCREENSHOT-OPT-IN` |
| Capture uses the browser's `getDisplayMedia` or canvas snapshot of the visible viewport — **never** the full document or off-screen content | `G-33-SF-SCREENSHOT-VIEWPORT-ONLY` |
| Captured image MUST be downscaled to ≤1280 px on the longest edge and re-encoded as WebP quality 0.7 before upload | `G-33-SF-SCREENSHOT-DOWNSCALE` |
| Image bytes are uploaded via a **separate** `POST /feedback/screenshot` returning an opaque `ScreenshotBlobRef` token; the main feedback row stores only the token (per `G-33-DM-NO-INLINE-BLOB`) | `G-33-SF-SCREENSHOT-TWO-PHASE` |
| If screenshot upload fails, the feedback submission MUST still proceed without the screenshot (degrade gracefully); user is told via inline `<FormMessage>` | `G-33-SF-SCREENSHOT-DEGRADE` |

---

## Submission — Single Egress

`submitFeedback(payload)` is the **sole** action-tier function that writes a `FeedbackReport`. Per the loader↔queue contract (ADR-0023), it writes the local mirror + queue entry in **one IDB transaction**, and the queue worker is the sole egress to the server.

```ts
async function submitFeedback(input: FeedbackInput, deps: SubmitDeps): Promise<FeedbackReportId> {
  const validated = FeedbackInputSchema.parse(input);                 // throws on invalid
  const diagnostics = captureDiagnostics(deps);
  const optimisticId = deps.idGen.next() as FeedbackReportId;
  await deps.idb.tx(['FeedbackReportMirror', 'Queue'], 'readwrite', async tx => {
    tx.objectStore('FeedbackReportMirror').add({ ...validated, FeedbackReportId: optimisticId, Status: 'New', SubmittedAt: deps.clock.nowIso() });
    tx.objectStore('Queue').add({ Verb: 'feedback.create', Payload: { ...validated, Diagnostics: diagnostics }, EnqueuedAt: deps.clock.nowIso() });
  });
  return optimisticId;
}
```

| Invariant | Gate |
|---|---|
| `submitFeedback` is the sole writer of `FeedbackReportMirror` rows (no other module may `add`/`put` to that store) | `G-33-SF-SOLE-WRITER` |
| Mirror write + Queue write happen in **one** IDB transaction (loader↔queue atomicity per ADR-0023) | `G-33-SF-ATOMIC-MIRROR-QUEUE` |
| The function MUST return within **50 ms** p95 (does not await network) — measured by the action-perf harness | `G-33-SF-OPTIMISTIC-BUDGET` |
| Network call to `/feedback` is performed by the **queue worker** only — never inside `submitFeedback` | `G-33-SF-NO-INLINE-FETCH` |
| Optimistic IDs are sentinel-tagged (`opt_` prefix on the underlying string before branding) and reconciled when the server returns the canonical `FeedbackReportId` | `G-33-SF-OPTIMISTIC-RECONCILE` |

---

## REST Endpoint — `EP-FEEDBACK-CREATE`

```
POST /feedback
Content-Type: application/json
Authorization: Bearer <session>

Request envelope:
{
  "Status": "Request",
  "Attributes": {
    "FeedbackType": "Bug",
    "Title": "...",
    "Body": "...",
    "ScreenshotBlobRef": "blob_…" | null,
    "Diagnostics": { … strict shape per 01-data-model.md … }
  }
}

Response envelope (201 Created):
{
  "Status": "Ok",
  "Attributes": { "FeedbackReportId": 1234 },
  "Results":    { "FeedbackReportId": 1234, "SubmittedAt": "2026-04-30T12:34:56Z" },
  "Navigation": { "Self": "/feedback/1234" }
}
```

| Invariant | Gate |
|---|---|
| Envelope uses PascalCase keys with mandatory `Status`/`Attributes`/`Results` per ADR-0004/0019 | `G-04-API-ENVELOPE-PASCAL` |
| Server re-validates the entire payload with the **same Zod schema** as the client (no trust of client validation) | `G-33-SF-SERVER-REVALIDATE` |
| Rate limit: **10 submissions per user per hour** (HTTP 429 with `Retry-After`) | `G-33-RATE-LIMIT` |
| Idempotency: client supplies `Idempotency-Key` header (= optimistic ID); server stores it for 24 h and short-circuits duplicate submissions to the original `FeedbackReportId` | `G-33-SF-IDEMPOTENCY-KEY` |
| Endpoint MUST return the canonical `FeedbackReportId` in `Results.FeedbackReportId` so the optimistic ID can be reconciled | `G-33-RECEIPT` |

---

## Retry Behavior

| Condition | Action | Gate |
|---|---|---|
| Network offline (`navigator.onLine === false`) at submit | Queue worker holds the entry; UI shows toast "Saved locally — will sync when online" | `G-33-SF-OFFLINE-DEGRADE` |
| Server returns 5xx | Queue worker retries with exponential backoff (1s, 2s, 4s, 8s, max 30s), up to 8 attempts | `G-33-SF-BACKOFF` |
| Server returns 4xx (other than 429) | Entry is moved to a dead-letter store; user is shown a non-blocking toast with `Retry` and `Discard` actions | `G-33-SF-DEAD-LETTER` |
| Server returns 429 | Worker honours `Retry-After`; UI shows toast "Slow down — try again in N seconds" | `G-33-RATE-LIMIT` |

> **Forbidden:** silent retries that never surface failure to the user; spinning a retry loop without backoff; retrying 4xx errors automatically (would mask validation bugs).

---

## Acceptance Criteria (Bound Here)

| AT id | Given | When | Then | Negative |
|---|---|---|---|---|
| `AT-FEEDBACKREPORT-05` | User is on any authenticated route | They press `Mod+Shift+/` | The Feedback dialog opens, focused on the `FeedbackType` radio group | A non-authenticated user pressing the same shortcut MUST NOT see the dialog (no Navbar mount) |
| `AT-FEEDBACKREPORT-06` | Form has `Title=""` (empty) | User clicks Submit | Submit button is disabled; inline `<FormMessage>` reads "Title is required" | NO toast is shown for inline validation errors |
| `AT-FEEDBACKREPORT-07` | Valid form, `navigator.onLine === true` | User clicks Submit | Dialog closes within 50 ms; toast reads "Sent — thanks!" with `Undo` (5s window) | Dialog MUST NOT remain open spinning while awaiting the network |
| `AT-FEEDBACKREPORT-08` | Valid form, server returns 503 once then 201 | User clicks Submit | Dialog closes optimistically; queue worker retries with 1 s backoff; success toast appears after second attempt | UI MUST NOT show a "Failed" error during the retry window |

Fixtures live in [`./97a-acceptance-criteria-fixtures.md`](./97a-acceptance-criteria-fixtures.md) (rows `at-feedbackreport-05..08`). Test names: `at_feedback_report_05_navbar_hotkey`, `at_feedback_report_06_inline_validation`, `at_feedback_report_07_optimistic_close`, `at_feedback_report_08_retry_5xx`.

---

## Gate Bindings (12 new gates, namespace `G-33-SF-*`)

| Gate id | MUST | Tier |
|---|---|---|
| `G-33-SF-NAVBAR-SLOT` | Button rendered in `<NavbarPrimary>` `right-cluster` slot | DOC |
| `G-33-SF-GLOBAL-MOUNT` | Reachable from every authenticated route via single global mount | CI (mount-graph check) |
| `G-33-SF-LUCIDE-ICON` | Icon is `MessageSquare` from `lucide-react` | DOC |
| `G-33-SF-HOTKEY-REGISTRY` | `Mod+Shift+/` registered through global hotkey registry, not inline | CI (grep for inline `addEventListener('keydown'`) |
| `G-33-SF-BOUNDARY-NAMED` | Button wrapped in `<NavbarBoundary>` (one of 8 per ADR-0017) | DOC |
| `G-33-SF-SCREENSHOT-OPT-IN` | Screenshot capture defaults to OFF; explicit opt-in checkbox | DOC |
| `G-33-SF-DIAG-PURE` | `captureDiagnostics` is pure with injected deps (clock, router, registry) | CI (no-side-effects lint) |
| `G-33-SF-CAPTURE-BUDGET` | Capture latency p95 ≤ 8 ms | CI (perf harness) |
| `G-33-SF-SOLE-WRITER` | Only `submitFeedback` writes to `FeedbackReportMirror` | CI (import-graph check) |
| `G-33-SF-ATOMIC-MIRROR-QUEUE` | Mirror + Queue write in one IDB tx | DOC |
| `G-33-SF-NO-INLINE-FETCH` | No `fetch` to `/feedback/*` outside the queue worker | CI (grep) |
| `G-33-SF-SERVER-REVALIDATE` | Server re-validates with the same Zod schema | DOC |

(Full 18-gate list incl. `G-33-SF-DISMISS-GUARD`, `G-33-SF-OPTIMISTIC-RECONCILE`, `G-33-SF-IDEMPOTENCY-KEY`, `G-33-SF-OFFLINE-DEGRADE`, `G-33-SF-BACKOFF`, `G-33-SF-DEAD-LETTER` registered in [`spec/_GATE-REGISTRY.md`](../_GATE-REGISTRY.md) under `G-33-SF-*`.)

---

## Anti-Pattern Table

| Anti-pattern | Why it fails | Gate violated |
|---|---|---|
| Floating-action button overlay instead of Navbar slot | Bypasses 8-boundary architecture; covers content | `G-33-SF-NAVBAR-SLOT` |
| `submitFeedback` awaits the `/feedback` POST before resolving | Blocks editor thread; breaks 50 ms optimistic budget | `G-33-SF-NO-INLINE-FETCH` |
| Inline `addEventListener('keydown', …)` for the shortcut | Bypasses central hotkey registry; conflict-detection broken | `G-33-SF-HOTKEY-REGISTRY` |
| Capturing screenshot without explicit user checkbox | Privacy violation; consent breach | `G-33-SF-SCREENSHOT-OPT-IN` |
| Storing screenshot bytes in the same POST body | Bloats request; hits intermediary size limits | `G-33-SF-SCREENSHOT-TWO-PHASE` |
| `captureDiagnostics()` reads `Date.now()` directly | Untestable; clock cannot be faked in tests | `G-33-SF-DIAG-PURE` |
| Server trusts client-validated payload, skips Zod re-parse | Forgery vector; closed-enum invariant breached | `G-33-SF-SERVER-REVALIDATE` |
| Auto-retrying 4xx errors with backoff | Masks validation bugs; spams server | `G-33-SF-DEAD-LETTER` |

---

## Cross-References

| Reference | Location |
|---|---|
| Data model (schema, enums, Diagnostics shape) | [`./01-data-model.md`](./01-data-model.md) |
| Admin review (consumes submitted rows) | [`./03-admin-review-ui.md`](./03-admin-review-ui.md) *(pending)* |
| Loader↔queue contract | ADR-0023 |
| Named error boundaries (8) | ADR-0017 |
| Clock injection | ADR-0027 |
| API envelope | ADR-0004 / ADR-0019 |
| `localStorage` forbidden | ADR-0021 |

---

*Sub-spec v1.0.0 — second of 4 in `33-feedback-report/` cluster — 2026-04-30*
