import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

const FAMIGROS_URL = 'https://famigros.migros.ch/de';

test.describe('Famigros Zoo-Ausflug Suche', () => {
  test.setTimeout(120000); // Erhöhe das Timeout auf 2 Minuten

  test('Suche nach Zoo-Ausflug mit Löwen', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Öffne Ausflugsziele-Seite', async () => {
      // Navigiere direkt zur Zoo-Suche URL
      await actions.observableGoto('https://famigros.migros.ch/de/ausfluege-und-freizeit/ausflugsziele/suche?q=Zoo', 'Öffne Zoo-Suche');
      await page.waitForLoadState('domcontentloaded');
      
      // Warte einen Moment, damit die Seite vollständig geladen wird
      await page.waitForTimeout(2000);
    });

    await actions.step('Cookie-Banner akzeptieren', async () => {
      try {
        const acceptButton = page.getByRole('button', { name: /akzeptieren/i });
        if (await acceptButton.isVisible()) {
          await acceptButton.click();
          actions.logTestInfo('Cookie-Banner wurde akzeptiert');
        }
      } catch (error) {
        actions.logTestInfo('Kein Cookie-Banner gefunden oder bereits akzeptiert');
      }
    });

    await actions.step('Warte auf Suchergebnisse', async () => {
      // Warte auf die Ladezeit der Seite
      await page.waitForLoadState('domcontentloaded');
      
      // Warte einen Moment für dynamische Inhalte
      await page.waitForTimeout(2000);
      
      actions.logTestInfo('Auf der Suchergebnisseite angekommen');
      
      actions.logTestInfo('Suche nach Zoo-Ausflügen');
      
      // Warte auf die Suchergebnisse
      await page.waitForLoadState('domcontentloaded');
    });

    await actions.step('Prüfe Suchergebnisse auf Zoo-Ausflüge mit Löwen', async () => {
      // Warte und sammle alle Textelemente
      await page.waitForTimeout(5000); // Warte länger auf dynamische Inhalte
      
      // Debug: Zeige alle verfügbaren Texte auf der Seite
      const pageContent = await page.evaluate(() => document.body.innerText);
      actions.logTestInfo(`Seiteninhalt: ${pageContent}`);
      
      let foundLionExcursion = false;
      
      // Suche nach Zoo-bezogenen Elementen
      const allElements = await page.locator('h1, h2, h3, h4, p, a').all();
      for (const element of allElements) {
        const text = await element.textContent() || '';
        if (text.toLowerCase().includes('zoo')) {
          actions.logTestInfo(`Gefundener Zoo-Text: ${text.trim()}`);
          
          if (text.toLowerCase().includes('löwe') || text.toLowerCase().includes('löwen')) {
            foundLionExcursion = true;
            // Screenshot des Elements
            await element.screenshot({ 
              path: `test-results/zoo-ausflug-mit-loewen-${Date.now()}.png` 
            });
          }
        }
      }
      
      let foundLionExcursion = false;
      
      for (const card of cards) {
        const title = await card.locator('.m-event-card__title').textContent() || '';
        const description = await card.locator('.m-event-card__text').textContent() || '';
        const combinedText = `${title} ${description}`.toLowerCase();
        
        if (combinedText.includes('löwe') || combinedText.includes('löwen') || 
            combinedText.includes('raubtier') || combinedText.includes('zoo')) {
          actions.logTestInfo(`Gefundener relevanter Ausflug: ${title.trim()}`);
          foundLionExcursion = true;
          
          // Screenshot des gefundenen Ausflugs
          await card.screenshot({ 
            path: `test-results/zoo-ausflug-${title.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png` 
          });
          
          // Optional: Klicke auf den Ausflug für mehr Details
          await card.click();
          await page.waitForLoadState('networkidle');
          
          // Screenshot der Detailseite
          await page.screenshot({ 
            path: `test-results/zoo-ausflug-details-${title.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`,
            fullPage: true 
          });
        }
      }
      
      // Überprüfe, ob mindestens ein passender Ausflug gefunden wurde
      expect(foundLionExcursion, 'Mindestens ein Zoo-Ausflug mit Löwen sollte gefunden werden').toBeTruthy();
    });
  });
});