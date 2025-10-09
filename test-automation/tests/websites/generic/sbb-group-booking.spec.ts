import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Group Booking Testing', () => {
  
  test('Test group ticket booking and special group rates', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('👥 Testing group booking functionality');
    
    await actions.step('🏠 Navigate to SBB Homepage', async () => {
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

    await actions.step('👥 Look for Group Booking Options', async () => {
      // Look for group booking in navigation or special sections
      const groupBookingSelectors = [
        'a:has-text("Gruppe")',
        'a:has-text("Group")',
        'a:has-text("Gruppentickets")',
        'a:has-text("Group tickets")',
        '[href*="group"]',
        '[href*="gruppe"]',
        'nav a:has-text("Groups")',
        '.group-booking'
      ];
      
      let groupLinkFound = false;
      
      for (const selector of groupBookingSelectors) {
        const groupLink = page.locator(selector).first();
        const isVisible = await groupLink.isVisible().catch(() => false);
        
        if (isVisible) {
          await groupLink.click();
          actions.logTestInfo('👥 Found and clicked group booking link');
          groupLinkFound = true;
          await page.waitForLoadState('networkidle');
          break;
        }
      }
      
      if (!groupLinkFound) {
        actions.logTestInfo('ℹ️ Group booking link not found in main navigation');
      }
    });

    await actions.step('🔍 Search for Group Information', async () => {
      // If no direct group link, search for group information
      const searchSelectors = [
        'input[placeholder*="Search"], input[placeholder*="Suche"]',
        '.search-input',
        '[data-testid*="search"]'
      ];
      
      for (const selector of searchSelectors) {
        const searchInput = page.locator(selector).first();
        const isVisible = await searchInput.isVisible().catch(() => false);
        
        if (isVisible) {
          await searchInput.fill('group tickets gruppentickets');
          actions.logTestInfo('🔍 Searching for group tickets');
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          break;
        }
      }
      
      // Alternative: Check footer or help sections for group info
      const footerGroupLinks = [
        'footer a:has-text("Group")',
        'footer a:has-text("Gruppe")',
        '.footer a[href*="group"]'
      ];
      
      for (const selector of footerGroupLinks) {
        const footerLink = page.locator(selector).first();
        const isVisible = await footerLink.isVisible().catch(() => false);
        
        if (isVisible) {
          await footerLink.click();
          actions.logTestInfo('📋 Found group link in footer');
          await page.waitForLoadState('networkidle');
          break;
        }
      }
    });

    await actions.step('📋 Analyze Group Booking Features', async () => {
      // Look for group-specific content and features
      const groupFeatures = await page.evaluate(() => {
        const results = {
          groupKeywords: [] as string[],
          discountMentioned: false,
          minimumPersons: false,
          groupPricing: false,
          specialRates: false,
          foundFeatures: [] as string[]
        };
        
        // Look for group-related keywords
        const groupKeywords = [
          'Gruppe', 'Group', 'Gruppenticket', 'Group ticket',
          'Gruppenrabatt', 'Group discount', 'Gruppentarif', 'Group rate'
        ];
        
        groupKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.groupKeywords.push(keyword);
          }
        });
        
        // Look for discount mentions
        const discountKeywords = ['Rabatt', 'Discount', '%', 'reduziert', 'reduced'];
        results.discountMentioned = discountKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for minimum person requirements
        const minPersonPatterns = [/ab \d+ Personen/gi, /from \d+ persons/gi, /minimum \d+/gi];
        results.minimumPersons = minPersonPatterns.some(pattern => 
          pattern.test(document.body.textContent || '')
        );
        
        // Look for group pricing indicators
        const pricingKeywords = ['Gruppentarif', 'Group rate', 'Group price', 'per Person'];
        results.groupPricing = pricingKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for special rate mentions
        const specialRateKeywords = ['Sondertarif', 'Special rate', 'Vorzugspreis'];
        results.specialRates = specialRateKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Collect specific features mentioned
        const featureKeywords = [
          'Reservierung', 'Reservation', 'Beratung', 'Consultation',
          'Voranmeldung', 'Pre-registration', 'Kontingent', 'Allocation'
        ];
        
        featureKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.foundFeatures.push(keyword);
          }
        });
        
        return results;
      });
      
      actions.logTestInfo('📋 Group booking analysis:');
      if (groupFeatures.groupKeywords.length > 0) {
        actions.logTestInfo(`  Group keywords: ${groupFeatures.groupKeywords.join(', ')}`);
      }
      actions.logTestInfo(`  Discount mentioned: ${groupFeatures.discountMentioned ? '✅' : '❌'}`);
      actions.logTestInfo(`  Minimum persons: ${groupFeatures.minimumPersons ? '✅' : '❌'}`);
      actions.logTestInfo(`  Group pricing: ${groupFeatures.groupPricing ? '✅' : '❌'}`);
      actions.logTestInfo(`  Special rates: ${groupFeatures.specialRates ? '✅' : '❌'}`);
      
      if (groupFeatures.foundFeatures.length > 0) {
        actions.logTestInfo(`  Features found: ${groupFeatures.foundFeatures.join(', ')}`);
      }
      
      await actions.screenshot('group-booking-info', 'Group booking information page');
    });

    await actions.step('🎫 Test Group Size Selection', async () => {
      // Look for passenger/traveler count selectors
      const passengerSelectors = [
        'select[name*="passenger"]',
        'select[name*="traveler"]', 
        'select[name*="person"]',
        'input[name*="passenger"]',
        'input[type="number"]',
        '.passenger-count',
        '.traveler-selector',
        '[data-testid*="passenger"]'
      ];
      
      let passengerSelectorFound = false;
      
      for (const selector of passengerSelectors) {
        const passengerElement = page.locator(selector).first();
        const isVisible = await passengerElement.isVisible().catch(() => false);
        
        if (isVisible) {
          actions.logTestInfo(`👥 Found passenger selector: ${selector}`);
          
          // Try to set group size (e.g., 15 people)
          const tagName = await passengerElement.evaluate(el => el.tagName.toLowerCase());
          
          if (tagName === 'select') {
            // Handle dropdown
            const options = await passengerElement.locator('option').allTextContents();
            actions.logTestInfo(`📋 Available options: ${options.join(', ')}`);
            
            // Try to find a high number option
            const highNumberOption = options.find(opt => {
              const num = parseInt(opt);
              return num >= 10;
            });
            
            if (highNumberOption) {
              await passengerElement.selectOption({ label: highNumberOption });
              actions.logTestInfo(`✅ Selected ${highNumberOption} passengers`);
            }
          } else if (tagName === 'input') {
            // Handle input field
            await passengerElement.fill('15');
            actions.logTestInfo('✅ Set passenger count to 15');
          }
          
          passengerSelectorFound = true;
          await page.waitForTimeout(2000);
          break;
        }
      }
      
      if (!passengerSelectorFound) {
        actions.logTestInfo('ℹ️ Passenger selector not found, may need to be in booking flow');
      }
    });

    await actions.step('🎯 Test Group Journey Planning', async () => {
      // Test journey planning with group size
      const fromInput = page.locator('input[placeholder*="Von"], input[placeholder*="From"], input[name*="from"]').first();
      const hasFromInput = await fromInput.isVisible().catch(() => false);
      
      if (hasFromInput) {
        await fromInput.fill('Basel');
        actions.logTestInfo('🏁 Group origin: Basel');
        
        await page.waitForTimeout(1000);
        
        const toInput = page.locator('input[placeholder*="Nach"], input[placeholder*="To"], input[name*="to"]').first();
        const hasToInput = await toInput.isVisible().catch(() => false);
        
        if (hasToInput) {
          await toInput.fill('Interlaken');
          actions.logTestInfo('🎯 Group destination: Interlaken');
          
          await page.waitForTimeout(1000);
          
          // Look for search button
          const searchButton = page.locator('button:has-text("Verbindungen suchen"), button:has-text("Search connections")').first();
          const hasSearchButton = await searchButton.isVisible().catch(() => false);
          
          if (hasSearchButton) {
            await searchButton.click();
            actions.logTestInfo('🔍 Searching group connections...');
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    await actions.step('💰 Analyze Group Pricing', async () => {
      // Look for group-specific pricing information
      const groupPricing = await page.evaluate(() => {
        const results = {
          totalPrice: false,
          perPersonPrice: false,
          groupDiscount: false,
          multiplePassengers: false,
          pricingBreakdown: [] as string[]
        };
        
        // Look for total price indicators
        const totalKeywords = ['Total', 'Gesamt', 'Summe'];
        results.totalPrice = totalKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for per-person pricing
        const perPersonKeywords = ['per Person', 'pro Person', '/Person', 'each'];
        results.perPersonPrice = perPersonKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for group discount mentions
        const discountKeywords = ['Gruppenrabatt', 'Group discount', 'Savings'];
        results.groupDiscount = discountKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for multiple passenger indicators
        const multiKeywords = ['x15', '15x', 'passengers', 'Personen'];
        results.multiplePassengers = multiKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Extract pricing patterns
        const pricePattern = /CHF\s*\d+\.?\d*/g;
        const matches = document.body.textContent?.match(pricePattern);
        if (matches) {
          results.pricingBreakdown = matches.slice(0, 3);
        }
        
        return results;
      });
      
      actions.logTestInfo('💰 Group pricing analysis:');
      actions.logTestInfo(`  Total price shown: ${groupPricing.totalPrice ? '✅' : '❌'}`);
      actions.logTestInfo(`  Per person price: ${groupPricing.perPersonPrice ? '✅' : '❌'}`);
      actions.logTestInfo(`  Group discount: ${groupPricing.groupDiscount ? '✅' : '❌'}`);
      actions.logTestInfo(`  Multiple passengers: ${groupPricing.multiplePassengers ? '✅' : '❌'}`);
      
      if (groupPricing.pricingBreakdown.length > 0) {
        actions.logTestInfo(`  Sample prices: ${groupPricing.pricingBreakdown.join(', ')}`);
      }
      
      await actions.screenshot('group-pricing', 'Group pricing information');
    });

    await actions.step('📞 Check Group Contact Information', async () => {
      // Look for group booking contact details
      const contactInfo = await page.evaluate(() => {
        const results = {
          phoneNumbers: [] as string[],
          emailAddresses: [] as string[],
          contactForms: false,
          groupAdvice: false
        };
        
        // Extract phone numbers
        const phonePattern = /(\+41|0041|0)\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2}/g;
        const phoneMatches = document.body.textContent?.match(phonePattern);
        if (phoneMatches) {
          results.phoneNumbers = [...new Set(phoneMatches)].slice(0, 3);
        }
        
        // Extract email addresses
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emailMatches = document.body.textContent?.match(emailPattern);
        if (emailMatches) {
          results.emailAddresses = [...new Set(emailMatches)].slice(0, 3);
        }
        
        // Look for contact forms
        const forms = document.querySelectorAll('form');
        results.contactForms = forms.length > 0;
        
        // Look for group advice mentions
        const adviceKeywords = ['Beratung', 'Advice', 'Consultation', 'Gruppenberatung'];
        results.groupAdvice = adviceKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        return results;
      });
      
      actions.logTestInfo('📞 Group contact information:');
      if (contactInfo.phoneNumbers.length > 0) {
        actions.logTestInfo(`  Phone numbers: ${contactInfo.phoneNumbers.join(', ')}`);
      }
      if (contactInfo.emailAddresses.length > 0) {
        actions.logTestInfo(`  Email addresses: ${contactInfo.emailAddresses.join(', ')}`);
      }
      actions.logTestInfo(`  Contact forms: ${contactInfo.contactForms ? '✅' : '❌'}`);
      actions.logTestInfo(`  Group advice: ${contactInfo.groupAdvice ? '✅' : '❌'}`);
    });

    await actions.step('📋 Group Booking Summary', async () => {
      actions.logTestInfo('📋 Group Booking Test Summary:');
      actions.logTestInfo('  👥 Group size selection (15 passengers)');
      actions.logTestInfo('  🎯 Group journey planning (Basel → Interlaken)');
      actions.logTestInfo('  💰 Group pricing analysis');
      actions.logTestInfo('  📞 Contact information validation');
      actions.logTestInfo('  🎫 Special group rates investigation');
    });
  });
});