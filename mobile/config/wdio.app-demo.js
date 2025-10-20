// Demo Configuration for App Testing (Chrome Browser as Example)
const config = {
    runner: 'local',
    
    specs: [
        '../test/specs/app-demo/**/*.spec.js'
    ],
    
    maxInstances: 1,
    
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:avd': 'Pixel_8a_API_36',
        'appium:avdLaunchTimeout': 120000,
        'appium:deviceName': 'Android Emulator',
        'appium:newCommandTimeout': 240,
        
        // Chrome Browser for demonstration
        'appium:appPackage': 'com.android.chrome',
        'appium:appActivity': 'com.google.android.apps.chrome.Main',
        'appium:autoGrantPermissions': true,
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
        retries: 1
    },
    
    onPrepare: function () {
        console.log('🌐 Starting Chrome Browser App Testing Demo...');
    },
    
    // No Appium service - using external Appium server
    services: [],
    
    reporters: ['spec']
};

module.exports = { config };