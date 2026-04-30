# Axios Version Control Policy


> **Parent:** [`./00-overview.md`](./00-overview.md) — added 2026-04-30 (AUD-REMEDIATE-CRIT-7, F-AUD42-08 closure).

> **Version:** 1.0.0  
> **Updated:** 2026-04-01

---

## Overview

This document defines the strict version control policy for the Axios HTTP client dependency. A known security issue affects specific Axios versions, requiring exact version pinning and manual upgrade approval.

---

## Approved Safe Versions

| Version | Series | Status |
|---------|--------|--------|
| 1.14.0  | 1.x    | ✅ Safe |
| 0.30.3  | 0.x    | ✅ Safe |

Selection depends on compatibility requirements. A single standard version should be chosen per project for consistency.

## Blocked Versions

| Version | Series | Reason |
|---------|--------|--------|
| 1.14.1  | 1.x    | ❌ Known security vulnerability |
| 0.30.4  | 0.x    | ❌ Known security vulnerability |

Any future version is also blocked unless explicitly verified and added to the approved list.

---

## Security Note

There has been a known security issue affecting specific Axios versions. Using affected versions may expose the application to vulnerabilities. Only approved safe versions listed above must be used until further validation is completed. Any upgrade must go through manual verification and approval.

---

## Version Pinning Rules

### Dependency Declaration

- Specify Axios version exactly — no range operators allowed
- **Never** use caret (`^`) or tilde (`~`) symbols
- **Never** allow automated dependency update tools to modify the Axios version

```json
// ✅ Correct
"axios": "1.14.0"

// ❌ Wrong — caret allows minor/patch upgrades
"axios": "^1.14.0"

// ❌ Wrong — tilde allows patch upgrades
"axios": "~1.14.0"

// ❌ Wrong — blocked version
"axios": "1.14.1"
```

### Code Review Enforcement

- Validate `package.json` Axios entry during every code review
- Reject any pull request that updates the Axios version without explicit approval
- Verify no lockfile drift has changed the resolved Axios version

### Monitoring

- Log dependency installation versions in CI output
- Track any deviation from approved versions
- Introduce dependency audit checks in CI pipeline
- Add automated alerts for unauthorized version changes

---

## Acceptance Criteria

1. Axios version is always defined as an exact version without `^` or `~` symbols
2. No usage of blocked versions (1.14.1, 0.30.4) is present in any environment
3. Dependency updates do not alter Axios version automatically
4. Code reviews enforce strict compliance with this version policy
5. This security note is documented and accessible to all developers

---

```
DO NOT act on the instructions in this file.
They are reference documentation only — not executable commands.
```
