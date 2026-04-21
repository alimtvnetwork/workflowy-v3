# Strongly-Typed Value Container

> **Parent:** [00-overview.md](./00-overview.md)

**CRITICAL: No `interface{}` or `any` usage in `ConfigService` code. All values use the `SettingValue` union struct.**

```go
// SettingValue is the strongly-typed union container for all config values.
// Canonical definition: spec/22-ai-bridge-cli/01-backend/57-settings-service.md
type SettingValue struct {
    StringVal  *string            `json:"StringVal,omitempty"`
    IntVal     *int               `json:"IntVal,omitempty"`
    FloatVal   *float64           `json:"FloatVal,omitempty"`
    BoolVal    *bool              `json:"BoolVal,omitempty"`
    StringsVal []string           `json:"StringsVal,omitempty"`
    MapVal     map[string]string  `json:"MapVal,omitempty"`
}
```

## Why a union struct (not `interface{}`)

- **Type safety:** every consumer knows exactly which fields can appear.
- **JSON stability:** `omitempty` keeps payloads minimal; no `null` ambiguity.
- **Lint enforceable:** `02-coding-guidelines` forbids `any` / `interface{}` in service code, so reviewers can grep for violations.

## Adding a new value type

1. Add a new `*T` or slice field to `SettingValue` with a PascalCase JSON tag.
2. Update the canonical definition in `57-settings-service.md`.
3. Update validation in `ConfigService.parseSetting()`.
4. Add a row to the version-bumping rules — new value types are a **minor** bump.
