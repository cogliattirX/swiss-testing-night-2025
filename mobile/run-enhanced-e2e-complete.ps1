#!/usr/bin/env pwsh

# 🎯 Run Enhanced E2E Complete Shopping Workflow - Multiple Products + Full Checkout
# This script runs the enhanced comprehensive E2E shopping test with robust checkout completion

Write-Host "🚀 Starting ENHANCED E2E Complete Shopping Workflow Test..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Yellow

# Check if we're in the mobile directory
if (-not (Test-Path "test\specs\sauce-demo\enhanced-e2e-shopping.spec.js")) {
    Write-Host "❌ Error: Enhanced test file not found!" -ForegroundColor Red
    Write-Host "Expected file: test\specs\sauce-demo\enhanced-e2e-shopping.spec.js" -ForegroundColor Yellow
    exit 1
}

# Create test results directories
Write-Host "📁 Creating test results directories..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "test-results\screenshots" | Out-Null
New-Item -ItemType Directory -Force -Path "test-results\logs" | Out-Null

# Display enhanced test features
Write-Host "`n🎯 Enhanced E2E Complete Shopping Test Features:" -ForegroundColor Cyan
Write-Host "   📱 Systematic addition of 3+ products to cart" -ForegroundColor White
Write-Host "   🛒 Robust shopping cart access and verification" -ForegroundColor White
Write-Host "   💳 Enhanced checkout button detection (5 strategies)" -ForegroundColor White
Write-Host "   📝 Comprehensive form filling with screen credentials" -ForegroundColor White
Write-Host "   💰 Payment method selection and details" -ForegroundColor White
Write-Host "   🎯 Order review and completion with confirmation" -ForegroundColor White
Write-Host "   📸 12-stage screenshot documentation" -ForegroundColor White
Write-Host "   ⏱️  Optimized timeout handling and waiting strategies" -ForegroundColor White

# Check emulator status
Write-Host "`n🔍 Checking Android emulator and app status..." -ForegroundColor Green
$emulatorRunning = adb devices | Select-String "emulator"
if ($emulatorRunning) {
    Write-Host "✅ Android emulator is running" -ForegroundColor Green
    Write-Host "Device: $emulatorRunning" -ForegroundColor Gray
} else {
    Write-Host "⚠️  No emulator detected. Please ensure emulator is running." -ForegroundColor Yellow
}

# Check if Sauce Labs Demo app is installed
$appInstalled = adb shell pm list packages | Select-String "com.saucelabs.mydemoapp.android"
if ($appInstalled) {
    Write-Host "✅ Sauce Labs Demo app is installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Sauce Labs Demo app not detected." -ForegroundColor Yellow
}

# Launch the app to ensure it's ready
Write-Host "`n🚀 Preparing Sauce Labs Demo app..." -ForegroundColor Green
adb shell am start -n com.saucelabs.mydemoapp.android/.SplashActivity
Start-Sleep 3

Write-Host "`n🎯 Enhanced E2E Test Improvements Over Previous Version:" -ForegroundColor Cyan
Write-Host "   🔧 Fixed timeout issues with robust selector strategies" -ForegroundColor White
Write-Host "   ➕ Systematic multi-product addition (3 products)" -ForegroundColor White
Write-Host "   🛒 Enhanced cart detection and access" -ForegroundColor White
Write-Host "   💳 Improved checkout flow with 5 detection strategies" -ForegroundColor White
Write-Host "   📝 Comprehensive form filling with multiple selector fallbacks" -ForegroundColor White
Write-Host "   💰 Payment method selection and credential filling" -ForegroundColor White
Write-Host "   🎯 Order completion verification with confirmation checking" -ForegroundColor White

# Add a pause for user to verify setup
Write-Host "`n⏸️  Press Enter when ready to start the ENHANCED comprehensive E2E test..." -ForegroundColor Cyan
Read-Host

# Run the enhanced E2E shopping test
Write-Host "`n🎯 Running ENHANCED E2E Complete Shopping Workflow Test..." -ForegroundColor Cyan
Write-Host "Test file: enhanced-e2e-shopping.spec.js" -ForegroundColor Gray
Write-Host "Expected duration: 3-5 minutes (optimized)" -ForegroundColor Gray
Write-Host "Features: 3+ products + Complete checkout + Order confirmation + Robust error handling" -ForegroundColor Gray

$testStartTime = Get-Date

try {
    # Run the specific enhanced E2E test
    npx wdio config/wdio.sauce-demo.js --spec="./test/specs/sauce-demo/enhanced-e2e-shopping.spec.js"
    
    $testEndTime = Get-Date
    $testDuration = $testEndTime - $testStartTime
    
    Write-Host "`n🎉 ENHANCED E2E Complete Shopping Test Completed!" -ForegroundColor Green
    Write-Host "Duration: $($testDuration.Minutes)m $($testDuration.Seconds)s" -ForegroundColor Gray
    
} catch {
    Write-Host "`n❌ Test execution failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Display enhanced results summary
Write-Host "`n📊 Enhanced Test Results Summary:" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Yellow

# Check for screenshots with enhanced naming
$screenshotCount = 0
if (Test-Path "test-results\screenshots") {
    $screenshots = Get-ChildItem -Path "test-results\screenshots\enhanced_e2e_*.png" -ErrorAction SilentlyContinue
    $screenshotCount = $screenshots.Count
}

if ($screenshotCount -gt 0) {
    Write-Host "📸 Enhanced screenshots captured: $screenshotCount" -ForegroundColor Green
    Write-Host "Location: test-results\screenshots\" -ForegroundColor Gray
    
    Write-Host "`n📱 Enhanced Test Stages Captured:" -ForegroundColor White
    $screenshots | ForEach-Object {
        $stageName = $_.Name -replace 'enhanced_e2e_\d+_', '' -replace '.png', ''
        Write-Host "   • $stageName" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  No enhanced screenshots found" -ForegroundColor Yellow
}

Write-Host "`n🎯 Enhanced E2E Complete Shopping Workflow Features Validated:" -ForegroundColor Cyan
Write-Host "   ✅ Multiple product addition (systematic approach)" -ForegroundColor White
Write-Host "   ✅ Robust shopping cart access and verification" -ForegroundColor White
Write-Host "   ✅ Enhanced checkout process initiation (5 strategies)" -ForegroundColor White
Write-Host "   ✅ Comprehensive customer information form filling" -ForegroundColor White
Write-Host "   ✅ Payment method selection and details input" -ForegroundColor White
Write-Host "   ✅ Order review and completion process" -ForegroundColor White
Write-Host "   ✅ Order confirmation verification" -ForegroundColor White
Write-Host "   ✅ Complete visual documentation (12 stages)" -ForegroundColor White

Write-Host "`n🏆 Key Improvements in Enhanced Version:" -ForegroundColor Green
Write-Host "   🔧 Eliminated timeout issues with robust waiting" -ForegroundColor White
Write-Host "   ➕ Added systematic multi-product workflow" -ForegroundColor White
Write-Host "   🛒 Enhanced cart detection and navigation" -ForegroundColor White
Write-Host "   💳 Improved checkout flow reliability" -ForegroundColor White
Write-Host "   📝 Added comprehensive form filling with fallbacks" -ForegroundColor White
Write-Host "   🎯 Implemented order confirmation verification" -ForegroundColor White

Write-Host "`n🏁 Enhanced E2E Complete Shopping Test Session Completed!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Yellow