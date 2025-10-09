import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Multilingual Testing', () => {
  
  test('Test language switching and localized content', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🌐 Testing multilingual functionality on SBB.ch');
    
    await actions.step('🎯 Navigate and Setup', async () => {
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

    await actions.step('🇩🇪 Test German Interface (Default)', async () => {
      // Check for German content
      const germanContent = await page.evaluate(() => {
        const germanWords = ['Von', 'Nach', 'Abfahrt', 'Ankunft', 'Suchen', 'Billett'];
        let foundGerman = 0;
        
        germanWords.forEach(word => {
          if (document.body.textContent?.includes(word)) {
            foundGerman++;
          }
        });
        
        return {
          foundWords: foundGerman,
          totalWords: germanWords.length,
          pageLanguage: document.documentElement.lang
        };
      });
      
      actions.logTestInfo(`🇩🇪 German content analysis:`);
      actions.logTestInfo(`  Found ${germanContent.foundWords}/${germanContent.totalWords} German terms`);
      actions.logTestInfo(`  Page language: ${germanContent.pageLanguage}`);
      
      await actions.screenshot('german-interface', 'German interface view');
    });

    await actions.step('🇫🇷 Switch to French', async () => {
      // Look for language switcher
      const languageSelectors = [
        'a[href*="/fr/"]',
        'button[aria-label*="French"]',
        'button[aria-label*="Français"]',
        '[data-testid*="language"]',
        '.language-switcher',
        'a:has-text("FR")',
        'a:has-text("Français")'
      ];
      
      let frenchSwitched = false;
      for (const selector of languageSelectors) {
        const langButton = page.locator(selector).first();
        const isVisible = await langButton.isVisible().catch(() => false);
        
        if (isVisible) {
          await langButton.click();
          actions.logTestInfo('🇫🇷 Switched to French');
          frenchSwitched = true;
          break;
        }
      }
      
      if (frenchSwitched) {
        await page.waitForLoadState('networkidle');
        
        // Check for French content
        const frenchContent = await page.evaluate(() => {
          const frenchWords = ['De', 'À', 'Départ', 'Arrivée', 'Rechercher', 'Billet'];
          let foundFrench = 0;
          
          frenchWords.forEach(word => {
            if (document.body.textContent?.includes(word)) {
              foundFrench++;
            }
          });
          
          return {
            foundWords: foundFrench,
            totalWords: frenchWords.length,
            currentUrl: window.location.href
          };
        });
        
        actions.logTestInfo(`🇫🇷 French content analysis:`);
        actions.logTestInfo(`  Found ${frenchContent.foundWords}/${frenchContent.totalWords} French terms`);
        actions.logTestInfo(`  URL: ${frenchContent.currentUrl}`);
        
        await actions.screenshot('french-interface', 'French interface view');
      } else {
        actions.logTestInfo('ℹ️ French language option not found');
      }
    });

    await actions.step('🇮🇹 Switch to Italian', async () => {
      const italianSelectors = [
        'a[href*="/it/"]',
        'button[aria-label*="Italian"]',
        'button[aria-label*="Italiano"]',
        'a:has-text("IT")',
        'a:has-text("Italiano")'
      ];
      
      let italianSwitched = false;
      for (const selector of italianSelectors) {
        const langButton = page.locator(selector).first();
        const isVisible = await langButton.isVisible().catch(() => false);
        
        if (isVisible) {
          await langButton.click();
          actions.logTestInfo('🇮🇹 Switched to Italian');
          italianSwitched = true;
          break;
        }
      }
      
      if (italianSwitched) {
        await page.waitForLoadState('networkidle');
        
        const italianContent = await page.evaluate(() => {
          const italianWords = ['Da', 'A', 'Partenza', 'Arrivo', 'Cerca', 'Biglietto'];
          let foundItalian = 0;
          
          italianWords.forEach(word => {
            if (document.body.textContent?.includes(word)) {
              foundItalian++;
            }
          });
          
          return foundItalian;
        });
        
        actions.logTestInfo(`🇮🇹 Found ${italianContent} Italian terms`);
        await actions.screenshot('italian-interface', 'Italian interface view');
      } else {
        actions.logTestInfo('ℹ️ Italian language option not found');
      }
    });

    await actions.step('🇬🇧 Test English Language', async () => {
      const englishSelectors = [
        'a[href*="/en/"]',
        'button[aria-label*="English"]',
        'a:has-text("EN")',
        'a:has-text("English")'
      ];
      
      let englishSwitched = false;
      for (const selector of englishSelectors) {
        const langButton = page.locator(selector).first();
        const isVisible = await langButton.isVisible().catch(() => false);
        
        if (isVisible) {
          await langButton.click();
          actions.logTestInfo('🇬🇧 Switched to English');
          englishSwitched = true;
          break;
        }
      }
      
      if (englishSwitched) {
        await page.waitForLoadState('networkidle');
        
        const englishContent = await page.evaluate(() => {
          const englishWords = ['From', 'To', 'Departure', 'Arrival', 'Search', 'Ticket'];
          let foundEnglish = 0;
          
          englishWords.forEach(word => {
            if (document.body.textContent?.includes(word)) {
              foundEnglish++;
            }
          });
          
          return foundEnglish;
        });
        
        actions.logTestInfo(`🇬🇧 Found ${englishContent} English terms`);
        await actions.screenshot('english-interface', 'English interface view');
      } else {
        actions.logTestInfo('ℹ️ English language option not found');
      }
    });
  });
});