# 7. Response Formats

> **Parent:** [00-overview.md](./00-overview.md)

---

## Validation Success

```json
{
  "Config": {
    "ChunkSize": 4096,
    "ChunkOverlap": 200,
    "ContextTokenBudget": 4096,
    "EmbeddingModel": "NomicEmbedText",
    "SimilarityThreshold": 0.7,
    "TopK": 10,
    "Source": "app"
  },
  "Updated": ["ChunkSize", "ChunkOverlap"],
  "Source": "app"
}
```

---

## Validation Error (Single)

```json
{
  "Error": {
    "Code": 9301,
    "Name": "RagChunkSizeInvalid",
    "Message": "Chunk size outside valid range",
    "Field": "ChunkSize",
    "Value": 100,
    "Expected": "256-8192",
    "Timestamp": "2026-02-02T10:30:00Z"
  },
  "Errors": [
    {
      "Code": 9301,
      "Name": "RagChunkSizeInvalid",
      "Message": "Chunk size outside valid range",
      "Field": "ChunkSize",
      "Value": 100,
      "Expected": "256-8192"
    }
  ]
}
```

---

## Multi-Error Response

```json
{
  "Errors": [
    {
      "Code": 9301,
      "Name": "RagChunkSizeInvalid",
      "Field": "ChunkSize",
      "Value": 100
    },
    {
      "Code": 9303,
      "Name": "RagOverlapTooLarge",
      "Field": "ChunkOverlap",
      "Value": 600
    }
  ]
}
```

---

## Field Reference

| Field | Type | Notes |
|-------|------|-------|
| `Config` | object | Full resolved config (success only) |
| `Updated` | string[] | Field names that changed in this request |
| `Source` | string | Final precedence source (`seed` / `root` / `app`) |
| `Error` | object | First validation error (legacy single-error clients) |
| `Errors` | array | Full list of validation errors |
| `Timestamp` | string | ISO 8601 UTC timestamp |
