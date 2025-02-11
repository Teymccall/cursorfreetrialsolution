# Cursor Free Trial Fix Script
# Run as Administrator

Write-Host "Starting Cursor Free Trial Fix..." -ForegroundColor Green

# Function to generate a new UUID
function New-UUID {
    return [guid]::NewGuid().ToString()
}

# Function to create a backup
function Backup-File {
    param($Path)
    if (Test-Path $Path) {
        $backupPath = "$Path.backup"
        Copy-Item -Path $Path -Destination $backupPath -Force
        Write-Host "Created backup at: $backupPath" -ForegroundColor Yellow
    }
}

# Generate new UUID
$newUUID = New-UUID
$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"

# Create new configuration
$newConfig = @{
    "telemetry.machineId" = $newUUID
    "telemetry.macMachineId" = $newUUID
    "telemetry.devDeviceId" = $newUUID
    "telemetry.sqmId" = $newUUID
    "lastModified" = $timestamp
    "version" = "1.0.1"
}

# Close any running instances of Cursor
Get-Process "Cursor" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Closed running Cursor instances" -ForegroundColor Yellow

# Path to storage.json
$configPath = "$env:APPDATA\Cursor\User\globalStorage\storage.json"

# Create backup of existing configuration
if (Test-Path $configPath) {
    Write-Host "Creating backup of existing configuration..." -ForegroundColor Yellow
    Backup-File $configPath
}

# Ensure directory exists
$configDir = Split-Path $configPath -Parent
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Save new configuration
$newConfig | ConvertTo-Json | Set-Content $configPath -Force
Write-Host "Applied new configuration successfully!" -ForegroundColor Green

Write-Host "`nNew Machine ID: $newUUID" -ForegroundColor Cyan
Write-Host "`nConfiguration has been updated. You can now restart Cursor." -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")