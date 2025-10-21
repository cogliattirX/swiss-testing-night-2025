// WDIO Configuration for Geberit Home App Testing
const config = {
    runner: 'local',
    
    specs: [
        '../test/specs/geberit-home/**/*.spec.js'
    ],
    
    maxInstances: 1,
    
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:avd': 'Pixel_8a_API_36',
        'appium:avdLaunchTimeout': 120000,
        'appium:deviceName': 'Android Emulator',
        'appium:newCommandTimeout': 240,
        
        // App-specific capabilities for Geberit Home (using already running app)
        'appium:appPackage': 'com.geberit.home',
        'appium:appActivity': '.MainActivity',
        'appium:autoGrantPermissions': true,
        'appium:noReset': true,  // Don't reset app - use already running instance
        'appium:fullReset': false,
        'appium:dontStopAppOnReset': true  // Keep app running
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
        retries: 1
    },
    
    onPrepare: function () {
        console.log('🏠 Starting Geberit Home App Testing...');
    },
    
    beforeSession: function (config, capabilities, specs) {
        console.log('📱 Connecting to Android Emulator for Geberit Home...');
    },
    
    before: function (capabilities, specs) {
        console.log('🔧 Setting up Geberit Home test environment...');
    },
    
    afterTest: function(test, context, { error, result, duration, passed, retries }) {
        if (error) {
            console.log('❌ Test failed:', test.title);
            // Take screenshot on failure
            browser.saveScreenshot(`./test-results/screenshots/geberit-home-failure-${Date.now()}.png`);
        } else {
            console.log('✅ Test passed:', test.title);
        }
    },
    
    // No Appium service - using external Appium server
    services: [],
    
    // Add Appium server configuration
    hostname: 'localhost',
    port: 4723,
    path: '/',
    
    reporters: ['spec']
};

module.exports = { config };