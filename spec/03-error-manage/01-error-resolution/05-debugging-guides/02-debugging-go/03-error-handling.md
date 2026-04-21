# Error Handling Pattern

> **Parent:** [00-overview.md](./00-overview.md)

## Standard Error Response

All Go backends MUST return the standard envelope:

```go
type Response[T any] struct {
    Success bool
    Data    T          `json:",omitempty"`
    Error   *ErrorInfo `json:",omitempty"`
}

type ErrorInfo struct {
    Code    int
    Message string
    Details string `json:",omitempty"`
}
```

## Error Response Helper

```go
func respondError(w http.ResponseWriter, code int, errCode int, message string, err error) {
    details := ""

    if err != nil {
        details = err.Error()
        log.Error().
            Err(err).
            Int("error_code", errCode).
            Str("message", message).
            Msg("API error response")
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(Response{
        Success: false,
        Error: &ErrorInfo{
            Code:    errCode,
            Message: message,
            Details: details,
        },
    })
}

func respondSuccess[T any](w http.ResponseWriter, data T) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(Response[T]{
        Success: true,
        Data:    data,
    })
}
```

## Related

- [04-health-check.md](./04-health-check.md) — Uses `respondSuccess`
- [06-common-issues.md](./06-common-issues.md) — Response format mismatch troubleshooting
