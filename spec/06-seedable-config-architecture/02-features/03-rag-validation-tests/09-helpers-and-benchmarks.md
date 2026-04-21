# 09 — Test Helpers & Benchmarks

> **Parent:** [00-overview.md](./00-overview.md)

---

## Table-Driven Test Helpers

```go
// TestHelper provides common setup for RAG validation tests
type TestHelper struct {
    t       *testing.T
    service *rag.RagConfigService
}

func NewTestHelper(t *testing.T) *TestHelper {
    service := rag.NewRagConfigService(
        "testdata/config.seed.json",
        ":memory:",
    )
    return &TestHelper{t: t, service: service}
}

func (h *TestHelper) AssertValidConfig(config *rag.RagConfig) {
    h.t.Helper()
    v := &rag.DefaultValidator{}
    errors := v.Validate(config)
    assert.Empty(h.t, errors, "expected valid config, got errors: %v", errors)
}

func (h *TestHelper) AssertErrorCode(err error, expectedCode int) {
    h.t.Helper()
    ragErr, ok := err.(*apperror.AppError)
    require.True(h.t, ok, "expected RagValidationError, got %T", err)
    assert.Equal(h.t, expectedCode, ragErr.Code)
}
```

---

## Benchmark Tests

```go
func BenchmarkValidateFullConfig(b *testing.B) {
    v := &rag.DefaultValidator{}
    config := &rag.RagConfig{
        ChunkSize:           2048,
        ChunkOverlap:        100,
        ContextTokenBudget:  4096,
        EmbeddingModel:      "NomicEmbedText",
        SimilarityThreshold: 0.7,
        TopK:                10,
    }
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        v.Validate(config)
    }
}

func BenchmarkValidateChunkSize(b *testing.B) {
    v := &rag.DefaultValidator{}
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        v.ValidateChunkSize(2048)
    }
}
```
