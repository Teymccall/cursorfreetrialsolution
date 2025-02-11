# Cursor Free Trial Fix Script
# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    if ([int](Get-CimInstance -Class Win32_OperatingSystem | Select-Object -ExpandProperty BuildNumber) -ge 6000) {
        $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`""
        Start-Process -FilePath PowerShell.exe -Verb RunAs -ArgumentList $CommandLine
        Exit
    }
}

# Execute the remote script
try {
    Write-Host "Downloading and executing cursor modifier script..." -ForegroundColor Green
    $scriptUrl = "https://raw.githubusercontent.com/yuaotian/go-cursor-help/refs/heads/master/scripts/run/cursor_win_id_modifier.ps1"
    
    # First, download and display the script content for transparency
    Write-Host "`nDownloading script from: $scriptUrl" -ForegroundColor Yellow
    $scriptContent = Invoke-RestMethod -Uri $scriptUrl
    
    Write-Host "`nScript content for review:" -ForegroundColor Cyan
    Write-Host "----------------------------------------"
    Write-Host $scriptContent
    Write-Host "----------------------------------------"
    
    Write-Host "`nPress Enter to execute the script, or Ctrl+C to cancel..." -ForegroundColor Yellow
    $null = Read-Host
    
    # Execute the script
    Invoke-Expression $scriptContent
    
} catch {
    Write-Host "`nAn error occurred: $_" -ForegroundColor Red
    Write-Host "The script failed to download or execute. Please check your internet connection and try again."
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') 