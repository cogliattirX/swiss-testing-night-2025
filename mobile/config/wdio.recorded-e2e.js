// Configuration for My Demo App E2E Testing - Based on Recorded Session
const config = {
    runner: 'local',
    
    // Server configuration for external Appium server
    hostname: 'localhost',
    port: 4723,
    path: '/',
    
    specs: [
        '../test/specs/my-demo-app/**/*.spec.js'
    ],
    
    maxInstances: 1,
    
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:avd': 'Pixel_8a_API_36',
        'appium:avdLaunchTimeout': 120000,
        'appium:deviceName': 'Android Emulator',
        'appium:newCommandTimeout': 240,
        
        // Use already installed app instead of installing APK (avoids JAVA_HOME issue)
        'appium:appPackage': 'com.saucelabs.mydemoapp.android',
        'appium:appActivity': 'com.saucelabs.mydemoapp.android.view.activities.SplashActivity',
        'appium:autoGrantPermissions': true,
        'appium:noReset': true,  // Keep app data/state
        'appium:fullReset': false
    }],
    
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 30000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    framework: 'mocha',
    
    mochaOpts: {
        ui: 'bdd',
        timeout: 180000,  // 3 minutes for complete E2E journey
        retries: 1
    },
    
    onPrepare: function () {
        console.log('📱 Starting My Demo App E2E Test (Recorded Session Automation)...');
        console.log('🎯 Target: Complete shopping journey automation');
    },
    
    // No Appium service - using external Appium server
    services: [],
    
    reporters: ['spec'],
    
    // Global test configuration
    onTest: function(test) {
        console.log(`🚀 Running: ${test.fullName}`);
    },
    
    onTestPass: function(test) {
        console.log(`✅ PASSED: ${test.fullName}`);
    },
    
    onTestFail: function(test) {
        console.log(`❌ FAILED: ${test.fullName}`);
    }
};

module.exports = { config };