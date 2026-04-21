# 4. Naming Conventions

> **Parent:** [00-overview.md](./00-overview.md)

## Universal Rules

| Element | Convention | Example |
|---------|-----------|---------|
| Classes / Types | PascalCase | `OrderService`, `UserRole` |
| Functions / Methods | camelCase (TS/PHP), PascalCase (Go exported) | `getUser()`, `GetUser()` |
| Variables | camelCase | `orderTotal`, `userName` |
| Constants | UPPER_SNAKE_CASE or PascalCase | `MAX_RETRIES`, `DefaultTimeout` |
| Files (Go) | PascalCase | `OrderService.go` |
| Files (TS) | kebab-case or PascalCase | `order-service.ts` |
| Enum types | PascalCase + `Type` suffix | `StatusType`, `RoleType` |

## Abbreviation Overrides (PascalCase Always)

| Abbreviation | Correct | Wrong |
|-------------|---------|-------|
| ID | `UserId`, `OrderId` | `userID`, `orderID` |
| URL | `BaseUrl`, `ApiUrl` | `baseURL`, `apiURL` |
| JSON | `JsonPayload` | `JSONPayload` |
| API | `ApiClient` | `APIClient` |
| HTTP | `HttpMethod` | `HTTPMethod` |
| SQL | `SqlQuery` | `SQLQuery` |

> Only first letter capitalized for abbreviations — consistent across all languages.

## Boolean Naming (All Languages — TS, Go, PHP, C#, Rust)

Every boolean variable **and** every function/method that returns a boolean **must** start with `is` or `has` (99% of cases). Use `should` only when expressing a recommendation or preference (e.g., `shouldRetry`). Never use `can`, `was`, or `will`.

**Never use `not`, `no`, or any negative word** in a boolean name. Use the semantic inverse instead.

| ❌ Wrong | ✅ Correct | Why |
|----------|-----------|-----|
| `active` | `isActive` | Missing prefix |
| `loaded` | `isLoaded` | Missing prefix |
| `visible` | `isVisible` | Missing prefix |
| `error` | `hasError` | Missing prefix |
| `checkPermission()` | `hasPermission()` | Function returns bool — needs prefix |
| `validateToken()` | `isTokenValid()` | Function returns bool — needs prefix |
| `existsInDb()` | `isPersistedInDb()` | Function returns bool — needs prefix |

## Semantic Inverse Pairs (Never Use `not` or `no`)

When you need the opposite of a boolean, **do not negate** — use the inverse name:

| ❌ Negative (banned) | ✅ Positive Inverse |
|----------------------|-------------------|
| `isNotActive` | `isInactive` |
| `isNotReady` | `isPending` |
| `isNotValid` | `isInvalid` |
| `isNotFound` | `isMissing` |
| `isNotAllowed` | `isForbidden` |
| `isNotConnected` | `isDisconnected` |
| `hasNoPermission` | `isUnauthorized` |
| `isNotEmpty` | `hasContent` |
| `isNotComplete` | `isIncomplete` |
| `isNotEnabled` | `isDisabled` |
| `notBlocked` | `isBlocked` / `isAllowed` |
| `noResults` | `isResultEmpty` |

> **Rule of thumb:** If you're typing `not`, `no`, or `!` in a name — stop and find the inverse word.
