# 08 — Config Load/Save Tests (AB-9308, AB-9309, AB-9310)

> **Parent:** [00-overview.md](./00-overview.md)

---

```go
func TestConfigLoad(t *testing.T) {
    t.Run("LoadSuccessFromSeed", func(t *testing.T) {
        service := rag.NewRagConfigService("testdata/config.seed.json", ":memory:")
        config, err := service.Load("")
        
        require.NoError(t, err)
        assert.Equal(t, 2048, config.ChunkSize)
        assert.Equal(t, "seed", config.Source)
    })
    
    t.Run("LoadFailureMissingSeed", func(t *testing.T) {
        service := rag.NewRagConfigService("nonexistent.json", ":memory:")
        _, err := service.Load("")
        
        require.Error(t, err)
        ragErr, ok := err.(*apperror.AppError)
        require.True(t, ok)
        assert.Equal(t, 9308, ragErr.Code)
    })
    
    t.Run("LoadAppOverride", func(t *testing.T) {
        service := setupTestService(t)
        
        // Set app-level override
        err := service.SaveAppSetting("testapp", "ChunkSize", 4096)
        require.NoError(t, err)
        
        config, err := service.Load("testapp")
        require.NoError(t, err)
        assert.Equal(t, 4096, config.ChunkSize)
        assert.Equal(t, "app", config.Source)
    })
}

func TestConfigSave(t *testing.T) {
    t.Run("SaveSuccess", func(t *testing.T) {
        service := setupTestService(t)
        
        config := &rag.RagConfig{
            ChunkSize:           4096,
            ChunkOverlap:        200,
            ContextTokenBudget:  8192,
            EmbeddingModel:      "NomicEmbedText",
            SimilarityThreshold: 0.8,
            TopK:                20,
        }
        
        err := service.Save("testapp", config)
        assert.NoError(t, err)
    })
    
    t.Run("SaveFailureValidation", func(t *testing.T) {
        service := setupTestService(t)
        
        config := &rag.RagConfig{
            ChunkSize: 100, // Invalid
        }
        
        err := service.Save("testapp", config)
        require.Error(t, err)
        
        ragErr, ok := err.(*apperror.AppError)
        require.True(t, ok)
        assert.Equal(t, 9301, ragErr.Code)
    })
    
    t.Run("SaveFailureDbError", func(t *testing.T) {
        service := rag.NewRagConfigService("testdata/config.seed.json", "/invalid/path/db.sqlite")
        
        config := &rag.RagConfig{
            ChunkSize:           2048,
            ChunkOverlap:        100,
            ContextTokenBudget:  4096,
            EmbeddingModel:      "NomicEmbedText",
            SimilarityThreshold: 0.7,
            TopK:                10,
        }
        
        err := service.Save("", config)
        require.Error(t, err)
        
        ragErr, ok := err.(*apperror.AppError)
        require.True(t, ok)
        assert.Equal(t, 9309, ragErr.Code)
    })
}

func TestConfigSourceConflict(t *testing.T) {
    t.Run("ConflictDetection", func(t *testing.T) {
        // Test when same setting has conflicting values from different sources
        service := setupTestService(t)
        
        // Set conflicting values
        service.SetRootSetting("ChunkSize", 2048)
        service.SetAppSetting("testapp", "ChunkSize", 4096)
        service.SetSeedDefault("ChunkSize", 1024)
        
        // Should resolve by priority (app > root > seed)
        config, err := service.Load("testapp")
        require.NoError(t, err)
        assert.Equal(t, 4096, config.ChunkSize)
        assert.Equal(t, "app", config.Source)
    })
}
```
