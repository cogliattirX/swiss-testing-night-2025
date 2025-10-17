# Simple Environment Check
Write-Host "Android Environment Check" -ForegroundColor Green

# Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
node --version

# npm  
Write-Host "Checking npm..." -ForegroundColor Yellow
npm --version

# Java
Write-Host "Checking Java..." -ForegroundColor Yellow
java -version

# Appium
Write-Host "Checking Appium..." -ForegroundColor Yellow
appium --version

# ADB
Write-Host "Checking ADB..." -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "Android SDK found at: $env:ANDROID_HOME" -ForegroundColor Green
    $adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"
    if (Test-Path $adbPath) {
        Write-Host "ADB found - checking devices..." -ForegroundColor Green
        & $adbPath devices
    } else {
        Write-Host "ADB not found" -ForegroundColor Red
    }
} else {
    Write-Host "ANDROID_HOME not set" -ForegroundColor Red
}

Write-Host "Environment check complete!" -ForegroundColor Green