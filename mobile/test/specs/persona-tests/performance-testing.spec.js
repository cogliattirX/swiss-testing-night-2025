const { expect } = require('@wdio/globals');
const { GeberitAppHelpers } = require('../geberit-home/complete-demo-cycle.spec');

// Persona-based test suite for Performance Testing Engineer
describe('Geberit Home - Performance Assessment Tests', () => {
    
    let performanceMetrics = {};
    
    beforeEach(async () => {
        console.log('📊 Performance Testing Engineer - Initializing performance assessment');
        performanceMetrics = {
            startTime: Date.now(),
            actionTimes: [],
            screenshotTimes: []
        };
        await driver.pause(1000);
    });
    
    it('should measure app launch and initialization performance', async () => {
        console.log('⚡ Testing app launch performance...');
        
        try {
            const launchStart = Date.now();
            
            // Measure app responsiveness
            const windowSize = await driver.getWindowSize();
            const launchTime = Date.now() - launchStart;
            
            console.log(`📱 Screen size: ${windowSize.width}x${windowSize.height}`);
            console.log(`⚡ App response time: ${launchTime}ms`);
            
            performanceMetrics.actionTimes.push({
                action: 'app_launch',
                duration: launchTime,
                timestamp: Date.now()
            });
            
            // Performance threshold check
            const maxLaunchTime = 5000; // 5 seconds max for app to be responsive
            expect(launchTime).toBeLessThan(maxLaunchTime);
            
            await driver.saveScreenshot('./test-results/screenshots/performance-launch.png');
            console.log('✅ App launch performance within acceptable limits');
            
        } catch (error) {
            console.log('❌ App launch performance test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/performance-launch-error.png');
            throw error;
        }
    });
    
    it('should measure demo mode activation performance', async () => {
        console.log('📈 Testing demo mode activation performance...');
        
        try {
            const demoModeStart = Date.now();
            
            // Measure menu button discovery performance
            const menuStart = Date.now();
            const menuButton = await GeberitAppHelpers.findMenuButton();
            const menuDiscoveryTime = Date.now() - menuStart;
            
            console.log(`🔍 Menu button discovery time: ${menuDiscoveryTime}ms`);
            expect(menuButton).not.toBe(null);
            
            // Measure menu click performance
            const clickStart = Date.now();
            await menuButton.click();
            await driver.pause(2000);
            const clickTime = Date.now() - clickStart;
            
            console.log(`🎯 Menu click response time: ${clickTime}ms`);
            
            // Measure demo mode option discovery
            const demoOptionStart = Date.now();
            const demoOption = await GeberitAppHelpers.findDemoModeOption();
            const demoDiscoveryTime = Date.now() - demoOptionStart;
            
            console.log(`🔍 Demo option discovery time: ${demoDiscoveryTime}ms`);
            expect(demoOption).not.toBe(null);
            
            // Complete demo mode activation
            await demoOption.click();
            await driver.pause(2000);
            
            const okButton = await GeberitAppHelpers.findOkButton();
            if (okButton) {
                const okStart = Date.now();
                await okButton.click();
                await driver.pause(3000);
                const okTime = Date.now() - okStart;
                console.log(`✅ OK button response time: ${okTime}ms`);
            }
            
            const totalDemoTime = Date.now() - demoModeStart;
            console.log(`📊 Total demo mode activation time: ${totalDemoTime}ms`);
            
            performanceMetrics.actionTimes.push({
                action: 'demo_mode_activation',
                duration: totalDemoTime,
                breakdown: {
                    menuDiscovery: menuDiscoveryTime,
                    menuClick: clickTime,
                    demoDiscovery: demoDiscoveryTime
                },
                timestamp: Date.now()
            });
            
            // Performance threshold for demo mode activation
            const maxDemoActivationTime = 15000; // 15 seconds max
            expect(totalDemoTime).toBeLessThan(maxDemoActivationTime);
            
            await driver.saveScreenshot('./test-results/screenshots/performance-demo-activation.png');
            console.log('✅ Demo mode activation performance acceptable');
            
        } catch (error) {
            console.log('❌ Demo mode activation performance test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/performance-demo-error.png');
            throw error;
        }
    });
    
    it('should measure product discovery performance with scrolling', async () => {
        console.log('🏃‍♂️ Testing product discovery performance...');
        
        try {
            const discoveryStart = Date.now();
            
            // Measure scrolling performance
            let scrollTimes = [];
            let products = [];
            
            for (let scroll = 0; scroll < 3; scroll++) {
                const scrollStart = Date.now();
                
                // Get current products
                const currentProducts = await GeberitAppHelpers.getAllVisibleProducts();
                
                // Add new products
                for (const product of currentProducts) {
                    const isNew = !products.some(p => p.text === product.text);
                    if (isNew) {
                        products.push(product);
                        console.log(`📦 Discovered product: "${product.text}"`);
                    }
                }
                
                // Perform scroll
                await GeberitAppHelpers.scrollDown();
                
                const scrollTime = Date.now() - scrollStart;
                scrollTimes.push(scrollTime);
                console.log(`📜 Scroll ${scroll + 1} performance: ${scrollTime}ms`);
            }
            
            const totalDiscoveryTime = Date.now() - discoveryStart;
            const avgScrollTime = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
            
            console.log(`📊 Performance Summary:`);
            console.log(`   Total discovery time: ${totalDiscoveryTime}ms`);
            console.log(`   Average scroll time: ${avgScrollTime.toFixed(2)}ms`);
            console.log(`   Products discovered: ${products.length}`);
            console.log(`   Discovery rate: ${(products.length / (totalDiscoveryTime / 1000)).toFixed(2)} products/second`);
            
            performanceMetrics.actionTimes.push({
                action: 'product_discovery',
                duration: totalDiscoveryTime,
                breakdown: {
                    avgScrollTime: avgScrollTime,
                    scrollCount: scrollTimes.length,
                    productsFound: products.length,
                    discoveryRate: products.length / (totalDiscoveryTime / 1000)
                },
                timestamp: Date.now()
            });
            
            // Performance thresholds
            expect(totalDiscoveryTime).toBeLessThan(30000); // 30 seconds max
            expect(avgScrollTime).toBeLessThan(5000); // 5 seconds max per scroll
            expect(products.length).toBeGreaterThan(0); // Must find at least some products
            
            await driver.saveScreenshot('./test-results/screenshots/performance-discovery.png');
            
            // Cleanup: Deactivate demo mode
            await GeberitAppHelpers.deactivateDemoMode();
            
            console.log('✅ Product discovery performance assessment completed');
            
        } catch (error) {
            console.log('❌ Product discovery performance test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/performance-discovery-error.png');
            throw error;
        }
    });
    
    it('should generate comprehensive performance report', async () => {
        console.log('📋 Generating performance assessment report...');
        
        try {
            const totalTestTime = Date.now() - performanceMetrics.startTime;
            
            // Calculate performance statistics
            const performanceReport = {
                testSession: {
                    duration: totalTestTime,
                    timestamp: new Date().toISOString(),
                    device: 'emulator-5554'
                },
                actions: performanceMetrics.actionTimes,
                summary: {
                    totalActions: performanceMetrics.actionTimes.length,
                    avgActionTime: performanceMetrics.actionTimes.length > 0 
                        ? performanceMetrics.actionTimes.reduce((sum, action) => sum + action.duration, 0) / performanceMetrics.actionTimes.length 
                        : 0,
                    slowestAction: performanceMetrics.actionTimes.length > 0 
                        ? performanceMetrics.actionTimes.reduce((slowest, action) => 
                            action.duration > slowest.duration ? action : slowest)
                        : null,
                    fastestAction: performanceMetrics.actionTimes.length > 0 
                        ? performanceMetrics.actionTimes.reduce((fastest, action) => 
                            action.duration < fastest.duration ? action : fastest)
                        : null
                }
            };
            
            console.log('📊 Performance Report Summary:');
            console.log(`   Test Duration: ${totalTestTime}ms`);
            console.log(`   Actions Measured: ${performanceReport.summary.totalActions}`);
            console.log(`   Average Action Time: ${performanceReport.summary.avgActionTime.toFixed(2)}ms`);
            
            if (performanceReport.summary.slowestAction) {
                console.log(`   Slowest Action: ${performanceReport.summary.slowestAction.action} (${performanceReport.summary.slowestAction.duration}ms)`);
            }
            
            if (performanceReport.summary.fastestAction) {
                console.log(`   Fastest Action: ${performanceReport.summary.fastestAction.action} (${performanceReport.summary.fastestAction.duration}ms)`);
            }
            
            // Save performance report
            const fs = require('fs');
            const path = require('path');
            const reportPath = path.join(process.cwd(), 'test-results', 'performance-report.json');
            
            // Ensure directory exists
            const reportDir = path.dirname(reportPath);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(performanceReport, null, 2));
            console.log(`💾 Performance report saved to: ${reportPath}`);
            
            await driver.saveScreenshot('./test-results/screenshots/performance-report-complete.png');
            console.log('✅ Performance assessment report generated successfully');
            
        } catch (error) {
            console.log('❌ Performance report generation failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/performance-report-error.png');
            throw error;
        }
    });
    
    afterEach(async () => {
        console.log('📊 Performance Testing Engineer - Test completed');
        await driver.pause(1000);
    });
});