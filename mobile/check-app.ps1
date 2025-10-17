# Check for Geberit Home app in emulator
Write-Host "Checking for Geberit Home app..." -ForegroundColor Cyan

$appPackage = "com.geberit.home"

# Check if app is installed
$appCheck = adb shell pm list packages $appPackage 2>$null

if ($appCheck -match $appPackage) {
    Write-Host "✅ Geberit Home app found!" -ForegroundColor Green
    
    # Try to get activity
    Write-Host "Getting app activity..." -ForegroundColor Yellow
    $activity = adb shell "cmd package resolve-activity --brief $appPackage" 2>$null | Select-Object -Last 1
    
    if ($activity -and $activity -ne "No activity found") {
        Write-Host "✅ App activity: $activity" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 NEXT STEP: Update your WDIO configs with this activity:" -ForegroundColor Yellow
        Write-Host "In config/wdio.local.android.ts and config/wdio.emulator.android.ts:" -ForegroundColor White
        Write-Host "'appium:appActivity': '$activity'" -ForegroundColor Green
        Write-Host ""
        Write-Host "Then run: npm run test:emulator" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Could not detect activity automatically" -ForegroundColor Yellow
        Write-Host "Try: adb shell am start -n $appPackage/[ACTIVITY]" -ForegroundColor White
    }
} else {
    Write-Host "❌ Geberit Home app not found in emulator" -ForegroundColor Red
    Write-Host ""
    Write-Host "📱 TO INSTALL:" -ForegroundColor Yellow
    Write-Host "1. Open the Android emulator (should be running)" -ForegroundColor White
    Write-Host "2. Open Google Play Store" -ForegroundColor White
    Write-Host "3. Sign in with your Google account" -ForegroundColor White
    Write-Host "4. Search for 'Geberit Home'" -ForegroundColor White
    Write-Host "5. Install the app" -ForegroundColor White
    Write-Host "6. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "OR install APK if you have one:" -ForegroundColor Cyan
    Write-Host "adb install path/to/geberit-home.apk" -ForegroundColor Green
}

Write-Host ""
Write-Host "Current emulator status:" -ForegroundColor Blue
adb devices