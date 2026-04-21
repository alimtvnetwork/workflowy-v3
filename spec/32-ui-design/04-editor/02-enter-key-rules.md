# Enter Key and Text Splitting Rules

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 6B.1 Core Split Behavior

When Enter is pressed, the item's content is split at the caret position into two items:

| Caret Position | Current Item Keeps | New Item Gets | New Item Type |
|---------------|-------------------|---------------|---------------|
| Middle of text | Text before caret | Text after caret | Always `bullet` (default type) |
| End of text | All text | Empty content | Always `bullet` |
| Start of text | Empty content (becomes empty item above) | All original text | Same type as original |
| Empty item | Stays empty | Empty content | `bullet` |

### 6B.2 Format Inheritance on Split

When the caret splits text inside a formatted range:

| Scenario | Before Caret | After Caret (new item) |
|----------|-------------|----------------------|
| Caret inside `<strong>bold text</strong>` | `<strong>bold te</strong>` | `<strong>xt</strong>` — format continues |
| Caret inside `<em>italic</em>` | `<em>ita</em>` | `<em>lic</em>` — format continues |
| Caret inside nested `<strong><em>text</em></strong>` | `<strong><em>te</em></strong>` | `<strong><em>xt</em></strong>` — all nesting preserved |
| Caret inside `<code>code</code>` | `<code>co</code>` | `<code>de</code>` — format continues |
| Caret inside `<span data-color="red">colored</span>` | `<span data-color="red">col</span>` | `<span data-color="red">ored</span>` — color continues |
| Caret inside `<a href>link text</a>` | `<a href>link</a>` | ` text` — link does NOT continue (links are atomic) |
| Caret inside `<span class="mention">@Name</span>` | Mention stays in current item | Nothing — mentions are atomic, do not split |
| Caret inside `<span class="tag">#tag</span>` | Tag stays in current item | Nothing — tags are atomic, do not split |

**Rule:** Inline formatting (bold, italic, underline, strikethrough, code, color) is split and continues. Atomic elements (links, mentions, tags) are NOT split — they stay in whichever side the caret anchor falls.

### 6B.3 Type Inheritance Rules

| Original Item Type | New Sibling Type After Enter |
|-------------------|------------------------------|
| Bullet | Bullet |
| Heading 1 | Bullet |
| Heading 2 | Bullet |
| Heading 3 | Bullet |
| Paragraph | Paragraph |
| To-do | To-do (unchecked) |
| Numbered | Numbered (auto-increments) |
| Board | Bullet |
| Quote | Quote (if caret in middle/end); Bullet (if caret at start of empty quote) |
| Code Block | **Does NOT split.** Enter creates a `<br>` newline within the code block. To exit the code block, press Enter twice on an empty line — the second Enter creates a new bullet sibling below. |
| Divider | Bullet (created below the divider) |

### 6B.4 Enter in Note Editor

Pressing Enter inside a note editor creates a **newline within the note** (not a new sibling item). Notes support multi-line content. To exit the note editor and return focus to the item content, press `Escape`.

---
