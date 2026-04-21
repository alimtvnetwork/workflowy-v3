# 06 — TopK Validation Tests (AB-9307)

> **Parent:** [00-overview.md](./00-overview.md)

---

```go
func TestTopKValidation(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    tests := []struct {
        name         string
        topK         int
        expectError  bool
        expectedCode int
    }{
        // Valid cases
        {"ValidMinimum", 1, false, 0},
        {"ValidDefault", 10, false, 0},
        {"ValidMaximum", 50, false, 0},
        {"ValidMid", 25, false, 0},
        
        // Invalid cases
        {"zero", 0, true, 9307},
        {"negative", -1, true, 9307},
        {"AboveMax", 51, true, 9307},
        {"WayAbove", 100, true, 9307},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := v.ValidateTopK(tt.topK)
            
            if tt.expectError {
                require.NotNil(t, err)
                assert.Equal(t, tt.expectedCode, err.Code)
                assert.Equal(t, "TopK", err.Field)
            } else {
                assert.Nil(t, err)
            }
        })
    }
}
```
