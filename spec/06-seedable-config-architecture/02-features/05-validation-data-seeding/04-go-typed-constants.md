# 4. Step 3 — Go Enums/Constants (MANDATORY)

> **Parent:** [Validation Data Seeding overview](./00-overview.md)

> **CRITICAL:** Never use magic strings. Always use typed constants for categories and keys.

```go
package validation

// ============================================
// Validation Category Constants
// ============================================
type ValidationCategory string

const (
    CategorySeo    ValidationCategory = "Seo"
    CategoryRag    ValidationCategory = "Rag"
    CategoryFaq    ValidationCategory = "Faq"
    CategorySearch ValidationCategory = "Search"
)

// ============================================
// SEO Validation Key Constants
// ============================================
type SeoKey string

const (
    SeoKeyTransitionWords           SeoKey = "TransitionWords"
    SeoKeyTransitionDensityThreshold SeoKey = "TransitionDensityThreshold"
    SeoKeyMaxSentenceWords          SeoKey = "MaxSentenceWords"
    SeoKeyMaxParagraphWords         SeoKey = "MaxParagraphWords"
    SeoKeyMinKeywordMentions        SeoKey = "MinKeywordMentions"
    SeoKeyMinAreaMentions           SeoKey = "MinAreaMentions"
    SeoKeyMaxAreaMentions           SeoKey = "MaxAreaMentions"
    SeoKeyLinksPerSentenceMin       SeoKey = "LinksPerSentenceMin"
    SeoKeyLinksPerSentenceMax       SeoKey = "LinksPerSentenceMax"
    SeoKeyStatisticalRangeMin       SeoKey = "StatisticalRangeMin"
    SeoKeyStatisticalRangeMax       SeoKey = "StatisticalRangeMax"
    SeoKeyTrustMetricsMax           SeoKey = "TrustMetricsMax"
    SeoKeyForbiddenContainerTags    SeoKey = "ForbiddenContainerTags"
    SeoKeyExperienceYearsMin        SeoKey = "ExperienceYearsMin"
    SeoKeyExperienceYearsMax        SeoKey = "ExperienceYearsMax"
    SeoKeySlugMinWords              SeoKey = "SlugMinWords"
    SeoKeySlugMaxWords              SeoKey = "SlugMaxWords"
    SeoKeyExternalLinkNofollowCount SeoKey = "ExternalLinkNofollowCount"
)

// ============================================
// RAG Validation Key Constants
// ============================================
type RagKey string

const (
    RagKeyStopWords    RagKey = "StopWords"
    RagKeyMinChunkSize RagKey = "MinChunkSize"
    RagKeyMaxChunkSize RagKey = "MaxChunkSize"
    RagKeyChunkOverlap RagKey = "ChunkOverlap"
)

// ============================================
// FAQ Validation Key Constants
// ============================================
type FaqKey string

const (
    FaqKeyDefaultOutputFormat       FaqKey = "DefaultOutputFormat"
    FaqKeyDefaultIncludeSchema      FaqKey = "DefaultIncludeSchema"
    FaqKeyDefaultSchemaVariation    FaqKey = "DefaultSchemaVariation"
    FaqKeyDefaultEncodeHtmlInJson   FaqKey = "DefaultEncodeHtmlInJson"
    FaqKeyDefaultWordLimit          FaqKey = "DefaultWordLimit"
    FaqKeyDefaultTransitionDensity  FaqKey = "DefaultTransitionDensity"
    FaqKeyDefaultKeywordMentions    FaqKey = "DefaultKeywordMentions"
    FaqKeyDefaultAreaMentions       FaqKey = "DefaultAreaMentions"
    FaqKeyDefaultMaxSentenceWords   FaqKey = "DefaultMaxSentenceWords"
    FaqKeyDefaultMaxParagraphWords  FaqKey = "DefaultMaxParagraphWords"
    FaqKeyDefaultEnableGSearch      FaqKey = "DefaultEnableGSearch"
    FaqKeyDefaultEnableSitemapLinking FaqKey = "DefaultEnableSitemapLinking"
    FaqKeyDefaultEnableYouTubeEmbed FaqKey = "DefaultEnableYouTubeEmbed"
    FaqKeySchemaParagraphs          FaqKey = "SchemaParagraphs"
    FaqKeySchemaTemplates           FaqKey = "SchemaTemplates"
    FaqKeyHtmlTemplates             FaqKey = "HtmlTemplates"
    FaqKeyTransitionWords           FaqKey = "TransitionWords"
    FaqKeyTrustPercentageMin        FaqKey = "TrustPercentageMin"
    FaqKeyTrustPercentageMax        FaqKey = "TrustPercentageMax"
    FaqKeyMonthlyImprovementMin     FaqKey = "MonthlyImprovementMin"
    FaqKeyMonthlyImprovementMax     FaqKey = "MonthlyImprovementMax"
    FaqKeyEffectivenessMin          FaqKey = "EffectivenessMin"
    FaqKeyEffectivenessMax          FaqKey = "EffectivenessMax"
    FaqKeyQuestionPatterns          FaqKey = "QuestionPatterns"
)

// ============================================
// Search Validation Key Constants
// ============================================
type SearchKey string

const (
    SearchKeyAllowedFileTypes     SearchKey = "AllowedFileTypes"
    SearchKeyExcludedDirectories  SearchKey = "ExcludedDirectories"
    SearchKeyMaxFileSize          SearchKey = "MaxFileSize"
)
```
