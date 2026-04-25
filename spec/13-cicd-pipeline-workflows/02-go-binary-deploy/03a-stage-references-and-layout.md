# Stage-by-Stage References & Multi-Module Layout

> **Split from** [`03-complete-workflow-reference.md`](./03-complete-workflow-reference.md) on 2026-04-25 to keep both files under the 400-line guideline (closes F-08).
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## Stage-by-Stage Cross-References

| Stage | Spec Reference |
|-------|---------------|
| Checkout & Setup | [Shared Conventions](../16-shared-conventions.md) |
| Version Resolution | [Shared Conventions — Version Resolution](../16-shared-conventions.md#version-resolution) |
| Windows Resources | [Binary Icon Branding](../09-binary-icon-branding.md) |
| Cross-Compilation | [Cross-Compilation](../../14-self-update-app-update/10-cross-compilation.md) |
| Multi-Module Build | [Release Pipeline — Multiple Binaries](./02-release-pipeline.md#multiple-binaries-multi-module-build) |
| Docs-Site Bundling | [Docs-Site Bundling](./02-release-pipeline.md#docs-site-bundling) |
| Code Signing | [Code Signing](../05-code-signing.md) |
| Compression | [Release Assets](../../14-self-update-app-update/07-release-assets.md) |
| Checksums | [Checksums & Verification](../../14-self-update-app-update/08-checksums-verification.md) |
| Install Scripts | [Install Script Generation](../04-install-script-generation.md) |
| Changelog | [Release Body and Changelog](../07-release-body-and-changelog.md) |
| GitHub Release | [GitHub Release Standard](../17-github-release-standard.md) |

---

## Multi-Module Directory Layout

This workflow assumes the following project structure for multi-binary projects:

```
<repo-root>/
├── <binary>/                  # Main binary Go module
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   ├── winres.json
│   ├── assets/icon.png
│   └── dist/                  # ALL build outputs go here
│       ├── <binary>-linux-amd64.tar.gz
│       ├── <binary>-updater-linux-amd64.tar.gz
│       ├── docs-site.zip
│       ├── checksums.txt
│       ├── install.ps1
│       └── install.sh
├── <binary>-updater/          # Updater binary Go module
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   └── winres.json
├── docs-site/                 # Documentation site (Node.js)
│   ├── package.json
│   └── dist/
├── scripts/
│   ├── install.ps1            # Template with placeholders
│   └── install.sh             # Template with placeholders
└── CHANGELOG.md
```

Key rules:
- The updater binary outputs to `../<binary>/dist/` (the main module's dist folder)
- `docs-site.zip` is built from a Node.js project and placed in the same `dist/`
- All assets converge into a **single `dist/` directory** for unified packaging and release

---

## Error Recovery

| Failure Point | Behavior | Fallback |
|---------------|----------|----------|
| Version resolution fails | Pipeline exits immediately | Fix the Git ref or branch name |
| One cross-compile target fails | Pipeline fails — no partial releases | Fix the build error and re-tag |
| Code signing times out (600s) | Signing step fails; pipeline stops | Disable signing via `SIGNPATH_SIGNING_ENABLED=false` and release unsigned |
| Changelog extraction finds nothing | Uses fallback text: "No changelog entry found for $VERSION." | Add changelog entry and re-release |
| Docs-site build fails | Pipeline fails | Fix docs build or remove docs-site step |
| GitHub Release creation fails | Pipeline fails | Check permissions and re-run |

**Policy**: Release builds are all-or-nothing. A partial release (e.g., 5 of 6 targets) is never published. If any stage fails, the entire pipeline fails and must be re-run after fixing the issue.

---

## Constraints

- This is a **single-job workflow** — all stages run sequentially on one runner
- Binaries are built **exactly once** — no stage triggers a rebuild
- The updater builds into the main module's `dist/` directory
- Release pipelines **never cancel** — `cancel-in-progress: false`
- All tools are pinned to exact versions
- `working-directory` is used instead of `cd`

---

## Cross-References

- [CI Pipeline](./01-ci-pipeline.md) — Validation pipeline that precedes releases
- [Release Pipeline](./02-release-pipeline.md) — Modular spec this workflow implements
- [Shared Conventions](../16-shared-conventions.md) — Platform, triggers, permissions

---

*Complete workflow reference — v3.1.0 — 2026-04-13*
