import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../test-helpers/observability';

/**
 * 🎓 WORKSHOP LIVE-DEMO: Einfacher Saucedemo Login Test
 * 
 * Persona: 👨‍💻 Test Implementation Engineer
 * Ziel: Demonstration des Observability Frameworks für Workshop-Teilnehmer
 * Besonderheiten: 
 * - Langsame, gut verfolgbare Ausführung im Workshop-Mode
 * - Beschreibende Logging-Nachrichten für Live-Demo
 * - Step-basierte Organisation für bessere Verständlichkeit
 * - Visuelle Hervorhebung von Elementen
 */

test.describe('🎓 Workshop Demo: Saucedemo Login', () => {
  test('Einfacher Login-Workflow für Live-Demonstration', async ({ page }) => {
    console.log('\n🚀 === WORKSHOP LIVE-DEMO STARTET ===');
    console.log('🎯 Ziel: Erfolgreiche Anmeldung bei Saucedemo');
    console.log('🛠️  Framework: Playwright + Observability Framework');
    console.log('👀 Modus: Workshop (langsame, sichtbare Ausführung)\n');

    // Erstelle Observable Actions für Workshop-Demo
    const actions = createObservableActions(page);
    
    await actions.step('🌐 Website Navigation', async () => {
      actions.logTestInfo('Navigiere zur Saucedemo Website...');
      await actions.observableGoto('https://www.saucedemo.com', 'Öffne Saucedemo Homepage');
      
      // Verifiziere, dass wir auf der Login-Seite sind
      await actions.observableExpect(async () => {
        await expect(page.locator('.login_logo')).toBeVisible();
        await expect(page.locator('#login-button')).toBeVisible();
      }, 'Prüfe Login-Seite ist geladen');
      
      actions.logTestInfo('✅ Login-Seite erfolgreich geladen!');
    });

    await actions.step('👤 Benutzer-Anmeldedaten eingeben', async () => {
      actions.logTestInfo('Gebe Standard-Benutzer Anmeldedaten ein...');
      
      // Benutzername eingeben
      await actions.observableFill(
        '#user-name', 
        'standard_user', 
        'Trage Benutzername "standard_user" ein'
      );
      
      // Passwort eingeben  
      await actions.observableFill(
        '#password', 
        'secret_sauce', 
        'Trage Passwort "secret_sauce" ein'
      );
      
      actions.logTestInfo('✅ Alle Anmeldedaten erfolgreich eingegeben!');
    });

    await actions.step('🔐 Login durchführen', async () => {
      actions.logTestInfo('Führe Login durch...');
      
      // Login-Button klicken
      await actions.observableClick(
        '#login-button', 
        'Klicke auf Login-Button'
      );
      
      // Warte auf Weiterleitung zur Inventory-Seite
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/.*inventory.html/);
      }, 'Prüfe Weiterleitung zur Produktseite');
      
      actions.logTestInfo('✅ Login erfolgreich durchgeführt!');
    });

    await actions.step('✅ Erfolgreiche Anmeldung verifizieren', async () => {
      actions.logTestInfo('Verifiziere erfolgreiche Anmeldung...');
      
      // Prüfe Produktseiten-Titel
      await actions.observableExpect(async () => {
        await expect(page.locator('.title')).toHaveText('Products');
      }, 'Prüfe "Products" Titel ist sichtbar');
      
      // Prüfe Hamburger-Menü (zeigt erfolgreiche Anmeldung)
      await actions.observableExpect(async () => {
        await expect(page.locator('#react-burger-menu-btn')).toBeVisible();
      }, 'Prüfe Burger-Menü ist verfügbar');
      
      // Prüfe Shopping-Cart ist verfügbar
      await actions.observableExpect(async () => {
        await expect(page.locator('.shopping_cart_link')).toBeVisible();
      }, 'Prüfe Shopping-Cart ist verfügbar');
      
      actions.logTestInfo('✅ Alle Verifikationen erfolgreich!');
    });

    // Screenshot für Workshop-Dokumentation
    await actions.screenshot('workshop-demo-login-success', 'Erfolgreiche Anmeldung dokumentieren');
    
    console.log('\n🎉 === WORKSHOP LIVE-DEMO ERFOLGREICH ABGESCHLOSSEN ===');
    console.log('📊 Ergebnis: Login-Workflow funktioniert einwandfrei');
    console.log('🎓 Lernziel erreicht: Observability Framework demonstriert');
    console.log('👥 Für Teilnehmer: Test ist nachvollziehbar und verständlich\n');
  });

  test('🔧 Bonus Demo: Error Handling Demonstration', async ({ page }) => {
    console.log('\n🚨 === BONUS DEMO: ERROR HANDLING ===');
    console.log('🎯 Ziel: Demonstration von Fehlerbehandlung');
    
    const actions = createObservableActions(page);
    
    await actions.step('🌐 Website öffnen', async () => {
      await actions.observableGoto('https://www.saucedemo.com', 'Öffne Saucedemo für Error-Demo');
    });

    await actions.step('❌ Bewusst falschen Login versuchen', async () => {
      actions.logTestInfo('Teste absichtlich mit falschen Anmeldedaten...');
      
      await actions.observableFill('#user-name', 'wrong_user', 'Falscher Benutzername');
      await actions.observableFill('#password', 'wrong_password', 'Falsches Passwort');
      await actions.observableClick('#login-button', 'Login versuchen');
      
      // Prüfe Fehlermeldung
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="error"]')).toBeVisible();
        await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
      }, 'Prüfe Fehlermeldung wird angezeigt');
      
      actions.logTestInfo('✅ Fehlerbehandlung funktioniert korrekt!');
    });
    
    console.log('🎓 Lernziel: Auch Fehlerfälle sollten getestet werden!\n');
  });
});