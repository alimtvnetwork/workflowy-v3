# 5. Validation Service

> **Parent:** [00-overview.md](./00-overview.md)

---

## RagConfigService

```go
// RagConfigService handles loading, validation, and saving of RAG config
type RagConfigService struct {
    validator ConfigValidator
    seedPath  string
    rootDb    string
}

func NewRagConfigService(seedPath, rootDb string) *RagConfigService {
    return &RagConfigService{
        validator: &DefaultValidator{},
        seedPath:  seedPath,
        rootDb:    rootDb,
    }
}
```

---

## Load (Priority Resolution)

```go
// Load retrieves config with priority resolution
func (s *RagConfigService) Load(appName string) apperror.Result[*RagConfig] {
    config := &RagConfig{}

    // 1. Load seed defaults
    seedConfig, err := s.loadSeed()
    if err != nil {
        return apperror.Fail[*RagConfig](apperror.Wrap(
            err,
            ErrRagConfigLoadFailed,
            "Failed to load seed configuration",
        ).WithContext("SeedPath", s.seedPath))
    }
    *config = *seedConfig
    config.Source = "seed"

    // 2. Override with root DB settings
    if rootConfig, err := s.loadRootDb(); err == nil {
        s.mergeConfig(config, rootConfig, "root")
    }

    // 3. Override with app-level settings
    if appName != "" {
        if appConfig, err := s.loadAppDb(appName); err == nil {
            s.mergeConfig(config, appConfig, "app")
        }
    }

    // Validate final config
    if errors := s.validator.Validate(config); len(errors) > 0 {
        return apperror.Fail[*RagConfig](errors[0])
    }

    return apperror.Ok(config)
}
```

### Resolution Order

| Priority | Source | Notes |
|----------|--------|-------|
| 1 (lowest) | `seed` | Always loaded first as baseline |
| 2 | `root` | Overrides seed |
| 3 (highest) | `app` | Overrides root and seed when `appName != ""` |

---

## Save

```go
// Save persists config with validation
func (s *RagConfigService) Save(appName string, config *RagConfig) apperror.Result[bool] {
    // Validate before saving
    if errors := s.validator.Validate(config); len(errors) > 0 {
        return apperror.Fail[bool](errors[0])
    }

    // Save to appropriate location
    if appName != "" {
        return s.saveAppDb(appName, config)
    }

    return s.saveRootDb(config)
}
```

---

## Partial Updates

```go
// RagConfigUpdate holds typed partial update fields
type RagConfigUpdate struct {
    ChunkSize           *int     `json:"ChunkSize,omitempty"`
    ChunkOverlap        *int     `json:"ChunkOverlap,omitempty"`
    ContextTokenBudget  *int     `json:"ContextTokenBudget,omitempty"`
    EmbeddingModel      *string  `json:"EmbeddingModel,omitempty"`
    SimilarityThreshold *float64 `json:"SimilarityThreshold,omitempty"`
    TopK                *int     `json:"TopK,omitempty"`
}

// ValidatePartial validates only provided fields
func (s *RagConfigService) ValidatePartial(updates *RagConfigUpdate) []*apperror.AppError {
    var errors []*apperror.AppError

    if updates.ChunkSize != nil {
        if err := (&DefaultValidator{}).validateChunkSize(*updates.ChunkSize); err != nil {
            errors = append(errors, *err)
        }
    }

    // Check overlap with size if both provided
    if updates.ChunkOverlap != nil {
        chunkSize := 2048 // default
        if updates.ChunkSize != nil {
            chunkSize = *updates.ChunkSize
        }
        if err := (&DefaultValidator{}).validateChunkOverlap(*updates.ChunkOverlap, chunkSize); err != nil {
            errors = append(errors, *err)
        }
    }

    // Continue for other fields...
    return errors
}
```

---

## Merge Helper

```go
func (s *RagConfigService) mergeConfig(base *RagConfig, override *RagConfig, source string) {
    if override.ChunkSize != 0 {
        base.ChunkSize = override.ChunkSize
        base.Source = source
    }
    if override.ChunkOverlap != 0 {
        base.ChunkOverlap = override.ChunkOverlap
    }
    if override.ContextTokenBudget != 0 {
        base.ContextTokenBudget = override.ContextTokenBudget
    }
    if override.EmbeddingModel != "" {
        base.EmbeddingModel = override.EmbeddingModel
    }
    if override.SimilarityThreshold != 0 {
        base.SimilarityThreshold = override.SimilarityThreshold
    }
    if override.TopK != 0 {
        base.TopK = override.TopK
    }
}
```
