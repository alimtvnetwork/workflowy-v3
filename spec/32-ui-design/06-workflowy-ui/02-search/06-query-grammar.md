# 06 — Query Grammar

> **Version:** 2.0.0 · **Created:** 2026-04-23 (UTC+8) · **Status:** ✅ Authored
> **Parent:** [`./00-overview.md`](./00-overview.md)
> **Screenshots:** img-42, img-43

---

## Purpose

Define the **complete query grammar** (EBNF), enumerate every keyword and its value format, specify combination semantics (AND / negation / `in:` union exception), and provide a test-vector table any implementer can use as a parser conformance suite.

---

## 1. EBNF

```
Query        := WS? Term (WS Term)* WS?
Term         := Negated | Token | FreeText
Negated      := "-" Token
Token        := KeyValue | Mention | Standalone
KeyValue     := Key ":" Value
Key          := "date" | "date-before" | "date-after" | "day-of-week"
              | "changed" | "created"
              | "is" | "has" | "in"
              | "text" | "link" | "highlight"
Mention      := "@" UserHandle
Standalone   := "me" | "others"
              | "today" | "tomorrow" | "yesterday"
              | "this-week" | "next-week" | "last-week"
              | "this-month" | "next-month" | "last-month"
Value        := QuotedString | UnquotedAtom
QuotedString := '"' { CHAR_NO_DQUOTE } '"'
UnquotedAtom := { CHAR_NO_WS_NO_COLON }+
FreeText     := { CHAR_NO_WS }+    (* matches when not parseable as Token *)
WS           := " "+
UserHandle   := { ALPHA | DIGIT | "_" | "-" | "." }+
```

Notes:
- Grammar is whitespace-separated and case-insensitive for keys and standalone keywords (`IS:TODO` ≡ `is:todo`).
- Mention handles are case-insensitive at parse time; display preserves original casing.
- `text:` and `link:` values may contain spaces only when wrapped in double quotes.

---

## 2. Keyword reference

### 2.1 Date family
| Key | Value format | Example |
|-----|--------------|---------|
| `date:` | `YYYY-MM-DD` | `date:2026-04-23` |
| `date-before:` | `YYYY-MM-DD` | `date-before:2026-05-01` |
| `date-after:` | `YYYY-MM-DD` | `date-after:2026-04-01` |
| `day-of-week:` | enum: `mon` `tue` `wed` `thu` `fri` `sat` `sun` `weekday` `weekend` | `day-of-week:fri` |

Standalone date shortcuts: `today`, `tomorrow`, `yesterday`, `this-week`, `next-week`, `last-week`, `this-month`, `next-month`, `last-month`. Each resolves at query time relative to user's local timezone.

### 2.2 History family
| Key | Value | Example |
|-----|-------|---------|
| `changed:` | `YYYY-MM-DD` OR a date shortcut from §2.1 | `changed:today` |
| `created:` | same | `created:last-week` |

### 2.3 State / metadata
| Key | Enum values |
|-----|-------------|
| `is:` | `todo`, `complete`, `starred`, `shared`, `mirror`, `template`, `heading` |
| `has:` | `note`, `date`, `file`, `image`, `video`, `tweet`, `link`, `comment`, `highlight` |
| `highlight:` | one of the 11 highlight color names — see Phase 5 § color palette (forward ref) |

### 2.4 Scope
| Key | Value | Notes |
|-----|-------|-------|
| `in:` | Node identifier (opaque ID) | Multiple `in:` tokens form a UNION (the only OR exception) |

### 2.5 Text / link
| Key | Value | Notes |
|-----|-------|-------|
| `text:` | quoted or unquoted phrase | Substring match, case-insensitive by default |
| `link:` | URL or substring | Matches against `href` of inline links |

### 2.6 People
| Token | Meaning |
|-------|---------|
| `@<handle>` | Items mentioning user `<handle>` |
| `me` | Items mentioning the current user |
| `others` | Items mentioning anyone OTHER than the current user |

---

## 3. Combination semantics

| Combination | Operator | Notes |
|-------------|----------|-------|
| Multiple distinct tokens | AND | Default |
| Multiple `in:` tokens | UNION (OR over scopes) | The only OR exception in the grammar |
| `-token` | NOT | Applies to a single immediately-following token |
| Free text + tokens | AND with substring | Free text matches node content |

There is **no explicit `OR` operator** at launch.

---

## 4. Resolution rules

- Date shortcuts use the user's local timezone for "today/tomorrow/etc."
- `changed:` and `created:` accept either a date shortcut or a literal `YYYY-MM-DD`.
- `is:mirror` matches mirror instances; `is:template` matches templates.
- `in:` IDs that no longer exist resolve to "no scope contribution" (silently dropped); a hint is shown in Region 3.
- Negation applies to the most recent token only; `-` standalone is treated as free text.

---

## 5. Test vectors

| # | Input | Parsed tokens (kind: value) | Expected semantics |
|---|-------|-----------------------------|--------------------|
| T1 | `is:todo` | `[KV is=todo]` | All todo items |
| T2 | `is:todo -is:complete` | `[KV is=todo, NOT KV is=complete]` | Open todos |
| T3 | `@alice today` | `[Mention alice, Standalone today]` | Today's items mentioning alice |
| T4 | `text:"deep work" date-after:2026-04-01` | `[KV text="deep work", KV date-after=2026-04-01]` | Phrase match after Apr 1 |
| T5 | `in:nodeA in:nodeB is:starred` | `[KV in=nodeA, KV in=nodeB, KV is=starred]` | Starred items in (A ∪ B) |
| T6 | `has:image -has:video` | `[KV has=image, NOT KV has=video]` | Has image, no video |
| T7 | `me changed:this-week` | `[Standalone me, KV changed=this-week]` | My recent changes |
| T8 | `day-of-week:weekend has:date` | `[KV day-of-week=weekend, KV has=date]` | Dated weekend items |
| T9 | `link:github.com` | `[KV link=github.com]` | Items with github.com links |
| T10 | `highlight:yellow text:standup` | `[KV highlight=yellow, KV text=standup]` | Yellow-highlighted standup mentions |
| T11 | `-@bob` | `[NOT Mention bob]` | Items NOT mentioning bob |
| T12 | `meeting is:todo` | `[FreeText meeting, KV is=todo]` | Todo items containing "meeting" |

These vectors are normative for the parser.

---

## 6. Error cases (parser-level)

| Input | Behavior |
|-------|----------|
| `date:abc` | Token rejected (invalid value); shown as invalid chip pre-commit |
| `unknown:value` | Whole fragment treated as FreeText (silent fallback) |
| Unclosed quote `text:"hello` | Token stays uncommitted; cursor inside string mode |
| Empty value `is:` (no value) | Triggers value picker (Region 4); does NOT parse to a token until value provided |

---

## 7. Cross-references

- [`05-token-system.md`](./05-token-system.md) — chip behavior
- [`03-hint-and-suggestions.md`](./03-hint-and-suggestions.md) — value pickers
- [`07-results-and-highlighting.md`](./07-results-and-highlighting.md) — query application
- [`13-data-contracts.md`](./13-data-contracts.md) — `ParsedQuery` shape
- Phase 5 highlight palette (forward ref) — `highlight:` color enum
