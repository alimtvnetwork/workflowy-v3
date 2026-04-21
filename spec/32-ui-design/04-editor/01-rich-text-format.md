# Rich Text Format Specification

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 6A.1 Storage Format

The `rich_content` field stores a **sanitized HTML subset**. The `content` field stores the **plain text equivalent** (all HTML tags stripped). Both fields MUST be kept in sync — every edit to `rich_content` regenerates `content` by stripping tags.

When an item has no formatting, `rich_content` is `null` and `content` holds the plain text. When any formatting is applied, `rich_content` is populated and `content` is derived from it.

### 6A.2 Allowed HTML Tags (Whitelist)

Only the following HTML tags are permitted in `rich_content`. All other tags MUST be stripped on paste and on save.

| Format | HTML Tag | Example |
|--------|----------|---------|
| Bold | `<strong>` | `<strong>text</strong>` |
| Italic | `<em>` | `<em>text</em>` |
| Underline | `<u>` | `<u>text</u>` |
| Strikethrough | `<s>` | `<s>text</s>` |
| Inline code | `<code>` | `<code>text</code>` |
| Text color | `<span data-color="red">` | `<span data-color="red">text</span>` |
| Link | `<a href="..." target="_blank" rel="noopener">` | Standard link tag |
| Inline mention | `<span data-mention="item-uuid" class="mention">` | `<span data-mention="abc-123" class="mention">@Project Plan</span>` |
| Inline tag | `<span data-tag="tag-name" class="tag">` | `<span data-tag="urgent" class="tag">#urgent</span>` |
| Line break | `<br>` | Only inside code blocks and notes |

**Forbidden tags (always stripped):** `<div>`, `<p>`, `<h1>`–`<h6>`, `<table>`, `<img>`, `<script>`, `<style>`, `<iframe>`, `<form>`, `<input>`, and all other tags not in the whitelist.

### 6A.3 Paste Sanitization Rules

When content is pasted from external sources:

| Source Content | Handling |
|---------------|----------|
| Bold (`<b>`, `<strong>`, font-weight CSS) | Convert to `<strong>` |
| Italic (`<i>`, `<em>`, font-style CSS) | Convert to `<em>` |
| Underline (`<u>`, text-decoration CSS) | Convert to `<u>` |
| Strikethrough (`<del>`, `<s>`, text-decoration CSS) | Convert to `<s>` |
| Inline code (`<code>`) | Keep as `<code>` |
| Links (`<a>`) | Keep href, add `target="_blank" rel="noopener"` |
| Headings (`<h1>`–`<h6>`) | Strip tag, keep inner text |
| Tables | Strip all table tags, extract cell text separated by tabs/newlines |
| Images | Strip entirely (ignored) |
| Custom fonts, colors, backgrounds | Strip entirely |
| Unknown/complex HTML | Strip tags, keep inner text content |
| Plain text URLs | Auto-wrap in `<a href="URL">URL</a>` |
| Multi-line paste | Auto-split by newlines into separate sibling items (see §4.1 in Workflow spec) |

### 6A.4 Inline Element Parsing

| Element | Trigger | Behavior | Storage |
|---------|---------|----------|---------|
| `#hashtag` | User types `#` followed by word characters, terminated by space or punctuation | Auto-creates the tag if it doesn't exist, links node to tag, wraps text in `<span data-tag="tagname" class="tag">` | Tag relation created in DB; inline HTML in `rich_content` |
| `@mention` | User clicks @ button in toolbar OR types `@` which opens a search popover | User selects an item from the popover; text is replaced with `<span data-mention="item-uuid" class="mention">@Item Title</span>` | Mention span stored in `rich_content`; clicking it zooms to the referenced item |
| `!!` date | User types `!!` anywhere in content | Opens the date picker dialog. On date selection, `!!` is removed from content and the date is stored in `date_assigned` field. A date badge renders beside the content (not inline). | Date stored on the item, NOT as inline HTML |

### 6A.5 Plain Text Derivation

To generate `content` from `rich_content`:
1. Strip all HTML tags
2. Replace `<br>` with a space
3. Collapse multiple whitespace to single space
4. Trim leading and trailing whitespace

This `content` field is used for: search indexing, plain text export, breadcrumb display, card previews, and any context where formatting is not rendered.

---
