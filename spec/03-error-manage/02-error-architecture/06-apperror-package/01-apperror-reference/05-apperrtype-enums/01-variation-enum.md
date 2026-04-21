# Variation Enum — All Domain Variants

> **Parent:** [`00-overview.md`](./00-overview.md)
> **Source file:** `types/apperrtype/variation.go`

---

## Variation (uint16 enum)

Single enum type for all error variants. Uses `uint16` to support 400+ variants across all domains.

```go
// apperrtype/variation.go
package apperrtype

type Variation uint16

const (
    NoError Variation = iota  // 0 — zero value, "no error"

    // ── E1xxx — Configuration ──────────────────────────
    ConfigFileMissing          // E1001
    ConfigParseFailure         // E1002
    ConfigKeyMissing           // E1003
    EnvVarMissing              // E1004

    // ── E2xxx — Database / Site / Plugin ───────────────
    DBConnectionFailed         // E2001
    DBQueryFailed              // E2002
    DBRecordNotFound           // E2003
    DBDuplicateKey             // E2004
    DBMigrationFailed          // E2005
    SiteNotFound               // E2010
    SiteBlocked                // E2011
    PluginSlugMissing          // E2012
    PluginNotFound             // E2013
    PluginAlreadyActive        // E2014

    // ── E3xxx — WordPress API ──────────────────────────
    WPConnectionFailed         // E3001
    WPAuthFailed               // E3002
    WPEndpointNotFound         // E3003
    WPRateLimited              // E3004
    WPResponseInvalid          // E3005

    // ── E4xxx — File System ────────────────────────────
    FileNotFound               // E4001
    FileReadFailed             // E4002
    FileWriteFailed            // E4003
    DirCreateFailed            // E4004
    PermissionDenied           // E4005
    FileNotExist               // E4006
    FileAccessFailed           // E4007
    FileAppendFailed           // E4008
    DirNotExist                // E4009
    DirAccessFailed            // E4010
    EmptyFilePath              // E4011
    PathNotFound               // E4012
    PathInvalid                // E4013
    PathStatFailed             // E4014
    SymlinkFailed              // E4015
    PathMissing                // E4016
    PathFailedToCreate         // E4017
    PathFailedToRead           // E4018
    PathFailedToWrite          // E4019
    PathFailedToDelete         // E4020

    // ── E5xxx — Sync ──────────────────────────────────
    SyncConflict               // E5001
    SyncTimeout                // E5002
    SyncChecksumFail           // E5003
    SyncLockAcquire            // E5004
    SyncStateMismatch          // E5005
    SyncOutOfSync              // E5006

    // ── E6xxx — Backup ────────────────────────────────
    BackupCreateFailed         // E6001
    BackupRestoreFailed        // E6002
    BackupNotFound             // E6003
    BackupCorrupted            // E6004
    BackupQuotaExceeded        // E6005

    // ── E7xxx — Git ───────────────────────────────────
    GitCloneFailed             // E7001
    GitPushFailed              // E7002
    GitPullFailed              // E7003
    GitMergeConflict           // E7004
    GitRepoNotFound            // E7005
    GitCommitFailed            // E7006

    // ── E8xxx — Build ─────────────────────────────────
    BuildCompileFailed         // E8001
    BuildDependencyMissing     // E8002
    BuildTimeout               // E8003
    BuildArtifactFailed        // E8004
    BuildConfigInvalid         // E8005
    BuildTranspileFailed       // E8006

    // ── E9xxx — General ───────────────────────────────
    InternalError              // E9001
    ValidationFailed           // E9002
    NotImplemented             // E9003
    Unauthorized               // E9004
    RateLimited                // E9005
    InvalidInput               // E9006
    InvalidOutput              // E9007
    InvalidCondition           // E9008
    UnexpectedValue            // E9009
    UnexpectedType             // E9010
    OutOfRangeValue            // E9011
    CastingFailed              // E9012
    NullOrEmpty                // E9013
    MismatchExpectation        // E9014
    NotFound                   // E9015
    CrudOperationFailed        // E9016
    MappingFailed              // E9017
    ParsingFailed              // E9018
    SerializationFailed        // E9019

    // ── E10xxx — E2E Test ─────────────────────────────
    E2ESetupFailed             // E10001
    E2EAssertFailed            // E10002
    E2ETimeoutFailed           // E10003
    E2EFixtureFailed           // E10004

    // ── E11xxx — Publish ──────────────────────────────
    PublishFailed              // E11001
    PublishConflict            // E11002
    PublishRollback            // E11003
    PublishTargetDown          // E11004

    // ── E12xxx — Version ──────────────────────────────
    VersionNotFound            // E12001
    VersionConflict            // E12002
    VersionParseFail           // E12003
    VersionLocked              // E12004

    // ── E13xxx — Session ──────────────────────────────
    SessionExpired             // E13001
    SessionNotFound            // E13002
    SessionInvalid             // E13003
    SessionLimitHit            // E13004

    // ── E14xxx — Crypto ───────────────────────────────
    CryptoEncryptFailed        // E14001
    CryptoDecryptFailed        // E14002
    CryptoKeyInvalid           // E14003
    CryptoHashMismatch         // E14004
    CryptoChecksumFailed       // E14005

    // ── E15xxx — Network / Connection ─────────────────
    NetworkOffline             // E15001
    ConnectionFailed           // E15002
    ConnectionTimeout          // E15003
    Disconnected               // E15004
    RequestFailed              // E15005

    // ── E16xxx — Process / Execution ──────────────────
    ProcessFailed              // E16001
    CommandExecutionFailed     // E16002
    ScriptFailed               // E16003
    LockFailed                 // E16004
    StepFailed                 // E16005
    CompletionFailed           // E16006

    // ── E17xxx — Encoding / Conversion ────────────────
    EncodingFailed             // E17001
    DecodingFailed             // E17002
    MarshalFailed              // E17003
    UnmarshalFailed            // E17004
    ConversionFailed           // E17005

    // ── E18xxx — Permission / Authorization ───────────
    PermissionFailed           // E18001
    AuthorizationFailed        // E18002
    AccessDenied               // E18003
    ResourceFrozen             // E18004

    // ── Sentinel ──────────────────────────────────────
    MaxError                   // must remain last
)
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`02-variant-structure.md`](./02-variant-structure.md) — Struct + methods that wrap each Variation
- [`03-registry-and-bounds.md`](./03-registry-and-bounds.md) — Registry holding each variant's metadata
