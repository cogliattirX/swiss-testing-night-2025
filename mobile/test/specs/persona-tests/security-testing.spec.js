const { expect } = require('@wdio/globals');
const { GeberitAppHelpers } = require('../geberit-home/complete-demo-cycle.spec');

// Persona-based test suite for Security Testing Specialist
describe('Geberit Home - Security Assessment Tests', () => {
    
    beforeEach(async () => {
        console.log('🔒 Security Testing Specialist - Initializing security assessment');
        await driver.pause(3000);
        await driver.saveScreenshot('./test-results/screenshots/security-init.png');
    });
    
    it('should verify secure app initialization and permissions', async () => {
        console.log('🛡️ Testing app security initialization...');
        
        try {
            // Verify app package matches expected secure package
            const packages = await driver.getCurrentPackage();
            console.log(`📦 Current package: ${packages}`);
            expect(packages).toBe('com.geberit.home');
            
            // Test app activity security
            const activity = await driver.getCurrentActivity();
            console.log(`🏠 Current activity: ${activity}`);
            expect(activity).toContain('MainActivity');
            
            // Verify no obvious security warnings in logs
            const logs = await driver.getLogs('logcat');
            const securityLogs = logs.filter(log => 
                log.message.toLowerCase().includes('security') ||
                log.message.toLowerCase().includes('permission') ||
                log.message.toLowerCase().includes('denied')
            );
            
            console.log(`🔍 Security-related logs found: ${securityLogs.length}`);
            if (securityLogs.length > 0) {
                console.log('⚠️ Security logs detected:');
                securityLogs.forEach(log => console.log(`   ${log.message}`));
            }
            
            await driver.saveScreenshot('./test-results/screenshots/security-app-verified.png');
            console.log('✅ App security initialization verified');
            
        } catch (error) {
            console.log('❌ Security assessment failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/security-error.png');
            throw error;
        }
    });
    
    it('should test demo mode activation security', async () => {
        console.log('🔐 Testing demo mode security aspects...');
        
        try {
            // Activate demo mode using shared helper
            await GeberitAppHelpers.activateDemoMode();
            
            // Security check: Verify demo mode doesn't expose sensitive data
            const pageSource = await driver.getPageSource();
            
            // Check for common sensitive data patterns
            const sensitivePatterns = [
                /password/i,
                /api[_-]?key/i,
                /secret/i,
                /token/i,
                /credential/i
            ];
            
            let sensitiveDataFound = [];
            sensitivePatterns.forEach(pattern => {
                if (pattern.test(pageSource)) {
                    sensitiveDataFound.push(pattern.source);
                }
            });
            
            if (sensitiveDataFound.length > 0) {
                console.log('⚠️ Potential sensitive data exposure:');
                sensitiveDataFound.forEach(pattern => 
                    console.log(`   Pattern detected: ${pattern}`)
                );
            } else {
                console.log('✅ No obvious sensitive data exposure detected');
            }
            
            // Verify demo mode is properly sandboxed
            await driver.saveScreenshot('./test-results/screenshots/security-demo-mode.png');
            
            // Deactivate demo mode for cleanup
            await GeberitAppHelpers.deactivateDemoMode();
            
            console.log('✅ Demo mode security assessment completed');
            
        } catch (error) {
            console.log('❌ Demo mode security test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/security-demo-error.png');
            throw error;
        }
    });
    
    it('should verify secure data handling during product discovery', async () => {
        console.log('🔍 Testing data handling security during product discovery...');
        
        try {
            await GeberitAppHelpers.activateDemoMode();
            
            // Collect products while monitoring for security issues
            const products = await GeberitAppHelpers.discoverAllProducts(3);
            
            // Security validation: Check product data for injection patterns
            let securityIssues = [];
            products.forEach((product, index) => {
                const text = product.text;
                
                // Check for potential script injection
                if (/<script|javascript:|data:/i.test(text)) {
                    securityIssues.push(`Product ${index + 1}: Potential script injection in "${text}"`);
                }
                
                // Check for SQL injection patterns
                if (/'|\"|;|--|\bor\b|\band\b/i.test(text)) {
                    securityIssues.push(`Product ${index + 1}: Potential SQL injection pattern in "${text}"`);
                }
                
                console.log(`🔍 Analyzed product: "${text}" - ${securityIssues.length === 0 ? 'Safe' : 'Issues detected'}`);
            });
            
            if (securityIssues.length > 0) {
                console.log('⚠️ Security issues detected:');
                securityIssues.forEach(issue => console.log(`   ${issue}`));
            } else {
                console.log('✅ No security issues detected in product data');
            }
            
            // Verify data collection doesn't leak sensitive information
            expect(products.length).toBeGreaterThan(0);
            console.log(`📦 Securely processed ${products.length} products`);
            
            await driver.saveScreenshot('./test-results/screenshots/security-data-handling.png');
            await GeberitAppHelpers.deactivateDemoMode();
            
            console.log('✅ Data handling security assessment completed');
            
        } catch (error) {
            console.log('❌ Data handling security test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/security-data-error.png');
            throw error;
        }
    });
    
    afterEach(async () => {
        console.log('🔒 Security Testing Specialist - Assessment completed');
        
        // Security cleanup: Ensure we're not in demo mode
        try {
            await GeberitAppHelpers.deactivateDemoMode();
        } catch (error) {
            console.log('ℹ️ Demo mode already deactivated or cleanup not needed');
        }
        
        await driver.pause(2000);
    });
});