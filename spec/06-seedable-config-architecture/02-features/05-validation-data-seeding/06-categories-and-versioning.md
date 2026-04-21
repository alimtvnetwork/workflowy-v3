# 6. Categories Reference + Version Seeding Flow

> **Parent:** [Validation Data Seeding overview](./00-overview.md)

## Common Validation Data Categories

### SEO Validation

| Key | Type | Description |
|-----|------|-------------|
| `TransitionWords` | array | Words for transition density |
| `TransitionDensityThreshold` | number | Min % required |
| `MaxSentenceWords` | number | Max words per sentence |
| `MaxParagraphWords` | number | Max words per paragraph |
| `MinKeywordMentions` | number | Min keyword occurrences |
| `ForbiddenContainerTags` | array | Tags not allowed in containers |

### RAG Validation

| Key | Type | Description |
|-----|------|-------------|
| `StopWords` | array | Words to exclude from indexing |
| `MinChunkSize` | number | Minimum chunk size |
| `MaxChunkSize` | number | Maximum chunk size |
| `ChunkOverlap` | number | Overlap between chunks |

### Search Validation

| Key | Type | Description |
|-----|------|-------------|
| `AllowedFileTypes` | array | File extensions to index |
| `ExcludedDirectories` | array | Directories to skip |
| `MaxFileSize` | number | Max file size to process |

---

## Version Seeding Behavior

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VALIDATION DATA SEEDING FLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  config.seed.json (v1.3.0)                                               │
│  └── Categories.Seo.Settings.TransitionWords: [...]                     │
│                                                                          │
│                          ↓                                               │
│                                                                          │
│  ConfigService.SeedWithVersionCheck()                                    │
│  └── Check: SeedVersion (1.3.0) > DbVersion (1.2.0)?                  │
│                                                                          │
│                          ↓ YES                                           │
│                                                                          │
│  INSERT INTO ValidationData                                              │
│  └── Category: 'Seo'                                                    │
│  └── Key: 'TransitionWords'                                             │
│  └── Value: '["however","therefore",...]'                               │
│  └── Version: '1.3.0'                                                   │
│                                                                          │
│                          ↓                                               │
│                                                                          │
│  Update ConfigMeta.SeedVersion = '1.3.0'                               │
│  Append to CHANGELOG.md                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```
