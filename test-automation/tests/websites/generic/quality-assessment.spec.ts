import { test, expect } from '@playwright/test';
import { WebsiteQualityReporter } from '../../test-helpers/quality-reporter';
import { createObservableActions } from '../../test-helpers/observability';

/**
 * Generic Website Quality Assessment Test
 * 
 * This test can be run against any website to generate a comprehensive quality report.
 * Usage: Update the TEST_URL environment variable or modify the url below.
 */

const TEST_URL = process.env.TEST_URL || 'https://example.com';

test.describe(`Website Quality Assessment: ${new URL(TEST_URL).hostname}`, () => {
  
  test('Comprehensive Quality Analysis', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo(`Starting comprehensive quality assessment for: ${TEST_URL}`);
    
    await test.step('Generate Quality Report', async () => {
      // Generate comprehensive quality report
      const qualityReport = await WebsiteQualityReporter.generateQualityReport(page, TEST_URL);
      
      // Basic assertions to ensure analysis completed
      expect(qualityReport.website.url).toBe(TEST_URL);
      expect(qualityReport.website.title).toBeTruthy();
      expect(qualityReport.overallScore).toBeGreaterThanOrEqual(0);
      expect(qualityReport.overallScore).toBeLessThanOrEqual(100);
      
      // Log summary to test output
      console.log(`\n🎯 Quality Assessment Complete:`);
      console.log(`   Overall Score: ${qualityReport.overallScore}/100`);
      console.log(`   Accessibility: ${qualityReport.accessibility.score}/100`);
      console.log(`   Performance: ${qualityReport.performance.score}/100`);
      console.log(`   Functionality: ${qualityReport.functionality.score}/100`);
      console.log(`   Usability: ${qualityReport.usability.score}/100`);
      console.log(`   Security: ${qualityReport.security.score}/100`);
      
      // Generate markdown report
      const markdownReport = WebsiteQualityReporter.generateMarkdownReport(qualityReport);
      
      // Save markdown report to test results
      const reportPath = `test-results/quality-reports/${new URL(TEST_URL).hostname}-report.md`;
      require('fs').writeFileSync(reportPath, markdownReport);
      
      actions.logTestInfo(`Quality report saved to: ${reportPath}`);
    });
  });

  test('Basic Functionality Verification', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Load Website', async () => {
      await actions.observableGoto(TEST_URL, 'Loading website for functionality test');
    });
    
    await actions.step('Verify Core Elements', async () => {
      // Verify page loads successfully
      await actions.observableExpect(async () => {
        await expect(page).toHaveTitle(/.+/);
      }, 'Verify page has a title');
      
      // Check for basic page structure
      const hasContent = await page.locator('body').isVisible();
      expect(hasContent).toBeTruthy();
      
      actions.logTestInfo('Basic page structure verification completed');
    });
    
    await actions.step('Test Interactive Elements', async () => {
      // Try to find and test common interactive elements
      try {
        // Test links
        const links = page.locator('a[href]');
        const linkCount = await links.count();
        if (linkCount > 0) {
          actions.logTestInfo(`Found ${linkCount} links on the page`);
        }
        
        // Test forms
        const forms = page.locator('form');
        const formCount = await forms.count();
        if (formCount > 0) {
          actions.logTestInfo(`Found ${formCount} forms on the page`);
        }
        
        // Test buttons
        const buttons = page.locator('button, input[type="button"], input[type="submit"]');
        const buttonCount = await buttons.count();
        if (buttonCount > 0) {
          actions.logTestInfo(`Found ${buttonCount} buttons on the page`);
        }
        
      } catch (error) {
        actions.logTestInfo(`Interactive element testing encountered issues: ${error}`);
      }
    });
  });

  test('Accessibility Quick Check', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Load Website', async () => {
      await actions.observableGoto(TEST_URL, 'Loading website for accessibility check');
    });
    
    await actions.step('Check Accessibility Basics', async () => {
      // Check for alt attributes on images
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      if (imagesWithoutAlt > 0) {
        actions.logTestInfo(`⚠️ Found ${imagesWithoutAlt} images without alt attributes`);
      } else {
        actions.logTestInfo('✅ All images have alt attributes');
      }
      
      // Check for proper heading structure
      const h1Count = await page.locator('h1').count();
      if (h1Count === 0) {
        actions.logTestInfo('⚠️ No H1 heading found on page');
      } else if (h1Count > 1) {
        actions.logTestInfo(`⚠️ Multiple H1 headings found (${h1Count})`);
      } else {
        actions.logTestInfo('✅ Proper H1 heading structure');
      }
      
      // Check for form labels
      const unlabeledInputs = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
      if (unlabeledInputs > 0) {
        actions.logTestInfo(`⚠️ Found ${unlabeledInputs} potentially unlabeled form inputs`);
      }
    });
  });

  test('Performance Quick Check', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Load Website with Timing', async () => {
      const startTime = Date.now();
      await actions.observableGoto(TEST_URL, 'Loading website for performance check');
      const loadTime = Date.now() - startTime;
      
      actions.logTestInfo(`Page load time: ${loadTime}ms`);
      
      // Performance assertions
      if (loadTime > 5000) {
        actions.logTestInfo('⚠️ Page load time is quite slow (>5s)');
      } else if (loadTime > 3000) {
        actions.logTestInfo('⚠️ Page load time could be improved (>3s)');
      } else {
        actions.logTestInfo('✅ Good page load performance (<3s)');
      }
    });
    
    await actions.step('Check Resource Loading', async () => {
      // Get basic performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          resourceCount: resources.length,
          totalSize: resources.reduce((sum: number, r: any) => sum + (r.transferSize || 0), 0)
        };
      });
      
      actions.logTestInfo(`DOM Content Loaded: ${metrics.domContentLoaded}ms`);
      actions.logTestInfo(`Total Resources: ${metrics.resourceCount}`);
      actions.logTestInfo(`Total Transfer Size: ${(metrics.totalSize / 1024 / 1024).toFixed(2)}MB`);
      
      // Performance recommendations
      if (metrics.resourceCount > 100) {
        actions.logTestInfo('⚠️ High number of resources - consider optimization');
      }
      
      if (metrics.totalSize > 5000000) { // 5MB
        actions.logTestInfo('⚠️ Large total size - consider compression/optimization');
      }
    });
  });
});
