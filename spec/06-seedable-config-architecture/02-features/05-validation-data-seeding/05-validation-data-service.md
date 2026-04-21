# 5. Step 4 + 5 — ValidationDataService and Validator Usage

> **Parent:** [Validation Data Seeding overview](./00-overview.md)

## Step 4: ValidationDataService with Typed Methods

```go
package validation

import (
    "encoding/json"
    "sync"
)

// ValidationDataService loads validation data from Root DB
type ValidationDataService struct {
    db    *gorm.DB
    cache sync.Map  // Thread-safe cache
}

// GetStringArray retrieves a string array using typed constants
func (s *ValidationDataService) GetStringArray(category ValidationCategory, key string) apperror.Result[[]string] {
    cacheKey := string(category) + ":" + key
    // EXEMPTED: typed accessor internal — cache stores known []string values (§7.2)
    if cached, ok := s.cache.Load(cacheKey); ok {
        return cached.([]string), nil
    }

    var data ValidationData
    if err := s.db.Where("Category = ? AND Key = ?", string(category), key).First(&data).Error; err != nil {
        return nil, err
    }

    var result []string
    if err := json.Unmarshal([]byte(data.Value), &result); err != nil {
        return nil, err
    }

    s.cache.Store(cacheKey, result)
    return result, nil
}

// GetNumber retrieves a numeric value using typed constants
func (s *ValidationDataService) GetNumber(category ValidationCategory, key string) apperror.Result[float64] {
    cacheKey := string(category) + ":" + key
    // EXEMPTED: typed accessor internal — cache stores known float64 values (§7.2)
    if cached, ok := s.cache.Load(cacheKey); ok {
        return cached.(float64), nil
    }

    var data ValidationData
    if err := s.db.Where("Category = ? AND Key = ?", string(category), key).First(&data).Error; err != nil {
        return 0, err
    }

    var result float64
    if err := json.Unmarshal([]byte(data.Value), &result); err != nil {
        return 0, err
    }

    s.cache.Store(cacheKey, result)
    return result, nil
}

// SEO-specific typed accessors
func (s *ValidationDataService) GetSeoStringArray(key SeoKey) apperror.Result[[]string] {
    return s.GetStringArray(CategorySeo, string(key))
}

func (s *ValidationDataService) GetSeoNumber(key SeoKey) apperror.Result[float64] {
    return s.GetNumber(CategorySeo, string(key))
}

// RAG-specific typed accessors
func (s *ValidationDataService) GetRagStringArray(key RagKey) apperror.Result[[]string] {
    return s.GetStringArray(CategoryRag, string(key))
}

func (s *ValidationDataService) GetRagNumber(key RagKey) apperror.Result[float64] {
    return s.GetNumber(CategoryRag, string(key))
}

// FAQ-specific typed accessors
func (s *ValidationDataService) GetFaqStringArray(key FaqKey) apperror.Result[[]string] {
    return s.GetStringArray(CategoryFaq, string(key))
}

func (s *ValidationDataService) GetFaqNumber(key FaqKey) apperror.Result[float64] {
    return s.GetNumber(CategoryFaq, string(key))
}

func (s *ValidationDataService) GetFaqBool(key FaqKey) apperror.Result[bool] {
    return s.GetBool(CategoryFaq, string(key))
}

func (s *ValidationDataService) GetFaqString(key FaqKey) apperror.Result[string] {
    return s.GetString(CategoryFaq, string(key))
}

// Search-specific typed accessors
func (s *ValidationDataService) GetSearchStringArray(key SearchKey) apperror.Result[[]string] {
    return s.GetStringArray(CategorySearch, string(key))
}

func (s *ValidationDataService) GetSearchNumber(key SearchKey) apperror.Result[float64] {
    return s.GetNumber(CategorySearch, string(key))
}

// InvalidateCache clears cached validation data
func (s *ValidationDataService) InvalidateCache() {
    s.cache = sync.Map{}
}
```

---

## Step 5: Correct Validator Implementation (Using Typed Constants)

```go
// ✅ CORRECT: Using typed constants - no magic strings
func (v *GuidelineValidator) validateTransitionDensity(content string, _ *SeoConfig) ValidationResult {
    // Load transition words using typed accessor
    transitions, err := v.validationData.GetSeoStringArray(SeoKeyTransitionWords)
    if err != nil {
        return ValidationResult{
            Passed:  false,
            Message: "Failed to load transition words from config",
        }
    }

    // Load threshold using typed accessor
    threshold, err := v.validationData.GetSeoNumber(SeoKeyTransitionDensityThreshold)
    if err != nil {
        threshold = 40.0  // Fallback if not configured
    }

    words := strings.Fields(strings.ToLower(content))
    transitionCount := 0

    transitionSet := make(map[string]bool)
    for _, t := range transitions {
        transitionSet[strings.ToLower(t)] = true
    }

    for _, word := range words {
        cleanWord := strings.Trim(word, ".,!?;:")
        if transitionSet[cleanWord] {
            transitionCount++
        }
    }

    density := float64(transitionCount) / float64(len(words)) * 100
    passed := density >= threshold

    return ValidationResult{
        Passed:  passed,
        Message: fmt.Sprintf("Transition density: %.1f%% (required: %.0f%%+)", density, threshold),
    }
}

// Example: Using RAG constants
func (s *RagService) GetStopWords() apperror.Result[[]string] {
    return s.validationData.GetRagStringArray(RagKeyStopWords)
}

// Example: Using Search constants
func (s *SearchService) GetAllowedFileTypes() apperror.Result[[]string] {
    return s.validationData.GetSearchStringArray(SearchKeyAllowedFileTypes)
}
```

---

## Anti-Pattern vs Correct Pattern

### ❌ WRONG: Magic Strings
```go
// Never do this
transitions, _ := v.validationData.GetStringArray("Seo", "TransitionWords")
threshold, _ := v.validationData.GetNumber("Seo", "TransitionDensityThreshold")
```

### ✅ CORRECT: Typed Constants
```go
// Always use typed constants
transitions, _ := v.validationData.GetSeoStringArray(SeoKeyTransitionWords)
threshold, _ := v.validationData.GetSeoNumber(SeoKeyTransitionDensityThreshold)
```
