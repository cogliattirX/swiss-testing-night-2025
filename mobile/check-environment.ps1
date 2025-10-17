#!/usr/bin/env powershell

<#
.SYNOPSIS
Android Environment Verification Script

.DESCRIPTION
This script checks if the Android development environment is properly set up
for mobile testing with Appium and WebDriverIO.
#>

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-StepInfo {
    param([string]$Message)
    Write-Host "🔍 $Message" -ForegroundColor $Blue
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

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

Write-Host @"
🔍 Android Environment Verification
===================================

Checking your Android development setup...

"@ -ForegroundColor $Blue

$AllGood = $true

# Check Node.js
Write-StepInfo "Checking Node.js..."
if (Test-Command "node") {
    $NodeVersion = node --version
    Write-Success "Node.js found: $NodeVersion"
    
    # Check if version is 20+
    $Version = [Version]($NodeVersion -replace 'v', '')
    if ($Version.Major -ge 20) {
        Write-Success "Node.js version is compatible (20+)"
    } else {
        Write-Warning "Node.js version should be 20 or higher for best compatibility"
    }
} else {
    Write-Error "Node.js not found. Please install Node.js 20 LTS"
    $AllGood = $false
}

# Check npm
Write-StepInfo "Checking npm..."
if (Test-Command "npm") {
    $NpmVersion = npm --version
    Write-Success "npm found: v$NpmVersion"
} else {
    Write-Error "npm not found"
    $AllGood = $false
}

# Check Java
Write-StepInfo "Checking Java..."
if (Test-Command "java") {
    $JavaVersion = java -version 2>&1 | Select-String -Pattern "version"
    Write-Success "Java found: $JavaVersion"
    
    # Check Java version (should be 17+)
    $JavaVersionLine = java -version 2>&1 | Select-Object -First 1
    if ($JavaVersionLine -match '"(\d+)\.') {
        $JavaMajorVersion = [int]$Matches[1]
        if ($JavaMajorVersion -ge 17) {
            Write-Success "Java version is compatible (17+)"
        } else {
            Write-Warning "Java version should be 17 or higher"
        }
    }
} else {
    Write-Error "Java not found. Please install Java 17 or higher"
    $AllGood = $false
}

# Check JAVA_HOME
Write-StepInfo "Checking JAVA_HOME..."
if ($env:JAVA_HOME) {
    Write-Success "JAVA_HOME set: $env:JAVA_HOME"
} else {
    Write-Warning "JAVA_HOME not set. This may cause issues with Android tools"
}

# Check Android SDK
Write-StepInfo "Checking Android SDK..."
$AndroidHome = $env:ANDROID_HOME
if (-not $AndroidHome) {
    $AndroidHome = $env:ANDROID_SDK_ROOT
}

if ($AndroidHome) {
    Write-Success "Android SDK found: $AndroidHome"
    
    # Check ADB
    $AdbPath = Join-Path $AndroidHome "platform-tools\adb.exe"
    if (Test-Path $AdbPath) {
        Write-Success "ADB found"
        
        # Test ADB devices
        try {
            $Devices = & $AdbPath devices
            $DeviceLines = $Devices | Select-String -Pattern "\t"
            
            if ($DeviceLines) {
                Write-Success "Connected devices found:"
                foreach ($Device in $DeviceLines) {
                    $DeviceInfo = $Device.ToString().Split("`t")
                    $DeviceId = $DeviceInfo[0].Trim()
                    $DeviceStatus = $DeviceInfo[1].Trim()
                    
                    if ($DeviceStatus -eq "device") {
                        Write-Success "  📱 $DeviceId (authorized)"
                    } elseif ($DeviceStatus -eq "unauthorized") {
                        Write-Warning "  📱 $DeviceId (unauthorized - please authorize on device)"
                    } else {
                        Write-Warning "  📱 $DeviceId ($DeviceStatus)"
                    }
                }
            } else {
                Write-Warning "No devices connected. Connect your Pixel 8a via USB"
            }
        } catch {
            Write-Error "Could not run adb devices: $_"
        }
    } else {
        Write-Error "ADB not found in Android SDK"
        $AllGood = $false
    }
    
    # Check Emulator
    $EmulatorPath = Join-Path $AndroidHome "emulator\emulator.exe"
    if (Test-Path $EmulatorPath) {
        Write-Success "Android Emulator found"
        
        # List available AVDs
        try {
            $AvdManager = Join-Path $AndroidHome "cmdline-tools\latest\bin\avdmanager.bat"
            if (Test-Path $AvdManager) {
                $Avds = & $AvdManager list avd 2>$null | Select-String -Pattern "Name:"
                if ($Avds) {
                    Write-Success "Available AVDs:"
                    foreach ($Avd in $Avds) {
                        $AvdName = ($Avd.ToString() -split ":")[1].Trim()
                        Write-Success "  📱 $AvdName"
                    }
                } else {
                    Write-Warning "No AVDs found. Run 'npm run setup:emulator' to create one"
                }
            }
        } catch {
            Write-Warning "Could not list AVDs"
        }
    } else {
        Write-Warning "Android Emulator not found"
    }
} else {
    Write-Error "Android SDK not found. Please install Android Studio and set ANDROID_HOME"
    $AllGood = $false
}

# Check Appium
Write-StepInfo "Checking Appium..."
if (Test-Command "appium") {
    $AppiumVersion = appium --version
    Write-Success "Appium found: v$AppiumVersion"
    
    # Check Appium drivers
    try {
        $Drivers = appium driver list 2>$null
        if ($Drivers -match "uiautomator2.*installed") {
            Write-Success "UiAutomator2 driver installed"
        } else {
            Write-Warning "UiAutomator2 driver not found. Run: appium driver install uiautomator2"
        }
    } catch {
        Write-Warning "Could not check Appium drivers"
    }
} else {
    Write-Error "Appium not found. Run: npm install -g appium"
    $AllGood = $false
}

# Check Geberit Home app
Write-StepInfo "Checking Geberit Home app..."
if ($AndroidHome -and (Test-Path (Join-Path $AndroidHome "platform-tools\adb.exe"))) {
    try {
        $AdbPath = Join-Path $AndroidHome "platform-tools\adb.exe"
        $AppCheck = & $AdbPath shell pm list packages com.geberit.home 2>$null
        
        if ($AppCheck -match "com.geberit.home") {
            Write-Success "Geberit Home app found on device"
            
            # Try to get app activity
            try {
                $Activity = & $AdbPath shell "cmd package resolve-activity --brief com.geberit.home" 2>$null | Select-Object -Last 1
                if ($Activity -and $Activity -ne "No activity found") {
                    Write-Success "App activity: $Activity"
                    Write-Host "📝 Use this activity in your WDIO config files" -ForegroundColor $Yellow
                } else {
                    Write-Warning "Could not determine app activity. Try manual detection"
                }
            } catch {
                Write-Warning "Could not get app activity automatically"
            }
        } else {
            Write-Warning "Geberit Home app not found. Install from Play Store"
        }
    } catch {
        Write-Warning "Could not check for Geberit Home app"
    }
}

# Summary
Write-Host "`n" + "="*50 -ForegroundColor $Blue
if ($AllGood) {
    Write-Success "Environment check completed successfully!"
    Write-Host @"

🚀 Ready to start testing!

Real device testing:
1. Connect your Pixel 8a via USB
2. Enable USB debugging
3. Authorize the computer on your device
4. Run: npm run dev

Emulator testing:
1. Run: npm run setup:emulator
2. Install Geberit Home in the emulator
3. Run: npm run test:emulator

"@ -ForegroundColor $Green
} else {
    Write-Error "Environment setup incomplete. Please fix the issues above"
}

Write-Host "="*50 -ForegroundColor $Blue