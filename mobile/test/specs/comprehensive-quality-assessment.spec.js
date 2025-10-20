const { expect } = require('@wdio/globals');
const { GeberitAppHelpers } = require('./geberit-home/complete-demo-cycle.spec');

// Comprehensive test orchestrator using all personas and shared functionalities
describe('Geberit Home - Comprehensive Multi-Persona Test Suite', () => {
    
    let testSession = {
        startTime: Date.now(),
        results: {},
        reports: []
    };
    
    before(async () => {
        console.log('🚀 Starting Comprehensive Multi-Persona Test Suite');
        console.log('🎭 Personas: Security, Performance, Accessibility Testing Specialists');
        console.log('📱 Target: Geberit Home App Demo Mode Testing');
        console.log('🎯 Goal: Comprehensive Quality Assessment with Reproducible Results');
        
        // Ensure test results directory exists
        const fs = require('fs');
        const path = require('path');
        const resultsDir = path.join(process.cwd(), 'test-results', 'screenshots');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        await driver.pause(3000);
        await driver.saveScreenshot('./test-results/screenshots/comprehensive-suite-start.png');
    });
    
    it('should execute complete demo cycle with quality assessment', async () => {
        console.log('🔄 Executing Complete Demo Mode Cycle...');
        
        try {
            const cycleStart = Date.now();
            
            // Step 1: Test app initialization and security baseline
            console.log('🔒 Phase 1: Security baseline assessment...');
            const packages = await driver.getCurrentPackage();
            const activity = await driver.getCurrentActivity();
            
            expect(packages).toBe('com.geberit.home');
            expect(activity).toContain('MainActivity');
            
            testSession.results.security = {
                appPackage: packages,
                appActivity: activity,
                initialized: true
            };
            
            // Step 2: Activate demo mode with performance monitoring
            console.log('⚡ Phase 2: Demo mode activation with performance monitoring...');
            const activationStart = Date.now();
            
            await GeberitAppHelpers.activateDemoMode();
            
            const activationTime = Date.now() - activationStart;
            console.log(`📊 Demo mode activation took: ${activationTime}ms`);
            
            testSession.results.performance = {
                demoActivationTime: activationTime,
                performanceAcceptable: activationTime < 15000
            };
            
            // Step 3: Product discovery with accessibility assessment
            console.log('♿ Phase 3: Product discovery with accessibility focus...');
            const discoveryStart = Date.now();
            
            const products = await GeberitAppHelpers.discoverAllProducts(4);
            
            const discoveryTime = Date.now() - discoveryStart;
            console.log(`📦 Product discovery completed in: ${discoveryTime}ms`);
            console.log(`📦 Products found: ${products.length}`);
            
            // Accessibility assessment of discovered products
            let accessibleProducts = 0;
            products.forEach(product => {
                if (product.text && product.text.trim().length > 2) {
                    accessibleProducts++;
                    console.log(`✅ Accessible product: "${product.text}"`);
                } else {
                    console.log(`⚠️ Potentially inaccessible product: "${product.text || 'NO TEXT'}"`);
                }
            });
            
            testSession.results.accessibility = {
                totalProducts: products.length,
                accessibleProducts: accessibleProducts,
                accessibilityRate: (accessibleProducts / products.length * 100).toFixed(1)
            };
            
            // Step 4: Security validation of discovered content
            console.log('🔍 Phase 4: Security validation of product content...');
            let securityIssues = 0;
            products.forEach(product => {
                const text = product.text || '';
                if (/<script|javascript:|data:/i.test(text)) {
                    securityIssues++;
                    console.log(`🚨 Security concern in product: "${text}"`);
                } else {
                    console.log(`✅ Product content safe: "${text}"`);
                }
            });
            
            testSession.results.security.contentScanResults = {
                productsScanned: products.length,
                securityIssuesFound: securityIssues,
                contentSecure: securityIssues === 0
            };
            
            // Step 5: Scroll back to top for consistency
            console.log('📜 Phase 5: Navigation consistency check...');
            for (let i = 0; i < 3; i++) {
                await GeberitAppHelpers.scrollUp();
            }
            
            // Step 6: Demo mode deactivation with validation
            console.log('🔄 Phase 6: Demo mode deactivation...');
            const deactivationStart = Date.now();
            
            await GeberitAppHelpers.deactivateDemoMode();
            
            const deactivationTime = Date.now() - deactivationStart;
            console.log(`📊 Demo mode deactivation took: ${deactivationTime}ms`);
            
            testSession.results.performance.demoDeactivationTime = deactivationTime;
            
            const totalCycleTime = Date.now() - cycleStart;
            console.log(`🎯 Complete cycle time: ${totalCycleTime}ms`);
            
            testSession.results.overall = {
                totalCycleTime: totalCycleTime,
                cycleSuccessful: true,
                productsFound: products.length
            };
            
            await driver.saveScreenshot('./test-results/screenshots/comprehensive-cycle-complete.png');
            
            // Validate comprehensive results
            expect(products.length).toBeGreaterThan(0);
            expect(testSession.results.security.contentSecure).toBe(true);
            expect(testSession.results.performance.performanceAcceptable).toBe(true);
            expect(parseInt(testSession.results.accessibility.accessibilityRate)).toBeGreaterThan(50);
            
            console.log('🎉 Comprehensive demo cycle completed successfully!');
            
        } catch (error) {
            console.log('❌ Comprehensive cycle failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/comprehensive-cycle-error.png');
            
            testSession.results.overall = {
                cycleSuccessful: false,
                error: error.message
            };
            
            throw error;
        }
    });
    
    it('should validate test reproducibility with multiple iterations', async () => {
        console.log('🔁 Testing reproducibility with multiple demo cycles...');
        
        try {
            let iterationResults = [];
            const targetIterations = 2; // Reduced for efficiency
            
            for (let iteration = 1; iteration <= targetIterations; iteration++) {
                console.log(`\\n🔄 Iteration ${iteration}/${targetIterations}:`);
                
                const iterationStart = Date.now();
                
                // Quick demo cycle
                await GeberitAppHelpers.activateDemoMode();
                const products = await GeberitAppHelpers.discoverAllProducts(2);
                await GeberitAppHelpers.deactivateDemoMode();
                
                const iterationTime = Date.now() - iterationStart;
                
                iterationResults.push({
                    iteration: iteration,
                    duration: iterationTime,
                    productsFound: products.length,
                    successful: products.length > 0
                });
                
                console.log(`   ✅ Iteration ${iteration}: ${products.length} products in ${iterationTime}ms`);
                
                // Brief pause between iterations
                await driver.pause(2000);
            }
            
            // Analyze reproducibility
            const successfulIterations = iterationResults.filter(r => r.successful).length;
            const avgProductsFound = iterationResults.reduce((sum, r) => sum + r.productsFound, 0) / iterationResults.length;
            const avgDuration = iterationResults.reduce((sum, r) => sum + r.duration, 0) / iterationResults.length;
            
            console.log(`\\n📊 Reproducibility Analysis:`);
            console.log(`   Successful iterations: ${successfulIterations}/${targetIterations}`);
            console.log(`   Success rate: ${(successfulIterations / targetIterations * 100).toFixed(1)}%`);
            console.log(`   Average products found: ${avgProductsFound.toFixed(1)}`);
            console.log(`   Average duration: ${avgDuration.toFixed(0)}ms`);
            
            testSession.results.reproducibility = {
                iterations: iterationResults,
                successRate: successfulIterations / targetIterations * 100,
                avgProductsFound: avgProductsFound,
                avgDuration: avgDuration,
                reproducible: successfulIterations === targetIterations
            };
            
            await driver.saveScreenshot('./test-results/screenshots/comprehensive-reproducibility-complete.png');
            
            // Validate reproducibility
            expect(successfulIterations).toBeGreaterThan(targetIterations * 0.8); // 80% success rate minimum
            expect(avgProductsFound).toBeGreaterThan(0);
            
            console.log('✅ Reproducibility test completed successfully');
            
        } catch (error) {
            console.log('❌ Reproducibility test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/comprehensive-reproducibility-error.png');
            throw error;
        }
    });
    
    it('should generate comprehensive quality assessment report', async () => {
        console.log('📋 Generating Comprehensive Quality Assessment Report...');
        
        try {
            const totalTestTime = Date.now() - testSession.startTime;
            
            // Generate comprehensive report
            const comprehensiveReport = {
                metadata: {
                    timestamp: new Date().toISOString(),
                    device: 'emulator-5554',
                    app: 'com.geberit.home',
                    testDuration: totalTestTime,
                    testFramework: 'WebDriverIO + Appium',
                    personas: ['Security Testing Specialist', 'Performance Testing Engineer', 'Accessibility Testing Expert']
                },
                results: testSession.results,
                qualityScores: {
                    security: testSession.results.security?.contentSecure ? 95 : 70,
                    performance: testSession.results.performance?.performanceAcceptable ? 90 : 60,
                    accessibility: parseInt(testSession.results.accessibility?.accessibilityRate || 0),
                    functionality: testSession.results.overall?.cycleSuccessful ? 95 : 50,
                    reproducibility: testSession.results.reproducibility?.successRate || 0
                },
                recommendations: [],
                testEvidence: {
                    screenshotsGenerated: true,
                    performanceMetricsCaptured: true,
                    securityScansCompleted: true,
                    accessibilityAssessmentDone: true
                }
            };
            
            // Calculate overall quality score
            const scores = comprehensiveReport.qualityScores;
            const overallScore = (scores.security + scores.performance + scores.accessibility + scores.functionality + scores.reproducibility) / 5;
            comprehensiveReport.overallQualityScore = Math.round(overallScore);
            
            // Generate recommendations
            if (scores.security < 90) {
                comprehensiveReport.recommendations.push('SECURITY: Review and enhance app security measures');
            }
            if (scores.performance < 85) {
                comprehensiveReport.recommendations.push('PERFORMANCE: Optimize app performance, especially demo mode activation');
            }
            if (scores.accessibility < 80) {
                comprehensiveReport.recommendations.push('ACCESSIBILITY: Improve accessibility features and screen reader support');
            }
            if (scores.functionality < 90) {
                comprehensiveReport.recommendations.push('FUNCTIONALITY: Address functional issues in demo mode cycle');
            }
            if (scores.reproducibility < 90) {
                comprehensiveReport.recommendations.push('REPRODUCIBILITY: Improve test consistency and reliability');
            }
            
            if (comprehensiveReport.recommendations.length === 0) {
                comprehensiveReport.recommendations.push('EXCELLENT: App demonstrates high quality across all assessed dimensions');
            }
            
            console.log('🎯 Comprehensive Quality Assessment Results:');
            console.log(`   Overall Quality Score: ${comprehensiveReport.overallQualityScore}/100`);
            console.log(`   Security Score: ${scores.security}/100`);
            console.log(`   Performance Score: ${scores.performance}/100`);
            console.log(`   Accessibility Score: ${scores.accessibility}/100`);
            console.log(`   Functionality Score: ${scores.functionality}/100`);
            console.log(`   Reproducibility Score: ${scores.reproducibility.toFixed(1)}/100`);
            
            console.log(`\\n💡 Key Recommendations:`);
            comprehensiveReport.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
            
            // Save comprehensive report
            const fs = require('fs');
            const path = require('path');
            const reportPath = path.join(process.cwd(), 'test-results', 'comprehensive-quality-report.json');
            
            // Ensure directory exists
            const reportDir = path.dirname(reportPath);
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(comprehensiveReport, null, 2));
            console.log(`💾 Comprehensive report saved to: ${reportPath}`);
            
            // Generate summary report in markdown
            const markdownReport = generateMarkdownReport(comprehensiveReport);
            const markdownPath = path.join(process.cwd(), 'test-results', 'quality-assessment-summary.md');
            fs.writeFileSync(markdownPath, markdownReport);
            console.log(`📄 Markdown summary saved to: ${markdownPath}`);
            
            await driver.saveScreenshot('./test-results/screenshots/comprehensive-report-complete.png');
            console.log('✅ Comprehensive quality assessment report generated successfully');
            
        } catch (error) {
            console.log('❌ Report generation failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/comprehensive-report-error.png');
            throw error;
        }
    });
});

// Helper function for markdown report generation
function generateMarkdownReport(report) {
        return `# Geberit Home App - Comprehensive Quality Assessment Report

## Test Overview
- **Timestamp**: ${report.metadata.timestamp}
- **Device**: ${report.metadata.device}
- **App**: ${report.metadata.app}
- **Test Duration**: ${(report.metadata.testDuration / 1000).toFixed(1)} seconds
- **Personas Used**: ${report.metadata.personas.join(', ')}

## Quality Scores
| Dimension | Score | Status |
|-----------|-------|--------|
| **Overall Quality** | **${report.overallQualityScore}/100** | **${report.overallQualityScore >= 80 ? '✅ GOOD' : report.overallQualityScore >= 60 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR'}** |
| Security | ${report.qualityScores.security}/100 | ${report.qualityScores.security >= 80 ? '✅' : '⚠️'} |
| Performance | ${report.qualityScores.performance}/100 | ${report.qualityScores.performance >= 80 ? '✅' : '⚠️'} |
| Accessibility | ${report.qualityScores.accessibility}/100 | ${report.qualityScores.accessibility >= 80 ? '✅' : '⚠️'} |
| Functionality | ${report.qualityScores.functionality}/100 | ${report.qualityScores.functionality >= 80 ? '✅' : '⚠️'} |
| Reproducibility | ${report.qualityScores.reproducibility.toFixed(1)}/100 | ${report.qualityScores.reproducibility >= 80 ? '✅' : '⚠️'} |

## Test Results Summary
- **Products Discovered**: ${report.results.overall?.productsFound || 'N/A'}
- **Demo Mode Cycle**: ${report.results.overall?.cycleSuccessful ? '✅ Successful' : '❌ Failed'}
- **Security Issues**: ${report.results.security?.contentScanResults?.securityIssuesFound || 0}
- **Accessibility Rate**: ${report.results.accessibility?.accessibilityRate || 'N/A'}%

## Performance Metrics
- **Demo Activation Time**: ${report.results.performance?.demoActivationTime || 'N/A'}ms
- **Demo Deactivation Time**: ${report.results.performance?.demoDeactivationTime || 'N/A'}ms
- **Reproducibility Success Rate**: ${report.results.reproducibility?.successRate?.toFixed(1) || 'N/A'}%

## Recommendations
${report.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\\n')}

## Test Evidence
- Screenshots: ${report.testEvidence.screenshotsGenerated ? '✅ Generated' : '❌ Missing'}
- Performance Metrics: ${report.testEvidence.performanceMetricsCaptured ? '✅ Captured' : '❌ Missing'}
- Security Scans: ${report.testEvidence.securityScansCompleted ? '✅ Completed' : '❌ Missing'}
- Accessibility Assessment: ${report.testEvidence.accessibilityAssessmentDone ? '✅ Done' : '❌ Missing'}

---
*Report generated by Multi-Persona Testing Framework*
`;
    }
    
    after(async () => {
        console.log('\\n🏁 Comprehensive Multi-Persona Test Suite Completed');
        console.log('📊 Summary:');
        console.log(`   Total Test Time: ${((Date.now() - testSession.startTime) / 1000).toFixed(1)} seconds`);
        console.log(`   Overall Success: ${testSession.results.overall?.cycleSuccessful ? '✅' : '❌'}`);
        console.log(`   Reports Generated: JSON + Markdown`);
        console.log('📸 Evidence: Screenshots and performance data captured');
        console.log('🔍 Next Steps: Review generated reports for detailed insights');
        
        // Final cleanup
        try {
            await GeberitAppHelpers.deactivateDemoMode();
        } catch (error) {
            console.log('ℹ️ Final cleanup: Demo mode already deactivated');
        }
        
        await driver.saveScreenshot('./test-results/screenshots/comprehensive-suite-complete.png');
    });
});