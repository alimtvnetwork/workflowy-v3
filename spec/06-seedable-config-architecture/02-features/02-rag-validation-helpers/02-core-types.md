# 2. Core Types

> **Parent:** [00-overview.md](./00-overview.md)

---

## RagConfig

```go
package rag

import (
    "fmt"
)

// RagConfig represents the complete RAG configuration
type RagConfig struct {
    ChunkSize           int
    ChunkOverlap        int
    ContextTokenBudget  int
    EmbeddingModel      string
    SimilarityThreshold float64
    TopK                int
    Source              string // "seed", "root", "app"
}
```

---

## Supported Embedding Models

```go
// Supported embedding models (PascalCase identifiers mapped to external strings)
var SupportedEmbeddingModels = map[string]bool{
    "NomicEmbedText":       true,
    "TextEmbedding3Small":  true,
    "TextEmbedding3Large":  true,
    "AllMiniLmL6V2":        true,
}
```

---

## Field Reference

| Field | Type | Range / Allowed Values |
|-------|------|------------------------|
| `ChunkSize` | `int` | 256–8192, multiple of 256 |
| `ChunkOverlap` | `int` | 0–512, ≤ 25% of `ChunkSize` |
| `ContextTokenBudget` | `int` | 512–16384 |
| `EmbeddingModel` | `string` | Member of `SupportedEmbeddingModels` |
| `SimilarityThreshold` | `float64` | 0.0–1.0 |
| `TopK` | `int` | 1–50 |
| `Source` | `string` | `"seed"`, `"root"`, `"app"` |
