# Worked Example Fixtures — Canonical Error Envelope (P27)

> **Audit gap closed:** P26 flagged "missing canonical error-envelope JSON + 5-row registry + ErrorModal component contract". This file binds `AT-ERRORRESOLUTION-01..10` to byte-exact JSON, a populated registry, and a React component contract.

---

## 1. Canonical error envelope (binding)

Every error response from any tier (REST, CLI, edge function, frontend) MUST conform:

```json
{
  "Status": "ERROR",
  "Errors": [
    {
      "Code": "ITEM-4041",
      "Message": "Item itm_xyz not found",
      "Severity": "FATAL",
      "Field": null,
      "ResourceId": "itm_xyz",
      "TraceId": "01JS5KQ7XJVB3M9C7P0XZTPYQ4",
      "OccurredAt": "2026-04-28T10:00:00Z",
      "Details": {
        "Workspace": "ws_1",
        "RequestedBy": "user_42"
      },
      "Stack": null
    }
  ],
  "MethodsStack": ["api.items.get", "repo.findById", "db.exec"],
  "Attributes": {
    "RequestId": "req_01JS5KQ7XJVB3M9C7P0XZTPYQ4"
  }
}
```

### Field rules

| Field | Required | Type | Notes |
|---|:---:|---|---|
| `Status` | ✅ | `"ERROR"` (literal) | NEVER `"FAIL"`, `"err"`, etc. |
| `Errors` | ✅ | `array<ErrorEntry>` minLen=1 | even single errors are wrapped |
| `Errors[].Code` | ✅ | `^[A-Z]+-\d{4,5}$` | namespace prefix per registry §2 |
| `Errors[].Message` | ✅ | string | human-readable, no PII |
| `Errors[].Severity` | ✅ | `WARN`/`FATAL`/`INFO` | enum closed |
| `Errors[].Field` | nullable | string | populated for validation errors |
| `Errors[].ResourceId` | nullable | string | populated for not-found errors |
| `Errors[].TraceId` | ✅ | ULID | required for log correlation |
| `Errors[].OccurredAt` | ✅ | RFC-3339 UTC | server clock |
| `Errors[].Details` | nullable | object | structured context (no PII) |
| `Errors[].Stack` | nullable | string | dev-mode only; redacted in prod |
| `MethodsStack` | ✅ | `array<string>` | function call chain |

## 2. Error code registry (5 binding rows — schema for the rest)

| Code | Tier | Severity | HTTP | Trigger |
|---|---|---|---:|---|
| `AUTH-1001` | API | FATAL | 401 | Missing or expired bearer token |
| `AUTH-1002` | API | FATAL | 403 | Token valid but lacks workspace permission |
| `ITEM-4041` | API | FATAL | 404 | `Item.id` does not exist |
| `ITEM-4221` | API | WARN | 422 | `Item.content` exceeds 10 KB limit |
| `DB-5001`   | Backend | FATAL | 500 | SQLite write rejected (locked or disk full) |

**Allocation rule:** prefixes are reserved per domain (`AUTH-`, `ITEM-`, `WS-` workspace, `DB-`, `CLI-`, `UPD-`, `CFG-`, `BACKUP-`); 4-digit codes are sequential within the prefix; 5-digit codes are reserved for vendor-passthrough.

## 3. Sensitive-data redaction (3 binding examples)

```json
// BEFORE redaction (raw):
{"Errors":[{"Code":"AUTH-1001","Message":"Token sk-prod-xxxxxxxxx invalid","Details":{"Email":"alice@example.com","Ip":"10.0.0.5"}}]}

// AFTER redaction (binding output):
{"Errors":[{"Code":"AUTH-1001","Message":"Token [REDACTED] invalid","Details":{"Email":"a***@example.com","Ip":"10.0.0.0/24"}}]}
```

Redaction rules (regex-based):
- `sk-[a-zA-Z0-9-]{8,}` → `[REDACTED]`
- Email local-part: keep first char + `***@`
- IP: mask last octet to `/24`

## 4. `ErrorModal.tsx` component contract

```tsx
// src/components/errors/ErrorModal.tsx — binding props
export interface ErrorModalProps {
  envelope: ErrorEnvelope;       // §1 shape
  onClose: () => void;
  onCopyTraceId: (traceId: string) => void;
  showStack?: boolean;           // default false; true only in dev
}
```

**Render contract** (1 error in envelope):
```
┌──────────────────────────────────────┐
│ ⚠ Error                          [×] │
│                                      │
│ Item itm_xyz not found               │  ← Errors[0].Message
│                                      │
│ Code: ITEM-4041                      │  ← monospace
│ Trace: 01JS5KQ7XJV…  [Copy]          │  ← truncate + copy button
│                                      │
│ ▸ Details (3)                        │  ← collapsible
│ ▸ Method stack (3)                   │  ← collapsible
└──────────────────────────────────────┘
```

**Render contract** (multiple errors): renders a vertically-stacked accordion, one row per `Errors[]` entry, sorted by `Severity` desc (`FATAL` → `WARN` → `INFO`).

## 5. Anti-patterns

| Anti-pattern | Why wrong | Detected by |
|---|---|---|
| `{"error": "..."}` flat string | breaks parser, no Code/TraceId | gate G-ERR-01 (envelope schema) |
| Throwing `new Error(JSON.stringify(envelope))` in frontend | loses prototype, breaks `instanceof` | gate G-ERR-02 (custom `AppError` class required) |
| Logging `Stack` in production | leaks code paths to attackers | gate G-ERR-03 (NODE_ENV check) |
| Email un-redacted in `Details.Email` | PII leak | gate G-ERR-04 (regex scan in CI logs) |
| Reusing a `Code` across two domains | violates registry uniqueness | gate G-ERR-05 (registry build-time check) |

## 6. Test-name slugs

| Bind | AT id (cited) | Vitest slug |
|---|---|---|
| `AT-ERRORRESOLUTION-01` | `at_errorresolution_01_envelope_pascalcase_shape` |
| `AT-ERRORRESOLUTION-02` | `at_errorresolution_02_code_regex_namespace` |
| `AT-ERRORRESOLUTION-03` | `at_errorresolution_03_severity_enum_closed` |
| `AT-ERRORRESOLUTION-04` | `at_errorresolution_04_traceid_is_ulid` |
| `AT-ERRORRESOLUTION-05` | `at_errorresolution_05_redaction_email_ip_token` |
| `AT-ERRORRESOLUTION-06` | `at_errorresolution_06_errormodal_renders_single` |
| `AT-ERRORRESOLUTION-07` | `at_errorresolution_07_errormodal_accordion_multi` |
| `AT-ERRORRESOLUTION-08` | `at_errorresolution_08_stack_hidden_in_prod` |
| `AT-ERRORRESOLUTION-09` | `at_errorresolution_09_registry_codes_unique` |
| `AT-ERRORRESOLUTION-10` | `at_errorresolution_10_methodsstack_chain_present` |
