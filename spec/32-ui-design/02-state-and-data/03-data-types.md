# Data Types

> **Version:** 1.1.0  
> **Updated:** 2026-04-18

---

### 7.1 Item

The core data object. Represents any node in the outliner tree.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| user_id | UUID | Owner of the item |
| parent_id | UUID or null | Parent item (null = root level) |
| content | Text | Plain text content |
| note | Text | Note/description text |
| item_type | Enum | One of: bullet, h1, h2, h3, paragraph, todo, numbered, board, quote, code_block, divider |
| is_completed | Boolean | Whether the item is marked complete |
| is_collapsed | Boolean | Whether children are hidden |
| sort_order | Float | Position among siblings |
| date_assigned | Date or null | Assigned date for today/scheduling features |
| text_color | Text or null | Custom text color from color picker |
| rich_content | Text or null | HTML-formatted content for rich text |
| created_at | Timestamp | Creation time |
| updated_at | Timestamp | Last modification time |
| created_by | Text or null | Display name of creator |
| updated_by | Text or null | Display name of last editor |

Computed/joined fields available on the client: children count, comment count, whether it has unresolved comments, whether it's a mirror, source item info, attached files, note expanded state.

### 7.2 Profile

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | User ID |
| email | Text | User email |
| display_name | Text or null | Display name |
| avatar_url | Text or null | Profile picture URL |
| plan | "free" or "pro" | Subscription plan |
| items_limit | Integer | Maximum items allowed (250 for free) |
| preferences | Object | Theme, font size, default view, show completed, auto-collapse depth |

### 7.3 Mirror

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Mirror reference ID |
| source_item_id | UUID | The canonical item being mirrored |
| target_parent_id | UUID | Where the mirror is placed |
| user_id | UUID | Owner |
| sort_order | Float | Position within the target parent |
| created_at | Timestamp | When the mirror was created |

### 7.4 Other Types

- **Share** — item_id, owner, shared user (email or ID), permission level (view/edit/admin), public link settings
- **Comment** — item_id, user, content text, resolved state, timestamps, user display info
- **Tag** — user_id, name, color
- **File Attachment** — item_id, user_id, file name, storage path, size, MIME type
- **Template** — user_id, name, description, serialized item tree structure
- **Trash Item** — original item ID, user, serialized item+children data, original parent, deletion timestamp, expiration timestamp
- **Favorite** — user_id, item_id
- **Activity Log Entry** — user_id, item_id (nullable), action type (create/update/delete/move/share/complete/uncomplete/mirror/duplicate/restore/convert_type), details object (action-specific metadata), timestamp

### 7.5 Client-Side State Types

- **Zoom State** — current item ID, history array, history index position
- **Drag State** — source item ID, target item ID, drop position (before/after/child)
- **Search Result** — item ID, content, note, parent breadcrumb path, highlighted match ranges
- **Undo Action** — action type (create/update/delete/move/reorder), item ID, before state, after state, timestamp
- **Save Status** — is saving, last saved timestamp, pending change count, error message

---
