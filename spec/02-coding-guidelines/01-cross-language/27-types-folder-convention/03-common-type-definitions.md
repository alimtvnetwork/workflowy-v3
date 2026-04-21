# Common Type Definitions

> **Parent:** [27-types-folder-convention overview](./00-overview.md)

---

## 4. Common Type Definitions

### ContentType

```go
// types/ContentType.go
package types

type ContentType byte

const (
    ContentTypeJson ContentType = iota + 1
    ContentTypeXml
    ContentTypeFormData
    ContentTypeTextPlain
    ContentTypeOctetStream
)

var contentTypeLabels = map[ContentType]string{
    ContentTypeJson:        "application/json",
    ContentTypeXml:         "application/xml",
    ContentTypeFormData:    "multipart/form-data",
    ContentTypeTextPlain:   "text/plain",
    ContentTypeOctetStream: "application/octet-stream",
}

func (c ContentType) String() string {
    if label, isFound := contentTypeLabels[c]; isFound {
        return label
    }

    return "application/octet-stream"
}
```

```typescript
// types/ContentType.ts
export enum ContentType {
    Json = "application/json",
    Xml = "application/xml",
    FormData = "multipart/form-data",
    TextPlain = "text/plain",
    OctetStream = "application/octet-stream",
}
```

```php
// types/ContentType.php
enum ContentType: string {
    case Json = 'application/json';
    case Xml = 'application/xml';
    case FormData = 'multipart/form-data';
    case TextPlain = 'text/plain';
    case OctetStream = 'application/octet-stream';
}
```

### HttpMethod

```go
// types/HttpMethod.go
package types

type HttpMethod byte

const (
    HttpMethodGet HttpMethod = iota + 1
    HttpMethodPost
    HttpMethodPut
    HttpMethodPatch
    HttpMethodDelete
    HttpMethodHead
    HttpMethodOptions
)

var httpMethodLabels = map[HttpMethod]string{
    HttpMethodGet:     "GET",
    HttpMethodPost:    "POST",
    HttpMethodPut:     "PUT",
    HttpMethodPatch:   "PATCH",
    HttpMethodDelete:  "DELETE",
    HttpMethodHead:    "HEAD",
    HttpMethodOptions: "OPTIONS",
}

func (m HttpMethod) String() string {
    if label, isFound := httpMethodLabels[m]; isFound {
        return label
    }

    return "GET"
}
```

```typescript
// types/HttpMethod.ts
export enum HttpMethod {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Patch = "PATCH",
    Delete = "DELETE",
    Head = "HEAD",
    Options = "OPTIONS",
}
```

```php
// types/HttpMethod.php
enum HttpMethod: string {
    case Get = 'GET';
    case Post = 'POST';
    case Put = 'PUT';
    case Patch = 'PATCH';
    case Delete = 'DELETE';
    case Head = 'HEAD';
    case Options = 'OPTIONS';
}
```

### HttpStatus

```go
// types/HttpStatus.go
package types

type HttpStatus byte

const (
    HttpStatusOk HttpStatus = iota + 1
    HttpStatusCreated
    HttpStatusBadRequest
    HttpStatusUnauthorized
    HttpStatusForbidden
    HttpStatusNotFound
    HttpStatusConflict
    HttpStatusInternalError
    HttpStatusServiceUnavailable
)

var httpStatusCodes = map[HttpStatus]int{
    HttpStatusOk:                 200,
    HttpStatusCreated:            201,
    HttpStatusBadRequest:         400,
    HttpStatusUnauthorized:       401,
    HttpStatusForbidden:          403,
    HttpStatusNotFound:           404,
    HttpStatusConflict:           409,
    HttpStatusInternalError:      500,
    HttpStatusServiceUnavailable: 503,
}

func (s HttpStatus) Code() int {
    if code, isFound := httpStatusCodes[s]; isFound {
        return code
    }

    return 500
}
```

```typescript
// types/HttpStatus.ts
export enum HttpStatus {
    Ok = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    InternalError = 500,
    ServiceUnavailable = 503,
}
```

### SortDirection

```go
// types/SortDirection.go
package types

type SortDirection byte

const (
    SortAsc SortDirection = iota + 1
    SortDesc
)
```

```typescript
// types/SortDirection.ts
export enum SortDirection {
    Asc = "asc",
    Desc = "desc",
}
```

### Environment

```go
// types/Environment.go
package types

type Environment byte

const (
    EnvironmentDevelopment Environment = iota + 1
    EnvironmentStaging
    EnvironmentProduction
)
```

```typescript
// types/Environment.ts
export enum Environment {
    Development = "development",
    Staging = "staging",
    Production = "production",
}
```

---

## Related

- [`02-rules.md`](./02-rules.md) — Rules
- [`04-anti-patterns-and-checklist.md`](./04-anti-patterns-and-checklist.md) — Anti-patterns

---

*Common type definitions v3.2.0 — 2026-04-20*
