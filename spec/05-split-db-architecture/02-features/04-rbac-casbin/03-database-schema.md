# 3. SQLite Database Schema

> **Parent:** [00-overview.md](./00-overview.md)

---

## CasbinRule Table

The GORM adapter automatically creates this table:

```sql
CREATE TABLE CasbinRule (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Ptype TEXT NOT NULL,
    V0 TEXT DEFAULT '',
    V1 TEXT DEFAULT '',
    V2 TEXT DEFAULT '',
    V3 TEXT DEFAULT '',
    V4 TEXT DEFAULT '',
    V5 TEXT DEFAULT ''
);

CREATE UNIQUE INDEX IdxCasbinRule ON CasbinRule(Ptype, V0, V1, V2, V3, V4, V5);
```

---

## Column Mapping

| Column | Purpose | Example Values |
|----------|---------|----------------|
| `Ptype` | Policy type | `p` (policy), `g` (role), `g2` (domain) |
| `V0` | Field 0 | Subject / User / Child role |
| `V1` | Field 1 | Object / Role / Parent role |
| `V2` | Field 2 | Action / Domain |
| `V3` | Field 3 | Optional field |
| `V4` | Field 4 | Optional field |
| `V5` | Field 5 | Optional field |

---

## Seed Policies (Initial Data)

```sql
-- Policies: role, resource, action
INSERT INTO CasbinRule (Ptype, V0, V1, V2) VALUES
-- Admin can do everything
('p', 'admin', '*', '*'),
-- Manager can read and write
('p', 'manager', '/api/*', 'read'),
('p', 'manager', '/api/*', 'write'),
-- Editor can read and write documents
('p', 'editor', '/api/documents/*', 'read'),
('p', 'editor', '/api/documents/*', 'write'),
-- Viewer can only read
('p', 'viewer', '/api/*', 'read');

-- Role hierarchy: g, child_role, parent_role
INSERT INTO CasbinRule (Ptype, V0, V1) VALUES
('g', 'superadmin', 'admin'),
('g', 'admin', 'manager'),
('g', 'manager', 'editor'),
('g', 'editor', 'viewer');
```

---

## Policy Types Explained

| Ptype | Format | Meaning |
|-------|--------|---------|
| `p` | `p, role, resource, action` | Permission policy |
| `g` | `g, child_role, parent_role` | Role inheritance |
| `g` | `g, user, role` | User-role assignment |
