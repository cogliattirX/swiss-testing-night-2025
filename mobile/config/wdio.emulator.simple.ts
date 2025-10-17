import type { Options } from '@wdio/types';

const config: Options.Testrunner = {
    runner: 'local',
    
    specs: [
        '../test/specs/**/*.spec.ts'
    ],
    
    maxInstances: 1,
    
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:avd': 'Pixel_8a_API_36',
        'appium:avdLaunchTimeout': 180000,
        'appium:avdReadyTimeout': 180000,
        'appium:deviceName': 'Android Emulator',
        'appium:platformVersion': '15.0',
        'appium:appPackage': 'com.geberit.home',
        'appium:appActivity': '<TO_BE_FILLED>',
        'appium:noReset': true,
        'appium:fullReset': false,
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 300,
        'appium:systemPort': 8201,
        'appium:enablePerformanceLogging': true,
        'appium:printPageSourceOnFindFailure': true
    }],
    
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 45000,
    connectionRetryTimeout: 180000,
    connectionRetryCount: 3,
    
    framework: 'mocha',
    
    mochaOpts: {
        ui: 'bdd',
        timeout: 180000,
        retries: 2
    },
    
    onPrepare: function () {
        console.log('🚀 Starting EMULATOR mobile test execution...');
    },
    
    services: [
        ['appium', {
            command: 'appium',
            logPath: './reports/',
            args: {
                port: 4723,
                host: 'localhost',
                relaxedSecurity: true,
                allowInsecure: ['chromedriver_autodownload'],
                driverLogLevel: 'info'
            }
        }]
    ],
    
    reporters: [
        'spec',
        ['junit', {
            outputDir: './reports',
            outputFileFormat: function(options) {
                return `emulator-results-${options.cid}.xml`;
            }
        }]
    ]
};

export { config };