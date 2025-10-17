#!/usr/bin/env powershell

<#
.SYNOPSIS
Install Android SDK Components

.DESCRIPTION
This script downloads and installs required Android SDK components for mobile testing
#>

Write-Host "📱 Installing Android SDK Components..." -ForegroundColor Cyan

# Create Android SDK directory
$AndroidHome = "$env:USERPROFILE\AppData\Local\Android\Sdk"
if (-not (Test-Path $AndroidHome)) {
    New-Item -ItemType Directory -Path $AndroidHome -Force | Out-Null
    Write-Host "📁 Created Android SDK directory: $AndroidHome" -ForegroundColor Green
}

# Download command line tools if not present
$CmdLineToolsDir = "$AndroidHome\cmdline-tools"
$CmdLineToolsLatest = "$CmdLineToolsDir\latest"

if (-not (Test-Path $CmdLineToolsLatest)) {
    Write-Host "📥 Downloading Android Command Line Tools..." -ForegroundColor Yellow
    
    $CmdLineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    $TempZip = "$env:TEMP\commandlinetools.zip"
    
    try {
        Invoke-WebRequest -Uri $CmdLineToolsUrl -OutFile $TempZip -UseBasicParsing
        Write-Host "✅ Downloaded command line tools" -ForegroundColor Green
        
        # Extract to temp directory first
        $TempExtract = "$env:TEMP\cmdline-tools"
        Expand-Archive -Path $TempZip -DestinationPath $TempExtract -Force
        
        # Move to correct location
        if (-not (Test-Path $CmdLineToolsDir)) {
            New-Item -ItemType Directory -Path $CmdLineToolsDir -Force | Out-Null
        }
        
        Move-Item -Path "$TempExtract\cmdline-tools" -Destination $CmdLineToolsLatest -Force
        Write-Host "✅ Extracted command line tools" -ForegroundColor Green
        
        # Clean up
        Remove-Item $TempZip -Force -ErrorAction SilentlyContinue
        Remove-Item $TempExtract -Recurse -Force -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "❌ Failed to download command line tools: $_" -ForegroundColor Red
        exit 1
    }
}

# Set environment for this session
$env:ANDROID_HOME = $AndroidHome
$env:PATH += ";$AndroidHome\cmdline-tools\latest\bin;$AndroidHome\platform-tools"

$SdkManager = "$CmdLineToolsLatest\bin\sdkmanager.bat"

if (Test-Path $SdkManager) {
    Write-Host "🔧 Installing essential Android SDK components..." -ForegroundColor Yellow
    
    # Accept licenses first
    Write-Host "📝 Accepting Android SDK licenses..." -ForegroundColor Yellow
    $LicenseAccept = "y`ny`ny`ny`ny`ny`ny`ny`ny`ny`ny`n"
    $LicenseAccept | & $SdkManager --licenses
    
    # Install essential components
    $Components = @(
        "platform-tools",
        "platforms;android-34",
        "platforms;android-33",
        "build-tools;34.0.0",
        "system-images;android-34;google_apis_playstore;x86_64",
        "emulator"
    )
    
    foreach ($Component in $Components) {
        Write-Host "📦 Installing $Component..." -ForegroundColor Cyan
        & $SdkManager $Component
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Installed $Component" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Warning: Failed to install $Component" -ForegroundColor Yellow
        }
    }
    
    Write-Host "🎉 Android SDK installation complete!" -ForegroundColor Green
    
    # Verify ADB
    $AdbPath = "$AndroidHome\platform-tools\adb.exe"
    if (Test-Path $AdbPath) {
        Write-Host "✅ ADB installed successfully" -ForegroundColor Green
        & $AdbPath version
    }
    
} else {
    Write-Host "❌ SDK Manager not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run setup-environment.ps1 as Administrator to set environment variables" -ForegroundColor White
Write-Host "2. Restart your terminal" -ForegroundColor White
Write-Host "3. Connect your Pixel 8a and run: adb devices" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White