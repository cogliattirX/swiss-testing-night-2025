# Alba AquaClean Journey Test Runner
# Swiss Testing Night 2025 - Complete Device Workflow Test

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("full", "critical")]
    [string]$TestType = "critical",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

Write-Host "🚀 Alba Geberit AquaClean Journey Test" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "📱 Target: Alba AquaClean Device Complete Workflow" -ForegroundColor Cyan
Write-Host "🎯 Test Type: $TestType" -ForegroundColor Yellow
Write-Host ""

# Check environment
Write-Host "🔧 Environment Check" -ForegroundColor Blue
Write-Host "===================" -ForegroundColor Blue

# Check emulator
try {
    $devices = adb devices 2>$null | Select-String "emulator-5554"
    if ($devices) {
        Write-Host "✅ Emulator emulator-5554 is connected" -ForegroundColor Green
    } else {
        Write-Host "❌ Emulator emulator-5554 not found" -ForegroundColor Red
        Write-Host "💡 Please start the Android emulator first" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Could not check emulator status" -ForegroundColor Red
    exit 1
}

# Check Appium
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4723/status" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Appium server is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Appium server not responding" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Appium server is not running on port 4723" -ForegroundColor Red
    Write-Host "💡 Please start Appium: appium --allow-insecure=chromedriver_autodownload" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Select test spec based on type
$specFile = switch ($TestType) {
    "full" { "test/specs/geberit-home/alba-aquaclean-journey.spec.js" }
    "critical" { "test/specs/geberit-home/alba-aquaclean-journey.spec.js" }
    default { "test/specs/geberit-home/alba-aquaclean-journey.spec.js" }
}

Write-Host "🧪 Test Execution" -ForegroundColor Blue
Write-Host "=================" -ForegroundColor Blue
Write-Host "📄 Spec File: $specFile" -ForegroundColor Gray
Write-Host "⚙️ Config: config/wdio.geberit-complete.js" -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date

try {
    if ($Verbose) {
        npx wdio run config/wdio.geberit-complete.js --spec $specFile
    } else {
        npx wdio run config/wdio.geberit-complete.js --spec $specFile 2>&1 | Where-Object { 
            $_ -match "PASSED|FAILED|Error|Step|Activating|Selecting|Waiting|Handling|Navigating|Opening|Adjusting|Closing|Deactivating|Verifying|Alba|Device|Demo" 
        }
    }
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host ""
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Alba AquaClean Journey Test PASSED" -ForegroundColor Green
        Write-Host "⏱️ Duration: $([math]::Round($duration, 1)) seconds" -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "📋 Test Results Summary:" -ForegroundColor Blue
        Write-Host "• Demo mode activation: ✅" -ForegroundColor Green
        Write-Host "• Alba device selection: ✅" -ForegroundColor Green  
        Write-Host "• Device connection: ✅" -ForegroundColor Green
        Write-Host "• Permissions handled: ✅" -ForegroundColor Green
        Write-Host "• Welcome dialog navigation: ✅" -ForegroundColor Green
        Write-Host "• Device settings interaction: ✅" -ForegroundColor Green
        Write-Host "• Demo mode deactivation: ✅" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Alba AquaClean Journey Test FAILED" -ForegroundColor Red
        Write-Host "⏱️ Duration: $([math]::Round($duration, 1)) seconds" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Test execution error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📸 Screenshots and Reports:" -ForegroundColor Blue
Write-Host "===========================" -ForegroundColor Blue

# Check for generated screenshots
$screenshotDir = "test-results\screenshots"
if (Test-Path $screenshotDir) {
    $albaScreenshots = Get-ChildItem $screenshotDir -Filter "alba-*.png" | Measure-Object
    Write-Host "📸 Alba journey screenshots: $($albaScreenshots.Count) files" -ForegroundColor Green
    
    # Show latest screenshots
    $latestScreenshots = Get-ChildItem $screenshotDir -Filter "alba-*.png" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
    foreach ($screenshot in $latestScreenshots) {
        Write-Host "   📷 $($screenshot.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️ No screenshots directory found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎭 Alba AquaClean Journey Test Complete" -ForegroundColor Magenta
Write-Host "Thank you for testing the Swiss Testing Night 2025 Mobile Framework!" -ForegroundColor Cyan

exit $LASTEXITCODE