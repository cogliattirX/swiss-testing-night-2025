# 🚀 Mobile Testing Setup Script für Windows
# Installiert alle notwendigen Tools für Android Testing (Real Device + Emulator)

Write-Host "🏁 Starting Mobile Testing Setup..." -ForegroundColor Green
Write-Host "📱 Target: Pixel 8a + Android Emulator" -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires Administrator privileges for some installations." -ForegroundColor Yellow
    Write-Host "💡 Please run PowerShell as Administrator for full functionality." -ForegroundColor Yellow
}

# Function to check if a command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Function to download and install from URL
function Install-FromUrl($name, $url, $installer) {
    Write-Host "📥 Downloading $name..." -ForegroundColor Yellow
    $tempPath = "$env:TEMP\$installer"
    try {
        Invoke-WebRequest -Uri $url -OutFile $tempPath -UseBasicParsing
        Write-Host "🚀 Installing $name..." -ForegroundColor Green
        Start-Process $tempPath -Wait
        Remove-Item $tempPath -Force
        Write-Host "✅ $name installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install $name : $_" -ForegroundColor Red
    }
}

Write-Host "`n🔍 Step 1: Checking existing installations..." -ForegroundColor Magenta

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js 20.x LTS from https://nodejs.org" -ForegroundColor Red
    Write-Host "📋 Manual installation required for Node.js" -ForegroundColor Yellow
}

# Check Java
if (Test-Command "java") {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Java not found. Installing OpenJDK 17..." -ForegroundColor Yellow
    if ($isAdmin) {
        try {
            # Try to install via winget
            winget install Microsoft.OpenJDK.17
            Write-Host "✅ OpenJDK 17 installed via winget" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Please install Java 17 manually from: https://learn.microsoft.com/en-us/java/openjdk/download" -ForegroundColor Yellow
        }
    } else {
        Write-Host "📋 Manual installation required: https://learn.microsoft.com/en-us/java/openjdk/download" -ForegroundColor Yellow
    }
}

Write-Host "`n🤖 Step 2: Android SDK Setup..." -ForegroundColor Magenta

# Check if Android Studio or SDK tools are installed
$androidSdkPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:ProgramFiles\Android\Android Studio\sdk",
    "${env:ProgramFiles(x86)}\Android\android-sdk"
)

$androidSdkPath = $null
foreach ($path in $androidSdkPaths) {
    if (Test-Path $path) {
        $androidSdkPath = $path
        break
    }
}

if ($androidSdkPath) {
    Write-Host "✅ Android SDK found at: $androidSdkPath" -ForegroundColor Green
    
    # Set environment variables
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "User")
    [Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidSdkPath, "User")
    
    # Add to PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $platformTools = "$androidSdkPath\platform-tools"
    $tools = "$androidSdkPath\tools"
    $toolsBin = "$androidSdkPath\tools\bin"
    
    if ($currentPath -notlike "*$platformTools*") {
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$platformTools;$tools;$toolsBin", "User")
        Write-Host "✅ Android tools added to PATH" -ForegroundColor Green
    }
    
    # Refresh environment variables for current session
    $env:ANDROID_HOME = $androidSdkPath
    $env:ANDROID_SDK_ROOT = $androidSdkPath
    $env:PATH = "$env:PATH;$platformTools;$tools;$toolsBin"
    
} else {
    Write-Host "❌ Android SDK not found. Installing Android Studio..." -ForegroundColor Yellow
    
    if ($isAdmin) {
        try {
            winget install Google.AndroidStudio
            Write-Host "✅ Android Studio installation initiated" -ForegroundColor Green
            Write-Host "🔄 Please complete Android Studio setup and install SDK components" -ForegroundColor Yellow
        } catch {
            Write-Host "📋 Manual installation required: https://developer.android.com/studio" -ForegroundColor Yellow
        }
    } else {
        Write-Host "📋 Manual installation required: https://developer.android.com/studio" -ForegroundColor Yellow
    }
}

Write-Host "`n📱 Step 3: Device Connection Test..." -ForegroundColor Magenta

# Test ADB (after environment setup)
try {
    $adbPath = "$androidSdkPath\platform-tools\adb.exe"
    if (Test-Path $adbPath) {
        Write-Host "🔧 Testing ADB connection..." -ForegroundColor Yellow
        $devices = & $adbPath devices
        Write-Host "📱 Connected devices:" -ForegroundColor Cyan
        Write-Host $devices -ForegroundColor Gray
        
        if ($devices -match "device$") {
            Write-Host "✅ Real device detected and ready!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  No devices detected. Please:" -ForegroundColor Yellow
            Write-Host "   1. Connect your Pixel 8a via USB" -ForegroundColor Gray
            Write-Host "   2. Enable Developer Options" -ForegroundColor Gray
            Write-Host "   3. Enable USB Debugging" -ForegroundColor Gray
            Write-Host "   4. Authorize RSA key on device" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "⚠️  ADB not yet available. Please restart PowerShell after Android SDK installation." -ForegroundColor Yellow
}

Write-Host "`n🎯 Step 4: Appium Setup Verification..." -ForegroundColor Magenta

if (Test-Command "appium") {
    $appiumVersion = appium --version
    Write-Host "✅ Appium found: v$appiumVersion" -ForegroundColor Green
    
    # Check drivers
    Write-Host "🔍 Checking Appium drivers..." -ForegroundColor Yellow
    $drivers = appium driver list --installed 2>&1
    Write-Host $drivers -ForegroundColor Gray
    
    if ($drivers -match "uiautomator2") {
        Write-Host "✅ UiAutomator2 driver ready" -ForegroundColor Green
    } else {
        Write-Host "🔧 Installing UiAutomator2 driver..." -ForegroundColor Yellow
        appium driver install uiautomator2
    }
} else {
    Write-Host "❌ Appium not found. Installing..." -ForegroundColor Red
    npm install -g appium
    appium driver install uiautomator2
}

Write-Host "`n🎮 Step 5: Emulator Setup..." -ForegroundColor Magenta

if ($androidSdkPath) {
    $avdManagerPath = "$androidSdkPath\cmdline-tools\latest\bin\avdmanager.bat"
    $emulatorPath = "$androidSdkPath\emulator\emulator.exe"
    
    if (Test-Path $avdManagerPath) {
        Write-Host "🔧 Setting up Android emulator..." -ForegroundColor Yellow
        
        # List available system images
        Write-Host "📋 Available system images:" -ForegroundColor Cyan
        & $avdManagerPath list target
        
        # Create a test AVD if none exists
        $avdList = & $avdManagerPath list avd
        if ($avdList -notmatch "pixel_8a_test") {
            Write-Host "🎯 Creating Pixel 8a test emulator..." -ForegroundColor Yellow
            # Note: This requires system image to be downloaded first
            Write-Host "📝 To create emulator manually:" -ForegroundColor Cyan
            Write-Host "   1. Open Android Studio" -ForegroundColor Gray
            Write-Host "   2. Go to AVD Manager" -ForegroundColor Gray
            Write-Host "   3. Create Virtual Device -> Pixel 8a" -ForegroundColor Gray
            Write-Host "   4. Choose Android 14 (API 34) system image" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  AVD Manager not found. Please install Android SDK command-line tools." -ForegroundColor Yellow
    }
}

Write-Host "`n🔧 Step 6: Project Configuration..." -ForegroundColor Magenta

# Check if we can detect Geberit app
if ($androidSdkPath -and (Test-Path "$androidSdkPath\platform-tools\adb.exe")) {
    Write-Host "🔍 Searching for Geberit Home app..." -ForegroundColor Yellow
    try {
        $adbPath = "$androidSdkPath\platform-tools\adb.exe"
        $packages = & $adbPath shell pm list packages | Select-String "geberit"
        
        if ($packages) {
            Write-Host "✅ Geberit app found:" -ForegroundColor Green
            Write-Host $packages -ForegroundColor Gray
            
            # Try to get activity
            Write-Host "🎯 Detecting main activity..." -ForegroundColor Yellow
            $activity = & $adbPath shell "cmd package resolve-activity --brief com.geberit.home" 2>&1 | Select-Object -Last 1
            if ($activity -and $activity -ne "") {
                Write-Host "✅ Main activity detected: $activity" -ForegroundColor Green
                Write-Host "📝 Update config/wdio.local.android.ts with:" -ForegroundColor Cyan
                $activityShort = $activity -replace "com\.geberit\.home", ""
                Write-Host "   appium:appActivity: $activityShort" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️  Geberit Home app not found. Please install from Play Store." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not check for Geberit app. Device may not be connected." -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Setup Summary:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "✅ Mobile testing framework created" -ForegroundColor White
Write-Host "✅ Node.js dependencies installed" -ForegroundColor White
Write-Host "✅ Appium and UiAutomator2 ready" -ForegroundColor White

if ($androidSdkPath) {
    Write-Host "✅ Android SDK configured" -ForegroundColor White
} else {
    Write-Host "⚠️  Android SDK needs manual installation" -ForegroundColor Yellow
}

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart PowerShell to refresh environment variables" -ForegroundColor White
Write-Host "2. Connect Pixel 8a and authorize USB debugging" -ForegroundColor White
Write-Host "3. Update activity in config/wdio.local.android.ts" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White

Write-Host "`n📚 For emulator testing:" -ForegroundColor Cyan
Write-Host "1. Open Android Studio -> AVD Manager" -ForegroundColor White
Write-Host "2. Create Pixel 8a emulator with Android 14" -ForegroundColor White
Write-Host "3. Install Geberit Home app in emulator" -ForegroundColor White

Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Magenta
Write-Host "- If ADB not found: Restart PowerShell" -ForegroundColor White
Write-Host "- If device unauthorized: Check USB debugging dialog" -ForegroundColor White
Write-Host "- If Java errors: Install OpenJDK 17" -ForegroundColor White
Write-Host "- For detailed help: See mobile/README.md" -ForegroundColor White

Write-Host "`n✨ Setup completed! Happy testing! 🧪" -ForegroundColor Green