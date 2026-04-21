# Full REST API Samples (Universal Envelope)

> **Parent:** [`00-overview.md`](./00-overview.md)
> All examples conform to the [Universal Response Envelope](../../03-error-manage/02-error-architecture/05-response-envelope/04-response-envelope-reference.md).

---

## 2.1 List Resources (Paginated)

```
GET /api/v1/transactions?StatusName=Pending&IsActive=1&page=2&perPage=10
```

**Response:**

```json
{
    "Status": {
        "IsSuccess": true,
        "IsFailed": false,
        "Code": 200,
        "Message": "OK",
        "Timestamp": "2026-04-02T10:30:00Z"
    },
    "Attributes": {
        "RequestedAt": "http://localhost:8080/api/v1/transactions",
        "RequestDelegatedAt": "",
        "HasAnyErrors": false,
        "IsSingle": false,
        "IsMultiple": true,
        "IsEmpty": false,
        "TotalRecords": 47,
        "PerPage": 10,
        "TotalPages": 5,
        "CurrentPage": 2
    },
    "Results": [
        {
            "TransactionId": 1,
            "PluginSlug": "my-plugin",
            "Amount": 29.99,
            "StatusName": "Pending",
            "FileTypeName": "Plugin",
            "AgentSiteName": "Example Site",
            "IsActive": true,
            "HasLicense": true,
            "CreatedAt": "2026-04-02T10:30:00Z"
        },
        {
            "TransactionId": 2,
            "PluginSlug": "another-plugin",
            "Amount": 9.99,
            "StatusName": "Pending",
            "FileTypeName": "Theme",
            "AgentSiteName": "Other Site",
            "IsActive": true,
            "HasLicense": false,
            "CreatedAt": "2026-04-01T08:15:00Z"
        }
    ],
    "Navigation": {
        "NextPage": "http://localhost:8080/api/v1/transactions?page=3&perPage=10",
        "PrevPage": "http://localhost:8080/api/v1/transactions?page=1&perPage=10",
        "CloserLinks": [
            "http://localhost:8080/api/v1/transactions?page=3&perPage=10",
            "http://localhost:8080/api/v1/transactions?page=4&perPage=10",
            "http://localhost:8080/api/v1/transactions?page=5&perPage=10"
        ]
    }
}
```

---

## 2.2 Get Single Resource

```
GET /api/v1/transactions/42
```

**Response:**

```json
{
    "Status": {
        "IsSuccess": true,
        "IsFailed": false,
        "Code": 200,
        "Message": "OK",
        "Timestamp": "2026-04-02T11:00:00Z"
    },
    "Attributes": {
        "RequestedAt": "http://localhost:8080/api/v1/transactions/42",
        "RequestDelegatedAt": "",
        "HasAnyErrors": false,
        "IsSingle": true,
        "IsMultiple": false,
        "IsEmpty": false,
        "TotalRecords": 1,
        "PerPage": 0,
        "TotalPages": 0,
        "CurrentPage": 0
    },
    "Results": [
        {
            "TransactionId": 42,
            "PluginSlug": "my-plugin",
            "Amount": 29.99,
            "StatusTypeId": 1,
            "StatusName": "Pending",
            "FileTypeId": 1,
            "FileTypeName": "Plugin",
            "AgentSiteId": 5,
            "AgentSiteName": "Example Site",
            "IsActive": true,
            "HasLicense": true,
            "CreatedAt": "2026-04-02T10:30:00Z",
            "UpdatedAt": "2026-04-02T11:00:00Z"
        }
    ]
}
```

---

## 2.3 Create Resource

```
POST /api/v1/transactions
Content-Type: application/json
```

**Request body (PascalCase keys):**

```json
{
    "PluginSlug": "new-plugin",
    "Amount": 19.99,
    "StatusTypeId": 1,
    "FileTypeId": 2,
    "AgentSiteId": 3
}
```

**Response:**

```json
{
    "Status": {
        "IsSuccess": true,
        "IsFailed": false,
        "Code": 201,
        "Message": "Transaction created successfully",
        "Timestamp": "2026-04-02T12:00:00Z"
    },
    "Attributes": {
        "RequestedAt": "http://localhost:8080/api/v1/transactions",
        "RequestDelegatedAt": "",
        "HasAnyErrors": false,
        "IsSingle": true,
        "IsMultiple": false,
        "IsEmpty": false,
        "TotalRecords": 1,
        "PerPage": 0,
        "TotalPages": 0,
        "CurrentPage": 0
    },
    "Results": [
        {
            "TransactionId": 43,
            "PluginSlug": "new-plugin",
            "Amount": 19.99,
            "StatusName": "Pending",
            "FileTypeName": "Theme",
            "IsActive": true,
            "CreatedAt": "2026-04-02T12:00:00Z"
        }
    ]
}
```

---

## 2.4 Update Resource

```
PUT /api/v1/transactions/42
Content-Type: application/json
```

**Request body:**

```json
{
    "StatusTypeId": 2,
    "Amount": 34.99
}
```

**Response:**

```json
{
    "Status": {
        "IsSuccess": true,
        "IsFailed": false,
        "Code": 200,
        "Message": "Transaction updated successfully",
        "Timestamp": "2026-04-02T13:00:00Z"
    },
    "Attributes": {
        "RequestedAt": "http://localhost:8080/api/v1/transactions/42",
        "RequestDelegatedAt": "",
        "HasAnyErrors": false,
        "IsSingle": true,
        "IsMultiple": false,
        "IsEmpty": false,
        "TotalRecords": 1,
        "PerPage": 0,
        "TotalPages": 0,
        "CurrentPage": 0
    },
    "Results": [
        {
            "TransactionId": 42,
            "StatusName": "Complete",
            "Amount": 34.99,
            "UpdatedAt": "2026-04-02T13:00:00Z"
        }
    ]
}
```

---

## 2.5 Delete Resource

```
DELETE /api/v1/transactions/42
```

**Response:**

```json
{
    "Status": {
        "IsSuccess": true,
        "IsFailed": false,
        "Code": 200,
        "Message": "Transaction deleted successfully",
        "Timestamp": "2026-04-02T13:30:00Z"
    },
    "Attributes": {
        "RequestedAt": "http://localhost:8080/api/v1/transactions/42",
        "RequestDelegatedAt": "",
        "HasAnyErrors": false,
        "IsSingle": false,
        "IsMultiple": false,
        "IsEmpty": true,
        "TotalRecords": 0,
        "PerPage": 0,
        "TotalPages": 0,
        "CurrentPage": 0
    },
    "Results": []
}
```

---

## 2.6 Error Response

```json
{
    "Status": {
        "IsSuccess": false,
        "IsFailed": true,
        "Code": 404,
        "Message": "Transaction not found",
        "Timestamp": "2026-04-02T14:00:00Z"
    },
    "Attributes": {
        "RequestedAt": "http://localhost:8080/api/v1/transactions/999",
        "RequestDelegatedAt": "",
        "HasAnyErrors": true,
        "IsSingle": false,
        "IsMultiple": false,
        "IsEmpty": true,
        "TotalRecords": 0,
        "PerPage": 0,
        "TotalPages": 0,
        "CurrentPage": 0
    },
    "Results": [],
    "Errors": {
        "BackendMessage": "Transaction not found",
        "DelegatedServiceErrorStack": [],
        "Backend": [
            "handlers.go:92 handleGetTransaction",
            "service.go:45 FindTransactionById"
        ],
        "Frontend": []
    }
}
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-key-format.md`](./01-key-format.md) — PascalCase rule applied in every example
- [`03-envelope-and-flow.md`](./03-envelope-and-flow.md) — Envelope structure reference
