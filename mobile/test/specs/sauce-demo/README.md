# 🛒 Sauce Labs Demo App - Mobile Testing Suite

This directory contains automated tests for the **Sauce Labs Demo App** (my-demo-app-android), an e-commerce demo application perfect for testing mobile automation scenarios.

## 📱 App Overview

- **Package Name**: `com.saucelabs.mydemoapp.android`
- **Main Activity**: `.view.activities.SplashActivity`
- **Version**: 2.2.0
- **Type**: E-commerce shopping demo
- **Features**: Product catalog, ratings, shopping cart simulation

## 🚀 Quick Start

### Prerequisites
1. Android emulator running (e.g., `emulator-5554`)
2. Appium server capability
3. Node.js and npm installed

### Run Tests
```powershell
# Quick test runner (interactive menu)
./run-sauce-demo-tests.ps1

# Or run specific test suites directly:
npx wdio config/wdio.sauce-demo.js --spec="test/specs/sauce-demo/basic-launch.spec.js"
npx wdio config/wdio.sauce-demo.js --spec="test/specs/sauce-demo/shopping-features.spec.js"
npx wdio config/wdio.sauce-demo.js --spec="test/specs/sauce-demo/user-features.spec.js"

# Run all tests
npx wdio config/wdio.sauce-demo.js
```

## 📂 Test Structure

```
test/specs/sauce-demo/
├── basic-launch.spec.js      # App launch, UI exploration, lifecycle
├── shopping-features.spec.js # Product catalog, ratings, navigation
└── user-features.spec.js     # Authentication, settings, state persistence
```

## 🧪 Test Suites

### 🚀 Basic Launch Tests (`basic-launch.spec.js`)
- **App Launch**: Verifies successful app startup and splash screen
- **UI Exploration**: Analyzes available UI elements and interactions
- **Lifecycle**: Tests background/foreground behavior

### 🛍️ Shopping Features (`shopping-features.spec.js`)
- **Product Catalog**: Validates product display with names and prices
- **Image Interactions**: Tests product image tapping and navigation
- **Ratings System**: Validates star rating components
- **Navigation**: Tests app navigation and menu systems
- **Orientation**: Tests landscape/portrait orientation changes

### 🔐 User Features (`user-features.spec.js`)
- **Authentication Search**: Looks for login/registration elements
- **Settings Exploration**: Searches for app settings and preferences
- **App Information**: Tests about/help sections
- **State Persistence**: Validates data persistence across app lifecycle

## 📸 Screenshots & Logging

All tests automatically capture:
- **Screenshots** at key interaction points → `test-results/screenshots/`
- **Detailed logs** with emoji indicators → `test-results/logs/`
- **Console output** with step-by-step progress

### Screenshot Examples:
- `01_splash_screen.png` - App launch
- `shopping_01_catalog.png` - Product catalog
- `auth_02_menu_opened.png` - Navigation menu

## ⚙️ Configuration

### WebDriverIO Config: `config/wdio.sauce-demo.js`
```javascript
capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'emulator-5554',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.saucelabs.mydemoapp.android',
    'appium:appActivity': '.view.activities.SplashActivity',
    'appium:noReset': false,
    'appium:autoGrantPermissions': true
}]
```

## 🔧 Installation & Setup

### Manual Installation
```powershell
# Install APK
adb install apks\my-demo-app-android-2.2.0.apk

# Launch app
adb shell am start -n com.saucelabs.mydemoapp.android/.view.activities.SplashActivity

# Check if installed
adb shell pm list packages | findstr saucelabs
```

### Automated Installation
The test runner script (`run-sauce-demo-tests.ps1`) automatically:
1. Checks emulator status
2. Installs app if missing
3. Provides interactive test selection menu

## 📊 Expected Test Results

### ✅ Successful Test Indicators:
- App launches with splash screen
- Product catalog displays with prices (e.g., "Sauce Labs Backpack - $29.99")
- Multiple clickable elements (29+ expected)
- Rating components with star elements
- Orientation changes handled gracefully

### 📦 Key App Elements:
- **Products**: "Sauce Labs Backpack", "Sauce Labs Backpack (green)", etc.
- **Prices**: Displayed as "$ XX.XX" format
- **Ratings**: Interactive star rating system
- **Images**: Product images with click interactions

## 🚨 Troubleshooting

### Common Issues:
1. **"Activity does not exist"** → Use `SplashActivity` not `MainActivity`
2. **"No devices attached"** → Start Android emulator first
3. **"Package not found"** → Install APK using the provided script
4. **"Appium connection failed"** → Ensure Appium server is running on port 4723

### Debug Commands:
```powershell
# Check emulator status
adb devices

# Check installed packages
adb shell pm list packages | findstr sauce

# Get current activity
adb shell dumpsys window windows | findstr mCurrentFocus

# Take manual screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

## 🎯 Testing Goals

This test suite demonstrates:
- **Mobile E-commerce Testing**: Product catalogs, ratings, navigation
- **Android App Automation**: Using WebDriverIO + Appium
- **Visual Validation**: Screenshot-based verification
- **User Experience Testing**: Orientation, lifecycle, interactions
- **Comprehensive Coverage**: Launch → Shopping → User features

Perfect for learning mobile test automation patterns and exploring Android app testing capabilities! 🚀