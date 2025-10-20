@echo off
echo 🔧 Setting up Android environment...

set ANDROID_HOME=C:\Users\rapha\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=C:\Users\rapha\AppData\Local\Android\Sdk
set PATH=%PATH%;C:\Users\rapha\AppData\Local\Android\Sdk\platform-tools;C:\Users\rapha\AppData\Local\Android\Sdk\emulator

echo ✅ Environment set:
echo    ANDROID_HOME=%ANDROID_HOME%
echo    ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%

echo 📱 Checking emulator...
adb devices

echo 🚀 Starting Appium server in background...
start "Appium Server" cmd /k "cd /d C:\git\swiss-testing-night-2025\mobile && appium --address 127.0.0.1 --port 4723 --relaxed-security"

echo ⏳ Waiting 10 seconds for Appium to start...
timeout /t 10 /nobreak

echo 🎯 Running Geberit test...
cd /d C:\git\swiss-testing-night-2025\mobile
node simple-geberit-test.js

echo 🏁 Test complete!
pause