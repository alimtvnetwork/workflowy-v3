# Classification and "Add New Case" Checklist

> **Parent:** [00-overview.md](00-overview.md)

## Classification: Enum vs Const Class

| Name               | Type         | Suffix | Has isEqual() | Why                                              |
|--------------------|--------------|--------|---------------|--------------------------------------------------|
| `UploadSourceType` | `enum`       | `Type` | ✅            | Discrete set — "which source?"                   |
| `CapabilityType`   | `enum`       | `Type` | ✅            | Discrete capabilities — "which permission?"      |
| `HttpMethodType`   | `enum`       | `Type` | ✅            | Discrete HTTP verbs — "which method?"            |
| `HookType`         | `enum`       | `Type` | ✅            | Discrete hook names — "which hook?"              |
| `EndpointType`     | `enum`       | `Type` | ✅            | Discrete REST paths — "which endpoint?"          |
| `LogLevelType`     | `enum`       | `Type` | ✅            | Discrete log levels — "which severity?"          |
| `StatusType`       | `enum`       | `Type` | ✅            | Discrete results — "success or failed?"          |
| `PostStatusType`   | `enum`       | `Type` | ✅            | Discrete post states — "which status?"           |
| `ActionType`       | `enum`       | `Type` | ✅            | Discrete actions — "which action?"               |
| `TableType`        | `enum`       | `Type` | ✅            | Discrete tables — "which table?"                 |
| `PathSubdirType`   | `enum`       | `Type` | ✅            | Discrete subdirectories — "which directory?"     |
| `PathDatabaseType` | `enum`       | `Type` | ✅            | Discrete DB files — "which database?"            |
| `PathLogFileType`  | `enum`       | `Type` | ✅            | Discrete log files — "which log?"                |
| `PathConfigType`   | `enum`       | `Type` | ✅            | Discrete config files — "which config?"          |
| `WpErrorCodeType`  | `enum`       | `Type` | ✅            | Discrete WP_Error codes — "which error code?"    |
| `ErrorType`        | `final class`| —      | ❌            | Arrays of E_* constants and label maps           |

## Decision Rule

> If the type answers **"which one of these?"** with a single value → `enum` with `Type` suffix + `isEqual()`.
> If it holds **arrays, maps, or composable fragments** → `final class` with `public const`.

---

## Adding New Enum Cases — Checklist

1. **Add the case** to the appropriate enum in `includes/Enums/`.
2. **Ensure `isEqual()` exists** — it should already be there; verify.
3. **Add a PHPDoc comment** if the case is non-obvious.
4. **If PathSubdirType:** Add a corresponding typed accessor to `PathHelper`.
5. **If PathDatabaseType/PathLogFileType/PathConfigType:** Add a typed accessor to `PathHelper`.
6. **If HookType:** Update all `add_action`/`add_filter` calls.
7. **If CapabilityType:** Update all `current_user_can()` calls.
8. **If HttpMethodType:** Update all `register_rest_route()` calls.
9. **If EndpointType:** Add the case, then use `->route()` in route registration. Update all callers.
10. **If ErrorType:** Add to the appropriate group array AND to `TYPE_LABELS`.
11. **If WpErrorCodeType:** Update all `new WP_Error()` calls and `$this->envelope->error()` code parameters.
12. **Never skip the enum** — even for "one-time" usage.
13. **Use `isEqual()` for all comparisons** — never raw `===` at call sites.
