# 4. Detailed Error Code Tables

> **Parent:** [Error Code Registry overview](../00-overview.md)

---

## RAG Configuration Validation Errors (9301-9310)

| Code | Name | Message |
|------|------|---------|
| AB-9301 | `ErrRagChunkSizeInvalid` | Chunk size outside valid range (256-8192) |
| AB-9302 | `ErrRagChunkSizeNotMultiple` | Chunk size not multiple of 256 |
| AB-9303 | `ErrRagOverlapTooLarge` | Chunk overlap exceeds 25% of chunk size |
| AB-9304 | `ErrRagContextBudgetInvalid` | Context token budget outside range (512-16384) |
| AB-9305 | `ErrRagEmbeddingModelInvalid` | Embedding model not supported |
| AB-9306 | `ErrRagSimilarityThresholdInvalid` | Similarity threshold outside range (0.0-1.0) |
| AB-9307 | `ErrRagTopkInvalid` | TopK outside valid range (1-50) |
| AB-9308 | `ErrRagConfigLoadFailed` | Failed to load RAG configuration |
| AB-9309 | `ErrRagConfigSaveFailed` | Failed to save RAG configuration |
| AB-9310 | `ErrRagConfigSourceConflict` | Conflicting config from multiple sources |

---

## AI SEO Generate Error Codes (9500-9524)

| Code | Name | Message |
|------|------|---------|
| AB-9501 | `ErrSeoPresetNotFound` | Industry preset not found |
| AB-9502 | `ErrSeoTemplateNotFound` | Template file not found in preset |
| AB-9503 | `ErrSeoVariableMissing` | Required template variable not provided |
| AB-9504 | `ErrSeoGenerationFailed` | Page generation failed |
| AB-9505 | `ErrSeoContextInjectionFailed` | Failed to inject RAG context |
| AB-9506 | `ErrSeoLlmTimeout` | LLM response timeout during generation |
| AB-9507 | `ErrSeoTokenLimitExceeded` | Content exceeds token limit |
| AB-9508 | `ErrSeoOutputWriteFailed` | Failed to write generated output |
| AB-9509 | `ErrSeoBatchLimitExceeded` | Batch exceeds maximum page limit |
| AB-9510 | `ErrSeoUploadFailed` | ZIP upload failed |
| AB-9511 | `ErrSeoUploadTooLarge` | Upload exceeds size limit |
| AB-9512 | `ErrSeoUnsupportedFormat` | File format not supported |
| AB-9513 | `ErrSeoCircularDependency` | Circular dependency detected in files |
| AB-9514 | `ErrSeoParseMarkdownFailed` | Failed to parse Markdown file |
| AB-9515 | `ErrSeoParseHtmlFailed` | Failed to parse HTML template |
| AB-9516 | `ErrSeoParseCsvFailed` | Failed to parse CSV file |
| AB-9517 | `ErrSeoParseSqliteFailed` | Failed to read SQLite database |
| AB-9518 | `ErrSeoExtractionFailed` | ZIP extraction failed |
| AB-9519 | `ErrSeoIngestFailed` | Failed to ingest files into RAG |
| AB-9520 | `ErrSeoJobNotFound` | Generation job not found |
| AB-9521 | `ErrSeoJobAlreadyRunning` | Job already in progress |

---

## GSearch Movie Search Error Codes (7600-7609)

| Code | Name | Message |
|------|------|---------|
| GS-7600 | `ErrMovieSearchFailed` | Movie search request failed |
| GS-7601 | `ErrMovieNotFound` | Movie not found in database |
| GS-7602 | `ErrTmdbApiError` | TMDB API request failed |
| GS-7603 | `ErrOmdbApiError` | OMDB API request failed |
| GS-7604 | `ErrMovieCacheError` | Movie cache read/write failed |
| GS-7605 | `ErrTvEpisodeNotFound` | TV episode not found |
| GS-7606 | `ErrFolderScanError` | Folder batch scan failed |
| GS-7607 | `ErrFilenameParsError` | Failed to parse filename for metadata |
| GS-7608 | `ErrApiKeyRotationFailed` | API key rotation exhausted |
| GS-7609 | `ErrMetadataTtlExpired` | Cached metadata expired (30-day TTL) |

---

## GSearch Business Intelligence Suite Error Codes (7700-7839)

| Range | Category | Description |
|-------|----------|-------------|
| 7700-7709 | Multi-Engine Search | Search engine errors |
| 7710-7719 | FAQ Discovery | FAQ extraction errors |
| 7720-7729 | SERP Tracking | Position tracking errors |
| 7730-7739 | Contact Extraction | Contact parsing errors |
| 7740-7749 | Maps Search | Google Maps errors |
| 7750-7759 | Response Formatting | Cache and format errors |
| 7760-7769 | Webhook | Webhook notification errors |
| 7800-7819 | Frontend | BI Suite frontend errors |
| 7820-7839 | Reserved | Future expansion |
