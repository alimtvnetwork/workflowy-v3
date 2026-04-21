# 3. Functions Reference

> **Parent:** [00-overview.md](./00-overview.md)

---

## Format-ElapsedTime

Formats a Stopwatch elapsed time for display.

```powershell
function Format-ElapsedTime($Stopwatch) {
    $elapsed = $Stopwatch.Elapsed
    if ($elapsed.TotalMinutes -ge 1) {
        return "{0:N0}m {1:N1}s" -f [Math]::Floor($elapsed.TotalMinutes), $elapsed.Seconds
    } else {
        return "{0:N1}s" -f $elapsed.TotalSeconds
    }
}
```

**Output Examples:**
- `2.3s` - Short duration
- `1m 45.2s` - Longer duration

---

## Test-Command

Checks if a command exists in PATH.

```powershell
function Test-Command($Command) {
    try { 
        if (Get-Command $Command) { return $true } 
    }
    catch { return $false }
}
```

**Usage:**
```powershell
if (-not (Test-Command "pnpm")) {
    Install-Pnpm
}
```

---

## Test-IsAdmin

Checks if running with Administrator privileges.

```powershell
function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}
```

---

## Install-Pnpm

Installs pnpm globally via npm.

```powershell
function Install-Pnpm {
    Write-Host "  Installing pnpm globally..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) { throw "Failed to install pnpm" }
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + 
                [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "  ✓ pnpm installed successfully" -ForegroundColor Green
}
```

---

## Install-NodeJS

Installs Node.js LTS via winget.

```powershell
function Install-NodeJS {
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + 
                [System.Environment]::GetEnvironmentVariable("Path","User")
}
```

---

## Install-Go

Installs Go via winget.

```powershell
function Install-Go {
    winget install GoLang.Go --accept-package-agreements --accept-source-agreements
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + 
                [System.Environment]::GetEnvironmentVariable("Path","User")
}
```

---

## Ensure-FirewallRules

Creates Windows Firewall inbound rules.

```powershell
function Ensure-FirewallRules {
    param([int[]]$Ports = @(8080))
    
    foreach ($p in $Ports) {
        $ruleName = "$ProjectName (Go Backend) TCP $p"
        $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
        
        if ($null -eq $existing) {
            New-NetFirewallRule `
                -DisplayName $ruleName `
                -Direction Inbound `
                -Action Allow `
                -Protocol TCP `
                -LocalPort $p `
                -Profile Private,Domain
        }
    }
}
```

**Requirements:**
- Must run as Administrator
- Windows PowerShell 5.1+ or PowerShell 7+
