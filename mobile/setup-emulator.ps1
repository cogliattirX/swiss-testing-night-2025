#!/usr/bin/env powershell

<#
.SYNOPSIS
Android Emulator Setup Script for Geberit Home Testing

.DESCRIPTION
This script sets up an Android emulator for testing the Geberit Home app.
It creates an AVD (Android Virtual Device) that matches the Pixel 8a specifications.

.NOTES
Run this script after installing Android Studio and setting up the SDK.
#>

param(
    [switch]$Force,
    [string]$AvdName = "Pixel_8a_API_34"
)

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-StepInfo {
    param([string]$Message)
    Write-Host "🔧 $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

Write-Host @"
📱 Android Emulator Setup for Geberit Home Testing
=================================================

This script will:
1. Verify Android SDK installation
2. Install required system images
3. Create Pixel 8a emulator (API 34)
4. Configure emulator for testing
5. Install Geberit Home app in emulator

"@ -ForegroundColor $Blue

# Step 1: Check Android SDK
Write-StepInfo "Checking Android SDK installation..."

$AndroidHome = $env:ANDROID_HOME
if (-not $AndroidHome) {
    $AndroidHome = $env:ANDROID_SDK_ROOT
}

if (-not $AndroidHome) {
    Write-Error "Android SDK not found. Please install Android Studio first."
    Write-Host @"
To install Android Studio:
1. Download from https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio and complete SDK setup
4. Add ANDROID_HOME environment variable

Expected path: C:\Users\$env:USERNAME\AppData\Local\Android\Sdk
"@
    exit 1
}

Write-Success "Android SDK found at: $AndroidHome"

# Step 2: Check required tools
Write-StepInfo "Checking Android SDK tools..."

$SdkManager = Join-Path $AndroidHome "cmdline-tools\latest\bin\sdkmanager.bat"
$AvdManager = Join-Path $AndroidHome "cmdline-tools\latest\bin\avdmanager.bat"
$Emulator = Join-Path $AndroidHome "emulator\emulator.exe"

if (-not (Test-Path $SdkManager)) {
    Write-Error "SDK Manager not found. Please install Android command line tools."
    Write-Host "In Android Studio: Tools > SDK Manager > SDK Tools > Android SDK Command-line Tools"
    exit 1
}

Write-Success "Android SDK tools found"

# Step 3: Install system image
Write-StepInfo "Installing Android 14 (API 34) system image..."

$SystemImage = "system-images;android-34;google_apis_playstore;x86_64"

try {
    & $SdkManager $SystemImage --channel=3
    Write-Success "System image installed successfully"
} catch {
    Write-Error "Failed to install system image: $_"
    exit 1
}

# Step 4: Accept licenses
Write-StepInfo "Accepting Android SDK licenses..."
try {
    echo "y" | & $SdkManager --licenses
    Write-Success "SDK licenses accepted"
} catch {
    Write-Warning "Could not auto-accept licenses. Please run manually if needed."
}

# Step 5: Create AVD
Write-StepInfo "Creating Android Virtual Device: $AvdName"

# Check if AVD already exists
$ExistingAvds = & $AvdManager list avd | Select-String -Pattern $AvdName
if ($ExistingAvds -and -not $Force) {
    Write-Warning "AVD '$AvdName' already exists. Use -Force to recreate."
} else {
    if ($ExistingAvds -and $Force) {
        Write-StepInfo "Deleting existing AVD..."
        & $AvdManager delete avd -n $AvdName
    }
    
    Write-StepInfo "Creating new AVD with Pixel 8a specifications..."
    
    $CreateAvdArgs = @(
        "create", "avd",
        "-n", $AvdName,
        "-k", $SystemImage,
        "-d", "pixel_8",
        "--force"
    )
    
    try {
        echo "no" | & $AvdManager @CreateAvdArgs
        Write-Success "AVD created successfully"
    } catch {
        Write-Error "Failed to create AVD: $_"
        exit 1
    }
}

# Step 6: Configure AVD for optimal testing
Write-StepInfo "Configuring AVD for testing..."

$AvdConfigPath = Join-Path $env:USERPROFILE ".android\avd\$AvdName.avd\config.ini"

if (Test-Path $AvdConfigPath) {
    $ConfigContent = @"
# Enhanced configuration for testing
hw.ramSize=4096
vm.heapSize=256
hw.keyboard=yes
hw.keyboard.lid=yes
showDeviceFrame=yes
hw.gpu.enabled=yes
hw.gpu.mode=auto
hw.camera.back=emulated
hw.camera.front=emulated
hw.gps=yes
hw.audioInput=yes
hw.audioOutput=yes
disk.dataPartition.size=8192MB
"@

    Add-Content -Path $AvdConfigPath -Value $ConfigContent
    Write-Success "AVD configuration updated"
}

# Step 7: Test emulator startup
Write-StepInfo "Testing emulator startup..."

Write-Host "Starting emulator (this may take a few minutes)..." -ForegroundColor $Yellow

$EmulatorArgs = @(
    "-avd", $AvdName,
    "-no-boot-anim",
    "-no-snapshot-save",
    "-wipe-data",
    "-gpu", "auto"
)

$EmulatorProcess = Start-Process -FilePath $Emulator -ArgumentList $EmulatorArgs -PassThru -WindowStyle Hidden

Write-StepInfo "Waiting for emulator to boot..."
Start-Sleep -Seconds 30

# Wait for emulator to be ready
$AdbPath = Join-Path $AndroidHome "platform-tools\adb.exe"
$BootComplete = $false
$MaxWaitTime = 300 # 5 minutes
$WaitTime = 0

while (-not $BootComplete -and $WaitTime -lt $MaxWaitTime) {
    try {
        $BootStatus = & $AdbPath shell getprop sys.boot_completed 2>$null
        if ($BootStatus -eq "1") {
            $BootComplete = $true
        }
    } catch {
        # Ignore errors during boot
    }
    
    if (-not $BootComplete) {
        Start-Sleep -Seconds 10
        $WaitTime += 10
        Write-Host "." -NoNewline
    }
}

if ($BootComplete) {
    Write-Success "`nEmulator started successfully!"
    
    # Step 8: Install Geberit Home app
    Write-StepInfo "Setting up Google Play Store for app installation..."
    
    Write-Host @"
📱 Emulator Setup Complete!

Next steps:
1. In the emulator, open Google Play Store
2. Sign in with your Google account
3. Install 'Geberit Home' app
4. Once installed, get the app activity:
   adb shell "cmd package resolve-activity --brief com.geberit.home | tail -n 1"

Then update the config files with the activity and run:
   npm run test:emulator

"@ -ForegroundColor $Green

} else {
    Write-Error "Emulator failed to start within 5 minutes"
    if ($EmulatorProcess -and -not $EmulatorProcess.HasExited) {
        $EmulatorProcess.Kill()
    }
    exit 1
}

Write-Success "Android Emulator setup completed successfully!"