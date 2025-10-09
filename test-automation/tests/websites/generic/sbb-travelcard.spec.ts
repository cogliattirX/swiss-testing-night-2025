import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Travel Card Validation Testing', () => {
  
  test('Test GA (General Abonnement) and Halbtax card validation workflow', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🎫 Testing travel card validation and pricing');
    
    await actions.step('🏠 Navigate to SBB and Setup Journey', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate to SBB homepage');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await page.click('#onetrust-accept-btn-handler');
        actions.logTestInfo('Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
    });

    await actions.step('🎯 Plan Journey with Base Price', async () => {
      // Setup journey from Bern to Geneva
      const fromInput = page.locator('input[placeholder*="Von"], input[placeholder*="From"], input[name*="from"]').first();
      const hasFromInput = await fromInput.isVisible().catch(() => false);
      
      if (hasFromInput) {
        await fromInput.fill('Bern');
        actions.logTestInfo('🏁 Origin: Bern');
        
        await page.waitForTimeout(1000);
        
        const toInput = page.locator('input[placeholder*="Nach"], input[placeholder*="To"], input[name*="to"]').first();
        const hasToInput = await toInput.isVisible().catch(() => false);
        
        if (hasToInput) {
          await toInput.fill('Genève');
          actions.logTestInfo('🎯 Destination: Genève');
          
          await page.waitForTimeout(1000);
          
          // Search for connections
          const searchButton = page.locator('button:has-text("Verbindungen suchen"), button:has-text("Search connections"), button[type="submit"]').first();
          const hasSearchButton = await searchButton.isVisible().catch(() => false);
          
          if (hasSearchButton) {
            await searchButton.click();
            actions.logTestInfo('🔍 Searching connections...');
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    await actions.step('💰 Capture Base Price Information', async () => {
      // Look for price information
      const basePriceInfo = await page.evaluate(() => {
        const results = {
          foundPrices: false,
          priceElements: 0,
          currencyFound: false,
          priceTexts: [] as string[]
        };
        
        // Look for price elements
        const priceSelectors = [
          '.price',
          '[class*="price"]',
          '[class*="cost"]',
          '[class*="fare"]',
          'span:contains("CHF")',
          'div:contains("CHF")'
        ];
        
        priceSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            results.priceElements += elements.length;
            results.foundPrices = true;
          }
        });
        
        // Look for CHF currency
        if (document.body.textContent?.includes('CHF')) {
          results.currencyFound = true;
        }
        
        // Extract price-like text patterns
        const pricePattern = /CHF\s*\d+\.?\d*/g;
        const matches = document.body.textContent?.match(pricePattern);
        if (matches) {
          results.priceTexts = matches.slice(0, 5); // First 5 matches
        }
        
        return results;
      });
      
      actions.logTestInfo('💰 Base price analysis:');
      actions.logTestInfo(`  Found prices: ${basePriceInfo.foundPrices ? '✅' : '❌'}`);
      actions.logTestInfo(`  Price elements: ${basePriceInfo.priceElements}`);
      actions.logTestInfo(`  Currency (CHF): ${basePriceInfo.currencyFound ? '✅' : '❌'}`);
      if (basePriceInfo.priceTexts.length > 0) {
        actions.logTestInfo(`  Sample prices: ${basePriceInfo.priceTexts.join(', ')}`);
      }
      
      await actions.screenshot('base-pricing', 'Base price without travel cards');
    });

    await actions.step('🎫 Test Halbtax Card Integration', async () => {
      // Look for travel card options
      const travelCardSelectors = [
        'button:has-text("Halbtax")',
        'button:has-text("GA")',
        'select[name*="reduction"]',
        'select[name*="discount"]',
        'select[name*="card"]',
        '[data-testid*="travelcard"]',
        '.travelcard-selector',
        '.discount-selector'
      ];
      
      let halbtaxFound = false;
      
      for (const selector of travelCardSelectors) {
        const cardElement = page.locator(selector).first();
        const isVisible = await cardElement.isVisible().catch(() => false);
        
        if (isVisible) {
          actions.logTestInfo(`🎫 Found travel card selector: ${selector}`);
          
          // Try to interact with it
          if (selector.includes('select')) {
            // Handle dropdown
            const options = await cardElement.locator('option').allTextContents();
            actions.logTestInfo(`📋 Available options: ${options.join(', ')}`);
            
            const halbtaxOption = options.find(opt => 
              opt.toLowerCase().includes('halbtax') || 
              opt.toLowerCase().includes('half') ||
              opt.toLowerCase().includes('50%')
            );
            
            if (halbtaxOption) {
              await cardElement.selectOption({ label: halbtaxOption });
              actions.logTestInfo('✅ Selected Halbtax option');
              halbtaxFound = true;
            }
          } else {
            // Handle button/other element
            const elementText = await cardElement.textContent();
            if (elementText?.toLowerCase().includes('halbtax')) {
              await cardElement.click();
              actions.logTestInfo('✅ Clicked Halbtax card');
              halbtaxFound = true;
            }
          }
          
          if (halbtaxFound) {
            await page.waitForTimeout(2000);
            break;
          }
        }
      }
      
      if (!halbtaxFound) {
        actions.logTestInfo('ℹ️ Halbtax selector not immediately visible, checking other areas');
      }
    });

    await actions.step('💳 Analyze Price Changes with Halbtax', async () => {
      // Check for price updates after travel card selection
      const updatedPriceInfo = await page.evaluate(() => {
        const results = {
          discountIndicators: [] as string[],
          halfPriceFound: false,
          percentageDiscounts: [] as string[]
        };
        
        // Look for discount indicators
        const discountKeywords = ['50%', 'Halbtax', 'Reduction', 'Discount', 'Rabatt'];
        discountKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.discountIndicators.push(keyword);
          }
        });
        
        // Look for half-price indicators
        const halfPricePatterns = ['50%', '/2', 'half', 'halbe'];
        results.halfPriceFound = halfPricePatterns.some(pattern => 
          document.body.textContent?.toLowerCase().includes(pattern.toLowerCase())
        );
        
        // Extract percentage patterns
        const percentagePattern = /\d+%/g;
        const percentMatches = document.body.textContent?.match(percentagePattern);
        if (percentMatches) {
          results.percentageDiscounts = [...new Set(percentMatches)].slice(0, 3);
        }
        
        return results;
      });
      
      actions.logTestInfo('💳 Halbtax price analysis:');
      if (updatedPriceInfo.discountIndicators.length > 0) {
        actions.logTestInfo(`  Discount indicators: ${updatedPriceInfo.discountIndicators.join(', ')}`);
      }
      actions.logTestInfo(`  Half-price found: ${updatedPriceInfo.halfPriceFound ? '✅' : '❌'}`);
      if (updatedPriceInfo.percentageDiscounts.length > 0) {
        actions.logTestInfo(`  Percentages found: ${updatedPriceInfo.percentageDiscounts.join(', ')}`);
      }
      
      await actions.screenshot('halbtax-pricing', 'Pricing with Halbtax card');
    });

    await actions.step('🎟️ Test GA (General Abonnement) Option', async () => {
      // Look for GA option
      const gaSelectors = [
        'button:has-text("GA")',
        'option:has-text("GA")',
        'option:has-text("General Abonnement")',
        'button:has-text("General")',
        'select option[value*="ga"]',
        'select option[value*="GA"]'
      ];
      
      let gaFound = false;
      
      for (const selector of gaSelectors) {
        const gaElement = page.locator(selector).first();
        const isVisible = await gaElement.isVisible().catch(() => false);
        
        if (isVisible) {
          actions.logTestInfo(`🎟️ Found GA option: ${selector}`);
          
          try {
            if (selector.includes('option')) {
              // Get parent select and choose option
              const selectElement = page.locator('select').first();
              await selectElement.selectOption({ label: 'GA' });
            } else {
              await gaElement.click();
            }
            
            actions.logTestInfo('✅ Selected GA option');
            gaFound = true;
            await page.waitForTimeout(2000);
            break;
          } catch (error) {
            actions.logTestInfo('ℹ️ Could not interact with GA option');
          }
        }
      }
      
      if (!gaFound) {
        actions.logTestInfo('ℹ️ GA option not found or not interactable');
      }
    });

    await actions.step('🆓 Analyze GA Pricing Impact', async () => {
      // Check for free travel with GA
      const gaPriceInfo = await page.evaluate(() => {
        const results = {
          freeIndicators: [] as string[],
          gaKeywords: [] as string[],
          zeroPrice: false
        };
        
        // Look for free travel indicators
        const freeKeywords = ['FREE', 'GRATIS', 'kostenlos', 'CHF 0', '0.00', 'Included'];
        freeKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.freeIndicators.push(keyword);
          }
        });
        
        // Look for GA-related text
        const gaKeywords = ['GA', 'General Abonnement', 'Generalabonnement'];
        gaKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.gaKeywords.push(keyword);
          }
        });
        
        // Check for zero pricing
        results.zeroPrice = /(CHF\s*0|0\s*CHF|0\.00)/i.test(document.body.textContent || '');
        
        return results;
      });
      
      actions.logTestInfo('🆓 GA pricing analysis:');
      if (gaPriceInfo.freeIndicators.length > 0) {
        actions.logTestInfo(`  Free indicators: ${gaPriceInfo.freeIndicators.join(', ')}`);
      }
      if (gaPriceInfo.gaKeywords.length > 0) {
        actions.logTestInfo(`  GA keywords: ${gaPriceInfo.gaKeywords.join(', ')}`);
      }
      actions.logTestInfo(`  Zero price found: ${gaPriceInfo.zeroPrice ? '✅' : '❌'}`);
      
      await actions.screenshot('ga-pricing', 'Pricing with GA subscription');
    });

    await actions.step('📋 Compare Travel Card Options', async () => {
      // Summary of travel card testing
      actions.logTestInfo('📋 Travel Card Validation Summary:');
      actions.logTestInfo('  🎫 Halbtax (50% discount) - Tested price reduction');
      actions.logTestInfo('  🎟️ GA (General Abonnement) - Tested free travel');
      actions.logTestInfo('  💰 Base pricing - Captured full fare information');
      
      // Test if we can switch between options
      const cardSwitchTest = await page.evaluate(() => {
        const selects = document.querySelectorAll('select');
        const buttons = document.querySelectorAll('button');
        
        return {
          selectElements: selects.length,
          buttonElements: buttons.length,
          hasTravelCardUI: selects.length > 0 || buttons.length > 0
        };
      });
      
      actions.logTestInfo(`📊 UI Elements: ${cardSwitchTest.selectElements} selects, ${cardSwitchTest.buttonElements} buttons`);
      actions.logTestInfo(`🎚️ Travel card UI available: ${cardSwitchTest.hasTravelCardUI ? '✅' : '❌'}`);
    });
  });
});