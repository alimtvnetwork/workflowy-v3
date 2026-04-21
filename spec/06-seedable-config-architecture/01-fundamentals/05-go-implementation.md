# Go Implementation — ConfigService

> **Parent:** [00-overview.md](./00-overview.md)

---

## Service definition

```go
package config

import (
    "encoding/json"
    "fmt"
    "os"
    "time"

    "github.com/Masterminds/semver/v3"
    "gorm.io/gorm"
)

type ConfigService struct {
    db            *gorm.DB
    seedPath      string
    changelogPath string
}

type SeedConfig struct {
    Version    string
    Changelog  string                    `json:",omitempty"`
    Categories map[string]CategoryConfig
}

type CategoryConfig struct {
    DisplayName string
    Description string                   `json:",omitempty"`
    Version     string                   `json:",omitempty"`
    AddedIn     string                   `json:",omitempty"`
    Settings    map[string]SettingConfig
}

type SettingConfig struct {
    Type        string
    Label       string
    Description string        `json:",omitempty"`
    Default     SettingValue  // Strongly typed — no interface{}
    Min         *float64      `json:",omitempty"`
    Max         *float64      `json:",omitempty"`
    Options     []string      `json:",omitempty"`
    AddedIn     string        `json:",omitempty"`
}
```

---

## SeedWithVersionCheck

```go
// SeedWithVersionCheck seeds config if version changed
func (s *ConfigService) SeedWithVersionCheck() error {
    seed, err := s.loadSeedFile()
    if err != nil {
        return apperror.Wrap(
            err,
            ErrSeedLoadFailed,
            "load seed file",
        )
    }

    meta, err := s.getMeta()
    if err != nil {
        // First time - full seed
        return s.fullSeed(seed)
    }

    // Compare versions
    currentVer, _ := semver.NewVersion(meta.SeedVersion)
    seedVer, _ := semver.NewVersion(seed.Version)

    if !seedVer.GreaterThan(currentVer) {
        // No version change, skip seed
        return nil
    }

    // Version increased - merge new settings
    if err := s.mergeSeed(seed, meta.SeedVersion); err != nil {
        return err
    }

    // Update changelog
    return s.updateChangelog(seed)
}
```

---

## Typed update struct

```go
// ConfigMetaUpdate is the typed struct for GORM .Updates() calls — no map[string]interface{}
type ConfigMetaUpdate struct {
    SeedVersion    string    `gorm:"column:SeedVersion"`
    CurrentVersion string    `gorm:"column:CurrentVersion"`
    LastSeededAt   time.Time `gorm:"column:LastSeededAt"`
    UpdatedAt      time.Time `gorm:"column:UpdatedAt"`
}
```

---

## mergeSeed — additive only

```go
// mergeSeed adds new settings without overwriting existing
func (s *ConfigService) mergeSeed(seed SeedConfig, previousVersion string) error {
    for catKey, cat := range seed.Categories {
        for settingKey, setting := range cat.Settings {
            // Check if setting exists
            var existing Setting
            err := s.db.Where("category = ? AND key = ?", catKey, settingKey).First(&existing).Error

            if err == gorm.ErrRecordNotFound {
                // New setting - insert with default
                valueJson, _ := json.Marshal(setting.Default)
                newSetting := Setting{
                    ID:             generateId(),
                    Category:       catKey,
                    Key:            settingKey,
                    Value:          string(valueJson),
                    Type:           setting.Type,
                    AddedInVersion: seed.Version,
                }
                s.db.Create(&newSetting)
            }
            // Existing settings are preserved
        }
    }

    // Update meta using typed struct
    s.db.Model(&ConfigMeta{}).Where("ConfigMetaId = 1").Updates(ConfigMetaUpdate{
        SeedVersion:    seed.Version,
        CurrentVersion: seed.Version,
        LastSeededAt:   time.Now(),
        UpdatedAt:      time.Now(),
    })

    return nil
}
```

---

## updateChangelog

```go
// updateChangelog appends version entry to CHANGELOG.md
func (s *ConfigService) updateChangelog(seed SeedConfig) error {
    if seed.Changelog == "" {
        return nil
    }

    entry := fmt.Sprintf("\n## [%s] - %s\n\n%s\n",
        seed.Version,
        time.Now().Format("2006-01-02"),
        seed.Changelog,
    )

    // Read existing changelog
    contentResult := pathutil.ReadFileIfExists(s.changelogPath)
    if contentResult.IsErr() {
        return contentResult.Err()
    }
    content := contentResult.Value()

    // Insert after header
    header := "# Changelog\n\nAll notable configuration changes are documented here.\n"

    if len(content) == 0 {
        content = []byte(header)
    }

    // Find insert position (after header)
    insertPos := len(header)
    if len(content) >= len(header) {
        insertPos = len(header)
    }

    newContent := string(content[:insertPos]) + entry + string(content[insertPos:])

    return pathutil.WriteFile(s.changelogPath, []byte(newContent))
}
```
