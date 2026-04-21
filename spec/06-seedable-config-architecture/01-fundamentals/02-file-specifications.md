# File Specifications

> **Parent:** [00-overview.md](./00-overview.md)

---

## config.seed.json

The seed file contains default values and metadata:

```json
{
  "$schema": "./config.schema.json",
  "Version": "1.2.0",
  "Changelog": "Added new cache settings for improved performance",
  "Categories": {
    "General": {
      "DisplayName": "General",
      "Description": "General application settings",
      "Settings": {
        "Theme": {
          "Type": "select",
          "Label": "Theme",
          "Description": "Application color theme",
          "Default": "system",
          "Options": ["light", "dark", "system", "high-contrast"]
        },
        "Language": {
          "Type": "select",
          "Label": "Language",
          "Default": "en",
          "Options": ["en", "es", "fr", "de", "zh", "ja"]
        },
        "AutoSave": {
          "Type": "boolean",
          "Label": "Auto Save",
          "Description": "Automatically save changes",
          "Default": true
        }
      }
    },
    "Cache": {
      "DisplayName": "Cache",
      "Description": "Caching configuration",
      "Version": "1.2.0",
      "AddedIn": "1.2.0",
      "Settings": {
        "Enabled": {
          "Type": "boolean",
          "Label": "Enable Cache",
          "Default": true
        },
        "MaxSizeMb": {
          "Type": "number",
          "Label": "Max Cache Size (MB)",
          "Default": 100,
          "Min": 10,
          "Max": 1000
        },
        "TtlHours": {
          "Type": "number",
          "Label": "Cache TTL (hours)",
          "Default": 24,
          "Min": 1,
          "Max": 168
        }
      }
    }
  }
}
```

---

## config.schema.json

JSON Schema for validation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Application Configuration",
  "Type": "object",
  "required": ["Version", "Categories"],
  "properties": {
    "Version": {
      "Type": "string",
      "pattern": "^\\\\d+\\\\.\\\\d+\\\\.\\\\d+$",
      "Description": "Semantic version of configuration"
    },
    "Changelog": {
      "Type": "string",
      "Description": "Description of changes in this version"
    },
    "Categories": {
      "Type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/category"
      }
    }
  },
  "definitions": {
    "category": {
      "Type": "object",
      "required": ["DisplayName", "Settings"],
      "properties": {
        "DisplayName": { "Type": "string" },
        "Description": { "Type": "string" },
        "Version": { "Type": "string" },
        "AddedIn": { "Type": "string" },
        "Settings": {
          "Type": "object",
          "additionalProperties": {
            "$ref": "#/definitions/setting"
          }
        }
      }
    },
    "setting": {
      "Type": "object",
      "required": ["Type", "Label", "Default"],
      "properties": {
        "Type": {
          "Type": "string",
          "enum": ["string", "number", "boolean", "select", "array", "object"]
        },
        "Label": { "Type": "string" },
        "Description": { "Type": "string" },
        "Default": {},
        "Min": { "Type": "number" },
        "Max": { "Type": "number" },
        "Options": { "Type": "array" },
        "AddedIn": { "Type": "string" },
        "DeprecatedIn": { "Type": "string" }
      }
    }
  }
}
```

---

## CHANGELOG.md format

```markdown
# Changelog

All notable configuration changes are documented here.

## [1.2.0] - 2026-02-01

### Added
- Cache category with Enabled, MaxSizeMb, TtlHours settings

### Changed
- Theme options now include "high-contrast"

## [1.1.0] - 2026-01-15

### Added
- Network category with port and timeout settings

## [1.0.0] - 2026-01-01

### Initial Release
- General category with Theme, Language, AutoSave
```
