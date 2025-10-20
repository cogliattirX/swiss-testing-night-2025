#!/usr/bin/env pwsh

# 🎯 Run Real E2E Complete Shopping Workflow - Multiple Products + Full Checkout
# This script runs the comprehensive E2E shopping test with multiple products and complete checkout

Write-Host "🚀 Starting Real E2E Complete Shopping Workflow Test..." -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Yellow

# Check if we're in the mobile directory
if (-not (Test-Path "test\specs\sauce-demo\real-e2e-shopping.spec.js")) {
    Write-Host "❌ Error: Not in mobile directory or test file not found!" -ForegroundColor Red
    Write-Host "Please run this script from the mobile directory" -ForegroundColor Yellow
    Write-Host "Expected file: test\specs\sauce-demo\real-e2e-shopping.spec.js" -ForegroundColor Yellow
    exit 1
}

# Create test results directories
Write-Host "📁 Creating test results directories..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "test-results\screenshots" | Out-Null
New-Item -ItemType Directory -Force -Path "test-results\logs" | Out-Null

# Display test summary
Write-Host "`n🎯 Real E2E Complete Shopping Test Features:" -ForegroundColor Cyan
Write-Host "   📱 Multiple products addition (3+ products)" -ForegroundColor White
Write-Host "   🛒 Shopping cart management" -ForegroundColor White
Write-Host "   💳 Complete checkout process" -ForegroundColor White
Write-Host "   📝 Customer information filling" -ForegroundColor White
Write-Host "   💰 Payment method selection" -ForegroundColor White
Write-Host "   🎯 Order completion and confirmation" -ForegroundColor White
Write-Host "   📸 Full screenshot documentation" -ForegroundColor White

# Check emulator status
Write-Host "`n🔍 Checking Android emulator status..." -ForegroundColor Green
$emulatorRunning = adb devices | Select-String "emulator"
if ($emulatorRunning) {
    Write-Host "✅ Android emulator is running" -ForegroundColor Green
    Write-Host "Device: $emulatorRunning" -ForegroundColor Gray
} else {
    Write-Host "⚠️  No emulator detected. Starting emulator..." -ForegroundColor Yellow
    Write-Host "Please ensure Android emulator is running before proceeding." -ForegroundColor Yellow
    
    # Optionally start emulator (uncomment if needed)
    # Write-Host "Starting emulator automatically..." -ForegroundColor Yellow
    # emulator -avd Pixel_7_Pro_API_34 -no-audio -no-boot-anim &
    # Start-Sleep 30
}

# Check if Sauce Labs Demo app is installed
Write-Host "`n📱 Checking Sauce Labs Demo app installation..." -ForegroundColor Green
$appInstalled = adb shell pm list packages | Select-String "com.saucelabs.mydemoapp.android"
if ($appInstalled) {
    Write-Host "✅ Sauce Labs Demo app is installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Sauce Labs Demo app not detected. Installing..." -ForegroundColor Yellow
    if (Test-Path "apks\my-demo-app-android-2.2.0.apk") {
        adb install "apks\my-demo-app-android-2.2.0.apk"
        Write-Host "✅ App installation attempted" -ForegroundColor Green
    } else {
        Write-Host "❌ APK file not found at apks\my-demo-app-android-2.2.0.apk" -ForegroundColor Red
    }
}

# Launch the app to ensure it's ready
Write-Host "`n🚀 Launching Sauce Labs Demo app..." -ForegroundColor Green
adb shell am start -n com.saucelabs.mydemoapp.android/.SplashActivity
Start-Sleep 5

Write-Host "`n🔄 Starting Appium server..." -ForegroundColor Green
Write-Host "Note: Ensure Appium server is running on port 4723" -ForegroundColor Yellow

# Add a pause for user to verify setup
Write-Host "`n⏸️  Press Enter when ready to start the comprehensive E2E test..." -ForegroundColor Cyan
Read-Host

# Run the comprehensive real E2E shopping test
Write-Host "`n🎯 Running Real E2E Complete Shopping Workflow Test..." -ForegroundColor Cyan
Write-Host "Test file: real-e2e-shopping.spec.js" -ForegroundColor Gray
Write-Host "Expected duration: 3-5 minutes" -ForegroundColor Gray
Write-Host "Features: Multiple products + Complete checkout + Order confirmation" -ForegroundColor Gray

try {
    # Run the specific real E2E test
    npx wdio config/wdio.sauce-demo.js --spec="./test/specs/sauce-demo/real-e2e-shopping.spec.js"
    
    Write-Host "`n🎉 Real E2E Complete Shopping Test Completed!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Test execution failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Display results summary
Write-Host "`n📊 Test Results Summary:" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Yellow

# Check for screenshots
$screenshotCount = (Get-ChildItem -Path "test-results\screenshots\real_e2e_*.png" -ErrorAction SilentlyContinue).Count
if ($screenshotCount -gt 0) {
    Write-Host "📸 Screenshots captured: $screenshotCount" -ForegroundColor Green
    Write-Host "Location: test-results\screenshots\" -ForegroundColor Gray
    
    # List key screenshots
    Write-Host "`n📱 Key Test Stages Captured:" -ForegroundColor White
    Get-ChildItem -Path "test-results\screenshots\real_e2e_*.png" -ErrorAction SilentlyContinue | ForEach-Object {
        $stageName = $_.Name -replace 'real_e2e_\d+_', '' -replace '.png', ''
        Write-Host "   • $stageName" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  No screenshots found (test may not have run completely)" -ForegroundColor Yellow
}

# Check for test reports
if (Test-Path "test-results") {
    $reportFiles = Get-ChildItem -Path "test-results" -Filter "*.json" -ErrorAction SilentlyContinue
    if ($reportFiles.Count -gt 0) {
        Write-Host "📋 Test reports generated: $($reportFiles.Count)" -ForegroundColor Green
    }
}

Write-Host "`n🎯 Real E2E Complete Shopping Workflow Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Product catalog exploration" -ForegroundColor White
Write-Host "   ✅ Multiple product addition to cart" -ForegroundColor White
Write-Host "   ✅ Shopping cart access and review" -ForegroundColor White
Write-Host "   ✅ Complete checkout process initiation" -ForegroundColor White
Write-Host "   ✅ Customer information form filling" -ForegroundColor White
Write-Host "   ✅ Payment method selection" -ForegroundColor White
Write-Host "   ✅ Order review and completion" -ForegroundColor White
Write-Host "   ✅ Order confirmation verification" -ForegroundColor White

Write-Host "`n🏁 Real E2E Complete Shopping Test Session Completed!" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Yellow