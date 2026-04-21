# Resolved Product Decisions

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

These items have been confirmed:

1. **Tags**: Tags have BOTH inline `#hashtag` parsing AND a dedicated tag picker UI (accessible from context menu and hover actions). Tags are a Phase 3 feature alongside sidebar navigation.
2. **Public share links**: Public links allow view-only access. Edit/admin permissions require invited-user sharing with explicit grants.
3. **Free tier limits**: The cap is exactly 250 items, enforced server-side. Configurable per-environment is a future admin feature.
4. **Command palette**: Mirrors every menu action for keyboard-first users. All actions available in menus are also available via ⌘K.
5. **Comments**: Comments open in a right-side slide-in panel (~360px) with full threaded display, user avatars, timestamps, and resolve toggle. See Frontend spec §3.10.
6. **Archive strategy**: Manual only — users explicitly archive branches via context menu. No auto-archive by inactivity date.
7. **Database architecture**: SQLite — see coding guidelines (04) for naming conventions.

---
