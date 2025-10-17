# Simple app check
Write-Host "Checking for Geberit Home app..." -ForegroundColor Green

$result = adb shell pm list packages com.geberit.home

if ($result) {
    Write-Host "App found!" -ForegroundColor Green
    Write-Host "Getting activity..." -ForegroundColor Yellow
    adb shell "cmd package resolve-activity --brief com.geberit.home"
} else {
    Write-Host "App not found. Install from Play Store first." -ForegroundColor Red
}

Write-Host "Emulator status:" -ForegroundColor Blue
adb devices