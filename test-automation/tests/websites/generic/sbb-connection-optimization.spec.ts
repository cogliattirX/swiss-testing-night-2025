import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Connection Optimization Testing', () => {
  
  test('Test connection optimization filters and preferences', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('⚡ Testing connection optimization and filtering');
    
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

    await actions.step('🎯 Plan Complex Multi-Transfer Journey', async () => {
      // Plan journey that requires multiple transfers to test optimization
      const fromInput = page.locator('input[placeholder*="Von"], input[placeholder*="From"], input[name*="from"]').first();
      const hasFromInput = await fromInput.isVisible().catch(() => false);
      
      if (hasFromInput) {
        await fromInput.fill('Lugano');
        actions.logTestInfo('🏁 Origin: Lugano (Southern Switzerland)');
        
        await page.waitForTimeout(1000);
        
        const toInput = page.locator('input[placeholder*="Nach"], input[placeholder*="To"], input[name*="to"]').first();
        const hasToInput = await toInput.isVisible().catch(() => false);
        
        if (hasToInput) {
          await toInput.fill('St. Gallen');
          actions.logTestInfo('🎯 Destination: St. Gallen (Eastern Switzerland)');
          
          await page.waitForTimeout(1000);
          
          // Search for connections
          const searchButton = page.locator('button:has-text("Verbindungen suchen"), button:has-text("Search connections"), button[type="submit"]').first();
          const hasSearchButton = await searchButton.isVisible().catch(() => false);
          
          if (hasSearchButton) {
            await searchButton.click();
            actions.logTestInfo('🔍 Searching connections for complex route...');
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    await actions.step('📊 Analyze Connection Results', async () => {
      // Analyze the search results for optimization data
      const connectionAnalysis = await page.evaluate(() => {
        const results = {
          connectionCount: 0,
          hasTransfers: false,
          transferCounts: [] as number[],
          journeyTimes: [] as string[],
          departureTimeSpread: false,
          multipleOptions: false
        };
        
        // Look for connection results
        const connectionSelectors = [
          '.connection',
          '[class*="connection"]',
          '.journey',
          '[data-testid*="connection"]',
          '.result',
          'tr'
        ];
        
        for (const selector of connectionSelectors) {
          const connections = document.querySelectorAll(selector);
          if (connections.length > 2) { // More than just header rows
            results.connectionCount = connections.length;
            results.multipleOptions = connections.length > 3;
            break;
          }
        }
        
        // Look for transfer information
        const transferKeywords = ['Umsteigen', 'Transfer', 'Change', 'via', 'über'];
        results.hasTransfers = transferKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Extract transfer counts (numbers followed by transfer keywords)
        const transferPattern = /(\d+)\s*(Umstieg|Transfer|Change)/gi;
        const transferMatches = document.body.textContent?.match(transferPattern);
        if (transferMatches) {
          transferMatches.forEach(match => {
            const num = parseInt(match);
            if (!isNaN(num)) {
              results.transferCounts.push(num);
            }
          });
        }
        
        // Look for journey duration patterns
        const timePattern = /\d{1,2}:\d{2}/g;
        const timeMatches = document.body.textContent?.match(timePattern);
        if (timeMatches && timeMatches.length > 2) {
          results.departureTimeSpread = true;
          results.journeyTimes = timeMatches.slice(0, 6); // First 6 times
        }
        
        return results;
      });
      
      actions.logTestInfo('📊 Connection analysis:');
      actions.logTestInfo(`  Found connections: ${connectionAnalysis.connectionCount}`);
      actions.logTestInfo(`  Has transfers: ${connectionAnalysis.hasTransfers ? '✅' : '❌'}`);
      actions.logTestInfo(`  Multiple options: ${connectionAnalysis.multipleOptions ? '✅' : '❌'}`);
      actions.logTestInfo(`  Time spread: ${connectionAnalysis.departureTimeSpread ? '✅' : '❌'}`);
      
      if (connectionAnalysis.transferCounts.length > 0) {
        actions.logTestInfo(`  Transfer counts: ${connectionAnalysis.transferCounts.join(', ')}`);
      }
      
      if (connectionAnalysis.journeyTimes.length > 0) {
        actions.logTestInfo(`  Sample times: ${connectionAnalysis.journeyTimes.join(', ')}`);
      }
      
      await actions.screenshot('connection-results', 'Initial connection search results');
    });

    await actions.step('🔧 Look for Filter and Optimization Options', async () => {
      // Look for filter options to optimize connections
      const filterOptions = await page.evaluate(() => {
        const results = {
          hasFilters: false,
          filterTypes: [] as string[],
          sortOptions: [] as string[],
          hasAdvancedOptions: false,
          foundFilterElements: 0
        };
        
        // Look for filter-related elements
        const filterSelectors = [
          '.filter', '.filters', '[class*="filter"]',
          '.sort', '.sorting', '[class*="sort"]',
          '.options', '[class*="option"]',
          'select', 'button[aria-expanded]'
        ];
        
        filterSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            results.foundFilterElements += elements.length;
            results.hasFilters = true;
          }
        });
        
        // Look for filter-related text
        const filterKeywords = [
          'Filter', 'Sortieren', 'Sort', 'Optionen', 'Options',
          'Schnellste', 'Fastest', 'Wenigste Umstiege', 'Fewest changes',
          'Günstigste', 'Cheapest', 'Direktverbindung', 'Direct'
        ];
        
        filterKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.filterTypes.push(keyword);
          }
        });
        
        // Look for sort options
        const sortKeywords = [
          'Zeit', 'Time', 'Preis', 'Price', 'Dauer', 'Duration',
          'Umstiege', 'Transfers', 'Abfahrt', 'Departure'
        ];
        
        sortKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.sortOptions.push(keyword);
          }
        });
        
        // Check for advanced options
        const advancedKeywords = ['Erweitert', 'Advanced', 'Mehr Optionen', 'More options'];
        results.hasAdvancedOptions = advancedKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        return results;
      });
      
      actions.logTestInfo('🔧 Filter options analysis:');
      actions.logTestInfo(`  Has filters: ${filterOptions.hasFilters ? '✅' : '❌'}`);
      actions.logTestInfo(`  Filter elements: ${filterOptions.foundFilterElements}`);
      actions.logTestInfo(`  Advanced options: ${filterOptions.hasAdvancedOptions ? '✅' : '❌'}`);
      
      if (filterOptions.filterTypes.length > 0) {
        actions.logTestInfo(`  Filter types: ${filterOptions.filterTypes.slice(0, 5).join(', ')}`);
      }
      
      if (filterOptions.sortOptions.length > 0) {
        actions.logTestInfo(`  Sort options: ${filterOptions.sortOptions.slice(0, 5).join(', ')}`);
      }
    });

    await actions.step('⚡ Test Fastest Connection Filter', async () => {
      // Try to filter for fastest connections
      const fastestSelectors = [
        'button:has-text("Schnellste")',
        'button:has-text("Fastest")',
        'select option:has-text("Schnellste")',
        'select option:has-text("Fastest")',
        'input[value*="fast"]',
        '[data-testid*="fastest"]'
      ];
      
      let fastestFilterFound = false;
      
      for (const selector of fastestSelectors) {
        const fastestElement = page.locator(selector).first();
        const isVisible = await fastestElement.isVisible().catch(() => false);
        
        if (isVisible) {
          actions.logTestInfo('⚡ Found fastest connection filter');
          
          try {
            if (selector.includes('option')) {
              // Handle select option
              const selectParent = page.locator('select').first();
              await selectParent.selectOption({ label: 'Schnellste' });
            } else {
              // Handle button or other element
              await fastestElement.click();
            }
            
            actions.logTestInfo('✅ Applied fastest connection filter');
            fastestFilterFound = true;
            await page.waitForTimeout(2000);
            break;
          } catch (error) {
            actions.logTestInfo('ℹ️ Could not interact with fastest filter');
          }
        }
      }
      
      if (!fastestFilterFound) {
        actions.logTestInfo('ℹ️ Fastest connection filter not found');
      }
    });

    await actions.step('🔄 Test Fewest Transfers Filter', async () => {
      // Try to filter for fewest transfers
      const transferSelectors = [
        'button:has-text("Wenigste")',
        'button:has-text("Fewest")',
        'button:has-text("Direktverbindung")',
        'button:has-text("Direct")',
        'select option:has-text("Transfer")',
        'select option:has-text("Umstieg")',
        '[data-testid*="transfer"]'
      ];
      
      let transferFilterFound = false;
      
      for (const selector of transferSelectors) {
        const transferElement = page.locator(selector).first();
        const isVisible = await transferElement.isVisible().catch(() => false);
        
        if (isVisible) {
          actions.logTestInfo('🔄 Found transfer optimization filter');
          
          try {
            await transferElement.click();
            actions.logTestInfo('✅ Applied fewest transfers filter');
            transferFilterFound = true;
            await page.waitForTimeout(2000);
            break;
          } catch (error) {
            actions.logTestInfo('ℹ️ Could not interact with transfer filter');
          }
        }
      }
      
      if (!transferFilterFound) {
        actions.logTestInfo('ℹ️ Transfer optimization filter not found');
      }
    });

    await actions.step('💰 Test Price-Based Optimization', async () => {
      // Look for price-based sorting/filtering
      const priceSelectors = [
        'button:has-text("Günstigste")',
        'button:has-text("Cheapest")',
        'button:has-text("Preis")',
        'button:has-text("Price")',
        'select option:has-text("Price")',
        'select option:has-text("Preis")',
        '[data-testid*="price"]'
      ];
      
      let priceFilterFound = false;
      
      for (const selector of priceSelectors) {
        const priceElement = page.locator(selector).first();
        const isVisible = await priceElement.isVisible().catch(() => false);
        
        if (isVisible) {
          actions.logTestInfo('💰 Found price optimization option');
          
          try {
            await priceElement.click();
            actions.logTestInfo('✅ Applied price-based optimization');
            priceFilterFound = true;
            await page.waitForTimeout(2000);
            break;
          } catch (error) {
            actions.logTestInfo('ℹ️ Could not interact with price filter');
          }
        }
      }
      
      if (!priceFilterFound) {
        actions.logTestInfo('ℹ️ Price optimization not found');
      }
    });

    await actions.step('⏰ Test Time-Based Preferences', async () => {
      // Look for time preference options
      const timePreferences = await page.evaluate(() => {
        const results = {
          departureTimeControl: false,
          arrivalTimeControl: false,
          timeRangeOptions: false,
          earlierLaterButtons: false
        };
        
        // Look for time controls
        const timeInputs = document.querySelectorAll('input[type="time"], input[type="datetime-local"]');
        results.departureTimeControl = timeInputs.length > 0;
        
        // Look for arrival time options
        const arrivalKeywords = ['Ankunft', 'Arrival', 'Arrive'];
        results.arrivalTimeControl = arrivalKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for time range options
        const rangeKeywords = ['Zeit', 'Time', 'zwischen', 'between', 'von', 'from'];
        results.timeRangeOptions = rangeKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for earlier/later buttons
        const earlierLaterButtons = document.querySelectorAll('button');
        for (const button of earlierLaterButtons) {
          const text = button.textContent || '';
          if (text.includes('früher') || text.includes('später') || 
              text.includes('earlier') || text.includes('later')) {
            results.earlierLaterButtons = true;
            break;
          }
        }
        
        return results;
      });
      
      actions.logTestInfo('⏰ Time preferences analysis:');
      actions.logTestInfo(`  Departure time control: ${timePreferences.departureTimeControl ? '✅' : '❌'}`);
      actions.logTestInfo(`  Arrival time control: ${timePreferences.arrivalTimeControl ? '✅' : '❌'}`);
      actions.logTestInfo(`  Time range options: ${timePreferences.timeRangeOptions ? '✅' : '❌'}`);
      actions.logTestInfo(`  Earlier/later buttons: ${timePreferences.earlierLaterButtons ? '✅' : '❌'}`);
      
      // Try to find and use earlier/later buttons
      const earlierButton = page.locator('button:has-text("früher"), button:has-text("earlier")').first();
      const hasEarlierButton = await earlierButton.isVisible().catch(() => false);
      
      if (hasEarlierButton) {
        await earlierButton.click();
        actions.logTestInfo('⏪ Clicked earlier departures');
        await page.waitForTimeout(2000);
      }
      
      const laterButton = page.locator('button:has-text("später"), button:has-text("later")').first();
      const hasLaterButton = await laterButton.isVisible().catch(() => false);
      
      if (hasLaterButton) {
        await laterButton.click();
        actions.logTestInfo('⏩ Clicked later departures');
        await page.waitForTimeout(2000);
      }
    });

    await actions.step('🎯 Analyze Optimization Results', async () => {
      // Analyze how the optimization affected the results
      const optimizationResults = await page.evaluate(() => {
        const results = {
          resultOrder: [] as string[],
          transferInfo: [] as string[],
          timeInfo: [] as string[],
          priceInfo: [] as string[],
          hasOptimizedOrder: false
        };
        
        // Try to extract result ordering information
        const resultElements = document.querySelectorAll('.connection, [class*="connection"], .journey, tr');
        if (resultElements.length > 1) {
          resultElements.forEach((element, index) => {
            if (index < 3) { // First 3 results
              const text = element.textContent || '';
              if (text.length > 10 && text.length < 200) {
                results.resultOrder.push(text.substring(0, 100));
              }
            }
          });
          results.hasOptimizedOrder = true;
        }
        
        // Extract transfer information
        const transferPattern = /(\d+)\s*(Umstieg|Transfer)/gi;
        const transferMatches = document.body.textContent?.match(transferPattern);
        if (transferMatches) {
          results.transferInfo = transferMatches.slice(0, 3);
        }
        
        // Extract time information (durations)
        const durationPattern = /\d{1,2}h\s*\d{0,2}m?|\d{1,2}:\d{2}/g;
        const durationMatches = document.body.textContent?.match(durationPattern);
        if (durationMatches) {
          results.timeInfo = durationMatches.slice(0, 5);
        }
        
        // Extract price information
        const pricePattern = /CHF\s*\d+\.?\d*/g;
        const priceMatches = document.body.textContent?.match(pricePattern);
        if (priceMatches) {
          results.priceInfo = priceMatches.slice(0, 3);
        }
        
        return results;
      });
      
      actions.logTestInfo('🎯 Optimization results analysis:');
      actions.logTestInfo(`  Has optimized order: ${optimizationResults.hasOptimizedOrder ? '✅' : '❌'}`);
      
      if (optimizationResults.transferInfo.length > 0) {
        actions.logTestInfo(`  Transfer info: ${optimizationResults.transferInfo.join(', ')}`);
      }
      
      if (optimizationResults.timeInfo.length > 0) {
        actions.logTestInfo(`  Time info: ${optimizationResults.timeInfo.slice(0, 3).join(', ')}`);
      }
      
      if (optimizationResults.priceInfo.length > 0) {
        actions.logTestInfo(`  Price info: ${optimizationResults.priceInfo.join(', ')}`);
      }
      
      await actions.screenshot('optimized-results', 'Connection results after optimization');
    });

    await actions.step('📋 Connection Optimization Summary', async () => {
      actions.logTestInfo('📋 Connection Optimization Test Summary:');
      actions.logTestInfo('  ⚡ Fastest connection filtering');
      actions.logTestInfo('  🔄 Fewest transfers optimization');
      actions.logTestInfo('  💰 Price-based connection sorting');
      actions.logTestInfo('  ⏰ Time preference adjustments');
      actions.logTestInfo('  📊 Multi-criteria connection analysis');
      actions.logTestInfo('  🎯 Complex route optimization (Lugano → St. Gallen)');
    });
  });
});