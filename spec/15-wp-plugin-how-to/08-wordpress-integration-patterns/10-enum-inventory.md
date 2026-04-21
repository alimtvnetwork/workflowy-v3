# 8.9 Complete Enum Inventory for a Full-Featured Plugin

> **Parent:** [Phase 8 overview](./00-overview.md)

---

| Enum | File | Cases (minimum) |
|------|------|-----------------|
| `PluginConfigType` | `Enums/PluginConfigType.php` | Slug, ShortName, Name, Version, MinWpVersion, MinPhpVersion, ApiNamespace, ApiVersion, LogPrefix, SettingsGroup, DebugConstant |
| `EndpointType` | `Enums/EndpointType.php` | Status, Plugins, Activate, Deactivate, Upload, FileUpload, Logs, Settings |
| `HttpMethodType` | `Enums/HttpMethodType.php` | Get, Post, Put, Delete |
| `HttpStatusType` | `Enums/HttpStatusType.php` | Ok, Created, BadRequest, Unauthorized, Forbidden, NotFound, ServerError |
| `HookType` | `Enums/HookType.php` | RestApiInit, PluginsLoaded, AdminMenu, AdminInit |
| `LogLevelType` | `Enums/LogLevelType.php` | Debug, Info, Warn, Error |
| `ResponseKeyType` | `Enums/ResponseKeyType.php` | Status, IsSuccess, IsFailed, Code, Message, Timestamp, Attributes, RequestedAt, TotalRecords, Results, Errors |
| `CapabilityType` | `Enums/CapabilityType.php` | ActivatePlugins, ManageOptions |
| `WpErrorCodeType` | `Enums/WpErrorCodeType.php` | Unauthorized, Forbidden, InvalidCredentials |
| `PathLogFileType` | `Enums/PathLogFileType.php` | Info, Error, Stacktrace, Autoloader, Fatal |
| `PhpNativeType` | `Enums/PhpNativeType.php` | PhpArray, PhpString, PhpInteger, PhpDouble, PhpBoolean, PhpObject, PhpNull |
| `AjaxActionType` | `Enums/AjaxActionType.php` | ClearCache, ExportData, RunDiagnostic |
| `CronScheduleType` | `Enums/CronScheduleType.php` | LogRotation, CacheCleanup |
| `SeedStrategyType` | `Enums/SeedStrategyType.php` | InsertIfEmpty, UpsertByKey, ReplaceAll |
