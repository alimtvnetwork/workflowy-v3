# 9. Split DB Integration

> **Parent:** [00-overview.md](./00-overview.md)

---

## Database Path Patterns

The RBAC database follows the Split DB naming conventions:

| Level | Path Pattern |
|-------|--------------|
| Root | `data/rbac.db` |
| App | `data/{appName}/rbac.db` |
| Company | `data/{appName}/companies/{companySlug}/rbac.db` |

---

## Database Registry Entry

```sql
INSERT INTO DbRegistry (Id, Category, EntityId, SequenceNum, Path) VALUES
('rbac_root', 'rbac', 'root', 1, 'rbac.db'),
('rbac_gsearch', 'rbac', 'gsearch', 1, 'gsearch/rbac.db');
```

---

## Directory Structure

```
data/
├── rbac.db                    # Root level
├── gsearch/
│   ├── gsearch.db
│   └── rbac.db               # App level
└── aibridge/
    ├── aibridge.db
    └── companies/
        └── acme-corp/
            ├── acme-corp.db
            └── rbac.db       # Company level
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Split DB Overview | [`../../00-overview.md`](../../00-overview.md) |
| User-Scoped Isolation | [`../05-user-scoped-isolation/00-overview.md`](../05-user-scoped-isolation/00-overview.md) |

---

## External References

- [Casbin Documentation](https://casbin.org/docs/overview)
- [GORM Adapter](https://github.com/casbin/gorm-adapter)
- [Casbin Go SDK](https://github.com/casbin/casbin)
- [Model Examples](https://casbin.org/docs/model-storage)
