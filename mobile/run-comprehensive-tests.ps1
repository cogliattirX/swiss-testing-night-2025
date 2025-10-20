# Geberit Home App - Comprehensive Test Suite Runner
# Swiss Testing Night 2025 - Mobile Testing Workshop

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "complete-cycle", "security", "performance", "accessibility", "comprehensive", "quick")]
    [string]$TestSuite = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipSetup,
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateReports,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

Write-Host "🚀 Geberit Home App - Test Suite Runner" -ForegroundColor Green
Write-Host "📱 Target: Emulated Android Device with Geberit Home App" -ForegroundColor Cyan
Write-Host "🎭 Multi-Persona Testing Framework" -ForegroundColor Yellow
Write-Host ""

# Function to check if ADB is in PATH
function Test-AdbPath {
    try {
        $adbVersion = adb version 2>$null
        if ($adbVersion) {
            Write-Host "✅ ADB is available in PATH" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ ADB not found in PATH" -ForegroundColor Red
        return $false
    }
}

# Function to check if Appium server is running
function Test-AppiumServer {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4723/status" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Appium server is running on port 4723" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Appium server is not running on port 4723" -ForegroundColor Red
        return $false
    }
}

# Function to check emulator status
function Test-EmulatorStatus {
    try {
        $devices = adb devices 2>$null | Select-String "emulator-5554"
        if ($devices) {
            Write-Host "✅ Emulator emulator-5554 is connected" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Emulator emulator-5554 not found" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Could not check emulator status" -ForegroundColor Red
        return $false
    }
}

# Setup environment if not skipped
if (-not $SkipSetup) {
    Write-Host "🔧 Environment Setup and Validation" -ForegroundColor Blue
    Write-Host "================================" -ForegroundColor Blue
    
    # Check ADB
    if (-not (Test-AdbPath)) {
        Write-Host "⚠️ Adding Android SDK to PATH..." -ForegroundColor Yellow
        $env:PATH += ";C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools"
        
        if (-not (Test-AdbPath)) {
            Write-Host "❌ Could not add ADB to PATH. Please ensure Android SDK is installed." -ForegroundColor Red
            exit 1
        }
    }
    
    # Check emulator
    if (-not (Test-EmulatorStatus)) {
        Write-Host "❌ Emulator not ready. Please start the Android emulator first." -ForegroundColor Red
        Write-Host "💡 Use: emulator -avd <your_avd_name> -no-snapshot-load" -ForegroundColor Yellow
        exit 1
    }
    
    # Check Appium server
    if (-not (Test-AppiumServer)) {
        Write-Host "⚠️ Starting Appium server..." -ForegroundColor Yellow
        try {
            Start-Process -FilePath "appium" -ArgumentList "--allow-insecure=chromedriver_autodownload" -WindowStyle Hidden
            Start-Sleep -Seconds 10
            
            if (-not (Test-AppiumServer)) {
                Write-Host "❌ Could not start Appium server. Please start it manually." -ForegroundColor Red
                Write-Host "💡 Use: appium --allow-insecure=chromedriver_autodownload" -ForegroundColor Yellow
                exit 1
            }
        } catch {
            Write-Host "❌ Could not start Appium server. Please start it manually." -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "✅ Environment setup completed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Create test results directory
$testResultsDir = ".\test-results"
if (-not (Test-Path $testResultsDir)) {
    New-Item -ItemType Directory -Path $testResultsDir -Force | Out-Null
    Write-Host "📁 Created test results directory: $testResultsDir" -ForegroundColor Cyan
}

# Define test configurations
$testConfigs = @{
    "complete-cycle" = @{
        name = "Complete Demo Cycle Test"
        config = "config/wdio.geberit-complete.js"
        spec = "test/specs/geberit-home/complete-demo-cycle.spec.js"
        description = "Tests complete demo mode activation/deactivation cycle"
    }
    "security" = @{
        name = "Security Assessment Test"
        config = "config/wdio.geberit-complete.js"
        spec = "test/specs/persona-tests/security-testing.spec.js"
        description = "Security specialist assessment of app and demo mode"
    }
    "performance" = @{
        name = "Performance Assessment Test"
        config = "config/wdio.geberit-complete.js"
        spec = "test/specs/persona-tests/performance-testing.spec.js"
        description = "Performance engineer assessment with metrics collection"
    }
    "accessibility" = @{
        name = "Accessibility Assessment Test"
        config = "config/wdio.geberit-complete.js"
        spec = "test/specs/persona-tests/accessibility-testing.spec.js"
        description = "Accessibility expert assessment for inclusive design"
    }
    "comprehensive" = @{
        name = "Comprehensive Quality Assessment"
        config = "config/wdio.geberit-complete.js"
        spec = "test/specs/comprehensive-quality-assessment.spec.js"
        description = "Multi-persona comprehensive quality assessment"
    }
    "quick" = @{
        name = "Quick Validation Test"
        config = "config/wdio.final.js"
        spec = "test/specs/minimal-test.spec.js"
        description = "Quick connectivity and basic functionality test"
    }
}

# Function to run a specific test
function Invoke-TestSuite {
    param(
        [string]$SuiteName,
        [hashtable]$Config
    )
    
    Write-Host "🧪 Running: $($Config.name)" -ForegroundColor Blue
    Write-Host "📋 Description: $($Config.description)" -ForegroundColor Gray
    Write-Host "⚙️ Config: $($Config.config)" -ForegroundColor Gray
    Write-Host "📄 Spec: $($Config.spec)" -ForegroundColor Gray
    Write-Host ""
    
    $startTime = Get-Date
    
    try {
        if ($Verbose) {
            npx wdio run $Config.config --spec $Config.spec
        } else {
            npx wdio run $Config.config --spec $Config.spec 2>&1 | Where-Object { 
                $_ -match "PASSED|FAILED|Error|✅|❌|🎉|📊|⚠️" 
            }
        }
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $($Config.name) completed successfully in $([math]::Round($duration, 1)) seconds" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $($Config.name) failed after $([math]::Round($duration, 1)) seconds" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $($Config.name) encountered an error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Execute tests based on suite selection
$executionResults = @{}
$totalStartTime = Get-Date

Write-Host "🎯 Test Execution Plan: $TestSuite" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Magenta

if ($TestSuite -eq "all") {
    Write-Host "🚀 Running all test suites in sequence..." -ForegroundColor Blue
    Write-Host ""
    
    foreach ($suiteName in @("quick", "complete-cycle", "security", "performance", "accessibility", "comprehensive")) {
        $config = $testConfigs[$suiteName]
        $result = Invoke-TestSuite -SuiteName $suiteName -Config $config
        $executionResults[$suiteName] = $result
        
        Write-Host ""
        
        # Brief pause between tests
        if ($suiteName -ne "comprehensive") {
            Write-Host "⏸️ Brief pause before next test..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
    }
} else {
    if ($testConfigs.ContainsKey($TestSuite)) {
        $config = $testConfigs[$TestSuite]
        $result = Invoke-TestSuite -SuiteName $TestSuite -Config $config
        $executionResults[$TestSuite] = $result
    } else {
        Write-Host "❌ Unknown test suite: $TestSuite" -ForegroundColor Red
        Write-Host "Available suites: $($testConfigs.Keys -join ', ')" -ForegroundColor Yellow
        exit 1
    }
}

$totalEndTime = Get-Date
$totalDuration = ($totalEndTime - $totalStartTime).TotalSeconds

# Generate execution summary
Write-Host ""
Write-Host "📊 Execution Summary" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta
Write-Host "⏱️ Total Duration: $([math]::Round($totalDuration, 1)) seconds" -ForegroundColor Cyan
Write-Host ""

$passedTests = 0
$failedTests = 0

foreach ($suite in $executionResults.Keys) {
    $status = if ($executionResults[$suite]) { "✅ PASSED" } else { "❌ FAILED" }
    $color = if ($executionResults[$suite]) { "Green" } else { "Red" }
    
    Write-Host "$status - $($testConfigs[$suite].name)" -ForegroundColor $color
    
    if ($executionResults[$suite]) {
        $passedTests++
    } else {
        $failedTests++
    }
}

Write-Host ""
Write-Host "📈 Results: $passedTests passed, $failedTests failed" -ForegroundColor Cyan

# Generate reports if requested
if ($GenerateReports -or ($passedTests -gt 0)) {
    Write-Host ""
    Write-Host "📋 Generated Reports and Evidence:" -ForegroundColor Blue
    Write-Host "=================================" -ForegroundColor Blue
    
    $reportFiles = @(
        "test-results\comprehensive-quality-report.json",
        "test-results\quality-assessment-summary.md",
        "test-results\performance-report.json",
        "test-results\accessibility-report.json"
    )
    
    foreach ($reportFile in $reportFiles) {
        if (Test-Path $reportFile) {
            $fileSize = [math]::Round((Get-Item $reportFile).Length / 1KB, 1)
            Write-Host "📄 $reportFile ($fileSize KB)" -ForegroundColor Green
        }
    }
    
    # Check for screenshots
    $screenshotDir = "test-results\screenshots"
    if (Test-Path $screenshotDir) {
        $screenshots = Get-ChildItem $screenshotDir -Filter "*.png" | Measure-Object
        Write-Host "📸 Screenshots: $($screenshots.Count) files in $screenshotDir" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "💡 View reports:" -ForegroundColor Yellow
    Write-Host "   - Open test-results\quality-assessment-summary.md for overview" -ForegroundColor Gray
    Write-Host "   - Check JSON files for detailed metrics" -ForegroundColor Gray
    Write-Host "   - Review screenshots for visual evidence" -ForegroundColor Gray
}

# Final status
Write-Host ""
if ($failedTests -eq 0) {
    Write-Host "🎉 All tests completed successfully!" -ForegroundColor Green
    Write-Host "✨ Geberit Home App demonstrates good quality across all tested dimensions" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some tests failed. Check the logs and reports for details." -ForegroundColor Yellow
    Write-Host "🔍 Focus on failed test areas for improvement" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎭 Multi-Persona Testing Framework - Execution Complete" -ForegroundColor Magenta
Write-Host "Thank you for using the Swiss Testing Night 2025 Mobile Testing Suite!" -ForegroundColor Cyan

# Exit with appropriate code
exit $(if ($failedTests -eq 0) { 0 } else { 1 })