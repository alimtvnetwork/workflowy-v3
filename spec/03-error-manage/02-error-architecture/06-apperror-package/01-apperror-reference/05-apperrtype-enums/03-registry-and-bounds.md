# Global Variant Registry & Bounds

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Source files:** `variant_registry.go`, `consts.go`

---

## Global Variant Registry

Single source-of-truth map for all error variants — enables iteration, lookup, and serialization:

```go
// apperrtype/variant_registry.go
package apperrtype

var variantRegistry = map[Variation]VariantStructure{
    // ── E1xxx — Configuration ──
    ConfigFileMissing:  {Name: "ConfigFileMissing",  Code: "E1001", Message: "configuration file not found",            Variant: ConfigFileMissing},
    ConfigParseFailure: {Name: "ConfigParseFailure", Code: "E1002", Message: "failed to parse configuration",           Variant: ConfigParseFailure},
    ConfigKeyMissing:   {Name: "ConfigKeyMissing",   Code: "E1003", Message: "required configuration key missing",      Variant: ConfigKeyMissing},
    EnvVarMissing:      {Name: "EnvVarMissing",      Code: "E1004", Message: "required environment variable not set",   Variant: EnvVarMissing},

    // ── E2xxx — Database / Site / Plugin ──
    DBConnectionFailed: {Name: "DBConnectionFailed", Code: "E2001", Message: "database connection failed",     Variant: DBConnectionFailed},
    DBQueryFailed:      {Name: "DBQueryFailed",      Code: "E2002", Message: "database query failed",          Variant: DBQueryFailed},
    DBRecordNotFound:   {Name: "DBRecordNotFound",   Code: "E2003", Message: "record not found",               Variant: DBRecordNotFound},
    DBDuplicateKey:     {Name: "DBDuplicateKey",     Code: "E2004", Message: "duplicate key violation",        Variant: DBDuplicateKey},
    DBMigrationFailed:  {Name: "DBMigrationFailed",  Code: "E2005", Message: "database migration failed",     Variant: DBMigrationFailed},
    SiteNotFound:       {Name: "SiteNotFound",       Code: "E2010", Message: "site not found",                 Variant: SiteNotFound},
    SiteBlocked:        {Name: "SiteBlocked",        Code: "E2011", Message: "site is blocked",                Variant: SiteBlocked},
    PluginSlugMissing:  {Name: "PluginSlugMissing",  Code: "E2012", Message: "plugin slug required",           Variant: PluginSlugMissing},
    PluginNotFound:     {Name: "PluginNotFound",     Code: "E2013", Message: "plugin not found",               Variant: PluginNotFound},
    PluginAlreadyActive:{Name: "PluginAlreadyActive", Code: "E2014", Message: "plugin is already active",     Variant: PluginAlreadyActive},

    // ── E3xxx — WordPress API ──
    WPConnectionFailed: {Name: "WPConnectionFailed", Code: "E3001", Message: "WordPress connection failed",    Variant: WPConnectionFailed},
    WPAuthFailed:       {Name: "WPAuthFailed",       Code: "E3002", Message: "WordPress authentication failed", Variant: WPAuthFailed},
    WPEndpointNotFound: {Name: "WPEndpointNotFound", Code: "E3003", Message: "WordPress endpoint not found",  Variant: WPEndpointNotFound},
    WPRateLimited:      {Name: "WPRateLimited",      Code: "E3004", Message: "WordPress API rate limited",    Variant: WPRateLimited},
    WPResponseInvalid:  {Name: "WPResponseInvalid",  Code: "E3005", Message: "invalid WordPress API response", Variant: WPResponseInvalid},

    // ... (remaining domains follow identical pattern)
    // Full registry continues for E4xxx–E18xxx with same structure

    // ── E4xxx — File System (path variants) ──
    PathMissing:        {Name: "PathMissing",        Code: "E4016", Message: "required path is missing",   Variant: PathMissing},
    PathFailedToCreate: {Name: "PathFailedToCreate",  Code: "E4017", Message: "failed to create path",     Variant: PathFailedToCreate},
    PathFailedToRead:   {Name: "PathFailedToRead",    Code: "E4018", Message: "failed to read path",       Variant: PathFailedToRead},
    PathFailedToWrite:  {Name: "PathFailedToWrite",   Code: "E4019", Message: "failed to write to path",   Variant: PathFailedToWrite},
    PathFailedToDelete: {Name: "PathFailedToDelete",  Code: "E4020", Message: "failed to delete path",     Variant: PathFailedToDelete},
}
```

---

## Bounds

```go
// apperrtype/consts.go
package apperrtype

const (
    minValue = int(NoError)
    maxValue = int(MaxError)
)
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-variation-enum.md`](./01-variation-enum.md) — Variation enum keys for this map
- [`02-variant-structure.md`](./02-variant-structure.md) — VariantStructure values stored in this map
- [`04-reverse-lookup-maps.md`](./04-reverse-lookup-maps.md) — Maps built from this registry at init
