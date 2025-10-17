# Simple AVD Creator
Write-Host "Creating Android Virtual Device..." -ForegroundColor Green

$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
$AvdName = "Pixel_8a_API_36"

# Create .android directory
$AndroidDir = "$env:USERPROFILE\.android"
$AvdDir = "$AndroidDir\avd"

if (-not (Test-Path $AndroidDir)) {
    New-Item -ItemType Directory -Path $AndroidDir -Force
}

if (-not (Test-Path $AvdDir)) {
    New-Item -ItemType Directory -Path $AvdDir -Force
}

# Create AVD directory
$AvdPath = "$AvdDir\$AvdName.avd"
if (-not (Test-Path $AvdPath)) {
    New-Item -ItemType Directory -Path $AvdPath -Force
}

Write-Host "AVD directory created: $AvdPath" -ForegroundColor Yellow

# Create simple config
$config = @"
PlayStore.enabled=true
abi.type=x86_64
hw.cpu.arch=x86_64
hw.ramSize=4096
hw.lcd.width=1080
hw.lcd.height=2400
hw.lcd.density=420
image.sysdir.1=system-images/android-36.1/google_apis_playstore/x86_64/
tag.id=google_apis_playstore
"@

$configFile = "$AvdPath\config.ini"
$config | Out-File -FilePath $configFile -Encoding ASCII

# Create AVD ini
$avdIni = @"
avd.ini.encoding=UTF-8
path=$AvdPath
target=android-36.1
"@

$avdIniFile = "$AvdDir\$AvdName.ini"
$avdIni | Out-File -FilePath $avdIniFile -Encoding ASCII

Write-Host "AVD created successfully!" -ForegroundColor Green
Write-Host "Name: $AvdName" -ForegroundColor White

# Start emulator
$emulator = "$env:ANDROID_HOME\emulator\emulator.exe"
if (Test-Path $emulator) {
    Write-Host "Starting emulator..." -ForegroundColor Yellow
    Start-Process -FilePath $emulator -ArgumentList "-avd", $AvdName
} else {
    Write-Host "Emulator not found" -ForegroundColor Red
}