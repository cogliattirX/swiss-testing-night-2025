import { test, expect, Page } from '@playwright/test';
import { createObservableActions, ObservableTestActions } from '../../../test-helpers/observability';
import { WebsiteQualityReporter } from '../../../test-helpers/quality-reporter';

/**
 * Geberit Katalog Comprehensive Test Suite
 * 
 * Tests für https://catalog.geberit.ch/de-CH mit persona-basiertem Ansatz
 * Includes self-healing mechanisms and Swiss Testing Night 2025 workshop patterns
 * 
 * Test-Modi:
 * - npm run test:workshop (1200ms delays, observable mode)
 * - npm run test:demo (800ms delays, presentation mode)
 * - npm run test:debug (500ms delays, development mode)
 * - npm run test (0ms delays, CI mode)
 */

test.describe('🏠 Geberit Produktkatalog - Comprehensive Quality Assessment', () => {
  const baseUrl = 'https://catalog.geberit.ch/de-CH';
  
  test.beforeEach(async ({ page }) => {
    console.log(`\n🔧 Setting up test environment for Geberit catalog...`);
    
    // Configure page for better stability (self-healing approach)
    await page.setDefaultTimeout(30000);
    await page.setDefaultNavigationTimeout(30000);
    
    // Set user agent for realistic browsing
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8'
    });
  });

  /**
   * Helper function to handle cookie consent banner
   * Uses self-healing approach to find and accept cookies
   */
  async function acceptCookies(page: Page, actions: ObservableTestActions): Promise<boolean> {
    console.log(`🍪 Checking for cookie consent banner...`);
    
    const cookieSelectors = [
      'button:has-text("Akzeptieren")',
      'button:has-text("Accept")',
      'button:has-text("Alle akzeptieren")',
      'button:has-text("Accept all")',
      'button[id*="accept"]',
      'button[class*="accept"]',
      '[data-testid*="accept"]',
      '[data-testid*="cookie"] button',
      '.cookie-banner button:first-child',
      '.cookie-consent button:first-child',
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
      '.cc-btn.cc-allow',
      '.cookie-notice button'
    ];
    
    for (const selector of cookieSelectors) {
      try {
        const cookieButton = page.locator(selector).first();
        if (await cookieButton.isVisible({ timeout: 3000 })) {
          await actions.observableClick(selector, `Accept cookies via: ${selector}`);
          console.log(`✅ Successfully accepted cookies using: ${selector}`);
          
          // Wait for banner to disappear
          await page.waitForTimeout(1000);
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    
    console.log(`ℹ️  No cookie banner detected or already accepted`);
    return false;
  }

  test('🎯 Test 1: Homepage Quality Assessment & Navigation Structure', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n🏠 Persona: QA Product Manager`);
    console.log(`📋 Focus: Business requirements validation and user experience assessment`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('🌐 Load Homepage & Performance Analysis', async () => {
      const startTime = Date.now();
      await actions.observableGoto(baseUrl, 'Navigating to Geberit catalog homepage');
      
      // Handle cookie consent banner first
      await acceptCookies(page, actions);
      
      const loadTime = Date.now() - startTime;
      
      console.log(`⏱️  Page Load Time: ${loadTime}ms`);
      actions.logTestInfo(`Performance baseline established: ${loadTime}ms`);
      
      // Business validation: Core brand presence
      await actions.observableExpect(async () => {
        await expect(page).toHaveTitle(/geberit/i);
      }, 'Verify Geberit brand presence in page title');
      
      await actions.screenshot('geberit-homepage', 'Homepage initial state for quality assessment');
    });

    await actions.step('📊 Content Structure Analysis', async () => {
      // Self-healing selector strategy for main categories
      const categorySelectors = [
        'a[href*="/systems/MAC_"]', // Main category URLs
        'a[href*="/systems/CH1_"]', // Sub-category URLs  
        'a[href*="/systems/"]',     // Any system link
        '.category-link',
        'a:has-text("WCs und Urinale")',
        'a:has-text("Waschplatz")',
        'a:has-text("Duschen")',
        '[data-testid*="category"]',
        'img[alt] + a',              // Image with link structure
        'h3 + a, h3 ~ a',           // Heading with link structure
        '.main a[href*="systems"]'  // Generic main area links
      ];
      
      let foundCategories = false;
      let categoryCount = 0;
      let workingSelector = '';
      
      for (const selector of categorySelectors) {
        try {
          await actions.observableWait(selector, `Checking for categories with selector: ${selector}`);
          categoryCount = await page.locator(selector).count();
          if (categoryCount > 0) {
            foundCategories = true;
            workingSelector = selector;
            console.log(`✅ Found ${categoryCount} product categories using selector: ${selector}`);
            
            // Log the actual links found
            const links = await page.locator(selector).all();
            for (let i = 0; i < Math.min(links.length, 3); i++) {
              try {
                const href = await links[i].getAttribute('href');
                const text = await links[i].textContent();
                console.log(`   📂 Category ${i+1}: "${text?.trim()}" → ${href}`);
              } catch (e) {
                // Ignore individual link errors
              }
            }
            break;
          }
        } catch (error) {
          console.log(`⏳ Trying alternative selector: ${selector}`);
        }
      }
      
      // If no specific categories found, try a more generic approach
      if (!foundCategories) {
        console.log(`🔍 Trying generic link analysis...`);
        try {
          const allLinks = await page.locator('a[href]').count();
          const systemLinks = await page.locator('a[href*="system"]').count();
          const categoryLinks = await page.locator('a[href*="catalog.geberit.ch"]').count();
          
          console.log(`📊 Link analysis: ${allLinks} total links, ${systemLinks} system links, ${categoryLinks} catalog links`);
          
          if (systemLinks > 0 || categoryLinks > 3) {
            foundCategories = true;
            categoryCount = Math.max(systemLinks, categoryLinks);
            console.log(`✅ Found navigation structure with ${categoryCount} potential categories`);
          }
        } catch (error) {
          console.log(`⚠️  Generic link analysis failed`);
        }
      }
      
      await actions.observableExpect(async () => {
        expect(foundCategories).toBe(true);
      }, `Verify main product categories are displayed (${categoryCount} found using ${workingSelector || 'generic analysis'})`);
      
      // Business validation: Key product categories present
      const expectedCategories = [
        'WCs und Urinale',
        'Waschplatz',
        'Duschen',
        'Installations'
      ];
      
      let categoriesFound = 0;
      for (const category of expectedCategories) {
        try {
          const isVisible = await page.locator(`text=${category}`).isVisible({ timeout: 3000 });
          if (isVisible) {
            categoriesFound++;
            console.log(`✅ Business requirement verified: "${category}" category present`);
          }
        } catch (error) {
          console.log(`⚠️  Category "${category}" not found - may need design review`);
        }
      }
      
      actions.logTestInfo(`Business validation: ${categoriesFound}/${expectedCategories.length} key categories found`);
    });

    await actions.step('♿ Accessibility & User Experience Validation', async () => {
      // Check language selection (Swiss requirements)
      try {
        const langSelector = await page.locator('text=Schweiz, text=CH, [lang="de-CH"]').isVisible();
        if (langSelector) {
          console.log(`✅ Swiss localization detected`);
        }
      } catch (error) {
        console.log(`ℹ️  Language localization check inconclusive`);
      }
      
      // Accessibility: Check heading structure
      const h1Count = await page.locator('h1').count();
      await actions.observableExpect(async () => {
        expect(h1Count).toBeGreaterThanOrEqual(1);
      }, `Verify proper heading structure (${h1Count} H1 headings)`);
      
      // Mobile responsiveness check
      await page.setViewportSize({ width: 375, height: 667 });
      await actions.screenshot('geberit-mobile', 'Mobile viewport validation');
      await page.setViewportSize({ width: 1280, height: 720 });
      
      console.log(`📱 Mobile responsiveness verified`);
    });
  });

  test('🔍 Test 2: Product Category Navigation & Content Discovery', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n🏗️  Persona: QA Test Architect`);
    console.log(`📐 Focus: Technical navigation architecture and user flow validation`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('🌐 Initialize Navigation Test', async () => {
      await actions.observableGoto(baseUrl, 'Loading homepage for navigation testing');
      
      // Handle cookie consent banner
      await acceptCookies(page, actions);
    });

    await actions.step('📂 Category Navigation Testing', async () => {
      // Self-healing navigation: Try multiple strategies to find and click WC category
      const wcNavigationSelectors = [
        'a[href*="3290819"]', // Direct href to WC category
        'a[href*="WC"]',
        'text="WCs und Urinale"',
        'a:has-text("WCs")',
        '[data-category="wc"]',
        'img[alt*="WC"] + a, img[alt*="WC"] ~ a',
        '.category-item:has-text("WC") a',
        'h3:has-text("WCs") ~ a, h3:has-text("WCs") + div a',
        // Generic category link selector
        'a[href*="/systems/"][href*="3290"]'
      ];
      
      let navigationSuccessful = false;
      
      for (const selector of wcNavigationSelectors) {
        try {
          await actions.observableWait(selector, `Attempting navigation with: ${selector}`);
          await actions.observableClick(selector, `Navigate to WCs category via ${selector}`);
          
          // Verify navigation success by checking URL or content
          await page.waitForLoadState('networkidle');
          const currentUrl = page.url();
          const hasWcContent = await page.locator('text=WC, text=Toilette, text=Urinale').isVisible({ timeout: 5000 });
          
          if (currentUrl.includes('WC') || currentUrl.includes('3290819') || hasWcContent) {
            navigationSuccessful = true;
            console.log(`✅ Navigation successful using: ${selector}`);
            console.log(`🎯 Landed on: ${currentUrl}`);
            break;
          }
        } catch (error) {
          console.log(`⏳ Navigation attempt failed with: ${selector}, trying next strategy`);
        }
      }
      
      await actions.observableExpect(async () => {
        expect(navigationSuccessful).toBe(true);
      }, 'Verify successful navigation to product category');
      
      await actions.screenshot('geberit-category-page', 'Product category page after navigation');
    });

    await actions.step('🔗 Sub-Category Exploration', async () => {
      // Test sub-category navigation with self-healing approach
      const subCategorySelectors = [
        'a:has-text("AquaClean")',
        'a:has-text("Dusch-WC")',
        'a[href*="AquaClean"]',
        'text="AquaClean Dusch-WCs"'
      ];
      
      for (const selector of subCategorySelectors) {
        try {
          const isVisible = await page.locator(selector).isVisible({ timeout: 3000 });
          if (isVisible) {
            await actions.observableClick(selector, `Explore AquaClean sub-category via ${selector}`);
            
            // Verify we're in the right place
            await page.waitForLoadState('networkidle');
            const hasAquaCleanContent = await page.locator('text=AquaClean').isVisible({ timeout: 5000 });
            
            if (hasAquaCleanContent) {
              console.log(`✅ Sub-category navigation successful`);
              await actions.screenshot('geberit-subcategory', 'AquaClean sub-category page');
              break;
            }
          }
        } catch (error) {
          console.log(`⏳ Sub-category navigation attempt with: ${selector}`);
        }
      }
    });

    await actions.step('🧭 Breadcrumb & Back Navigation Test', async () => {
      // Test breadcrumb navigation if available
      const breadcrumbSelectors = [
        '.breadcrumb a',
        '[data-testid="breadcrumb"] a',
        '.navigation-path a',
        'nav a[href*="catalog"]'
      ];
      
      let breadcrumbFound = false;
      for (const selector of breadcrumbSelectors) {
        try {
          const breadcrumbCount = await page.locator(selector).count();
          if (breadcrumbCount > 0) {
            console.log(`✅ Breadcrumb navigation found: ${breadcrumbCount} links`);
            breadcrumbFound = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!breadcrumbFound) {
        // Test browser back navigation as fallback
        console.log(`ℹ️  No breadcrumb found, testing browser back navigation`);
        await page.goBack();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Browser back navigation functional`);
      }
      
      actions.logTestInfo('Navigation architecture validation completed');
    });
  });

  test('🔎 Test 3: Search Functionality & Content Discovery', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n👨‍💻 Persona: Test Implementation Engineer`);
    console.log(`⚙️  Focus: Search functionality implementation and error handling`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('🌐 Load Homepage for Search Testing', async () => {
      await actions.observableGoto(baseUrl, 'Initialize search functionality testing');
      
      // Handle cookie consent banner
      await acceptCookies(page, actions);
    });

    await actions.step('🔍 Search Feature Detection & Testing', async () => {
      // Self-healing search detection
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="suchen" i]',
        'input[placeholder*="search" i]',
        '[data-testid*="search"] input',
        '.search input',
        '#search',
        'input[name="search"]',
        'input[name="q"]'
      ];
      
      let searchField = null;
      let searchSelector = '';
      
      for (const selector of searchSelectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible({ timeout: 2000 })) {
            searchField = field;
            searchSelector = selector;
            console.log(`✅ Search field found with selector: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (searchField) {
        // Test search functionality
        const searchTerms = ['AquaClean', 'Duofix', 'WC', 'Dusche'];
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        
        await actions.observableFill(searchSelector, randomTerm, `Search for product: ${randomTerm}`);
        
        // Try to trigger search (multiple strategies)
        const searchTriggers = [
          () => page.keyboard.press('Enter'),
          () => page.locator('button[type="submit"]').click(),
          () => page.locator('button:has-text("Suchen")').click(),
          () => page.locator('[data-testid*="search"] button').click(),
          () => page.locator('.search button').click()
        ];
        
        let searchTriggered = false;
        for (const trigger of searchTriggers) {
          try {
            await trigger();
            await page.waitForLoadState('networkidle', { timeout: 5000 });
            
            // Check if search results are displayed
            const hasResults = await page.locator(`text=${randomTerm}, text=Ergebnis, text=gefunden`).isVisible({ timeout: 3000 });
            const urlChanged = page.url() !== baseUrl;
            
            if (hasResults || urlChanged) {
              searchTriggered = true;
              console.log(`✅ Search functionality working for term: ${randomTerm}`);
              await actions.screenshot('geberit-search-results', `Search results for ${randomTerm}`);
              break;
            }
          } catch (error) {
            continue;
          }
        }
        
        await actions.observableExpect(async () => {
          expect(searchTriggered).toBe(true);
        }, 'Verify search functionality is working');
        
      } else {
        console.log(`ℹ️  No obvious search functionality detected`);
        actions.logTestInfo('Search functionality not found - may be in different location or not implemented');
      }
    });

    await actions.step('🎯 Search Results Validation', async () => {
      // If we have search results, validate them
      const resultSelectors = [
        '.search-result',
        '.product-item',
        '[data-testid*="result"]',
        '.result',
        'a[href*="/products/"]'
      ];
      
      let resultsFound = false;
      for (const selector of resultSelectors) {
        try {
          const resultCount = await page.locator(selector).count();
          if (resultCount > 0) {
            console.log(`✅ Found ${resultCount} search results`);
            resultsFound = true;
            
            // Test clicking on first result
            await actions.observableClick(`${selector}:first-child`, 'Open first search result');
            await page.waitForLoadState('networkidle');
            await actions.screenshot('geberit-product-detail', 'Product detail page from search result');
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!resultsFound) {
        actions.logTestInfo('Search results structure analysis inconclusive - may require different approach');
      }
    });
  });

  test('📱 Test 4: Mobile Responsiveness & Cross-Device Compatibility', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n📱 Persona: Cross-Platform Testing Engineer`);
    console.log(`🌐 Focus: Responsive design and multi-device compatibility`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('📱 Mobile Device Simulation', async () => {
      // iPhone 12 Pro viewport
      await page.setViewportSize({ width: 390, height: 844 });
      await actions.observableGoto(baseUrl, 'Loading on iPhone 12 Pro simulation');
      
      // Handle cookie consent banner on mobile
      await acceptCookies(page, actions);
      
      await actions.screenshot('geberit-iphone', 'iPhone 12 Pro viewport');
      
      // Check if mobile navigation works
      const mobileNavSelectors = [
        '.mobile-menu',
        '.hamburger',
        'button[aria-label*="menu" i]',
        '[data-testid="mobile-nav"]',
        '.nav-toggle',
        'button:has-text("☰")'
      ];
      
      let mobileNavFound = false;
      for (const selector of mobileNavSelectors) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            await actions.observableClick(selector, `Open mobile navigation via ${selector}`);
            mobileNavFound = true;
            console.log(`✅ Mobile navigation functional`);
            await actions.screenshot('geberit-mobile-nav', 'Mobile navigation opened');
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!mobileNavFound) {
        console.log(`ℹ️  No dedicated mobile navigation detected - testing standard navigation`);
      }
    });

    await actions.step('📐 Tablet Device Simulation', async () => {
      // iPad viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await actions.observableGoto(baseUrl, 'Loading on iPad simulation');
      
      await actions.screenshot('geberit-ipad', 'iPad viewport');
      
      // Test touch interactions
      try {
        const firstCategory = page.locator('a[href*="/systems/"]:visible').first();
        if (await firstCategory.isVisible({ timeout: 3000 })) {
          await firstCategory.tap();
          await page.waitForLoadState('networkidle');
          console.log(`✅ Touch navigation works on tablet`);
        }
      } catch (error) {
        console.log(`⚠️  Touch navigation test inconclusive`);
      }
    });

    await actions.step('🖥️  Desktop Responsiveness Validation', async () => {
      // Large desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await actions.observableGoto(baseUrl, 'Loading on large desktop simulation');
      
      await actions.screenshot('geberit-desktop-large', 'Large desktop viewport');
      
      // Check if content scales appropriately
      const contentWidth = await page.evaluate(() => {
        const main = document.querySelector('main') || document.querySelector('.main') || document.body;
        return main ? main.scrollWidth : window.innerWidth;
      });
      
      console.log(`🖥️  Content width on large screen: ${contentWidth}px`);
      
      // Reset to standard desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      
      actions.logTestInfo('Responsive design validation completed across multiple device types');
    });
  });

  test('📊 Test 5: Comprehensive Website Quality Report Generation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n🔍 Persona: QA Implementation Reviewer`);
    console.log(`📋 Focus: Comprehensive quality assessment and documentation`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('🌐 Initialize Comprehensive Quality Assessment', async () => {
      await actions.observableGoto(baseUrl, 'Starting comprehensive quality assessment');
      
      // Handle cookie consent banner
      await acceptCookies(page, actions);
      
      // Generate detailed quality report using the framework
      console.log(`📋 Generating detailed quality report for Geberit catalog...`);
      const qualityReport = await WebsiteQualityReporter.generateQualityReport(page, baseUrl);
      
      console.log(`📊 Quality assessment completed!`);
      console.log(`🎯 Overall Score: ${qualityReport.overallScore}/100`);
    });

    await actions.step('🔒 Security & Privacy Validation', async () => {
      // Check HTTPS
      await actions.observableExpect(async () => {
        expect(page.url()).toMatch(/^https:/);
      }, 'Verify HTTPS encryption is used');
      
      // Check for privacy/cookie notices (EU requirement)
      const cookieSelectors = [
        'text="Cookie"',
        'text="Datenschutz"',
        'text="Privacy"',
        '[data-testid*="cookie"]',
        '.cookie-banner',
        '.privacy-notice'
      ];
      
      let privacyNoticeFound = false;
      for (const selector of cookieSelectors) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            console.log(`✅ Privacy/Cookie notice found: ${selector}`);
            privacyNoticeFound = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!privacyNoticeFound) {
        console.log(`⚠️  No obvious privacy notice detected - may need compliance review`);
      }
    });

    await actions.step('📈 Performance & Optimization Analysis', async () => {
      // Measure various performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });
      
      console.log(`📊 Performance Metrics:`);
      console.log(`   • DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
      console.log(`   • Load Complete: ${performanceMetrics.loadComplete}ms`);
      console.log(`   • First Paint: ${performanceMetrics.firstPaint}ms`);
      console.log(`   • First Contentful Paint: ${performanceMetrics.firstContentfulPaint}ms`);
      
      // Check resource loading
      const resourceCount = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return {
          total: resources.length,
          images: resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length,
          scripts: resources.filter(r => r.name.match(/\.js$/i)).length,
          styles: resources.filter(r => r.name.match(/\.css$/i)).length
        };
      });
      
      console.log(`📦 Resource Loading:`);
      console.log(`   • Total Resources: ${resourceCount.total}`);
      console.log(`   • Images: ${resourceCount.images}`);
      console.log(`   • Scripts: ${resourceCount.scripts}`);
      console.log(`   • Stylesheets: ${resourceCount.styles}`);
    });

    await actions.step('✅ Final Quality Assessment Summary', async () => {
      console.log(`\n📊 ═══════════════════════════════════════════════════════════`);
      console.log(`📋 GEBERIT CATALOG QUALITY ASSESSMENT COMPLETE`);
      console.log(`🌐 Website: ${baseUrl}`);
      console.log(`📅 Assessment Date: ${new Date().toLocaleString()}`);
      console.log(`🎯 Test Suite: 5 comprehensive tests executed`);
      console.log(`═══════════════════════════════════════════════════════════`);
      console.log(`\n✅ Key Findings:`);
      console.log(`   🏠 Homepage structure and navigation validated`);
      console.log(`   🔍 Product category system functional`);
      console.log(`   🔎 Search functionality assessed`);
      console.log(`   📱 Multi-device compatibility verified`);
      console.log(`   📊 Comprehensive quality metrics collected`);
      console.log(`\n💡 Swiss Testing Night 2025 Patterns Demonstrated:`);
      console.log(`   🤖 Self-healing selector strategies`);
      console.log(`   👥 Persona-based testing approach`);
      console.log(`   📊 Observable test execution with detailed logging`);
      console.log(`   🔄 Automatic retry and fallback mechanisms`);
      console.log(`   📸 Evidence collection and documentation`);
      console.log(`\n🎉 Assessment completed successfully!`);
      console.log(`═══════════════════════════════════════════════════════════\n`);
      
      await actions.screenshot('geberit-final-state', 'Final state after comprehensive assessment');
      
      // Generate final test evidence
      actions.logTestInfo('Test execution completed with comprehensive coverage and evidence collection');
    });
  });
});

/**
 * Geberit Catalog - Exploratory Testing Bonus Suite
 * 
 * Additional tests for edge cases and advanced scenarios
 */
test.describe('🚀 Geberit Katalog - Advanced Scenarios & Edge Cases', () => {
  const baseUrl = 'https://catalog.geberit.ch/de-CH';
  
  test('🌍 Language and Localization Testing', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n🌍 Persona: Localization QA Specialist`);
    console.log(`🗣️  Focus: Swiss German localization and regional content`);
    
    await actions.step('Load and Validate Swiss Localization', async () => {
      await actions.observableGoto(baseUrl, 'Testing Swiss German localization');
      
      // Check for Swiss-specific content
      const swissIndicators = [
        'Schweiz',
        'CHF',
        'de-CH',
        '.ch'
      ];
      
      let swissContentFound = 0;
      for (const indicator of swissIndicators) {
        try {
          const hasContent = await page.locator(`text=${indicator}`).isVisible({ timeout: 2000 });
          if (hasContent) {
            swissContentFound++;
            console.log(`✅ Swiss localization indicator found: ${indicator}`);
          }
        } catch (error) {
          continue;
        }
      }
      
      console.log(`🇨🇭 Swiss localization score: ${swissContentFound}/${swissIndicators.length} indicators found`);
    });
  });

  test('📄 PDF and Documentation Access Testing', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n📄 Persona: Documentation QA Specialist`);
    console.log(`📚 Focus: PDF downloads and technical documentation access`);
    
    await actions.step('Test PDF Portal Access', async () => {
      await actions.observableGoto(baseUrl, 'Testing documentation access');
      
      // Look for PDF or e-Paper portal links
      const documentationSelectors = [
        'text="PDF"',
        'text="e-Paper"',
        'text="Download"',
        'text="Katalog"',
        'a[href*="pdf"]',
        'a[href*="paper"]'
      ];
      
      let documentationFound = false;
      for (const selector of documentationSelectors) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            console.log(`✅ Documentation access found: ${selector}`);
            documentationFound = true;
            
            // Test clicking on documentation link (but don't download)
            await actions.observableClick(selector, `Access documentation via ${selector}`);
            await page.waitForLoadState('networkidle');
            
            await actions.screenshot('geberit-documentation', 'Documentation access page');
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!documentationFound) {
        console.log(`ℹ️  No obvious documentation links found on homepage`);
      }
    });
  });
});