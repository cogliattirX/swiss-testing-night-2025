#!/usr/bin/env powershell

Write-Host "📱 Creating Android Virtual Device (AVD)" -ForegroundColor Cyan

# Set Android environment
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

$AvdName = "Pixel_8a_API_36"
$SystemImage = "system-images;android-36.1;google_apis_playstore;x86_64"

Write-Host "Creating AVD: $AvdName" -ForegroundColor Yellow
Write-Host "System Image: $SystemImage" -ForegroundColor Yellow

# Create AVD using Android Studio's AVD Manager (direct approach)
$AvdConfigDir = "$env:USERPROFILE\.android\avd"
$AvdDir = "$AvdConfigDir\$AvdName.avd"

# Create directories
if (-not (Test-Path $AvdConfigDir)) {
    New-Item -ItemType Directory -Path $AvdConfigDir -Force | Out-Null
}

if (-not (Test-Path $AvdDir)) {
    New-Item -ItemType Directory -Path $AvdDir -Force | Out-Null
}

# Create config.ini
$ConfigIni = @"
PlayStore.enabled=true
abi.type=x86_64
avd.ini.displayname=$AvdName
avd.ini.encoding=UTF-8
disk.dataPartition.size=8192MB
hw.accelerometer=yes
hw.audioInput=yes
hw.audioOutput=yes
hw.battery=yes
hw.camera.back=emulated
hw.camera.front=emulated
hw.cpu.arch=x86_64
hw.cpu.ncore=4
hw.device.manufacturer=Google
hw.device.name=pixel_8
hw.gps=yes
hw.gpu.enabled=yes
hw.gpu.mode=auto
hw.keyboard=yes
hw.lcd.density=420
hw.lcd.height=2400
hw.lcd.width=1080
hw.ramSize=4096
hw.sdCard=yes
image.sysdir.1=system-images/android-36.1/google_apis_playstore/x86_64/
runtime.network.latency=none
runtime.network.speed=full
tag.display=Google Play
tag.id=google_apis_playstore
vm.heapSize=256
"@

$ConfigPath = Join-Path $AvdDir "config.ini"
Set-Content -Path $ConfigPath -Value $ConfigIni -Encoding UTF8

# Create AVD ini file
$AvdIni = @"
avd.ini.encoding=UTF-8
path=$AvdDir
path.rel=avd/$AvdName.avd
target=android-36.1
"@

$AvdIniPath = Join-Path $AvdConfigDir "$AvdName.ini"
Set-Content -Path $AvdIniPath -Value $AvdIni -Encoding UTF8

Write-Host "✅ AVD created successfully!" -ForegroundColor Green
Write-Host "AVD Name: $AvdName" -ForegroundColor White
Write-Host "Location: $AvdDir" -ForegroundColor White

# Test emulator
$EmulatorPath = "$env:ANDROID_HOME\emulator\emulator.exe"
if (Test-Path $EmulatorPath) {
    Write-Host "`n🚀 Starting emulator..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    
    # Start emulator in background
    Start-Process -FilePath $EmulatorPath -ArgumentList @("-avd", $AvdName, "-no-snapshot-save") -WindowStyle Hidden
    
    Write-Host "✅ Emulator started!" -ForegroundColor Green
    Write-Host "Wait for emulator to boot, then install Geberit Home from Play Store" -ForegroundColor Cyan
} else {
    Write-Host "❌ Emulator not found at: $EmulatorPath" -ForegroundColor Red
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait for emulator to fully boot (3-5 minutes)" -ForegroundColor White
Write-Host "2. Open Google Play Store in emulator" -ForegroundColor White
Write-Host "3. Sign in with your Google account" -ForegroundColor White
Write-Host "4. Install 'Geberit Home' app" -ForegroundColor White
Write-Host "5. Run: npm run test:emulator" -ForegroundColor White