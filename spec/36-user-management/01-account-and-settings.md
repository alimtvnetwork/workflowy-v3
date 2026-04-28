# Account & Settings — Feature Reference (F5)

> **Version:** 1.0.0
> **Created:** 2026-04-28 (UTC+8)
> **Status:** Active — Workflowy product feature list, merged lossless
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Keywords

`user-management` · `account` · `settings` · `auth` · `mfa` · `referrals` · `theme` · `email-summary` · `labs` · `help` · `handbook` · `bug-report` · `delete-account` · `restore-from-backup`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ (parent) |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |
| AI Confidence (auto-backfill) | Medium |
| Ambiguity (auto-backfill) | Medium |

---

## AI Contract (inherits from parent)

This file is a **feature-reference appendix** to [`./00-overview.md`](./00-overview.md). It does not redefine the section's AI Contract; it enumerates the user-facing surfaces that the parent's *Expected AI Output* must implement. Each surface below maps to a planned `AT-USR-*` ID (added in P2).

---

## Workflowy Feature Reference (F5) — Account & Settings Surfaces

> **Source:** Workflowy product feature list, merged 2026-04-28 (lossless, additive). Reproduced verbatim. Backend-runtime decisions follow `mem://constraints/backend-runtime-deferred` (WordPress plugin + PHP 8.1 + SQLite + REST). Auth model follows the parent overview's RBAC matrix.

### 1. Settings Panel (root surface)

- **Settings Panel** — A single dialog (or full-screen view on narrow viewports) reached from the sidebar account chrome (avatar → *Settings*). The panel is organised as a left sub-nav with the categories listed below; each row links to a sub-panel rendered to the right. `⌘,`
- **Save Behaviour** — Every setting auto-saves on blur / toggle change; there is no global *Save* button. A transient `settings-save-toast` confirms each write.
- **Backend Contract** — All settings are stored in the `UserSetting` table (`UserId` + `Key` PK, `Value` TEXT JSON), exposed via `GET/PATCH /wp-json/workflowy/v1/me/settings` with the standard PascalCase envelope (`Status`, `Attributes`, `Results`).

### 2. Account & Identity

- **Set Password** — From *Account → Security*. Requires the current password to set a new one. Validates against the password policy in [`./00-overview.md`](./00-overview.md) FR-3. (component: `set-password-form`)
- **Change Email** — From *Account → Email*. Sends a confirmation link to the new address; the change is only persisted after the user clicks through. The previous email retains login access until confirmation succeeds. (component: `change-email-form`)
- **Multi-Factor Authentication** — From *Account → Security → MFA*. Supports TOTP (authenticator app, RFC 6238) and WebAuthn passkeys (per [`./00-overview.md`](./00-overview.md) FR-3). One TOTP secret + N passkeys per user. Recovery codes are generated once at enrolment; user must download/print before the dialog can close. (component: `mfa-enroll-dialog`)
- **Delete Account** — From *Account → Danger Zone*. Requires re-entering password + typing the literal phrase `delete my account`. On confirmation, the account is **soft-deleted** with a 30-day grace window matching trash retention (`mem://features/trash-logic`); login during grace cancels the deletion. After grace, a daily WP cron purges all `User` rows + cascaded `Item`/`Mirror`/`Share` rows. (component: `delete-account-dialog`)

### 3. Backups & Restore

- **Restore from Backup** — From *Account → Backup & Restore*. Lists the user's stored backups (one nightly snapshot, retained 30 days); selecting one shows a diff summary and a *Restore* button. Restore is destructive: it overwrites the current tree with the snapshot's state. A pre-restore safety snapshot is taken automatically and added to the top of the backup list. (component: `backup-restore-dialog`)
- **Export All** — Companion to Backup that downloads (rather than restores). One-click archive (zip) of Markdown + OPML + attachments manifest. Cross-link: [`spec/31-app/01-features/13-templates.md`](../31-app/01-features/13-templates.md) F4 appendix.

### 4. Personalization

- **Theme** — From *Settings → Appearance*. Choices: *System* (follow OS), *Light*, *Dark*. Selection writes the `Theme` user-setting and applies the corresponding `data-theme` attribute on `<html>`; the design system reads from CSS custom properties defined in [`spec/07-design-system/`](../07-design-system/00-overview.md). (component: `theme-picker`)
- **Daily Email Summary** — From *Settings → Notifications*. Toggle that subscribes the user to a daily digest email at a configurable local time (default 08:00). Digest contents: items dated for today, overdue to-dos, unread comments, recent shares received. Sent by a daily WP cron (`wp_schedule_event`). (component: `daily-summary-toggle`)
- **Workflowy Labs** — From *Settings → Labs*. A gated panel exposing experimental, non-stable features (per-feature toggle). Toggles are persisted as `Lab.<FeatureKey>` user-settings; absence = off. The Labs panel is the ONLY surface that may render unstable feature affordances; once a Lab graduates, its toggle is removed and the feature appears unconditionally. (component: `labs-panel`)

### 5. Growth

- **Referrals** — From *Settings → Referrals*. Generates a unique referral URL (`https://workflowy.app/r/<userId>`) and tracks how many sign-ups it produced. Each successful referral grants the inviter and the invitee a +1 month *Pro* credit (or equivalent per pricing model). Referrals view shows: shareable link with copy button, total signups, total credits earned. (component: `referrals-panel`)

### 6. Support & Documentation

- **Help** — From the sidebar account chrome → *Help*. Opens an in-app overlay with a search box that queries the bundled docs (see [`spec/08-docs-viewer-ui/`](../08-docs-viewer-ui/00-overview.md)) plus links to community/forum. (component: `help-overlay`, slash: `/help`)
- **Report a Bug** — From *Help → Report a Bug*. Opens a form pre-filled with: user agent, app version, last 50 console-log entries (sanitised), and the URL of the current item. On submit, posts to the feedback endpoint defined in [`spec/33-feedback-report/`](../33-feedback-report/00-overview.md). (component: `bug-report-form`)
- **Handbook Panel** — A persistent right-rail panel (collapsible) that shows context-aware tips drawn from the Workflowy Handbook. Visibility is per-user (toggle in *Settings → Appearance → Show Handbook Panel*). Content is fetched from the docs corpus rendered by [`spec/08-docs-viewer-ui/`](../08-docs-viewer-ui/00-overview.md). (component: `handbook-panel`)

---

## REST Surface Summary (planned)

All endpoints below use the canonical PascalCase envelope (`Status`, `Attributes`, `Results`; optional `Navigation`, `Errors`, `MethodsStack`) per [`spec/04-database-conventions/06-rest-api-format/`](../04-database-conventions/06-rest-api-format/00-overview.md). Concrete fixtures land in P3.

| Endpoint | Method | Purpose | Surface |
|---|---|---|---|
| `/wp-json/workflowy/v1/me/settings` | GET, PATCH | Read/write all user settings as a flat key-value map | §1, §4, §5 |
| `/wp-json/workflowy/v1/me/password` | POST | Change password (requires current) | §2 Set Password |
| `/wp-json/workflowy/v1/me/email/request-change` | POST | Begin email change (sends confirmation) | §2 Change Email |
| `/wp-json/workflowy/v1/me/email/confirm/{token}` | GET | Complete email change | §2 Change Email |
| `/wp-json/workflowy/v1/me/mfa/enroll` | POST | Begin TOTP/passkey enrolment | §2 MFA |
| `/wp-json/workflowy/v1/me/mfa/recovery-codes` | POST | Regenerate recovery codes | §2 MFA |
| `/wp-json/workflowy/v1/me/account` | DELETE | Initiate soft-delete (30-day grace) | §2 Delete Account |
| `/wp-json/workflowy/v1/me/backups` | GET | List nightly backup snapshots | §3 |
| `/wp-json/workflowy/v1/me/backups/{id}/restore` | POST | Restore from snapshot (auto-safety snapshot first) | §3 |
| `/wp-json/workflowy/v1/me/referrals` | GET | Referral URL + stats | §5 |
| `/wp-json/workflowy/v1/me/help/search?q=…` | GET | Docs search proxy | §6 Help |
| `/wp-json/workflowy/v1/feedback` | POST | Bug report submission | §6 Report a Bug |

> **Reconciliation note (F7 candidate):** every endpoint above MUST appear in the canonical endpoint matrix at [`spec/31-app/06-endpoints/`](../31-app/06-endpoints/00-overview.md). Cross-checked by `scripts/spec-hygiene/29-check-endpoint-matrix-coverage.mjs` (planned coverage extension under P6).

---

## Acceptance-Criteria Stub

Concrete `AT-USR-*` rows land in this section's `97-acceptance-criteria.md` during P2 (I/O table conversion). Each surface above contributes at least one row:

| Surface | Planned AT-USR-* range |
|---|---|
| Settings Panel + auto-save | AT-USR-01..02 |
| Set Password / Change Email / MFA / Delete Account | AT-USR-03..08 |
| Restore from Backup / Export All | AT-USR-09..10 |
| Theme / Daily Email Summary / Labs | AT-USR-11..13 |
| Referrals | AT-USR-14 |
| Help / Report a Bug / Handbook Panel | AT-USR-15..17 |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | [`./00-overview.md`](./00-overview.md) |
| RBAC matrix | [`./00-overview.md`](./00-overview.md) §Roles & Permissions |
| Sharing model | [`mem://features/sharing-model`](mem://features/sharing-model) |
| Trash retention (drives delete-account grace) | [`mem://features/trash-logic`](mem://features/trash-logic) |
| Feedback ingestion | [`../33-feedback-report/00-overview.md`](../33-feedback-report/00-overview.md) |
| Activity audit | [`../34-activity-feed/00-overview.md`](../34-activity-feed/00-overview.md) |
| Docs corpus (Help, Handbook) | [`../08-docs-viewer-ui/00-overview.md`](../08-docs-viewer-ui/00-overview.md) |
| Design tokens (Theme) | [`../07-design-system/00-overview.md`](../07-design-system/00-overview.md) |
| REST envelope | [`../04-database-conventions/06-rest-api-format/00-overview.md`](../04-database-conventions/06-rest-api-format/00-overview.md) |
| Backend runtime constraint | [`mem://constraints/backend-runtime-deferred`](mem://constraints/backend-runtime-deferred) |

---

## Related

**In this section:**

- [`./00-overview.md`](./00-overview.md) — Parent overview (RBAC, security notes)
- [`./97-acceptance-criteria.md`](./97-acceptance-criteria.md) — `AT-USR-*` IDs (filled in P2)

**See also:**

- [`../31-app/01-features/13-templates.md`](../31-app/01-features/13-templates.md) — Export, Print, Presentation, Fractal Comments (F4)
- [`../31-app/01-features/08-share-dialog.md`](../31-app/01-features/08-share-dialog.md) — Sharing UX (F4)
