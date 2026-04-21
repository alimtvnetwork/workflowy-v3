# 04 — EmbeddingModel Validation Tests (AB-9305)

> **Parent:** [00-overview.md](./00-overview.md)

---

```go
func TestEmbeddingModelValidation(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    tests := []struct {
        name         string
        model        string
        expectError  bool
        expectedCode int
    }{
        // Valid models
        {"ValidNomic", "NomicEmbedText", false, 0},
        {"ValidSmall", "TextEmbedding3Small", false, 0},
        {"ValidLarge", "TextEmbedding3Large", false, 0},
        {"ValidMinilm", "AllMiniLmL6V2", false, 0},
        
        // Invalid models
        {"EmptyString", "", true, 9305},
        {"UnknownModel", "unknown-model", true, 9305},
        {"TypoNomic", "nomic-embed", true, 9305},
        {"CaseSensitive", "NOMIC-EMBED-TEXT", true, 9305},
        {"spaces", "nomic embed text", true, 9305},
        {"PartialMatch", "text-embedding", true, 9305},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := v.ValidateEmbeddingModel(tt.model)
            
            if tt.expectError {
                require.NotNil(t, err)
                assert.Equal(t, tt.expectedCode, err.Code)
                assert.Equal(t, "EmbeddingModel", err.Field)
                assert.Equal(t, tt.model, err.Value)
            } else {
                assert.Nil(t, err)
            }
        })
    }
}
```
