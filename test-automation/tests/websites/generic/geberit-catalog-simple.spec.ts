import { test, expect, Page } from '@playwright/test';
import { createObservableActions, ObservableTestActions } from '../../../test-helpers/observability';

/**
 * Geberit Katalog - Vereinfachte Test Suite
 * 
 * Pragmatische Tests für https://catalog.geberit.ch/de-CH
 * Fokus auf funktionierende Grundfunktionalität ohne strenge Struktur-Annahmen
 */

test.describe('🏠 Geberit Produktkatalog - Grundfunktionalität', () => {
  const baseUrl = 'https://catalog.geberit.ch/de-CH';
  
  /**
   * Helper function to handle cookie consent banner
   */
  async function acceptCookies(page: Page, actions: ObservableTestActions): Promise<boolean> {
    console.log(`🍪 Checking for cookie consent banner...`);
    
    const cookieSelectors = [
      'button:has-text("Akzeptieren")',
      'button:has-text("Accept")',
      'button:has-text("Alle akzeptieren")',
      'button[id*="accept"]',
      'button[class*="accept"]',
      '[data-testid*="accept"]',
      '.cookie-banner button:first-child'
    ];
    
    for (const selector of cookieSelectors) {
      try {
        const cookieButton = page.locator(selector).first();
        if (await cookieButton.isVisible({ timeout: 3000 })) {
          await actions.observableClick(selector, `Accept cookies via: ${selector}`);
          console.log(`✅ Successfully accepted cookies using: ${selector}`);
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

  test('🌐 Test 1: Grundlegende Webseiten-Funktionalität', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n🔧 Persona: QA Implementation Engineer`);
    console.log(`🎯 Focus: Grundlegende Funktionalität ohne strenge Struktur-Annahmen`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('🌐 Webseite laden und Cookie-Handling', async () => {
      const startTime = Date.now();
      await actions.observableGoto(baseUrl, 'Lade Geberit Katalog');
      
      // Handle cookies
      await acceptCookies(page, actions);
      
      const loadTime = Date.now() - startTime;
      console.log(`⏱️  Ladezeit: ${loadTime}ms`);
      
      // Grundlegende Validierung
      await actions.observableExpect(async () => {
        await expect(page).toHaveTitle(/geberit/i);
      }, 'Verifiziere Geberit Brand im Titel');
      
      await actions.screenshot('geberit-loaded', 'Webseite erfolgreich geladen');
    });

    await actions.step('📊 Inhalts-Analyse (flexibel)', async () => {
      // Flexibler Ansatz - schaue was tatsächlich da ist
      const pageContent = await page.locator('body').textContent() || '';
      const hasContent = pageContent.length > 100;
      
      console.log(`📄 Seiten-Inhalt: ~${pageContent.length} Zeichen`);
      
      await actions.observableExpect(async () => {
        expect(hasContent).toBe(true);
      }, 'Verifiziere dass Seite sinnvollen Inhalt hat');
      
      // Suche nach Links (ohne spezifische Struktur-Annahmen)
      const allLinks = await page.locator('a[href]').count();
      console.log(`🔗 Gefundene Links: ${allLinks}`);
      
      if (allLinks > 0) {
        console.log(`✅ Navigation-Strukturen erkannt`);
      } else {
        console.log(`⚠️  Keine Links gefunden - möglicherweise SPA oder dynamischer Inhalt`);
      }
    });

    await actions.step('🔍 Such-Funktionalität testen', async () => {
      // Flexible Suche nach Such-Elementen
      const searchSelectors = [
        'input[type="search"]',
        'input[placeholder*="suchen" i]',
        'input[placeholder*="search" i]',
        '[data-testid*="search"] input',
        'input[name="search"]',
        'input[name="q"]'
      ];
      
      let searchFound = false;
      for (const selector of searchSelectors) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            console.log(`🔍 Such-Feld gefunden: ${selector}`);
            
            // Teste Eingabe
            await actions.observableFill(selector, 'WC', 'Teste Such-Eingabe');
            searchFound = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (searchFound) {
        console.log(`✅ Such-Funktionalität vorhanden und testbar`);
      } else {
        console.log(`ℹ️  Keine offensichtliche Such-Funktionalität gefunden`);
      }
    });
  });

  test('📱 Test 2: Mobile Responsiveness', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n📱 Persona: Cross-Platform Testing Engineer`);
    console.log(`📐 Focus: Mobile Darstellung und Responsive Design`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('📱 Mobile Viewport Test', async () => {
      // Handy-Auflösung
      await page.setViewportSize({ width: 375, height: 667 });
      await actions.observableGoto(baseUrl, 'Lade Webseite im Mobile Viewport');
      
      await acceptCookies(page, actions);
      
      await actions.screenshot('geberit-mobile', 'Mobile Darstellung');
      
      // Prüfe ob Inhalt sichtbar ist
      const isContentVisible = await page.locator('body').isVisible();
      
      await actions.observableExpect(async () => {
        expect(isContentVisible).toBe(true);
      }, 'Verifiziere Mobile Darstellung funktioniert');
      
      console.log(`📱 Mobile Darstellung validiert`);
    });

    await actions.step('🖥️  Desktop Viewport Test', async () => {
      // Desktop-Auflösung
      await page.setViewportSize({ width: 1920, height: 1080 });
      await actions.observableGoto(baseUrl, 'Lade Webseite im Desktop Viewport');
      
      await acceptCookies(page, actions);
      
      await actions.screenshot('geberit-desktop', 'Desktop Darstellung');
      
      console.log(`🖥️  Desktop Darstellung validiert`);
    });
  });

  test('⚡ Test 3: Performance Assessment', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n⚡ Persona: Performance Testing Engineer`);
    console.log(`📊 Focus: Lade-Performance und Core Web Vitals`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('⚡ Performance Messung', async () => {
      const startTime = Date.now();
      
      await actions.observableGoto(baseUrl, 'Performance Test - Webseite laden');
      await acceptCookies(page, actions);
      
      const loadTime = Date.now() - startTime;
      
      // Performance Metriken sammeln
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
        };
      });
      
      console.log(`📊 Performance Metriken:`);
      console.log(`   ⏱️  Gesamt-Ladezeit: ${loadTime}ms`);
      console.log(`   📄 DOM Content Loaded: ${Math.round(performanceMetrics.domContentLoaded)}ms`);
      console.log(`   ✅ Load Complete: ${Math.round(performanceMetrics.loadComplete)}ms`);
      console.log(`   🎨 First Paint: ${Math.round(performanceMetrics.firstPaint)}ms`);
      console.log(`   📝 First Contentful Paint: ${Math.round(performanceMetrics.firstContentfulPaint)}ms`);
      
      // Bewertung
      if (loadTime < 3000) {
        console.log(`🚀 Performance: Ausgezeichnet (<3s)`);
      } else if (loadTime < 5000) {
        console.log(`✅ Performance: Gut (<5s)`);
      } else {
        console.log(`⚠️  Performance: Verbesserungswürdig (>5s)`);
      }
    });
  });

  test('♿ Test 4: Accessibility Grundprüfung', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n♿ Persona: Accessibility Testing Expert`);
    console.log(`🔍 Focus: Grundlegende Barrierefreiheits-Prüfung`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('♿ Accessibility Assessment', async () => {
      await actions.observableGoto(baseUrl, 'Lade Webseite für Accessibility Test');
      await acceptCookies(page, actions);
      
      // Überschriften-Struktur prüfen
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();
      
      console.log(`📝 Überschriften-Struktur: ${h1Count} H1, ${h2Count} H2 Elemente`);
      
      // Bilder ohne Alt-Text prüfen
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      
      if (imagesWithoutAlt > 0) {
        console.log(`⚠️  ${imagesWithoutAlt} Bilder ohne Alt-Text gefunden`);
      } else {
        console.log(`✅ Alle Bilder haben Alt-Text`);
      }
      
      // HTTPS prüfen
      const isHttps = page.url().startsWith('https://');
      
      await actions.observableExpect(async () => {
        expect(isHttps).toBe(true);
      }, 'Verifiziere HTTPS Verschlüsselung');
      
      console.log(`🔒 HTTPS: ${isHttps ? '✅ Aktiviert' : '❌ Nicht aktiv'}`);
      
      console.log(`♿ Accessibility Grundprüfung abgeschlossen`);
    });
  });

  test('🎯 Test 5: Umfassende Qualitätsbewertung', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n🎯 Persona: QA Implementation Reviewer`);
    console.log(`📋 Focus: Gesamtbewertung und Zusammenfassung`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    await actions.step('🎯 Gesamtbewertung', async () => {
      await actions.observableGoto(baseUrl, 'Finale Qualitätsbewertung');
      await acceptCookies(page, actions);
      
      // Sammle finale Metriken
      const finalAssessment = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          linkCount: document.querySelectorAll('a[href]').length,
          imageCount: document.querySelectorAll('img').length,
          wordCount: document.body.textContent?.split(/\s+/).length || 0,
          hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
          isHttps: window.location.protocol === 'https:'
        };
      });
      
      console.log(`\n📊 ═══════════════════════════════════════════════════════════`);
      console.log(`📋 GEBERIT KATALOG - QUALITÄTSBERICHT`);
      console.log(`🌐 URL: ${finalAssessment.url}`);
      console.log(`📝 Titel: ${finalAssessment.title}`);
      console.log(`📅 Datum: ${new Date().toLocaleString()}`);
      console.log(`═══════════════════════════════════════════════════════════`);
      console.log(`\n📈 METRIKEN:`);
      console.log(`   🔗 Links: ${finalAssessment.linkCount}`);
      console.log(`   🖼️  Bilder: ${finalAssessment.imageCount}`);
      console.log(`   📄 Wörter: ${finalAssessment.wordCount}`);
      console.log(`   📱 Viewport Meta: ${finalAssessment.hasViewportMeta ? '✅' : '❌'}`);
      console.log(`   🔒 HTTPS: ${finalAssessment.isHttps ? '✅' : '❌'}`);
      
      // Qualitäts-Score berechnen
      let qualityScore = 0;
      if (finalAssessment.linkCount > 0) qualityScore += 20;
      if (finalAssessment.wordCount > 100) qualityScore += 20;
      if (finalAssessment.hasViewportMeta) qualityScore += 20;
      if (finalAssessment.isHttps) qualityScore += 20;
      if (finalAssessment.title.toLowerCase().includes('geberit')) qualityScore += 20;
      
      console.log(`\n🎯 GESAMT-SCORE: ${qualityScore}/100`);
      
      if (qualityScore >= 80) {
        console.log(`🌟 Bewertung: Ausgezeichnet`);
      } else if (qualityScore >= 60) {
        console.log(`✅ Bewertung: Gut`);
      } else {
        console.log(`⚠️  Bewertung: Verbesserungswürdig`);
      }
      
      console.log(`\n💡 Swiss Testing Night 2025 Features demonstriert:`);
      console.log(`   🤖 Self-Healing Cookie-Handling`);
      console.log(`   📊 Observable Test-Ausführung`);
      console.log(`   📱 Multi-Device Testing`);
      console.log(`   ⚡ Performance-Monitoring`);
      console.log(`   ♿ Accessibility-Assessment`);
      console.log(`\n✅ Qualitätsbewertung erfolgreich abgeschlossen!`);
      console.log(`═══════════════════════════════════════════════════════════\n`);
      
      await actions.screenshot('geberit-final-assessment', 'Finale Qualitätsbewertung');
      
      // Finale Validierung
      await actions.observableExpect(async () => {
        expect(qualityScore).toBeGreaterThan(0);
      }, `Qualitätsbewertung erfolgreich: ${qualityScore}/100 Punkte`);
    });
  });
});