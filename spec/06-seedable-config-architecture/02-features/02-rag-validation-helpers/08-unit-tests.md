# 8. Unit Tests

> **Parent:** [00-overview.md](./00-overview.md)

For the full unit test specification, see [`../03-rag-validation-tests/00-overview.md`](../03-rag-validation-tests/00-overview.md). This file documents only minimal smoke-test patterns kept inside the helpers package.

---

## ChunkSize Validation Smoke Test

```go
func TestChunkSizeValidation(t *testing.T) {
    v := &DefaultValidator{}

    tests := []struct {
        name     string
        size     int
        wantCode int
    }{
        {"valid_2048", 2048, 0},
        {"valid_min", 256, 0},
        {"valid_max", 8192, 0},
        {"too_small", 100, 9301},
        {"too_large", 10000, 9301},
        {"not_multiple", 1000, 9302},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := v.validateChunkSize(tt.size)
            if tt.wantCode == 0 {
                if err != nil {
                    t.Errorf("expected no error, got %v", err)
                }
            } else {
                if err == nil {
                    t.Errorf("expected error code %d, got nil", tt.wantCode)
                } else if err.Code != tt.wantCode {
                    t.Errorf("expected error code %d, got %d", tt.wantCode, err.Code)
                }
            }
        })
    }
}
```

---

## Overlap Percentage Smoke Test

```go
func TestOverlapPercentageValidation(t *testing.T) {
    v := &DefaultValidator{}

    tests := []struct {
        name      string
        chunkSize int
        overlap   int
        wantErr   bool
    }{
        {"25_percent_ok", 2048, 512, false},
        {"20_percent_ok", 2048, 400, false},
        {"26_percent_fail", 2048, 600, true},
        {"50_percent_fail", 2048, 1024, true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := v.validateChunkOverlap(tt.overlap, tt.chunkSize)
            if tt.wantErr && err == nil {
                t.Error("expected error, got nil")
            }
            if !tt.wantErr && err != nil {
                t.Errorf("expected no error, got %v", err)
            }
        })
    }
}
```

---

## Coverage Mapping

| Test | Error Code(s) Covered |
|------|----------------------|
| `TestChunkSizeValidation` | AB-9301, AB-9302 |
| `TestOverlapPercentageValidation` | AB-9303 |

Full coverage of AB-9301..9310 lives in [`../03-rag-validation-tests/`](../03-rag-validation-tests/00-overview.md).
