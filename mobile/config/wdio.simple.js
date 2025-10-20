// Simple WDIO Configuration without Appium Service
const config = {
    runner: 'local',
    
    specs: [
        '../test/specs/**/*.spec.js'
    ],
    
    maxInstances: 1,
    
    hostname: 'localhost',
    port: 4723,
    path: '/',
    
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': 'com.saucelabs.mydemoapp.android',
        'appium:appActivity': 'com.saucelabs.mydemoapp.android.view.activities.MainActivity',
        'appium:avd': 'Pixel_8a_API_36',
        'appium:avdLaunchTimeout': 120000,
        'appium:deviceName': 'Android Emulator',
        'appium:newCommandTimeout': 240,
        'appium:noReset': true
    }],
    
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 30000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    framework: 'mocha',
    
    mochaOpts: {
        ui: 'bdd',
        timeout: 120000,
        retries: 0
    },
    
    onPrepare: function () {
        console.log('🚀 Starting Android Emulator Test (External Appium)...');
    },
    
    // No Appium service - using external Appium server
    services: [],
    
    reporters: ['spec']
};

module.exports = { config };