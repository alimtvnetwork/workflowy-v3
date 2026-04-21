# 4. Individual Validators

> **Parent:** [00-overview.md](./00-overview.md)

---

## ChunkSize Validator

```go
func (v *DefaultValidator) validateChunkSize(size int) *apperror.AppError {
    if size < 256 || size > 8192 {
        return apperror.New(
            ErrRagChunkSizeInvalid,
            "Chunk size outside valid range",
        ).WithContext("Field", "ChunkSize").
            WithContext("Value", size).
            WithContext("Expected", "256-8192")
    }

    if size%256 != 0 {
        return apperror.New(
            ErrRagChunkSizeNotMultiple,
            "Chunk size must be multiple of 256",
        ).WithContext("Field", "ChunkSize").
            WithContext("Value", size).
            WithContext("Expected", "Multiple of 256")
    }

    return nil
}
```

---

## ChunkOverlap Validator

```go
func (v *DefaultValidator) validateChunkOverlap(overlap, chunkSize int) *apperror.AppError {
    if overlap < 0 || overlap > 512 {
        return apperror.New(
            ErrRagOverlapTooLarge,
            "Chunk overlap outside valid range",
        ).WithContext("Field", "ChunkOverlap").
            WithContext("Value", overlap).
            WithContext("Expected", "0-512")
    }

    // Overlap cannot exceed 25% of chunk size
    maxOverlap := chunkSize / 4
    if overlap > maxOverlap {
        return apperror.New(
            ErrRagOverlapTooLarge,
            fmt.Sprintf("Chunk overlap cannot exceed 25%% of chunk size (%d)", maxOverlap),
        ).WithContext("Field", "ChunkOverlap").
            WithContext("Value", overlap).
            WithContext("MaxOverlap", maxOverlap)
    }

    return nil
}
```

---

## ContextBudget Validator

```go
func (v *DefaultValidator) validateContextBudget(budget int) *apperror.AppError {
    if budget < 512 || budget > 16384 {
        return apperror.New(
            ErrRagContextBudgetInvalid,
            "Context token budget outside valid range",
        ).WithContext("Field", "ContextTokenBudget").
            WithContext("Value", budget).
            WithContext("Expected", "512-16384")
    }

    return nil
}
```

---

## EmbeddingModel Validator

```go
func (v *DefaultValidator) validateEmbeddingModel(model string) *apperror.AppError {
    if !SupportedEmbeddingModels[model] {
        return apperror.New(
            ErrRagEmbeddingModelInvalid,
            "Embedding model not supported",
        ).WithContext("Field", "EmbeddingModel").
            WithContext("Value", model).
            WithContext("Expected", "NomicEmbedText, TextEmbedding3Small, TextEmbedding3Large, AllMiniLmL6V2")
    }

    return nil
}
```

---

## SimilarityThreshold Validator

```go
func (v *DefaultValidator) validateSimilarityThreshold(threshold float64) *apperror.AppError {
    if threshold < 0.0 || threshold > 1.0 {
        return apperror.New(
            ErrRagSimilarityThresholdInvalid,
            "Similarity threshold outside valid range",
        ).WithContext("Field", "SimilarityThreshold").
            WithContext("Value", threshold).
            WithContext("Expected", "0.0-1.0")
    }

    return nil
}
```

---

## TopK Validator

```go
func (v *DefaultValidator) validateTopK(topK int) *apperror.AppError {
    if topK < 1 || topK > 50 {
        return apperror.New(
            ErrRagTopkInvalid,
            "TopK outside valid range",
        ).WithContext("Field", "TopK").
            WithContext("Value", topK).
            WithContext("Expected", "1-50")
    }

    return nil
}
```
