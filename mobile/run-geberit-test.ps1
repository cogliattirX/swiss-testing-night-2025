# PowerShell script to run Geberit test with proper environment
Write-Host "🔧 Setting up Android environment variables..." -ForegroundColor Green

# Set Android environment variables
$env:ANDROID_HOME = "C:\Users\rapha\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\rapha\AppData\Local\Android\Sdk"
$env:PATH += ";C:\Users\rapha\AppData\Local\Android\Sdk\platform-tools;C:\Users\rapha\AppData\Local\Android\Sdk\emulator;C:\Users\rapha\AppData\Local\Android\Sdk\cmdline-tools\latest\bin"

Write-Host "✅ Environment variables set:" -ForegroundColor Green
Write-Host "   ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Cyan
Write-Host "   ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT" -ForegroundColor Cyan

# Check if emulator is running
Write-Host "📱 Checking emulator status..." -ForegroundColor Yellow
adb devices

# Start Appium in background
Write-Host "🚀 Starting Appium server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$env:ANDROID_HOME = 'C:\Users\rapha\AppData\Local\Android\Sdk'
`$env:ANDROID_SDK_ROOT = 'C:\Users\rapha\AppData\Local\Android\Sdk'
cd C:\git\swiss-testing-night-2025\mobile
Write-Host '🔥 Appium starting with Android SDK at: `$env:ANDROID_HOME' -ForegroundColor Green
appium --address 127.0.0.1 --port 4723 --relaxed-security
"@

# Wait for Appium to start
Write-Host "⏳ Waiting for Appium to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run the test
Write-Host "🎯 Running Geberit Home test..." -ForegroundColor Green
cd C:\git\swiss-testing-night-2025\mobile
node simple-geberit-test.js

Write-Host "🏁 Test execution complete!" -ForegroundColor Green