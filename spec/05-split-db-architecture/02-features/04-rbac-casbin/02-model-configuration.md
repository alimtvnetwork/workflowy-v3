# 2. Casbin Model Configuration

> **Parent:** [00-overview.md](./00-overview.md)

---

## RBAC Model (`rbac_model.conf`)

```ini
[request_definition]
r = Sub, Obj, Act

[policy_definition]
p = Sub, Obj, Act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.Sub, p.Sub) && keyMatch2(r.Obj, p.Obj) && r.Act == p.Act
```

---

## RBAC with Resource Hierarchy (`rbac_model_hierarchy.conf`)

```ini
[request_definition]
r = Sub, Dom, Obj, Act

[policy_definition]
p = Sub, Dom, Obj, Act

[role_definition]
g = _, _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.Sub, p.Sub, r.Dom) && r.Dom == p.Dom && keyMatch2(r.Obj, p.Obj) && r.Act == p.Act
```

---

## Model Components

| Section | Purpose |
|---------|---------|
| `request_definition` | Defines the request format (Subject, Object, Action) |
| `policy_definition` | Defines the policy line format |
| `role_definition` | Defines role hierarchy patterns |
| `policy_effect` | Determines how multiple policies combine |
| `matchers` | Boolean expression for policy matching |

---

## Matcher Functions

| Function | Description |
|----------|-------------|
| `keyMatch(r.Obj, p.Obj)` | Key matching (e.g., `/foo` matches `/foo/*`) |
| `keyMatch2(r.Obj, p.Obj)` | Extended key matching with `:param` support |
| `regexMatch(r.Obj, p.Obj)` | Regular expression matching |
