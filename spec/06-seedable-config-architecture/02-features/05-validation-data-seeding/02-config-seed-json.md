# 2. Step 1 — Define in `config.seed.json`

> **Parent:** [Validation Data Seeding overview](./00-overview.md)

All validation data lives in the seed JSON file under the category whose enum value matches the data's domain (per `spec/19-glossary.md` §Architecture Tiers). The Default value becomes what's loaded into the Root DB on first seed.

```json
{
  "$schema": "./config.schema.json",
  "Version": "1.3.0",
  "Changelog": "Added SEO validation data arrays",
  "Categories": {
    "Seo": {
      "DisplayName": "SEO Settings",
      "Description": "SEO content generation configuration",
      "Settings": {
        "TransitionWords": {
          "Type": "array",
          "Label": "Transition Words",
          "Description": "Words counted for transition density validation",
          "Default": [
            "however", "therefore", "additionally", "moreover", "furthermore",
            "consequently", "meanwhile", "nevertheless", "accordingly", "hence",
            "thus", "indeed", "specifically", "particularly", "notably",
            "significantly", "ultimately", "essentially", "primarily", "initially",
            "subsequently", "similarly", "likewise", "conversely", "alternatively",
            "otherwise", "regardless", "nonetheless", "certainly", "undoubtedly"
          ]
        },
        "TransitionDensityThreshold": {
          "Type": "number",
          "Label": "Transition Density Threshold",
          "Description": "Minimum percentage of transition words required",
          "Default": 40,
          "Min": 10,
          "Max": 80
        },
        "MaxSentenceWords": {
          "Type": "number",
          "Label": "Max Sentence Words",
          "Description": "Maximum words allowed per sentence",
          "Default": 18,
          "Min": 10,
          "Max": 50
        },
        "MaxParagraphWords": {
          "Type": "number",
          "Label": "Max Paragraph Words",
          "Description": "Maximum words allowed per paragraph",
          "Default": 180,
          "Min": 50,
          "Max": 500
        },
        "MinKeywordMentions": {
          "Type": "number",
          "Label": "Min Keyword Mentions",
          "Description": "Minimum keyword occurrences required",
          "Default": 8,
          "Min": 3,
          "Max": 20
        },
        "MinAreaMentions": {
          "Type": "number",
          "Label": "Min Area Mentions",
          "Description": "Minimum area/location mentions per section",
          "Default": 3,
          "Min": 1,
          "Max": 10
        },
        "MaxAreaMentions": {
          "Type": "number",
          "Label": "Max Area Mentions",
          "Description": "Maximum area/location mentions per section",
          "Default": 4,
          "Min": 2,
          "Max": 15
        },
        "LinksPerSentenceMin": {
          "Type": "number",
          "Label": "Min Links Per Sentence",
          "Description": "Minimum internal/external links per sentence",
          "Default": 2,
          "Min": 0,
          "Max": 5
        },
        "LinksPerSentenceMax": {
          "Type": "number",
          "Label": "Max Links Per Sentence",
          "Description": "Maximum internal/external links per sentence",
          "Default": 3,
          "Min": 1,
          "Max": 10
        },
        "StatisticalRangeMin": {
          "Type": "number",
          "Label": "Statistical Range Min",
          "Description": "Minimum value for credibility percentages",
          "Default": 2.51,
          "Min": 0.01,
          "Max": 10.0
        },
        "StatisticalRangeMax": {
          "Type": "number",
          "Label": "Statistical Range Max",
          "Description": "Maximum value for credibility percentages",
          "Default": 2.97,
          "Min": 0.01,
          "Max": 10.0
        },
        "TrustMetricsMax": {
          "Type": "number",
          "Label": "Trust Metrics Max",
          "Description": "Maximum percentage for company glorification metrics",
          "Default": 5,
          "Min": 1,
          "Max": 10
        },
        "ForbiddenContainerTags": {
          "Type": "array",
          "Label": "Forbidden Container Tags",
          "Description": "HTML tags not allowed inside seo-container-para contrast",
          "Default": ["p", "div"]
        },
        "ExperienceYearsMin": {
          "Type": "number",
          "Label": "Experience Years Min",
          "Description": "Minimum years for experience narratives",
          "Default": 5,
          "Min": 1,
          "Max": 20
        },
        "ExperienceYearsMax": {
          "Type": "number",
          "Label": "Experience Years Max",
          "Description": "Maximum years for experience narratives",
          "Default": 15,
          "Min": 5,
          "Max": 50
        },
        "SlugMaxWords": {
          "Type": "number",
          "Label": "Slug Max Words",
          "Description": "Maximum words in generated URL slugs",
          "Default": 4,
          "Min": 2,
          "Max": 8
        },
        "SlugMinWords": {
          "Type": "number",
          "Label": "Slug Min Words",
          "Description": "Minimum words in generated URL slugs",
          "Default": 3,
          "Min": 1,
          "Max": 5
        },
        "ExternalLinkNofollowCount": {
          "Type": "number",
          "Label": "External Nofollow Count",
          "Description": "Number of external links to mark as nofollow",
          "Default": 2,
          "Min": 0,
          "Max": 5
        }
      }
    }
  }
}
```
