import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Seasonal Offers Testing', () => {
  
  test('Test seasonal travel offers and special promotions', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🎿 Testing seasonal offers and promotions');
    
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

    await actions.step('🎁 Look for Seasonal Offers Section', async () => {
      // Look for seasonal offers in navigation and homepage
      const seasonalSelectors = [
        'a:has-text("Angebote")',
        'a:has-text("Offers")',
        'a:has-text("Aktionen")',
        'a:has-text("Promotions")',
        'a:has-text("Special")',
        'a:has-text("Winter")',
        'a:has-text("Sommer")',
        'a:has-text("Freizeit")',
        'a:has-text("Leisure")',
        '[href*="angebot"]',
        '[href*="offer"]',
        '[href*="promotion"]',
        '.offers-section',
        '.seasonal-offers'
      ];
      
      let offersFound = false;
      
      for (const selector of seasonalSelectors) {
        const offerLink = page.locator(selector).first();
        const isVisible = await offerLink.isVisible().catch(() => false);
        
        if (isVisible) {
          const linkText = await offerLink.textContent();
          actions.logTestInfo(`🎁 Found offers link: "${linkText}"`);
          await offerLink.click();
          offersFound = true;
          await page.waitForLoadState('networkidle');
          break;
        }
      }
      
      if (!offersFound) {
        actions.logTestInfo('ℹ️ Seasonal offers not in main navigation, checking homepage banners');
      }
    });

    await actions.step('🏔️ Scan Homepage for Seasonal Content', async () => {
      // Look for seasonal content on homepage
      const seasonalContent = await page.evaluate(() => {
        const results = {
          winterKeywords: [] as string[],
          summerKeywords: [] as string[],
          holidayKeywords: [] as string[],
          skiKeywords: [] as string[],
          recreationKeywords: [] as string[],
          foundPromotions: [] as string[]
        };
        
        const bodyText = document.body.textContent || '';
        
        // Winter-related keywords
        const winterWords = [
          'Winter', 'Ski', 'Snowboard', 'Schnee', 'Snow', 
          'Wintersport', 'Pistenbully', 'Skigebiet', 'Bergbahn'
        ];
        winterWords.forEach(word => {
          if (bodyText.includes(word)) {
            results.winterKeywords.push(word);
          }
        });
        
        // Summer-related keywords
        const summerWords = [
          'Sommer', 'Summer', 'Wandern', 'Hiking', 'Berg', 'Mountain',
          'See', 'Lake', 'Fahrrad', 'Bike', 'Outdoor'
        ];
        summerWords.forEach(word => {
          if (bodyText.includes(word)) {
            results.summerKeywords.push(word);
          }
        });
        
        // Holiday/vacation keywords
        const holidayWords = [
          'Ferien', 'Holiday', 'Vacation', 'Weekend', 'Wochenende',
          'Familienferien', 'Kurztrip', 'Ausflug', 'Trip'
        ];
        holidayWords.forEach(word => {
          if (bodyText.includes(word)) {
            results.holidayKeywords.push(word);
          }
        });
        
        // Ski-specific keywords
        const skiWords = [
          'Skipass', 'Ski pass', 'Davos', 'St. Moritz', 'Zermatt',
          'Grindelwald', 'Jungfraujoch', 'Matterhorn', 'Gornergrat'
        ];
        skiWords.forEach(word => {
          if (bodyText.includes(word)) {
            results.skiKeywords.push(word);
          }
        });
        
        // Recreation keywords
        const recreationWords = [
          'Freizeit', 'Leisure', 'Erlebnis', 'Experience', 'Abenteuer',
          'Adventure', 'Wellness', 'Spa', 'Kultur', 'Culture'
        ];
        recreationWords.forEach(word => {
          if (bodyText.includes(word)) {
            results.recreationKeywords.push(word);
          }
        });
        
        // Look for specific promotional text
        const promoElements = document.querySelectorAll('.promo, .offer, .banner, .promotion, .special');
        promoElements.forEach((element, index) => {
          if (index < 5) { // Limit to first 5 elements
            const text = element.textContent?.trim();
            if (text && text.length > 10 && text.length < 100) {
              results.foundPromotions.push(text);
            }
          }
        });
        
        return results;
      });
      
      actions.logTestInfo('🏔️ Seasonal content analysis:');
      if (seasonalContent.winterKeywords.length > 0) {
        actions.logTestInfo(`  Winter: ${seasonalContent.winterKeywords.slice(0, 5).join(', ')}`);
      }
      if (seasonalContent.summerKeywords.length > 0) {
        actions.logTestInfo(`  Summer: ${seasonalContent.summerKeywords.slice(0, 5).join(', ')}`);
      }
      if (seasonalContent.holidayKeywords.length > 0) {
        actions.logTestInfo(`  Holiday: ${seasonalContent.holidayKeywords.slice(0, 5).join(', ')}`);
      }
      if (seasonalContent.skiKeywords.length > 0) {
        actions.logTestInfo(`  Ski destinations: ${seasonalContent.skiKeywords.slice(0, 5).join(', ')}`);
      }
      if (seasonalContent.recreationKeywords.length > 0) {
        actions.logTestInfo(`  Recreation: ${seasonalContent.recreationKeywords.slice(0, 5).join(', ')}`);
      }
      
      if (seasonalContent.foundPromotions.length > 0) {
        actions.logTestInfo('🎁 Found promotions:');
        seasonalContent.foundPromotions.forEach((promo, index) => {
          actions.logTestInfo(`  ${index + 1}. ${promo}`);
        });
      }
      
      await actions.screenshot('seasonal-homepage', 'Homepage with seasonal content');
    });

    await actions.step('🎿 Test Ski Resort Connections', async () => {
      // Test journey to popular ski destinations
      const skiDestinations = ['Davos', 'St. Moritz', 'Zermatt', 'Grindelwald', 'Wengen'];
      
      for (const destination of skiDestinations.slice(0, 2)) { // Test first 2 destinations
        actions.logTestInfo(`🎿 Testing connection to ${destination}...`);
        
        // Try to plan journey to ski destination
        const fromInput = page.locator('input[placeholder*="Von"], input[placeholder*="From"], input[name*="from"]').first();
        const hasFromInput = await fromInput.isVisible().catch(() => false);
        
        if (hasFromInput) {
          await fromInput.clear();
          await fromInput.fill('Zürich');
          await page.waitForTimeout(500);
          
          const toInput = page.locator('input[placeholder*="Nach"], input[placeholder*="To"], input[name*="to"]').first();
          const hasToInput = await toInput.isVisible().catch(() => false);
          
          if (hasToInput) {
            await toInput.clear();
            await toInput.fill(destination);
            await page.waitForTimeout(1000);
            
            // Check if destination appears in autocomplete
            const suggestion = page.locator(`text="${destination}"`).first();
            const hasSuggestion = await suggestion.isVisible().catch(() => false);
            
            if (hasSuggestion) {
              actions.logTestInfo(`✅ ${destination} found in autocomplete`);
              await suggestion.click();
            } else {
              actions.logTestInfo(`ℹ️ ${destination} not in autocomplete`);
            }
            
            await page.waitForTimeout(500);
          }
        }
        
        if (destination === skiDestinations[0]) {
          // Only search for the first destination to avoid too many requests
          const searchButton = page.locator('button:has-text("Verbindungen suchen"), button:has-text("Search connections")').first();
          const hasSearchButton = await searchButton.isVisible().catch(() => false);
          
          if (hasSearchButton) {
            await searchButton.click();
            actions.logTestInfo(`🔍 Searching connections to ${destination}...`);
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    await actions.step('🎫 Look for Ski Pass Combinations', async () => {
      // Look for ski pass and transport combinations
      const skiPassInfo = await page.evaluate(() => {
        const results = {
          skiPassMentioned: false,
          combiTickets: false,
          skiPassPartners: [] as string[],
          foundCombinations: [] as string[]
        };
        
        const bodyText = document.body.textContent || '';
        
        // Look for ski pass mentions
        const skiPassKeywords = ['Skipass', 'Ski pass', 'Tageskarte', 'Day pass'];
        results.skiPassMentioned = skiPassKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Look for combination tickets
        const combiKeywords = ['Kombi', 'Combination', 'Package', 'Bundle', 'inclusive'];
        results.combiTickets = combiKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Look for ski area partners
        const skiAreas = [
          'Davos Klosters', 'Engadin St. Moritz', 'Zermatt Matterhorn',
          'Jungfrau', 'Verbier', 'Andermatt', 'Saas-Fee'
        ];
        skiAreas.forEach(area => {
          if (bodyText.includes(area)) {
            results.skiPassPartners.push(area);
          }
        });
        
        // Look for specific combination offers
        const combiElements = document.querySelectorAll('*');
        combiElements.forEach(element => {
          const text = element.textContent || '';
          if (text.toLowerCase().includes('ski') && 
              text.toLowerCase().includes('bahn') && 
              text.length < 150) {
            results.foundCombinations.push(text.trim());
          }
        });
        
        return results;
      });
      
      actions.logTestInfo('🎫 Ski pass integration analysis:');
      actions.logTestInfo(`  Ski pass mentioned: ${skiPassInfo.skiPassMentioned ? '✅' : '❌'}`);
      actions.logTestInfo(`  Combination tickets: ${skiPassInfo.combiTickets ? '✅' : '❌'}`);
      
      if (skiPassInfo.skiPassPartners.length > 0) {
        actions.logTestInfo(`  Partner ski areas: ${skiPassInfo.skiPassPartners.join(', ')}`);
      }
      
      if (skiPassInfo.foundCombinations.length > 0) {
        actions.logTestInfo('🎿 Found ski combinations:');
        skiPassInfo.foundCombinations.slice(0, 3).forEach((combo, index) => {
          actions.logTestInfo(`  ${index + 1}. ${combo}`);
        });
      }
      
      await actions.screenshot('ski-pass-info', 'Ski pass and combination information');
    });

    await actions.step('🌅 Test Summer Season Offers', async () => {
      // Look for summer-specific content and offers
      const summerOffers = await page.evaluate(() => {
        const results = {
          hikingMentioned: false,
          lakesAndMountains: false,
          outdoorActivities: false,
          summerCards: false,
          foundSummerOffers: [] as string[]
        };
        
        const bodyText = document.body.textContent || '';
        
        // Look for hiking mentions
        const hikingKeywords = ['Wandern', 'Hiking', 'Wanderung', 'Trail'];
        results.hikingMentioned = hikingKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Look for lakes and mountains
        const landscapeKeywords = [
          'See', 'Lake', 'Berg', 'Mountain', 'Gipfel', 'Summit',
          'Alpen', 'Alps', 'Panorama', 'Aussicht'
        ];
        results.lakesAndMountains = landscapeKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Look for outdoor activities
        const outdoorKeywords = [
          'Outdoor', 'Fahrrad', 'Bike', 'Klettern', 'Climbing',
          'Paragliding', 'Rafting', 'Swimming', 'Schwimmen'
        ];
        results.outdoorActivities = outdoorKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Look for summer travel cards
        const summerCardKeywords = ['Sommerkarte', 'Summer card', 'Freizeitkarte'];
        results.summerCards = summerCardKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Extract summer-specific offers
        const summerElements = document.querySelectorAll('*');
        summerElements.forEach(element => {
          const text = element.textContent || '';
          if ((text.toLowerCase().includes('sommer') || text.toLowerCase().includes('summer')) && 
              text.length > 20 && text.length < 120) {
            results.foundSummerOffers.push(text.trim());
          }
        });
        
        return results;
      });
      
      actions.logTestInfo('🌅 Summer offers analysis:');
      actions.logTestInfo(`  Hiking mentioned: ${summerOffers.hikingMentioned ? '✅' : '❌'}`);
      actions.logTestInfo(`  Lakes & mountains: ${summerOffers.lakesAndMountains ? '✅' : '❌'}`);
      actions.logTestInfo(`  Outdoor activities: ${summerOffers.outdoorActivities ? '✅' : '❌'}`);
      actions.logTestInfo(`  Summer cards: ${summerOffers.summerCards ? '✅' : '❌'}`);
      
      if (summerOffers.foundSummerOffers.length > 0) {
        actions.logTestInfo('🌞 Found summer offers:');
        summerOffers.foundSummerOffers.slice(0, 3).forEach((offer, index) => {
          actions.logTestInfo(`  ${index + 1}. ${offer}`);
        });
      }
    });

    await actions.step('🎊 Check Holiday and Event Specials', async () => {
      // Look for holiday and event-specific offers
      const holidaySpecials = await page.evaluate(() => {
        const results = {
          christmasOffers: false,
          newYearOffers: false,
          easterOffers: false,
          schoolHolidays: false,
          eventTransport: false,
          festivalConnections: false
        };
        
        const bodyText = document.body.textContent || '';
        
        // Holiday keywords
        const christmasKeywords = ['Weihnacht', 'Christmas', 'Advent', 'Festtage'];
        results.christmasOffers = christmasKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        const newYearKeywords = ['Neujahr', 'New Year', 'Silvester', 'Jahreswechsel'];
        results.newYearOffers = newYearKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        const easterKeywords = ['Ostern', 'Easter', 'Osterferien'];
        results.easterOffers = easterKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // School holiday keywords
        const schoolKeywords = ['Schulferien', 'School holidays', 'Ferienzeit'];
        results.schoolHolidays = schoolKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Event transport keywords
        const eventKeywords = ['Event', 'Festival', 'Konzert', 'Concert', 'Veranstaltung'];
        results.eventTransport = eventKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Festival connections
        const festivalKeywords = ['Montreux', 'Lucerne Festival', 'Locarno', 'Basel Art'];
        results.festivalConnections = festivalKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        return results;
      });
      
      actions.logTestInfo('🎊 Holiday & event specials:');
      actions.logTestInfo(`  Christmas offers: ${holidaySpecials.christmasOffers ? '✅' : '❌'}`);
      actions.logTestInfo(`  New Year offers: ${holidaySpecials.newYearOffers ? '✅' : '❌'}`);
      actions.logTestInfo(`  Easter offers: ${holidaySpecials.easterOffers ? '✅' : '❌'}`);
      actions.logTestInfo(`  School holidays: ${holidaySpecials.schoolHolidays ? '✅' : '❌'}`);
      actions.logTestInfo(`  Event transport: ${holidaySpecials.eventTransport ? '✅' : '❌'}`);
      actions.logTestInfo(`  Festival connections: ${holidaySpecials.festivalConnections ? '✅' : '❌'}`);
    });

    await actions.step('📋 Seasonal Testing Summary', async () => {
      actions.logTestInfo('📋 Seasonal Offers Test Summary:');
      actions.logTestInfo('  🎿 Winter sports destinations and ski pass combinations');
      actions.logTestInfo('  🌅 Summer hiking and outdoor activity offers');
      actions.logTestInfo('  🎊 Holiday and event-specific transport specials');
      actions.logTestInfo('  🎁 Promotional content and seasonal campaigns');
      actions.logTestInfo('  🏔️ Alpine destination accessibility testing');
      
      await actions.screenshot('seasonal-summary', 'Complete seasonal offers overview');
    });
  });
});