import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('Famigros Zoo-Ausflug Finder', () => {
  test.setTimeout(120000); // Erhöhe das Timeout auf 2 Minuten

  test('Finde Zoo-Ausflüge mit Löwen', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Öffne Zoo-Suche', async () => {
      // Navigiere direkt zur Zoo-Suche URL
      await actions.observableGoto('https://famigros.migros.ch/de/ausfluege-und-freizeit/ausflugsziele/suche?q=Zoo', 'Öffne Zoo-Suche');
      await page.waitForLoadState('domcontentloaded');
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

    await actions.step('Analysiere Suchergebnisse', async () => {
      // Warte auf die Ladezeit der Seite
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000); // Warte auf dynamische Inhalte
      
      // Debug: Logge den Seiteninhalt
      const pageContent = await page.evaluate(() => document.body.innerText);
      actions.logTestInfo(`Seiteninhalt: ${pageContent}`);
      
      // Suche nach Zoo-bezogenen Elementen
      const zooMentions = [];
      const allElements = await page.locator('h1, h2, h3, h4, p, a, div').all();
      
      for (const element of allElements) {
        const text = await element.textContent() || '';
        const textLower = text.toLowerCase().trim();
        
        if (textLower.includes('zoo')) {
          zooMentions.push(text.trim());
          actions.logTestInfo(`Gefundener Zoo-Text: ${text.trim()}`);
          
          // Wenn der Text Löwen erwähnt, mache einen Screenshot
          if (textLower.includes('löwe') || textLower.includes('löwen') || 
              textLower.includes('raubtier')) {
            try {
              await element.screenshot({ 
                path: `test-results/zoo-mit-loewen-${zooMentions.length}.png` 
              });
            } catch (error) {
              actions.logTestInfo(`Screenshot fehlgeschlagen: ${error}`);
            }
          }
        }
      }
      
      actions.logTestInfo(`Gefundene Zoo-Erwähnungen: ${zooMentions.length}`);
      
      // Mache einen Screenshot der ganzen Seite
      await page.screenshot({ 
        path: 'test-results/zoo-suche-vollstaendig.png',
        fullPage: true 
      });
      
      // Prüfe, ob wir Zoo-Erwähnungen gefunden haben
      expect(zooMentions.length, 'Mindestens ein Zoo sollte gefunden werden').toBeGreaterThan(0);
      
      // Suche nach Löwen in den gefundenen Texten
      const lionMentions = zooMentions.filter(text => 
        text.toLowerCase().includes('löwe') || 
        text.toLowerCase().includes('löwen') ||
        text.toLowerCase().includes('raubtier')
      );
      
      // Logge alle gefundenen Zoo-Erwähnungen
      actions.logTestInfo('Gefundene Zoo-Texte:');
      zooMentions.forEach((text, index) => {
        actions.logTestInfo(`${index + 1}. ${text}`);
      });
      
      // Erwartung: Mindestens ein Zoo mit Löwen sollte gefunden werden
      expect(lionMentions.length, 'Mindestens ein Zoo mit Löwen sollte gefunden werden').toBeGreaterThan(0);
    });
  });
});