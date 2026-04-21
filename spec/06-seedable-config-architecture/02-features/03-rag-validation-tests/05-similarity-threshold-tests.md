# 05 — SimilarityThreshold Validation Tests (AB-9306)

> **Parent:** [00-overview.md](./00-overview.md)

---

```go
func TestSimilarityThresholdValidation(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    tests := []struct {
        name         string
        threshold    float64
        expectError  bool
        expectedCode int
    }{
        // Valid cases
        {"ValidZero", 0.0, false, 0},
        {"ValidOne", 1.0, false, 0},
        {"ValidDefault", 0.7, false, 0},
        {"ValidHalf", 0.5, false, 0},
        {"ValidLow", 0.1, false, 0},
        {"ValidHigh", 0.9, false, 0},
        {"ValidSmall", 0.001, false, 0},
        {"ValidNearOne", 0.999, false, 0},
        
        // Invalid cases
        {"NegativeSmall", -0.001, true, 9306},
        {"NegativeLarge", -1.0, true, 9306},
        {"AboveOne", 1.001, true, 9306},
        {"WayAbove", 2.0, true, 9306},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := v.ValidateSimilarityThreshold(tt.threshold)
            
            if tt.expectError {
                require.NotNil(t, err)
                assert.Equal(t, tt.expectedCode, err.Code)
                assert.Equal(t, "SimilarityThreshold", err.Field)
            } else {
                assert.Nil(t, err)
            }
        })
    }
}

func TestSimilarityThresholdFloatPrecision(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    // Test float precision edge cases
    edgeCases := []float64{
        0.0000001,           // Very small positive
        0.9999999,           // Very close to 1
        1.0 - 1e-10,         // Float precision near 1
        0.0 + 1e-10,         // Float precision near 0
    }
    
    for _, threshold := range edgeCases {
        err := v.ValidateSimilarityThreshold(threshold)
        assert.Nil(t, err, "threshold %v should be valid", threshold)
    }
}
```
