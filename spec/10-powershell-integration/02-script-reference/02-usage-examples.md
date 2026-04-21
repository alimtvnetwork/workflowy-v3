# 2. Usage Examples

> **Parent:** [00-overview.md](./00-overview.md)

---

```powershell
# Show help
.\run.ps1 -h

# Install/update all dependencies (frontend + backend)
.\run.ps1 -i

# Complete clean reinstall (recommended after git pull with new deps)
.\run.ps1 -r

# Full build and run (default)
.\run.ps1

# Clean rebuild everything
.\run.ps1 -f

# Quick start (skip build)
.\run.ps1 -s

# Build only for CI/CD
.\run.ps1 -b

# Skip git, clean build
.\run.ps1 -p -f

# First-time setup with firewall
.\run.ps1 -fw

# Upload default plugin to WordPress (V2 uploader)
.\run.ps1 -u

# Upload custom plugin path
.\run.ps1 -u -pp "C:\path\to\custom-plugin"

# Upload via QUpload API
.\run.ps1 -q

# Upload specific plugin via QUpload
.\run.ps1 -q -pp "wp-plugins/qupload"

# ZIP all plugins in wp-plugins/ with version numbers (best compression)
.\run.ps1 -z

# ZIP a specific plugin
.\run.ps1 -z -pp "wp-plugins/qupload"

# ZIP + upload all plugins (except QUpload) via QUpload API
.\run.ps1 -ua

# Multi-site: upload all plugins to all enabled sites
.\run.ps1 -uas

# Multi-site: upload to a specific site
.\run.ps1 -uas -site "Test V1"

# Multi-site: upload to all except one site
.\run.ps1 -uas -xs "Test V1"

# Multi-site: exclude multiple sites (comma-separated)
.\run.ps1 -uas -xs "Test V1,Test V2"

# Clear old ZIPs, then ZIP + upload all
.\run.ps1 -ua -c

# Run Go backend tests
.\run.ps1 -t

# Full deploy: git pull, upload all sites, plugin status, then build & run
.\run.ps1 -d

# Verbose output for debugging
.\run.ps1 -v
```
