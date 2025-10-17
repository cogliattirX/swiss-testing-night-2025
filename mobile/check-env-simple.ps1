#!/usr/bin/env powershell

<#
.SYNOPSIS
Simple Android Environment Check

.DESCRIPTION
Quick check of Android environment for mobile testing
#>

Write-Host "🔍 Android Environment Check" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Check Node.js
Write-Host "`n🔍 Checking Node.js..." -ForegroundColor Cyan
try {
    $NodeVersion = node --version
    Write-Host "✅ Node.js found: $NodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
}

# Check npm
Write-Host "`n🔍 Checking npm..." -ForegroundColor Cyan
try {
    $NpmVersion = npm --version
    Write-Host "✅ npm found: v$NpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
}

# Check Java
Write-Host "`n🔍 Checking Java..." -ForegroundColor Cyan
try {
    $JavaCheck = java -version 2>&1
    Write-Host "✅ Java found" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found" -ForegroundColor Red
}

# Check Android SDK
Write-Host "`n🔍 Checking Android SDK..." -ForegroundColor Cyan
$AndroidHome = $env:ANDROID_HOME
if (-not $AndroidHome) {
    $AndroidHome = $env:ANDROID_SDK_ROOT
}

if ($AndroidHome) {
    Write-Host "✅ Android SDK found: $AndroidHome" -ForegroundColor Green
    
    # Check ADB
    $AdbPath = Join-Path $AndroidHome "platform-tools\adb.exe"
    if (Test-Path $AdbPath) {
        Write-Host "✅ ADB found" -ForegroundColor Green
        
        # Check devices
        try {
            Write-Host "`n📱 Connected devices:" -ForegroundColor Cyan
            & $AdbPath devices
        } catch {
            Write-Host "⚠️ Could not run adb devices" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ ADB not found" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Android SDK not found" -ForegroundColor Red
    Write-Host "Install Android Studio and set ANDROID_HOME" -ForegroundColor Yellow
}

# Check Appium
Write-Host "`n🔍 Checking Appium..." -ForegroundColor Cyan
try {
    $AppiumVersion = appium --version
    Write-Host "✅ Appium found: v$AppiumVersion" -ForegroundColor Green
    
    # Check drivers
    Write-Host "`n🔍 Checking Appium drivers..." -ForegroundColor Cyan
    appium driver list
} catch {
    Write-Host "❌ Appium not found" -ForegroundColor Red
    Write-Host "Run: npm install -g appium" -ForegroundColor Yellow
}

Write-Host "`n🚀 Next steps:" -ForegroundColor Green
Write-Host "1. Install missing components above" -ForegroundColor White
Write-Host "2. Connect your Pixel 8a via USB" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White

Write-Host "`n" + "="*40 -ForegroundColor Cyan