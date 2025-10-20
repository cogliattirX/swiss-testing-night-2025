// Simple WDIO Configuration for Emulator Demo
const config = {
    runner: 'local',
    
    specs: [
        '../test/specs/**/*.spec.ts'
    ],
    
    maxInstances: 1,
    
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:avd': 'Pixel_8a_API_36',
        'appium:avdLaunchTimeout': 120000,
        'appium:deviceName': 'Android Emulator',
        'appium:newCommandTimeout': 240
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
        console.log('🚀 Starting Android Emulator Demo...');
    },
    
    services: [
        ['appium', {
            command: 'appium',
            args: {
                port: 4723,
                relaxedSecurity: true
            }
        }]
    ],
    
    reporters: ['spec']
};

module.exports = { config };