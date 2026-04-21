# 6. API Integration

> **Parent:** [00-overview.md](./00-overview.md)

---

## Validation Middleware

```go
// ValidationMiddleware validates RAG config in requests
func ValidationMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.Method == "PUT" || r.Method == "POST" {
            var config RagConfig
            if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
                http.Error(w, "Invalid JSON", http.StatusBadRequest)
                return
            }

            validator := &DefaultValidator{}
            if errors := validator.Validate(&config); len(errors) > 0 {
                w.Header().Set("Content-Type", "application/json")
                w.WriteHeader(http.StatusBadRequest)
                json.NewEncoder(w).Encode(RagValidationErrorResponse{
                    Errors: errors,
                })
                return
            }

            // Re-encode for next handler
            encoded, _ := json.Marshal(config)
            r.Body = io.NopCloser(bytes.NewReader(encoded))
        }
        next.ServeHTTP(w, r)
    })
}
```

---

## API Handler

```go
// UpdateRagSettings handles PUT /api/v1/settings/rag
func (h *SettingsHandler) UpdateRagSettings(w http.ResponseWriter, r *http.Request) {
    var updates RagConfigUpdate
    if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
        h.respondError(w, 9308, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Validate partial updates
    if errors := h.configService.ValidatePartial(&updates); len(errors) > 0 {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(RagValidationErrorResponse{
            Error:  &errors[0],
            Errors: errors,
        })
        return
    }

    // Load current config
    appName := r.URL.Query().Get("app")
    config, err := h.configService.Load(appName)
    if err != nil {
        h.respondError(w, 9308, "Failed to load config", http.StatusInternalServerError)
        return
    }

    // Apply typed updates
    if updates.ChunkSize != nil {
        config.ChunkSize = *updates.ChunkSize
    }
    if updates.ChunkOverlap != nil {
        config.ChunkOverlap = *updates.ChunkOverlap
    }
    if updates.ContextTokenBudget != nil {
        config.ContextTokenBudget = *updates.ContextTokenBudget
    }
    if updates.EmbeddingModel != nil {
        config.EmbeddingModel = *updates.EmbeddingModel
    }
    if updates.SimilarityThreshold != nil {
        config.SimilarityThreshold = *updates.SimilarityThreshold
    }
    if updates.TopK != nil {
        config.TopK = *updates.TopK
    }

    // Save updated config
    if err := h.configService.Save(appName, config); err != nil {
        var valErr *apperror.AppError
        if errors.As(err, &valErr) {
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(valErr)
            return
        }
        h.respondError(w, 9309, "Failed to save config", http.StatusInternalServerError)
        return
    }

    // Return updated config
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(RagConfigUpdateResponse{
        Config:  *config,
        Updated: getUpdatedFieldsFromUpdate(&updates),
        Source:  config.Source,
    })
}
```

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/settings/rag` | Fetch current resolved config |
| `PUT` | `/api/v1/settings/rag` | Partial update with validation |
| `POST` | `/api/v1/settings/rag/validate` | Dry-run validation only |
