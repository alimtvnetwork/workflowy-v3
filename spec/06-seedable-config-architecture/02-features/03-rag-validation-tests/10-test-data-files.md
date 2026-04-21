# 10 — Test Data Files

> **Parent:** [00-overview.md](./00-overview.md)

---

## testdata/config.seed.json

```json
{
  "$schema": "./config.schema.json",
  "version": "1.3.0",
  "categories": {
    "rag": {
      "DisplayName": "RAG Configuration",
      "settings": {
        "ChunkSize": {
          "type": "number",
          "label": "Chunk Size",
          "default": 2048,
          "min": 256,
          "max": 8192
        },
        "ChunkOverlap": {
          "type": "number",
          "label": "Chunk Overlap",
          "default": 100,
          "min": 0,
          "max": 512
        },
        "ContextTokenBudget": {
          "type": "number",
          "label": "Context Budget",
          "default": 4096
        },
        "EmbeddingModel": {
          "type": "string",
          "label": "Embedding Model",
          "default": "NomicEmbedText"
        },
        "SimilarityThreshold": {
          "type": "number",
          "label": "Similarity",
          "default": 0.7
        },
        "TopK": {
          "type": "number",
          "label": "Top K",
          "default": 10
        }
      }
    }
  }
}
```
