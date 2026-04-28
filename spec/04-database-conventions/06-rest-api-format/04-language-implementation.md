# Language Implementation

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Go — Default Behavior

Go marshals PascalCase struct fields to PascalCase JSON by default — no tags needed:

```go
type Transaction struct {
    TransactionId int64   `db:"TransactionId"`
    PluginSlug    string  `db:"PluginSlug"`
    IsActive      bool    `db:"IsActive"`
    Amount        float64 `db:"Amount"`
}

// json.Marshal(tx) produces:
// {"TransactionId":42,"PluginSlug":"my-plugin","IsActive":true,"Amount":29.99}
```

> **Do NOT add `json:"PluginSlug"` tags** — that would convert to camelCase.

---

## PHP — Array Keys

```php
// Response array keys are PascalCase
return [
    'Success' => true,
    'Data' => [
        'TransactionId' => $tx->TransactionId,
        'PluginSlug'    => $tx->PluginSlug,
        'IsActive'      => $tx->IsActive,
        'Amount'        => $tx->Amount,
    ],
];
```

---

## TypeScript — Interface

```typescript
// Envelope types
interface ApiResponse<T> {
    Status: {
        IsSuccess: boolean;
        IsFailed: boolean;
        Code: number;
        Message: string;
        Timestamp: string;
    };
    Attributes: {
        RequestedAt: string;
        RequestDelegatedAt: string;
        HasAnyErrors: boolean;
        IsSingle: boolean;
        IsMultiple: boolean;
        IsEmpty: boolean;
        TotalRecords: number;
        PerPage: number;
        TotalPages: number;
        CurrentPage: number;
    };
    Results: T[];
    // Optional keys — OMITTED entirely when not applicable, never `null` (ADR-0019 D1).
    // The `?:` here means "may be absent from the JSON object", not "may be `null`".
    Navigation?: {
        NextPage: string | null;   // null permitted ONLY on first/last page
        PrevPage: string | null;   // null permitted ONLY on first/last page
        CloserLinks: string[];     // 0..5 nearby pages, ordered
    };
    Errors?: {
        BackendMessage: string;
        DelegatedServiceErrorStack: string[];
        Backend: string[];
        Frontend: string[];
    };
    MethodsStack?: {
        Frames: Array<{ Method: string; File: string; Line: number }>;
        StartedAt: string;
        ElapsedMs: number;
    };  // present iff `debug.methods_stack` config flag enabled — production builds MUST omit.
}

// Domain type
interface Transaction {
    TransactionId: number;
    PluginSlug: string;
    IsActive: boolean;
    Amount: number;
    StatusName: string;
    CreatedAt: string;
}

// Usage
type TransactionListResponse = ApiResponse<Transaction>;
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`03-envelope-and-flow.md`](./03-envelope-and-flow.md) — End-to-end PascalCase rationale
