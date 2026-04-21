# 5. GEN, SM, LM, CLI, PS Error Codes

> **Parent:** [Error Code Registry overview](../00-overview.md)

---

## GEN: General/Shared Errors (1000-1999)

### GEN-000: Initialization

| Code | Name | Message |
|------|------|---------|
| GEN-000-01 | ErrConfigMissing | Configuration file not found |
| GEN-000-02 | ErrConfigInvalid | Configuration file is malformed |
| GEN-000-03 | ErrEnvMissing | Required environment variable not set |

### GEN-100: Authentication

| Code | Name | Message |
|------|------|---------|
| GEN-100-01 | ErrAuthRequired | Authentication required |
| GEN-100-02 | ErrTokenExpired | Authentication token has expired |
| GEN-100-03 | ErrTokenInvalid | Authentication token is invalid |
| GEN-100-04 | ErrCredentialsInvalid | Invalid username or password |

### GEN-200: Authorization

| Code | Name | Message |
|------|------|---------|
| GEN-200-01 | ErrAccessDenied | Access denied to this resource |
| GEN-200-02 | ErrRoleRequired | Insufficient role privileges |
| GEN-200-03 | ErrPermissionDenied | Permission not granted |

### GEN-300: Validation

| Code | Name | Message |
|------|------|---------|
| GEN-300-01 | ErrFieldRequired | Required field is missing |
| GEN-300-02 | ErrFieldInvalid | Field value is invalid |
| GEN-300-03 | ErrFormatInvalid | Input format is invalid |
| GEN-300-04 | ErrLengthExceeded | Input exceeds maximum length |

### GEN-400: Business Logic

| Code | Name | Message |
|------|------|---------|
| GEN-400-01 | ErrOperationFailed | Business operation failed |
| GEN-400-02 | ErrStateInvalid | Invalid state for requested operation |
| GEN-400-03 | ErrConflict | Operation conflicts with current state |
| GEN-400-04 | ErrLimitExceeded | Operation limit exceeded |

### GEN-500: Database

| Code | Name | Message |
|------|------|---------|
| GEN-500-01 | ErrDbConnection | Database connection failed |
| GEN-500-02 | ErrDbQuery | Database query failed |
| GEN-500-03 | ErrDbTransaction | Transaction failed |
| GEN-500-04 | ErrRecordNotFound | Record not found |
| GEN-500-05 | ErrDuplicateRecord | Record already exists |

### GEN-600: Type Casting / Conversion

> Cross-cutting errors used by `pkg/typecast/`. See [Casting Elimination Patterns](../../../02-coding-guidelines/01-cross-language/03-casting-elimination-patterns/00-overview.md) for usage.

| Code | Name | Message |
|------|------|---------|
| GEN-600-01 | `ErrCastTypeAssertionFailed` | Type assertion failed: expected `T`, got `U` |
| GEN-600-02 | `ErrCastSliceElementFailed` | Slice element cast failed at index `N`: expected `T`, got `U` |

**Implementation mapping:**

| Spec Code | Go Constant | Used By |
|-----------|-------------|---------|
| `GEN-600-01` | `ErrCastTypeAssertionFailed` | `typecast.CastOrFail[T]()` |
| `GEN-600-02` | `ErrCastSliceElementFailed` | `typecast.CastSliceOrFail[T]()` |

**Rules:**
- These codes are emitted exclusively by `pkg/typecast/` — never constructed manually
- The `AppError` includes `.WithSkip(1)` so stack traces point to the caller
- Cast errors must **never** be swallowed — see §7.2 and §10 in [03-casting-elimination-patterns](../../../02-coding-guidelines/01-cross-language/03-casting-elimination-patterns/00-overview.md)

### GEN-700: File System

| Code | Name | Message |
|------|------|---------|
| GEN-700-01 | ErrFileNotFound | File not found at specified path |
| GEN-700-02 | ErrFileReadFailed | Failed to read file |
| GEN-700-03 | ErrFileWriteFailed | Failed to write file |
| GEN-700-04 | ErrDirCreateFailed | Failed to create directory |
| GEN-700-05 | ErrFsPermissionDenied | Insufficient file system permissions |

### GEN-800: Network

| Code | Name | Message |
|------|------|---------|
| GEN-800-01 | ErrNetworkError | Network request failed |
| GEN-800-02 | ErrTimeout | Request timed out |
| GEN-800-03 | ErrServiceUnavailable | Service temporarily unavailable |

### GEN-900: Reserved

> Reserved for future cross-cutting error categories. No codes should be registered in this range until a new category is formally defined and documented.

---

## SM: Spec Management Software (2000-2999)

### SM-000: Initialization

| Code | Name | Message |
|------|------|---------|
| SM-000-01 | ErrSpecRootMissing | Spec root directory not found |
| SM-000-02 | ErrIndexMissing | Master index file not found |

### SM-400: Business Logic

| Code | Name | Message |
|------|------|---------|
| SM-400-01 | ErrSpecParseError | Failed to parse specification file |
| SM-400-02 | ErrCircularDependency | Circular dependency detected |
| SM-400-03 | ErrVersionConflict | Version conflict detected |
| SM-400-04 | ErrTemplateError | Template rendering failed |

### SM-500: Database

| Code | Name | Message |
|------|------|---------|
| SM-500-01 | ErrMigrationFailed | Database migration failed |
| SM-500-02 | ErrSeedFailed | Database seeding failed |

### SM-600: External Services

| Code | Name | Message |
|------|------|---------|
| SM-600-01 | ErrAiApiError | AI service request failed |
| SM-600-02 | ErrEmbeddingFailed | Vector embedding generation failed |
| SM-600-03 | ErrRagSearchFailed | RAG search query failed |

---

## LM: Link Manager (15000-15999)

> ⚠️ **REASSIGNED:** Previously at 3000-3999 and 14000-14999 (both deprecated). Moved to 15000-15999 to resolve collision with AI Transcribe CLI (14000-14499).

### LM-15000: Initialization

| Code | Name | Message |
|------|------|---------|
| LM-15000-01 | ErrWpNotDetected | WordPress environment not detected |
| LM-15000-02 | ErrPluginConflict | Plugin conflict detected |

### LM-15400: Business Logic

| Code | Name | Message |
|------|------|---------|
| LM-15400-01 | ErrLinkInvalid | Invalid link format |
| LM-15400-02 | ErrRedirectLoop | Redirect loop detected |
| LM-15400-03 | ErrDomainBlocked | Domain is blocked |

---

## CLI: CLI Tools (4000-4999) — DEPRECATED

> ⚠️ **DEPRECATED:** Legacy range. Do not allocate new codes. GSearch and BRun now use 7000+ ranges.

### CLI-000: Initialization

| Code | Name | Message |
|------|------|---------|
| CLI-000-01 | ErrBinaryNotFound | Required binary not found |
| CLI-000-02 | ErrPathNotSet | PATH environment not configured |

### CLI-400: gsearch (legacy)

| Code | Name | Message |
|------|------|---------|
| CLI-400-01 | ErrPatternInvalid | Invalid search pattern |
| CLI-400-02 | ErrNoResults | No results found |
| CLI-400-03 | ErrIndexStale | Search index is stale |

### CLI-500: brun (legacy)

| Code | Name | Message |
|------|------|---------|
| CLI-500-01 | ErrBuildFailed | Build step failed |
| CLI-500-02 | ErrRunFailed | Run step failed |
| CLI-500-03 | ErrDepsMissing | Dependencies not installed |

---

## PS: PowerShell Integration (9500-9599)

> See `spec/06-powershell-integration/04-error-codes.md` for full list.

| Code | Name | Message |
|------|------|---------|
| PS-9500-00 | PsSuccess | Operation completed successfully |
| PS-9501-01 | ErrPsGoMissing | Go runtime not found |
| PS-9502-01 | ErrPsNodeMissing | Node.js not found |
| PS-9510-01 | ErrPsConfigMissing | powershell.json not found |
| PS-9520-01 | ErrPsBuildFailed | Frontend build failed |
| PS-9530-01 | ErrPsBackendFailed | Backend failed to start |
