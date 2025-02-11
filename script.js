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
        trackEvent('Interface', 'Theme_Change', 'Dark Mode', 1);
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        trackEvent('Interface', 'Theme_Change', 'Light Mode', 1);
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
    const accordionJsonConfigElement = document.getElementById('accordionJsonConfig');
    
    // Save the configuration to localStorage
    localStorage.setItem('currentConfig', JSON.stringify(config));
    localStorage.setItem('currentPage', 'result');
    
    // Format the JSON with proper indentation
    const formattedJson = JSON.stringify(config, null, 2);
    
    // Update the content
    machineIdElement.textContent = config["telemetry.machineId"];
    jsonConfigElement.textContent = formattedJson;
    
    // Update the accordion JSON configuration
    if (accordionJsonConfigElement) {
        accordionJsonConfigElement.textContent = formattedJson;
        hljs.highlightElement(accordionJsonConfigElement);
    }
    
    // Apply syntax highlighting
    hljs.highlightElement(jsonConfigElement);
    
    // Hide main page and show result page
    mainPage.style.display = 'none';
    resultPage.style.display = 'block';
    
    // Scroll to top smoothly
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Re-attach download button event listener
    const downloadBtn = document.getElementById('downloadScriptBtn');
    if (downloadBtn) {
        // Remove any existing listeners
        downloadBtn.replaceWith(downloadBtn.cloneNode(true));
        const newDownloadBtn = document.getElementById('downloadScriptBtn');
        
        // Add new listener
        newDownloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Download button clicked');
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
    const accordionJsonConfigElement = document.getElementById('accordionJsonConfig');
    
    // Format the JSON with proper indentation
    const formattedJson = JSON.stringify(config, null, 2);
    
    // Update all displays
    machineIdElement.textContent = config["telemetry.machineId"];
    jsonConfigElement.textContent = formattedJson;
    
    // Update the accordion JSON configuration
    if (accordionJsonConfigElement) {
        accordionJsonConfigElement.textContent = formattedJson;
        hljs.highlightElement(accordionJsonConfigElement);
    }
    
    // Apply syntax highlighting to the main JSON
    hljs.highlightElement(jsonConfigElement);
    
    // Save the new configuration to localStorage
    localStorage.setItem('currentConfig', JSON.stringify(config));
    
    // Show notification
    showNotification('New Machine ID generated!');
}

function trackEvent(category, action, label, value = 0) {
    gtag('event', action, {
        'event_category': category,
        'event_label': label,
        'value': value,
        'send_to': 'G-NR0QPRKZW6'
    });
}

function downloadScript() {
    // Create the PowerShell script content
    const scriptContent = [
        "# Cursor Free Trial Fix Script",
        "# Self-elevate the script if required",
        "if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {",
        "    if ([int](Get-CimInstance -Class Win32_OperatingSystem | Select-Object -ExpandProperty BuildNumber) -ge 6000) {",
        "        $CommandLine = \"-File `\"\" + $MyInvocation.MyCommand.Path + \"`\"\"",
        "        Start-Process -FilePath PowerShell.exe -Verb RunAs -ArgumentList $CommandLine",
        "        Exit",
        "    }",
        "}",
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

    // Update the script content display
    const scriptContentElement = document.getElementById('scriptContent');
    if (scriptContentElement) {
        scriptContentElement.textContent = scriptContent;
        hljs.highlightElement(scriptContentElement);
    }

    // If this was triggered by the download button, create and trigger download
    if (event && event.target.closest('#downloadScriptBtn')) {
        try {
            // Create blob with text/plain MIME type
            const blob = new Blob([scriptContent], { 
                type: 'text/plain;charset=utf-8'
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

            showNotification('Script downloaded! Remember to unblock it in Properties before running.', 6000);
            
            // Track successful download
            trackEvent('Conversion', 'Script_Download', 'PowerShell Script', 1);
        } catch (error) {
            console.error('Download failed:', error);
            showNotification('Failed to download script. Please try copying it manually.', 6000);
            trackEvent('Error', 'Download_Failed', error.message);
        }
    } else {
        // Just showing the script content
        showNotification('Script ready! Follow the instructions above to create and run the script.', 6000);
    }
}

// Accordion functionality
document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const accordionItem = button.parentElement;
        accordionItem.classList.toggle('active');
    });
});

// Track solution generation
document.getElementById('generateBtn').addEventListener('click', () => {
    const btn = document.getElementById('generateBtn');
    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.loader');
    
    // Show loading state
    btnText.style.display = 'none';
    loader.style.display = 'block';
    btn.disabled = true;
    
    // Track solution generation
    trackEvent('Conversion', 'Generate_Solution', 'Solution Generated', 1);
    
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
        showResultPage(JSON.parse(savedConfig));
    }
    
    // Initialize download button
    const downloadBtn = document.getElementById('downloadScriptBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadScript();
        });
    }

    // Initialize script content display
    const scriptContentElement = document.getElementById('scriptContent');
    if (scriptContentElement) {
        downloadScript(); // This will populate the script content
    }

    // Initialize generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            const config = generateConfiguration();
            showResultPage(config);
            // Re-initialize download button after showing result page
            setTimeout(initializeDownloadButton, 100);
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

// Enhanced copy tracking
function copyMachineId() {
    const machineId = document.getElementById('machineId').textContent;
    copyToClipboard(machineId);
    trackEvent('Conversion', 'Copy_MachineID', 'Machine ID Copied', 1);
}

function copyJsonConfig() {
    const jsonConfig = document.getElementById('jsonConfig').textContent;
    copyToClipboard(jsonConfig);
    trackEvent('Conversion', 'Copy_Config', 'JSON Config Copied', 1);
}

function copyScript() {
    const scriptContent = document.getElementById('scriptContent').textContent;
    const cleanedContent = scriptContent
        .replace(/^\s+|\s+$/g, '') // Remove leading/trailing whitespace
        .replace(/\n\s*\n/g, '\n\n') // Normalize multiple newlines
        .replace(/\r\n/g, '\n') // Normalize line endings
        .trim();
        
    copyToClipboard(cleanedContent);
    trackEvent('Conversion', 'Copy_Script', 'PowerShell Script Copied', 1);
    
    // Change button text temporarily to show success
    const copyBtn = document.querySelector('.script-header .copy-btn');
    const btnText = copyBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = 'Copied!';
    setTimeout(() => {
        btnText.textContent = originalText;
    }, 2000);
}

function copyAccordionJson() {
    const jsonConfig = document.getElementById('accordionJsonConfig').textContent;
    copyToClipboard(jsonConfig);
    trackEvent('Conversion', 'Copy_AccordionConfig', 'Accordion JSON Config Copied', 1);
    
    // Change button text temporarily to show success
    const copyBtn = document.querySelector('.json-preview .copy-btn');
    const btnText = copyBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = 'Copied!';
    setTimeout(() => {
        btnText.textContent = originalText;
    }, 2000);
} 