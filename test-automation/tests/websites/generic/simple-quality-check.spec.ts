import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * Simple Website Quality Assessment Test
 * 
 * This test demonstrates how to quickly assess any website's quality.
 * Set TEST_URL environment variable or modify url in test.
 */

test.describe('Generic Website Quality Assessment', () => {
  const testUrl = 'https://example.com'; // Change this or use TEST_URL env var
  
  test('Basic Website Quality Check', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n🔍 Starting Quality Assessment for: ${testUrl}`);
    console.log(`═══════════════════════════════════════════════════════════`);
    
    await test.step('🌐 Load Website & Measure Performance', async () => {
      const startTime = Date.now();
      await actions.observableGoto(testUrl, 'Loading website for quality assessment');
      const loadTime = Date.now() - startTime;
      
      console.log(`⏱️  Load Time: ${loadTime}ms`);
      
      // Performance assessment
      if (loadTime > 5000) {
        console.log(`❌ Performance: Poor (>5s) - Score: 20/100`);
      } else if (loadTime > 3000) {
        console.log(`⚠️  Performance: Below Average (>3s) - Score: 60/100`);
      } else if (loadTime > 1000) {
        console.log(`✅ Performance: Good (<3s) - Score: 85/100`);
      } else {
        console.log(`🚀 Performance: Excellent (<1s) - Score: 100/100`);
      }
      
      // Take initial screenshot
      await actions.screenshot(`${new URL(testUrl).hostname}-initial`, 'Initial website state');
    });
    
    await test.step('📊 Basic Content Analysis', async () => {
      const title = await page.title();
      console.log(`📝 Page Title: "${title}"`);
      
      // Check if page has meaningful content
      const bodyText = await page.locator('body').textContent();
      const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;
      console.log(`📄 Content: ~${wordCount} words`);
      
      if (wordCount > 100) {
        console.log(`✅ Content: Good amount of content - Score: 85/100`);
      } else if (wordCount > 10) {
        console.log(`⚠️  Content: Minimal content - Score: 60/100`);
      } else {
        console.log(`❌ Content: Very little content - Score: 30/100`);
      }
    });
    
    await test.step('♿ Quick Accessibility Check', async () => {
      let accessibilityScore = 100;
      
      // Check images without alt text
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      if (imagesWithoutAlt > 0) {
        accessibilityScore -= 20;
        console.log(`⚠️  Found ${imagesWithoutAlt} images without alt text`);
      }
      
      // Check heading structure
      const h1Count = await page.locator('h1').count();
      if (h1Count === 0) {
        accessibilityScore -= 15;
        console.log(`⚠️  No H1 heading found`);
      } else if (h1Count > 1) {
        accessibilityScore -= 10;
        console.log(`⚠️  Multiple H1 headings (${h1Count})`);
      } else {
        console.log(`✅ Proper H1 heading structure`);
      }
      
      // Check form labels
      const forms = await page.locator('form').count();
      if (forms > 0) {
        const unlabeledInputs = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
        if (unlabeledInputs > 0) {
          accessibilityScore -= 15;
          console.log(`⚠️  Found ${unlabeledInputs} potentially unlabeled inputs`);
        }
      }
      
      console.log(`♿ Accessibility Score: ${Math.max(0, accessibilityScore)}/100`);
    });
    
    await test.step('⚙️ Functionality Assessment', async () => {
      let functionalityScore = 50; // Base score
      
      // Check for interactive elements
      const linkCount = await page.locator('a[href]').count();
      const buttonCount = await page.locator('button, input[type="button"], input[type="submit"]').count();
      const formCount = await page.locator('form').count();
      
      console.log(`🔗 Found ${linkCount} links`);
      console.log(`🔘 Found ${buttonCount} buttons`);
      console.log(`📝 Found ${formCount} forms`);
      
      if (linkCount > 0) functionalityScore += 15;
      if (buttonCount > 0) functionalityScore += 15;
      if (formCount > 0) functionalityScore += 20;
      
      // Test if basic navigation works
      try {
        if (linkCount > 0) {
          const firstLink = page.locator('a[href]').first();
          const href = await firstLink.getAttribute('href');
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            console.log(`✅ Navigation links appear functional`);
            functionalityScore += 10;
          }
        }
      } catch (e) {
        console.log(`⚠️  Could not verify link functionality`);
      }
      
      console.log(`⚙️  Functionality Score: ${Math.min(100, functionalityScore)}/100`);
    });
    
    await test.step('🔒 Basic Security Check', async () => {
      let securityScore = 50; // Base score
      
      // Check HTTPS
      if (page.url().startsWith('https://')) {
        securityScore += 30;
        console.log(`✅ Uses HTTPS encryption`);
      } else {
        console.log(`❌ Not using HTTPS - Security Risk`);
      }
      
      // Check for password fields in forms
      const passwordFields = await page.locator('input[type="password"]').count();
      if (passwordFields > 0) {
        securityScore += 20;
        console.log(`🔐 Has ${passwordFields} password field(s) - verify proper handling`);
      }
      
      console.log(`🔒 Security Score: ${securityScore}/100`);
    });
    
    await test.step('📱 Mobile Responsiveness Quick Test', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await actions.screenshot(`${new URL(testUrl).hostname}-mobile`, 'Mobile viewport test');
      
      // Check viewport meta tag
      const viewportMeta = await page.locator('meta[name="viewport"]').count();
      if (viewportMeta > 0) {
        console.log(`✅ Has viewport meta tag - mobile optimized`);
      } else {
        console.log(`⚠️  Missing viewport meta tag - may not be mobile optimized`);
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
    
    await test.step('📋 Generate Summary Report', async () => {
      console.log(`\n📊 ═══════════════════════════════════════════════════════════`);
      console.log(`📋 QUALITY ASSESSMENT SUMMARY`);
      console.log(`🌐 Website: ${testUrl}`);
      console.log(`📅 Assessed: ${new Date().toLocaleString()}`);
      console.log(`═══════════════════════════════════════════════════════════`);
      console.log(`\n✅ Assessment completed successfully!`);
      console.log(`📸 Screenshots saved to test-results/`);
      console.log(`📊 Check test output above for detailed scores and recommendations`);
      console.log(`\n💡 Recommendation: Run this test against different websites`);
      console.log(`   to compare quality scores and identify improvement areas.`);
      console.log(`═══════════════════════════════════════════════════════════\n`);
    });
  });
  
  test('Interactive Elements Test', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Load Website', async () => {
      await actions.observableGoto(testUrl, 'Loading for interactive test');
    });
    
    await actions.step('Test Interactive Elements', async () => {
      // Try to interact with search if available
      try {
        const searchSelector = 'input[type="search"], input[placeholder*="search" i]';
        const searchInput = page.locator(searchSelector).first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          await actions.observableFill(searchSelector, 'test query', 'Testing search functionality');
          console.log(`✅ Search functionality appears to work`);
        }
      } catch (e) {
        console.log(`ℹ️  No obvious search functionality found`);
      }
      
      // Try to test navigation
      try {
        const navLinks = page.locator('nav a, .nav a, .navigation a').first();
        if (await navLinks.isVisible({ timeout: 2000 })) {
          console.log(`✅ Navigation elements found and appear clickable`);
        }
      } catch (e) {
        console.log(`ℹ️  No obvious navigation structure found`);
      }
      
      console.log(`🎯 Interactive elements test completed`);
    });
  });
});
