// Dark mode handling
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;

// Check for saved dark mode preference or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
darkModeToggle.checked = savedTheme === 'dark';

darkModeToggle.addEventListener('change', function() {
    if (this.checked) {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// Notification handling
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateConfiguration() {
    const uuid = generateUUID();
    const now = new Date().toISOString();
    
    return {
        "telemetry.machineId": uuid,
        "telemetry.macMachineId": uuid,
        "telemetry.devDeviceId": uuid,
        "telemetry.sqmId": uuid,
        "lastModified": now,
        "version": "1.0.1"
    };
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!');
    }).catch(err => {
        showNotification('Failed to copy to clipboard', 'error');
        console.error('Failed to copy:', err);
    });
}

function showResultPage(config) {
    const mainPage = document.getElementById('mainPage');
    const resultPage = document.getElementById('resultPage');
    const machineIdElement = document.getElementById('machineId');
    const jsonConfigElement = document.getElementById('jsonConfig');
    
    // Save the configuration to localStorage
    localStorage.setItem('currentConfig', JSON.stringify(config));
    localStorage.setItem('currentPage', 'result');
    
    // Update the content
    machineIdElement.textContent = config["telemetry.machineId"];
    jsonConfigElement.textContent = JSON.stringify(config, null, 4);
    
    // Apply syntax highlighting
    hljs.highlightElement(jsonConfigElement);
    
    // Hide main page and show result page
    mainPage.style.display = 'none';
    resultPage.style.display = 'block';
    
    // Re-attach download button event listener
    const downloadBtn = document.getElementById('downloadScriptBtn');
    if (downloadBtn) {
        console.log('Reattaching download button listener');
        downloadBtn.addEventListener('click', function(e) {
            console.log('Download button clicked from showResultPage');
            e.preventDefault();
            downloadScript();
        });
    }
    
    // Add visible class after a brief delay to trigger animation
    setTimeout(() => {
        resultPage.classList.add('visible');
    }, 50);
}

function generateNew() {
    // Generate new configuration
    const config = generateConfiguration();
    
    // Update the displayed ID and JSON
    const machineIdElement = document.getElementById('machineId');
    const jsonConfigElement = document.getElementById('jsonConfig');
    
    machineIdElement.textContent = config["telemetry.machineId"];
    jsonConfigElement.textContent = JSON.stringify(config, null, 4);
    
    // Apply syntax highlighting to the JSON
    hljs.highlightElement(jsonConfigElement);
    
    // Save the new configuration to localStorage
    localStorage.setItem('currentConfig', JSON.stringify(config));
    
    // Show notification
    showNotification('New Machine ID generated!');
}

function copyMachineId() {
    const machineId = document.getElementById('machineId').textContent;
    copyToClipboard(machineId);
}

function copyJsonConfig() {
    const jsonConfig = document.getElementById('jsonConfig').textContent;
    copyToClipboard(jsonConfig);
}

function copyScript() {
    const scriptContent = document.getElementById('scriptContent').textContent;
    copyToClipboard(scriptContent.trim());
}

function downloadScript() {
    console.log('Download function triggered');
    // Create the PowerShell script content with proper line endings
    const scriptContent = [
        "# Cursor Free Trial Fix Script",
        "# Run as Administrator",
        "",
        "Write-Host \"Starting Cursor Free Trial Fix...\" -ForegroundColor Green",
        "",
        "# Function to generate a new UUID",
        "function New-UUID {",
        "    return [guid]::NewGuid().ToString()",
        "}",
        "",
        "# Function to create a backup",
        "function Backup-File {",
        "    param($Path)",
        "    if (Test-Path $Path) {",
        "        $backupPath = \"$Path.backup\"",
        "        Copy-Item -Path $Path -Destination $backupPath -Force",
        "        Write-Host \"Created backup at: $backupPath\" -ForegroundColor Yellow",
        "    }",
        "}",
        "",
        "# Generate new UUID",
        "$newUUID = New-UUID",
        "$timestamp = Get-Date -Format \"yyyy-MM-ddTHH:mm:ss.fffZ\"",
        "",
        "# Create new configuration",
        "$newConfig = @{",
        "    \"telemetry.machineId\" = $newUUID",
        "    \"telemetry.macMachineId\" = $newUUID",
        "    \"telemetry.devDeviceId\" = $newUUID",
        "    \"telemetry.sqmId\" = $newUUID",
        "    \"lastModified\" = $timestamp",
        "    \"version\" = \"1.0.1\"",
        "}",
        "",
        "# Close any running instances of Cursor",
        "Get-Process \"Cursor\" -ErrorAction SilentlyContinue | Stop-Process -Force",
        "Write-Host \"Closed running Cursor instances\" -ForegroundColor Yellow",
        "",
        "# Path to storage.json",
        "$configPath = \"$env:APPDATA\\Cursor\\User\\globalStorage\\storage.json\"",
        "",
        "# Create backup of existing configuration",
        "if (Test-Path $configPath) {",
        "    Write-Host \"Creating backup of existing configuration...\" -ForegroundColor Yellow",
        "    Backup-File $configPath",
        "}",
        "",
        "# Ensure directory exists",
        "$configDir = Split-Path $configPath -Parent",
        "if (-not (Test-Path $configDir)) {",
        "    New-Item -ItemType Directory -Path $configDir -Force | Out-Null",
        "}",
        "",
        "# Save new configuration",
        "$newConfig | ConvertTo-Json | Set-Content $configPath -Force",
        "Write-Host \"Applied new configuration successfully!\" -ForegroundColor Green",
        "",
        "Write-Host \"`nNew Machine ID: $newUUID\" -ForegroundColor Cyan",
        "Write-Host \"`nConfiguration has been updated. You can now restart Cursor.\" -ForegroundColor Green",
        "Write-Host \"Press any key to exit...\"",
        "$null = $Host.UI.RawUI.ReadKey(\"NoEcho,IncludeKeyDown\")"
    ].join("\r\n");

    try {
        // Create blob with proper text encoding
        const blob = new Blob([scriptContent], { 
            type: 'application/octet-stream'
        });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'fix-cursor.ps1';
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);

        showNotification('Script downloaded successfully!');
    } catch (error) {
        console.error('Download failed:', error);
        showNotification('Failed to download script. Please try again.');
    }
}

// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const accordionItem = button.parentElement;
        accordionItem.classList.toggle('active');
    });
});

// Add loading animation to generate button
document.getElementById('generateBtn').addEventListener('click', () => {
    const btn = document.getElementById('generateBtn');
    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.loader');
    
    // Show loading state
    btnText.style.display = 'none';
    loader.style.display = 'block';
    btn.disabled = true;
    
    // Simulate loading (you can remove setTimeout if generation is fast)
    setTimeout(() => {
        const config = generateConfiguration();
        showResultPage(config);
        
        // Reset button state
        btnText.style.display = 'inline';
        loader.style.display = 'none';
        btn.disabled = false;
    }, 1000);
});

document.addEventListener('DOMContentLoaded', function() {
    // Check for saved state
    const savedPage = localStorage.getItem('currentPage');
    const savedConfig = localStorage.getItem('currentConfig');
    
    if (savedPage === 'result' && savedConfig) {
        // Restore the result page with saved configuration
        showResultPage(JSON.parse(savedConfig));
    }
    
    // Attach download button event listener
    const downloadBtn = document.getElementById('downloadScriptBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadScript();
        });
    }
});

function goBack() {
    const resultPage = document.getElementById('resultPage');
    const mainPage = document.getElementById('mainPage');
    
    // Clear saved state
    localStorage.removeItem('currentConfig');
    localStorage.removeItem('currentPage');
    
    // Hide result page and show main page
    resultPage.style.display = 'none';
    resultPage.classList.remove('visible');
    mainPage.style.display = 'block';
} 