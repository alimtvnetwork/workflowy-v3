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
    Navigation?: {
        NextPage: string | null;
        PrevPage: string | null;
        CloserLinks: string[];
    };
    Errors?: {
        BackendMessage: string;
        DelegatedServiceErrorStack: string[];
        Backend: string[];
        Frontend: string[];
    };
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
