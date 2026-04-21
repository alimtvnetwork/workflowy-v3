# 1. Error Code Mapping

> **Parent:** [00-overview.md](./00-overview.md)

---

## Validation Error Codes

| Error Code | Name | Validation Rule |
|------------|------|-----------------|
| AB-9301 | `RagChunkSizeInvalid` | ChunkSize outside 256-8192 range |
| AB-9302 | `RagChunkSizeNotMultiple` | ChunkSize not multiple of 256 |
| AB-9303 | `RagOverlapTooLarge` | ChunkOverlap > 25% of ChunkSize |
| AB-9304 | `RagContextBudgetInvalid` | ContextTokenBudget outside 512-16384 |
| AB-9305 | `RagEmbeddingModelInvalid` | Unsupported embedding model |
| AB-9306 | `RagSimilarityThresholdInvalid` | Threshold outside 0.0-1.0 |
| AB-9307 | `RagTopkInvalid` | TopK outside 1-50 range |
| AB-9308 | `RagConfigLoadFailed` | Failed to load configuration |
| AB-9309 | `RagConfigSaveFailed` | Failed to save configuration |
| AB-9310 | `RagConfigSourceConflict` | Conflicting multi-source config |

---

## Code Range

All RAG validation errors fall in the `9301–9310` range, registered under the AB (AI Bridge) namespace. See the [Error Code Registry](../../../03-error-manage/02-error-architecture/06-apperror-package/01-apperror-reference/00-overview.md) for the full inventory.
