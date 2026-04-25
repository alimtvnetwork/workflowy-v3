# Phase 2 — Filter Syntax (Query Grammar)

> **Version:** 1.0.0
> **Created:** 2026-04-21 (UTC+8)
> **Status:** ✅ Authored
> **Parent:** [`../00-overview.md`](../00-overview.md) (archived — see `_archive-v1/README.md`)
> **Sibling:** [`./01-overlay.md`](./01-overlay.md)
> **Screenshots:** img-41, img-42, img-43, img-44, img-58

---

## 1. Purpose

Defines the **complete grammar** of the query string typed into the Search Overlay. Covers every filter keyword, operator, value format, combination rule, and the parser's behavior on malformed input.

For the visual container, see [`./01-overlay.md`](./01-overlay.md). Parent overview at [`../00-overview.md`](../00-overview.md).

---

## 2. Top-level Grammar

```
query        := term (WS term)*
term         := filter | bareword | quoted-string | shortcut
filter       := keyword ":" value
keyword      := "date" | "date-before" | "date-after" | "day-of-week"
              | "changed" | "created"
              | "is" | "has" | "in"
              | "text" | "link" | "highlight"
value        := token | quoted-string | date-expr | enum
shortcut     := "me" | "others" | "today" | "tomorrow" | "@" identifier
bareword     := any non-whitespace, non-keyword string — matches against node text
quoted-string := "\"" any-char* "\""   (preserves whitespace, no syntax inside)
WS           := one or more spaces
```

**Combination rule:** Multiple terms are joined by **logical AND**. There is no `OR` operator at launch — each whitespace-separated term must match.

**Negation:** Prefix any term with `-` to negate it. Examples: `-is:complete`, `-text:draft`, `-@alice`.

**Case:** Keywords and enum values are **case-insensitive** (`Is:TODO` ≡ `is:todo`). Bareword/text matching is **case-insensitive** by default; wrap in quotes with leading `=` for case-sensitive (e.g. `="Exact Term"`).

---

## 3. Date Filters

### 3.1 `date:`

Matches nodes whose attached date equals the value.

| Value form | Meaning | Example |
|------------|---------|---------|
| `today` | Today (local timezone) | `date:today` |
| `tomorrow` | Tomorrow | `date:tomorrow` |
| `yesterday` | Yesterday | `date:yesterday` |
| `YYYY-MM-DD` | Exact date | `date:2026-04-21` |
| `YYYY-MM` | Whole month | `date:2026-04` |
| `YYYY` | Whole year | `date:2026` |
| `next-week` / `last-week` | Relative span | `date:next-week` |
| `this-month` / `next-month` / `last-month` | Calendar month relative to today | `date:this-month` |

### 3.2 `date-before:` and `date-after:`

Same value forms as `date:`, interpreted as **strict** < or > comparisons against the node's attached date.

```
date-after:2026-01-01 date-before:2026-07-01    → first half of 2026
date-after:today                                → all future-dated items
```

### 3.3 `day-of-week:`

Matches by weekday regardless of date.

| Value | Notes |
|-------|-------|
| `mon` … `sun` | Three-letter abbreviation, case-insensitive. |
| `weekday` | Mon–Fri. |
| `weekend` | Sat–Sun. |

Example: `date:this-month day-of-week:fri` → all Fridays in current month.

---

## 4. Activity Filters

### 4.1 `changed:`

Matches nodes whose **last-modified** timestamp falls in the given window.

Accepted values: same as `date:` plus **relative duration tokens**:

| Token | Meaning |
|-------|---------|
| `1d` / `7d` / `30d` | Within last N days. |
| `1w` / `4w` | Within last N weeks. |
| `1m` / `6m` | Within last N months. |
| `1y` | Within last year. |

Example: `changed:7d is:todo` → todos touched in the last week.

### 4.2 `created:`

Same value grammar as `changed:`, applied to creation timestamp.

```
created:2026-04 -is:complete    → April-created items still open
```

---

## 5. People Filters

### 5.1 `@identifier`

Matches nodes that **mention** the given user. Identifier is the user's handle (no email).

```
@alice                    → mentions Alice
@alice @bob               → mentions BOTH Alice AND Bob (AND, per § 2)
-@me                      → does NOT mention me
```

### 5.2 Shortcut: `me`

Bare token (no prefix) referring to the current user. Used inside other filters:

```
created:today text:report me     → reports created today, mentioning me
```

When `me` appears alone as a bareword, the parser auto-promotes it to `@me`.

### 5.3 Shortcut: `others`

Bareword expanding to "any user except `me`". Useful for `created:` scoping:

```
created:7d others    → items created in the last week by anyone but me
```

---

## 6. Structural Filters

### 6.1 `is:` (item state / type)

Single-value enum. Allowed values:

| Value | Matches |
|-------|---------|
| `todo` | Any to-do item, regardless of completion. |
| `complete` / `done` | Completed to-dos. (Aliases.) |
| `incomplete` / `open` | Uncompleted to-dos. (Aliases.) |
| `starred` | Starred items. |
| `shared` | Items with sharing enabled. |
| `mirror` | Mirror clones (only meaningful when overlay's "Include mirrors" toggle is On). |
| `template` | Template definitions. |
| `heading` | H1–H5 items. |

Example: `is:todo is:incomplete changed:7d` → unfinished to-dos touched this week.

### 6.2 `has:` (attached features)

| Value | Matches |
|-------|---------|
| `note` | Items with a note (sub-content beneath the bullet). |
| `date` | Items with an attached date. |
| `comment` | Items with at least one comment. |
| `link` | Items containing at least one URL. |
| `highlight` | Items containing highlighted text (any color). |
| `mention` | Items mentioning at least one user. |
| `child` / `children` | Items with at least one child node. (Aliases.) |

### 6.3 `in:` (location scope)

Restricts results to a subtree.

| Value form | Meaning | Example |
|------------|---------|---------|
| `home` | Search from app root. (Default scope.) | `in:home` |
| `inbox` | Inbox subtree only. | `in:inbox text:idea` |
| `drafts` / `mentions` / `trash` | Named special-node subtrees. | `in:drafts` |
| `«node-id»` | Specific node ID (opaque ULID). | `in:01HX3K9ZB7QR8VWMNPYTC4FE2D` |
| `current` | Currently focused node and its descendants. | `in:current` |

Multiple `in:` filters → union (the only OR-flavored exception, scoped to location).

---

## 7. Content Filters

### 7.1 `text:`

Restricts the bareword match to the **text body only**, ignoring notes/comments.

```
text:"quarterly review"     → exact phrase in node body
```

### 7.2 `link:`

Matches nodes containing a URL. Value forms:

| Value | Meaning |
|-------|---------|
| (empty) | Any URL. (Equivalent to `has:link`.) |
| `domain.com` | URL whose host matches the given domain (suffix match). |
| `"https://full/url"` | Exact URL match. |

```
link:github.com is:todo
```

### 7.3 `highlight:`

Matches nodes containing highlighted text.

| Value | Meaning |
|-------|---------|
| (empty) | Any highlight color. |
| Color name | Specific palette swatch (yellow, green, blue, pink, etc. — exact list deferred to Phase 5 color-palette spec). |

```
highlight:yellow text:risk
```

---

## 8. Standalone Shortcuts

These barewords are recognized without a `:` prefix:

| Shortcut | Expands to | Notes |
|----------|------------|-------|
| `today` | `date:today` | |
| `tomorrow` | `date:tomorrow` | |
| `me` | `@me` | See § 5.2. |
| `others` | (special — see § 5.3) | |

If a user actually wants to search for the literal word "today" in node text, they must quote it: `"today"`.

---

## 9. Combination Examples

| Query | Meaning |
|-------|---------|
| `is:todo is:incomplete @me` | My open todos. |
| `changed:1d in:inbox` | Inbox items touched in the last 24 h. |
| `date-after:today is:starred` | Future starred items. |
| `text:"sprint planning" -is:complete` | Active sprint-planning notes. |
| `@alice has:comment changed:30d` | Items mentioning Alice with comments, modified this month. |
| `in:drafts in:inbox text:idea` | Items containing "idea" in EITHER drafts OR inbox subtree. |

---

## 10. Parser Behavior

### 10.1 Tokenization

1. Split on top-level whitespace, respecting quoted strings.
2. For each token: detect leading `-` (negation flag), then attempt to match `keyword:value` pattern.
3. Unrecognized keywords fall back to bareword (whole token, including the `:`, is searched as plain text).

### 10.2 Error reporting

- **Malformed value** (e.g. `date:notadate`) → overlay shows inline error per `01-overlay.md` § 10. Last valid result set is preserved at 60% opacity.
- **Empty value** (e.g. `text:`) → ignored silently; treated as if the token were absent.
- **Unknown keyword** (e.g. `foo:bar`) → no error; entire token becomes a bareword search for `"foo:bar"`.

### 10.3 Whitespace inside values

Values cannot contain spaces unless quoted:
- `text:"long phrase here"` ✅
- `text:long phrase here` → only `long` is the value; rest become separate barewords.

---

## 11. Recent & Suggested Queries

The overlay surfaces query suggestions in two places (forward-reference: rendered per `./01-overlay.md` § 7.1):

| Source | Capacity | Lifetime |
|--------|----------|----------|
| Recent searches | Last 5 distinct committed queries | Persisted across sessions (per device, no sync). |
| Suggested filters | Static curated list | `is:todo`, `changed:1d`, `@me`, `has:comment`. |

A "Clear recent searches" link sits at the bottom of the recent list.

---

## 12. Out of Scope (Deferred)

| Item | Owning phase / reason |
|------|----------------------|
| `OR` operator | Post-v1. |
| Saved searches | Post-v1 (likely Phase 6 sidebar pin). |
| Regex / glob in values | Not planned. |
| Full-text indexing engine choice | Backend-runtime decision — deferred per memory rule. Spec only describes user-visible behavior. |

---

## 13. Cross-References

- [`./01-overlay.md`](./01-overlay.md) — visual container.
- [`./00-overview.md`](./00-overview.md) — phase overview.
- [`../../01-navbar/01-layout.md`](../../01-navbar/01-layout.md) § Right cluster — search input entry point.
- Forward-references: Phase 4 (bullet/comment), Phase 5 (highlight colors), Phase 6 (sidebar special nodes), Phase 8 (global hotkey binding).
