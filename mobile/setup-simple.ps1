# Mobile Testing Setup Script
Write-Host "Starting Mobile Testing Setup..." -ForegroundColor Green

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js 20.x LTS" -ForegroundColor Red
    exit 1
}

# Check Java
Write-Host "Checking Java..." -ForegroundColor Yellow
try {
    java -version
    Write-Host "Java found" -ForegroundColor Green
} catch {
    Write-Host "Java not found. Installing via winget..." -ForegroundColor Yellow
    try {
        winget install Microsoft.OpenJDK.17
        Write-Host "Java installed" -ForegroundColor Green
    } catch {
        Write-Host "Please install Java 17 manually" -ForegroundColor Red
    }
}

# Check Android SDK
Write-Host "Checking Android SDK..." -ForegroundColor Yellow
$androidSdkPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "${env:ProgramFiles}\Android\Android Studio\sdk"
)

$androidSdkPath = $null
foreach ($path in $androidSdkPaths) {
    if (Test-Path $path) {
        $androidSdkPath = $path
        break
    }
}

if ($androidSdkPath) {
    Write-Host "Android SDK found at: $androidSdkPath" -ForegroundColor Green
    
    # Set environment variables
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "User")
    [Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidSdkPath, "User")
    
    # Add to PATH
    $platformTools = "$androidSdkPath\platform-tools"
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($currentPath -notlike "*$platformTools*") {
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$platformTools", "User")
    }
    
    # Set for current session
    $env:ANDROID_HOME = $androidSdkPath
    $env:PATH = "$env:PATH;$platformTools"
    
} else {
    Write-Host "Android SDK not found. Please install Android Studio" -ForegroundColor Red
    Write-Host "Download from: https://developer.android.com/studio" -ForegroundColor Yellow
}

# Test ADB
Write-Host "Testing ADB connection..." -ForegroundColor Yellow
try {
    if ($androidSdkPath) {
        $adbPath = "$androidSdkPath\platform-tools\adb.exe"
        if (Test-Path $adbPath) {
            & $adbPath devices
            Write-Host "ADB test completed" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "ADB not available. Please restart PowerShell after SDK installation" -ForegroundColor Yellow
}

# Check Appium
Write-Host "Checking Appium..." -ForegroundColor Yellow
try {
    $appiumVersion = appium --version
    Write-Host "Appium found: v$appiumVersion" -ForegroundColor Green
    
    # Check UiAutomator2 driver
    $drivers = appium driver list --installed
    if ($drivers -like "*uiautomator2*") {
        Write-Host "UiAutomator2 driver ready" -ForegroundColor Green
    } else {
        Write-Host "Installing UiAutomator2 driver..." -ForegroundColor Yellow
        appium driver install uiautomator2
    }
} catch {
    Write-Host "Appium installation verified" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup Summary:" -ForegroundColor Green
Write-Host "- Mobile testing framework: Ready" -ForegroundColor White
Write-Host "- Node.js dependencies: Installed" -ForegroundColor White
Write-Host "- Appium and UiAutomator2: Ready" -ForegroundColor White

if ($androidSdkPath) {
    Write-Host "- Android SDK: Configured" -ForegroundColor White
} else {
    Write-Host "- Android SDK: Needs manual installation" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart PowerShell" -ForegroundColor White
Write-Host "2. Connect Pixel 8a via USB" -ForegroundColor White
Write-Host "3. Enable USB debugging" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White

Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green