const { expect } = require('@wdio/globals');
const { GeberitAppHelpers } = require('../geberit-home/complete-demo-cycle.spec');

// Persona-based test suite for Accessibility Testing Expert  
describe('Geberit Home - Accessibility Assessment Tests', () => {
    
    let accessibilityFindings = [];
    
    beforeEach(async () => {
        console.log('♿ Accessibility Testing Expert - Initializing accessibility assessment');
        accessibilityFindings = [];
        await driver.pause(2000);
        await driver.saveScreenshot('./test-results/screenshots/accessibility-init.png');
    });
    
    it('should assess app navigation accessibility', async () => {
        console.log('🧭 Testing navigation accessibility...');
        
        try {
            // Test menu button accessibility
            const menuButton = await GeberitAppHelpers.findMenuButton();
            expect(menuButton).not.toBe(null);
            
            // Check if menu button has accessibility attributes
            const menuContentDesc = await menuButton.getAttribute('content-desc');
            const menuClickable = await menuButton.getAttribute('clickable');
            const menuEnabled = await menuButton.getAttribute('enabled');
            
            console.log(`🎯 Menu button accessibility:`);
            console.log(`   Content Description: "${menuContentDesc || 'MISSING'}"`);
            console.log(`   Clickable: ${menuClickable}`);
            console.log(`   Enabled: ${menuEnabled}`);
            
            // Accessibility evaluation
            if (!menuContentDesc || menuContentDesc.trim() === '') {
                accessibilityFindings.push({
                    severity: 'HIGH',
                    element: 'Menu Button',
                    issue: 'Missing content description for screen readers',
                    wcag: 'WCAG 2.1 Level A - 1.1.1 Non-text Content'
                });
            } else {
                console.log('✅ Menu button has proper content description');
            }
            
            if (menuClickable !== 'true') {
                accessibilityFindings.push({
                    severity: 'HIGH',
                    element: 'Menu Button',
                    issue: 'Element not marked as clickable',
                    wcag: 'WCAG 2.1 Level A - 2.1.1 Keyboard'
                });
            }
            
            await driver.saveScreenshot('./test-results/screenshots/accessibility-menu-button.png');
            console.log('✅ Menu button accessibility assessment completed');
            
        } catch (error) {
            console.log('❌ Navigation accessibility test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/accessibility-nav-error.png');
            accessibilityFindings.push({
                severity: 'CRITICAL',
                element: 'Navigation',
                issue: `Navigation accessibility test failed: ${error.message}`,
                wcag: 'WCAG 2.1 Level A - Multiple criteria affected'
            });
        }
    });
    
    it('should test demo mode accessibility features', async () => {
        console.log('🎭 Testing demo mode accessibility...');
        
        try {
            // Activate demo mode and assess accessibility
            await GeberitAppHelpers.activateDemoMode();
            
            // Test demo mode option accessibility
            await driver.pressKeyCode(4); // Go back to menu to re-test
            await driver.pause(2000);
            
            const menuButton = await GeberitAppHelpers.findMenuButton();
            await menuButton.click();
            await driver.pause(2000);
            
            const demoOption = await GeberitAppHelpers.findDemoModeOption();
            if (demoOption) {
                const demoContentDesc = await demoOption.getAttribute('content-desc');
                const demoText = await demoOption.getText();
                const demoClickable = await demoOption.getAttribute('clickable');
                
                console.log(`🎭 Demo mode option accessibility:`);
                console.log(`   Text: "${demoText || 'MISSING'}"`);
                console.log(`   Content Description: "${demoContentDesc || 'MISSING'}"`);
                console.log(`   Clickable: ${demoClickable}`);
                
                // Evaluate demo option accessibility
                if ((!demoText || demoText.trim() === '') && (!demoContentDesc || demoContentDesc.trim() === '')) {
                    accessibilityFindings.push({
                        severity: 'HIGH',
                        element: 'Demo Mode Option',
                        issue: 'No accessible text or description for screen readers',
                        wcag: 'WCAG 2.1 Level A - 1.1.1 Non-text Content'
                    });
                } else {
                    console.log('✅ Demo mode option has accessible text content');
                }
                
                // Test if demo mode provides clear feedback
                await demoOption.click();
                await driver.pause(3000);
                
                // Check for confirmation dialog accessibility
                const okButton = await GeberitAppHelpers.findOkButton();
                if (okButton) {
                    const okText = await okButton.getText();
                    const okContentDesc = await okButton.getAttribute('content-desc');
                    
                    console.log(`✅ Confirmation dialog accessibility:`);
                    console.log(`   OK Button Text: "${okText}"`);
                    console.log(`   OK Button Description: "${okContentDesc || 'Same as text'}"`);
                    
                    await okButton.click();
                    await driver.pause(3000);
                } else {
                    console.log('ℹ️ No confirmation dialog found - direct activation');
                }
            }
            
            await driver.saveScreenshot('./test-results/screenshots/accessibility-demo-mode.png');
            console.log('✅ Demo mode accessibility assessment completed');
            
        } catch (error) {
            console.log('❌ Demo mode accessibility test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/accessibility-demo-error.png');
            accessibilityFindings.push({
                severity: 'HIGH',
                element: 'Demo Mode',
                issue: `Demo mode accessibility test failed: ${error.message}`,
                wcag: 'WCAG 2.1 Level A - User Interface Component accessibility'
            });
        }
    });
    
    it('should assess product content accessibility', async () => {
        console.log('📦 Testing product content accessibility...');
        
        try {
            // Get visible products for accessibility assessment
            const products = await GeberitAppHelpers.getAllVisibleProducts();
            
            if (products.length === 0) {
                console.log('⚠️ No products found for accessibility assessment');
                accessibilityFindings.push({
                    severity: 'MEDIUM',
                    element: 'Product List',
                    issue: 'No products available for accessibility assessment',
                    wcag: 'WCAG 2.1 Level A - Content accessibility'
                });
                return;
            }
            
            console.log(`📦 Assessing accessibility of ${products.length} products...`);
            
            let accessibleProducts = 0;
            let inaccessibleProducts = 0;
            
            for (let i = 0; i < Math.min(products.length, 5); i++) { // Limit to first 5 for performance
                const product = products[i];
                
                try {
                    const productText = product.text;
                    const productElement = product.element;
                    
                    // Check if product has accessible text
                    if (productText && productText.trim().length > 0) {
                        accessibleProducts++;
                        console.log(`✅ Product ${i + 1}: "${productText}" - Accessible text available`);
                        
                        // Check text quality for screen readers
                        if (productText.length < 3) {
                            accessibilityFindings.push({
                                severity: 'MEDIUM',
                                element: `Product "${productText}"`,
                                issue: 'Product text may be too short for meaningful screen reader output',
                                wcag: 'WCAG 2.1 Level AA - 2.4.4 Link Purpose'
                            });
                        }
                        
                        // Check for non-descriptive text
                        if (/^(test|demo|sample|\d+)$/i.test(productText.trim())) {
                            accessibilityFindings.push({
                                severity: 'LOW',
                                element: `Product "${productText}"`,
                                issue: 'Product name may not be descriptive enough for users with disabilities',
                                wcag: 'WCAG 2.1 Level AA - 2.4.4 Link Purpose'
                            });
                        }
                        
                    } else {
                        inaccessibleProducts++;
                        console.log(`❌ Product ${i + 1}: No accessible text found`);
                        accessibilityFindings.push({
                            severity: 'HIGH',
                            element: `Product ${i + 1}`,
                            issue: 'Product has no accessible text for screen readers',
                            wcag: 'WCAG 2.1 Level A - 1.1.1 Non-text Content'
                        });
                    }
                    
                } catch (productError) {
                    console.log(`⚠️ Could not assess product ${i + 1}: ${productError.message}`);
                    inaccessibleProducts++;
                }
            }
            
            console.log(`📊 Product Accessibility Summary:`);
            console.log(`   Accessible products: ${accessibleProducts}`);
            console.log(`   Inaccessible products: ${inaccessibleProducts}`);
            console.log(`   Accessibility rate: ${((accessibleProducts / (accessibleProducts + inaccessibleProducts)) * 100).toFixed(1)}%`);
            
            await driver.saveScreenshot('./test-results/screenshots/accessibility-products.png');
            
            // Cleanup
            await GeberitAppHelpers.deactivateDemoMode();
            
            console.log('✅ Product content accessibility assessment completed');
            
        } catch (error) {
            console.log('❌ Product accessibility test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/accessibility-products-error.png');
            accessibilityFindings.push({
                severity: 'HIGH',
                element: 'Product Content',
                issue: `Product accessibility assessment failed: ${error.message}`,
                wcag: 'WCAG 2.1 Level A - Content accessibility'
            });
        }
    });
    
    it('should generate comprehensive accessibility report', async () => {
        console.log('📋 Generating accessibility assessment report...');
        
        try {
            // Categorize findings by severity
            const critical = accessibilityFindings.filter(f => f.severity === 'CRITICAL');
            const high = accessibilityFindings.filter(f => f.severity === 'HIGH');
            const medium = accessibilityFindings.filter(f => f.severity === 'MEDIUM');
            const low = accessibilityFindings.filter(f => f.severity === 'LOW');
            
            const accessibilityReport = {
                timestamp: new Date().toISOString(),
                device: 'emulator-5554',
                app: 'com.geberit.home',
                summary: {
                    totalFindings: accessibilityFindings.length,
                    critical: critical.length,
                    high: high.length,
                    medium: medium.length,
                    low: low.length
                },
                findings: accessibilityFindings,
                wcagCompliance: {
                    levelA: critical.length + high.length === 0 ? 'PASS' : 'FAIL',
                    levelAA: accessibilityFindings.length === 0 ? 'PASS' : 'NEEDS_REVIEW',
                    overallScore: Math.max(0, 100 - (critical.length * 25 + high.length * 15 + medium.length * 10 + low.length * 5))
                },
                recommendations: []
            };
            
            // Generate recommendations based on findings
            if (critical.length > 0) {
                accessibilityReport.recommendations.push('CRITICAL: Address all critical accessibility issues immediately - these prevent basic app usage for users with disabilities');
            }
            if (high.length > 0) {
                accessibilityReport.recommendations.push('HIGH: Fix high-priority issues to meet WCAG 2.1 Level A compliance');
            }
            if (medium.length > 0) {
                accessibilityReport.recommendations.push('MEDIUM: Address medium-priority issues for better accessibility experience');
            }
            if (accessibilityFindings.length === 0) {
                accessibilityReport.recommendations.push('EXCELLENT: No significant accessibility issues found in tested areas');
            }
            
            console.log('♿ Accessibility Report Summary:');
            console.log(`   Total Findings: ${accessibilityReport.summary.totalFindings}`);
            console.log(`   Critical: ${critical.length}`);
            console.log(`   High: ${high.length}`);
            console.log(`   Medium: ${medium.length}`);
            console.log(`   Low: ${low.length}`);
            console.log(`   WCAG Level A Compliance: ${accessibilityReport.wcagCompliance.levelA}`);
            console.log(`   Overall Accessibility Score: ${accessibilityReport.wcagCompliance.overallScore}/100`);
            
            // Display findings
            if (accessibilityFindings.length > 0) {
                console.log(`\\n📋 Accessibility Findings:`);
                accessibilityFindings.forEach((finding, index) => {
                    console.log(`   ${index + 1}. [${finding.severity}] ${finding.element}: ${finding.issue}`);
                    console.log(`      WCAG: ${finding.wcag}`);
                });
            }
            
            // Save accessibility report
            const fs = require('fs');
            const path = require('path');
            const reportPath = path.join(process.cwd(), 'test-results', 'accessibility-report.json');
            
            // Ensure directory exists
            const reportDir = path.dirname(reportPath);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(accessibilityReport, null, 2));
            console.log(`💾 Accessibility report saved to: ${reportPath}`);
            
            await driver.saveScreenshot('./test-results/screenshots/accessibility-report-complete.png');
            console.log('✅ Accessibility assessment report generated successfully');
            
        } catch (error) {
            console.log('❌ Accessibility report generation failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/accessibility-report-error.png');
            throw error;
        }
    });
    
    afterEach(async () => {
        console.log('♿ Accessibility Testing Expert - Assessment completed');
        
        // Cleanup: Ensure we're not in demo mode
        try {
            await GeberitAppHelpers.deactivateDemoMode();
        } catch (error) {
            console.log('ℹ️ Demo mode already deactivated or cleanup not needed');
        }
        
        await driver.pause(1000);
    });
});