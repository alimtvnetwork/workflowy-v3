# 3. Validator Interface

> **Parent:** [00-overview.md](./00-overview.md)

---

## ConfigValidator

```go
// ConfigValidator defines the validation interface
type ConfigValidator interface {
    Validate(config *RagConfig) []*apperror.AppError
}
```

---

## DefaultValidator Dispatcher

```go
// DefaultValidator implements ConfigValidator
type DefaultValidator struct{}

func (v *DefaultValidator) Validate(config *RagConfig) []*apperror.AppError {
    var errors []*apperror.AppError

    // ChunkSize validation
    if err := v.validateChunkSize(config.ChunkSize); err != nil {
        errors = append(errors, *err)
    }

    // ChunkOverlap validation (depends on ChunkSize)
    if err := v.validateChunkOverlap(config.ChunkOverlap, config.ChunkSize); err != nil {
        errors = append(errors, *err)
    }

    // ContextTokenBudget validation
    if err := v.validateContextBudget(config.ContextTokenBudget); err != nil {
        errors = append(errors, *err)
    }

    // EmbeddingModel validation
    if err := v.validateEmbeddingModel(config.EmbeddingModel); err != nil {
        errors = append(errors, *err)
    }

    // SimilarityThreshold validation
    if err := v.validateSimilarityThreshold(config.SimilarityThreshold); err != nil {
        errors = append(errors, *err)
    }

    // TopK validation
    if err := v.validateTopK(config.TopK); err != nil {
        errors = append(errors, *err)
    }

    return errors
}
```

---

## Behavior

- The dispatcher accumulates **all** validation errors (does not short-circuit).
- Order matters only for `ChunkOverlap`, which depends on `ChunkSize`.
- Returning a non-empty slice signals invalid config; an empty slice signals valid.
