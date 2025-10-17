#!/usr/bin/env powershell

<#
.SYNOPSIS
Set Android Environment Variables

.DESCRIPTION
This script sets up the required environment variables for Android development
#>

# Requires Admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges" -ForegroundColor Red
    Write-Host "Right-click PowerShell and 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Setting up Android Environment Variables..." -ForegroundColor Cyan

# Set JAVA_HOME
$JavaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
if (Test-Path $JavaHome) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $JavaHome, "Machine")
    Write-Host "✅ JAVA_HOME set to: $JavaHome" -ForegroundColor Green
} else {
    Write-Host "❌ Java installation not found at: $JavaHome" -ForegroundColor Red
}

# Set ANDROID_HOME (default location)
$AndroidHome = "$env:USERPROFILE\AppData\Local\Android\Sdk"
if (Test-Path $AndroidHome) {
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $AndroidHome, "Machine")
    [Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $AndroidHome, "Machine")
    Write-Host "✅ ANDROID_HOME set to: $AndroidHome" -ForegroundColor Green
} else {
    Write-Host "⚠️ Android SDK not found at: $AndroidHome" -ForegroundColor Yellow
    Write-Host "Please complete Android Studio setup first" -ForegroundColor Yellow
    
    # Create the directory structure
    New-Item -ItemType Directory -Path $AndroidHome -Force | Out-Null
    Write-Host "📁 Created Android SDK directory" -ForegroundColor Green
}

# Update PATH
$CurrentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

# Add Java to PATH
$JavaBin = "$JavaHome\bin"
if ($CurrentPath -notlike "*$JavaBin*") {
    $NewPath = $CurrentPath + ";" + $JavaBin
    [Environment]::SetEnvironmentVariable("Path", $NewPath, "Machine")
    Write-Host "✅ Added Java to PATH" -ForegroundColor Green
}

# Add Android tools to PATH
$AndroidPlatformTools = "$AndroidHome\platform-tools"
$AndroidTools = "$AndroidHome\tools"

if (Test-Path $AndroidPlatformTools) {
    if ($CurrentPath -notlike "*$AndroidPlatformTools*") {
        $NewPath = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + $AndroidPlatformTools
        [Environment]::SetEnvironmentVariable("Path", $NewPath, "Machine")
        Write-Host "✅ Added Android platform-tools to PATH" -ForegroundColor Green
    }
}

if (Test-Path $AndroidTools) {
    if ($CurrentPath -notlike "*$AndroidTools*") {
        $NewPath = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + $AndroidTools
        [Environment]::SetEnvironmentVariable("Path", $NewPath, "Machine")
        Write-Host "✅ Added Android tools to PATH" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Environment setup complete!" -ForegroundColor Green
Write-Host "Please restart your terminal/PowerShell for changes to take effect" -ForegroundColor Yellow

# Show current settings
Write-Host "`n📋 Current Settings:" -ForegroundColor Cyan
Write-Host "JAVA_HOME: $([Environment]::GetEnvironmentVariable('JAVA_HOME', 'Machine'))" -ForegroundColor White
Write-Host "ANDROID_HOME: $([Environment]::GetEnvironmentVariable('ANDROID_HOME', 'Machine'))" -ForegroundColor White