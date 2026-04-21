# 07 — Full Config Validation Tests

> **Parent:** [00-overview.md](./00-overview.md)

---

```go
func TestFullConfigValidation(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    tests := []struct {
        name        string
        config      rag.RagConfig
        errorCount  int
        errorCodes  []int
    }{
        {
            name: "ValidConfig",
            config: rag.RagConfig{
                ChunkSize:           2048,
                ChunkOverlap:        100,
                ContextTokenBudget:  4096,
                EmbeddingModel:      "NomicEmbedText",
                SimilarityThreshold: 0.7,
                TopK:                10,
            },
            errorCount: 0,
        },
        {
            name: "SingleErrorChunkSize",
            config: rag.RagConfig{
                ChunkSize:           100, // Invalid
                ChunkOverlap:        100,
                ContextTokenBudget:  4096,
                EmbeddingModel:      "NomicEmbedText",
                SimilarityThreshold: 0.7,
                TopK:                10,
            },
            errorCount: 1,
            errorCodes: []int{9301},
        },
        {
            name: "MultipleErrors",
            config: rag.RagConfig{
                ChunkSize:           100,      // Invalid range
                ChunkOverlap:        1000,     // Too large
                ContextTokenBudget:  100,      // Too small
                EmbeddingModel:      "invalid",
                SimilarityThreshold: 2.0,      // Out of range
                TopK:                100,      // Too large
            },
            errorCount: 6,
            errorCodes: []int{9301, 9303, 9304, 9305, 9306, 9307},
        },
        {
            name: "OverlapPercentageError",
            config: rag.RagConfig{
                ChunkSize:           1024,
                ChunkOverlap:        300, // > 25% of 1024
                ContextTokenBudget:  4096,
                EmbeddingModel:      "NomicEmbedText",
                SimilarityThreshold: 0.7,
                TopK:                10,
            },
            errorCount: 1,
            errorCodes: []int{9303},
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            errors := v.Validate(&tt.config)
            
            assert.Len(t, errors, tt.errorCount, "wrong number of errors")
            
            if len(tt.errorCodes) > 0 {
                for i, expectedCode := range tt.errorCodes {
                    if i < len(errors) {
                        assert.Equal(t, expectedCode, errors[i].Code)
                    }
                }
            }
        })
    }
}
```
