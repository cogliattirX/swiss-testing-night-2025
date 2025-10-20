# Sauce Labs Demo App Test Runner
# This script provides easy access to run different test suites for the Sauce Labs Demo App

Write-Host "🛒 Sauce Labs Demo App - Test Runner" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Check if emulator is running
Write-Host "📱 Checking if Android emulator is running..." -ForegroundColor Yellow
$adbPath = "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools\adb.exe"

if (Test-Path $adbPath) {
    $devices = & $adbPath devices
    $emulatorRunning = $devices -match "emulator-\d+\s+device"
    
    if ($emulatorRunning) {
        Write-Host "✅ Emulator is running" -ForegroundColor Green
    } else {
        Write-Host "❌ No emulator detected. Please start an Android emulator first." -ForegroundColor Red
        Write-Host "   You can start one using: emulator.exe -avd <your_avd_name>" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "⚠️  ADB not found. Please ensure Android SDK is installed." -ForegroundColor Yellow
}

# Check if Sauce Labs app is installed
Write-Host "📦 Checking if Sauce Labs Demo App is installed..." -ForegroundColor Yellow
$packages = & $adbPath shell pm list packages | findstr "saucelabs"
if ($packages -match "com.saucelabs.mydemoapp.android") {
    Write-Host "✅ Sauce Labs Demo App is installed" -ForegroundColor Green
} else {
    Write-Host "❌ Sauce Labs Demo App not found. Installing..." -ForegroundColor Red
    if (Test-Path "apks\my-demo-app-android-2.2.0.apk") {
        & $adbPath install "apks\my-demo-app-android-2.2.0.apk"
        Write-Host "✅ App installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ APK file not found in apks directory" -ForegroundColor Red
        exit 1
    }
}

# Menu for test selection
Write-Host ""
Write-Host "🧪 Select which tests to run:" -ForegroundColor Cyan
Write-Host "1. Basic Launch Tests (quick verification)" -ForegroundColor White
Write-Host "2. Shopping Features Tests (product catalog, ratings)" -ForegroundColor White
Write-Host "3. User Features Tests (authentication, settings)" -ForegroundColor White
Write-Host "4. All Tests (complete test suite)" -ForegroundColor White
Write-Host "5. Custom Test File" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Running Basic Launch Tests..." -ForegroundColor Green
        npx wdio config/wdio.sauce-demo.js --spec="test/specs/sauce-demo/basic-launch.spec.js"
    }
    "2" {
        Write-Host "🛍️ Running Shopping Features Tests..." -ForegroundColor Green
        npx wdio config/wdio.sauce-demo.js --spec="test/specs/sauce-demo/shopping-features.spec.js"
    }
    "3" {
        Write-Host "🔐 Running User Features Tests..." -ForegroundColor Green
        npx wdio config/wdio.sauce-demo.js --spec="test/specs/sauce-demo/user-features.spec.js"
    }
    "4" {
        Write-Host "🔄 Running All Tests..." -ForegroundColor Green
        npx wdio config/wdio.sauce-demo.js
    }
    "5" {
        $customSpec = Read-Host "Enter the path to your test file (relative to mobile directory)"
        Write-Host "🧪 Running Custom Test: $customSpec..." -ForegroundColor Green
        npx wdio config/wdio.sauce-demo.js --spec="$customSpec"
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📊 Test execution completed!" -ForegroundColor Green
Write-Host "📸 Screenshots saved in: test-results/screenshots/" -ForegroundColor Yellow
Write-Host "📋 Logs available in: test-results/logs/" -ForegroundColor Yellow

# Option to open screenshots folder
$openScreenshots = Read-Host "Do you want to open the screenshots folder? (y/n)"
if ($openScreenshots -eq "y" -or $openScreenshots -eq "Y") {
    if (Test-Path "test-results\screenshots") {
        Invoke-Item "test-results\screenshots"
    } else {
        Write-Host "📁 Screenshots folder not found" -ForegroundColor Yellow
    }
}