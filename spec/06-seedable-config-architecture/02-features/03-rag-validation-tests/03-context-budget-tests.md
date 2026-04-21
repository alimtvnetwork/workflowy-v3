# 03 — ContextBudget Validation Tests (AB-9304)

> **Parent:** [00-overview.md](./00-overview.md)

---

```go
func TestContextBudgetValidation(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    tests := []struct {
        name         string
        budget       int
        expectError  bool
        expectedCode int
    }{
        // Valid cases
        {"ValidMinimum", 512, false, 0},
        {"ValidDefault", 4096, false, 0},
        {"ValidMaximum", 16384, false, 0},
        {"ValidMidRange", 8192, false, 0},
        {"Valid1024", 1024, false, 0},
        
        // Invalid cases
        {"TooSmallZero", 0, true, 9304},
        {"TooSmall511", 511, true, 9304},
        {"TooSmall256", 256, true, 9304},
        {"TooLarge16385", 16385, true, 9304},
        {"TooLarge32768", 32768, true, 9304},
        {"negative", -1, true, 9304},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := v.ValidateContextBudget(tt.budget)
            
            if tt.expectError {
                require.NotNil(t, err)
                assert.Equal(t, tt.expectedCode, err.Code)
                assert.Equal(t, "ContextTokenBudget", err.Field)
            } else {
                assert.Nil(t, err)
            }
        })
    }
}
```
