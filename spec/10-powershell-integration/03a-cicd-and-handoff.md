# PowerShell Integration — CI/CD & AI Handoff

> **Split from** [`03-integration-guide.md`](./03-integration-guide.md) on 2026-04-25 to keep both files under the 400-line guideline (closes F-08).
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## CI/CD Integration

### GitHub Actions

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Build Frontend
  shell: pwsh
  run: .\run.ps1 -BuildOnly -SkipPull
```

### Azure DevOps

```yaml
- task: PowerShell@2
  inputs:
    filePath: 'run.ps1'
    arguments: '-BuildOnly -SkipPull'
```

---

## AI Handoff Checklist

When asking an AI to integrate this PowerShell runner:

1. ✅ Share `spec/powershell-integration/` spec folder
2. ✅ Provide current project structure
3. ✅ Specify port requirements
4. ✅ List any custom build commands
5. ✅ Indicate pnpm store path preference

**Example Prompt:**

> "Integrate the PowerShell runner from spec `spec/powershell-integration/` into this project. The backend is in `backend/` and frontend in root. Use port 8080. Enable pnpm PnP with a shared store at `D:/dev/.pnpm-store`."

---

## Cross-References

- [Overview](./00-overview.md) - Architecture and quick start
- [Configuration Schema](./01-configuration-schema.md) - JSON config details
- [Script Reference](./02-script-reference/00-overview.md) - All CLI flags
