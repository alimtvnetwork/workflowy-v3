# 4. Pipeline Steps Detail

> **Parent:** [00-overview.md](./00-overview.md)

---

## Step 1: Git Pull

```powershell
if (-not $SkipPull) {
    Push-Location $RootDir
    if (Test-Path ".git") {
        git pull
    }
    Pop-Location
}
```

**Behavior:**
- Skipped if `-SkipPull` flag
- Warns but continues if git pull fails
- Skips if not a git repository

---

## Step 2: Prerequisites Check

```powershell
# Check Go
if ($config.prerequisites.go -and -not (Test-Command "go")) {
    Install-Go
}

# Check Node.js
if ($config.prerequisites.node -and -not (Test-Command "node")) {
    Install-NodeJS
}

# Check pnpm
if ($config.prerequisites.pnpm -and -not (Test-Command "pnpm")) {
    Install-Pnpm
}
```

**Auto-Install:**
- Uses winget for Go and Node.js
- Uses npm for pnpm
- Refreshes PATH after install
- Warns if restart needed

---

## Step 3: pnpm Install (PnP Mode)

```powershell
Push-Location $FrontendDir

# Configure pnpm store path
if ($config.pnpmStorePath) {
    $storePath = Join-Path $RootDir $config.pnpmStorePath
    pnpm config set store-dir $storePath
}

# Force clean (removes ALL pnpm artifacts including PnP loaders)
if ($Force) {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force ".pnpm" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force ".pnp.cjs" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force ".pnp.loader.mjs" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force ".pnp.data.json" -ErrorAction SilentlyContinue
    pnpm store prune

    # Backend runtime data cleanup (sessions, request-sessions, error logs)
    if ($DataDir) {
        Remove-Item -Recurse -Force "$DataDir/sessions" -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force "$DataDir/request-sessions" -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force "$DataDir/errors" -ErrorAction SilentlyContinue
        Remove-Item -Force "$DataDir/log.txt" -ErrorAction SilentlyContinue
        Remove-Item -Force "$DataDir/error.log.txt" -ErrorAction SilentlyContinue
    }
}

# Install dependencies
# NOTE: pnpm v10+ blocks dependency build scripts by default.
# The runner auto-appends:
#   --dangerously-allow-all-builds
# when pnpm v10+ is detected, to ensure native deps like esbuild/@swc work for Vite.
#
# IMPORTANT: -rebuild (-r) defers install until AFTER force-clean to avoid
# installing then immediately deleting node_modules.
pnpm install

Pop-Location
```

**PnP Benefits:**
- No `node_modules` folder needed (or minimal)
- Faster installs from shared store
- Disk savings of 50-70%

**Install Detection (v1.1.0+):**
- Respects `EffectiveNodeLinker` setting (PnP checks `.pnp.cjs`, isolated checks `node_modules`)
- `-i` and `-r` flags always trigger install, even if deps appear present

---

## Step 4: Frontend Build

```powershell
Push-Location $FrontendDir

# Build the frontend
# NOTE: When pnpm PnP is enabled, Node ESM tools like Vite may require PnP loader options.
# The runner handles this automatically when `node-linker=pnp` is active.
pnpm run build

Pop-Location
```

### Important Notes (Windows / Node 24)

If `usePnp` is enabled in `powershell.json`, the runner will **fall back to `node-linker=isolated`** when:

- Node.js major version is **24+**, or
- The pnpm store is on a **different drive** than the project

This avoids `ERR_MODULE_NOT_FOUND` failures (e.g., Vite failing to resolve `esbuild`).

---

## Step 5: Copy Build

```powershell
$SourceDist = Join-Path $RootDir $DistDir
$TargetDist = Join-Path $RootDir $TargetDir

# Remove old
if (Test-Path $TargetDist) {
    Remove-Item -Recurse -Force $TargetDist
}

# Copy new
Copy-Item -Recurse $SourceDist $TargetDist
```

---

## Step 6: Start Backend

```powershell
Push-Location $BackendDir

# Create config if missing
if (-not (Test-Path $config.configFile)) {
    Copy-Item $config.configExampleFile $config.configFile
}

# Create data directories
New-Item -ItemType Directory -Path "data" -ErrorAction SilentlyContinue

# Run
Invoke-Expression $config.runCommand

Pop-Location
```
