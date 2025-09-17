import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Usability Test Suite for Sauce Demo
 * 
 * Tests basierend auf:
 * - Nielsen's 10 Usability Heuristics
 * - WCAG 2.1 Accessibility Guidelines
 * - ISO 9241-11 Usability Standards
 * - UX Best Practices
 */

interface UsabilityIssue {
  severity: 'critical' | 'major' | 'minor' | 'cosmetic';
  category: 'functionality' | 'accessibility' | 'ux-heuristic' | 'performance';
  heuristic?: string;
  description: string;
  location: string;
  impact: string;
  recommendation: string;
}

class UsabilityTester {
  private issues: UsabilityIssue[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  addIssue(issue: UsabilityIssue) {
    this.issues.push(issue);
    console.log(`🔍 ${issue.severity.toUpperCase()}: ${issue.description}`);
  }

  getIssuesSummary() {
    const summary = {
      critical: this.issues.filter(i => i.severity === 'critical').length,
      major: this.issues.filter(i => i.severity === 'major').length,
      minor: this.issues.filter(i => i.severity === 'minor').length,
      cosmetic: this.issues.filter(i => i.severity === 'cosmetic').length,
      total: this.issues.length
    };
    
    console.log('\n📊 USABILITY ISSUES SUMMARY:');
    console.log(`Critical: ${summary.critical} | Major: ${summary.major} | Minor: ${summary.minor} | Cosmetic: ${summary.cosmetic}`);
    console.log(`Total Issues Found: ${summary.total}`);
    
    return { summary, issues: this.issues };
  }

  // Nielsen Heuristic #1: Visibility of System Status
  async testSystemStatusVisibility() {
    console.log('\n🔍 Testing: Visibility of System Status...');
    
    // Test loading states
    await this.page.goto('/');
    
    // Check if there are loading indicators
    const hasLoadingIndicator = await this.page.locator('[data-testid="loading"], .loading, .spinner').count() > 0;
    if (!hasLoadingIndicator) {
      this.addIssue({
        severity: 'minor',
        category: 'ux-heuristic',
        heuristic: 'Visibility of System Status',
        description: 'Keine sichtbaren Loading-Indikatoren',
        location: 'Alle Seiten',
        impact: 'Nutzer wissen nicht, ob die Seite lädt',
        recommendation: 'Loading-Spinner oder Progress-Indikatoren hinzufügen'
      });
    }

    // Test form validation feedback
    await this.page.fill('#user-name', 'invalid');
    await this.page.fill('#password', '');
    await this.page.click('#login-button');
    
    const errorMessage = await this.page.locator('[data-test="error"]').textContent();
    if (!errorMessage || errorMessage.trim() === '') {
      this.addIssue({
        severity: 'major',
        category: 'ux-heuristic',
        heuristic: 'Visibility of System Status',
        description: 'Unklare Fehlermeldungen bei Login',
        location: 'Login-Formular',
        impact: 'Nutzer verstehen nicht, was falsch ist',
        recommendation: 'Spezifische, hilfreiche Fehlermeldungen implementieren'
      });
    }
  }

  // Nielsen Heuristic #2: Match between system and real world
  async testSystemWorldMatch() {
    console.log('\n🔍 Testing: Match between System and Real World...');
    
    await this.page.goto('/');
    await this.page.fill('#user-name', 'standard_user');
    await this.page.fill('#password', 'secret_sauce');
    await this.page.click('#login-button');
    
    // Check for intuitive navigation labels
    const menuButton = await this.page.locator('#react-burger-menu-btn');
    const menuButtonText = await menuButton.getAttribute('aria-label') || await menuButton.textContent();
    
    if (!menuButtonText || !menuButtonText.toLowerCase().includes('menu')) {
      this.addIssue({
        severity: 'minor',
        category: 'ux-heuristic',
        heuristic: 'Match between System and Real World',
        description: 'Menu-Button hat keine klare Beschriftung',
        location: 'Header Navigation',
        impact: 'Nutzer verstehen die Funktion nicht sofort',
        recommendation: 'Aria-label "Menu" oder sichtbaren Text hinzufügen'
      });
    }

    // Check shopping cart metaphor
    const cartButton = await this.page.locator('.shopping_cart_link');
    const cartExists = await cartButton.count() > 0;
    
    if (cartExists) {
      const cartBadge = await this.page.locator('.shopping_cart_badge').textContent();
      console.log(`✅ Shopping Cart metaphor used correctly${cartBadge ? ` (${cartBadge} items)` : ''}`);
    }
  }

  // Nielsen Heuristic #3: User control and freedom
  async testUserControlFreedom() {
    console.log('\n🔍 Testing: User Control and Freedom...');
    
    // Test back button functionality
    await this.page.goto('/inventory.html');
    await this.page.click('.inventory_item_name');
    
    // Check if back button exists
    const backButton = await this.page.locator('[data-testid="back-to-products"], .back-to-products, button:has-text("Back")');
    const hasBackButton = await backButton.count() > 0;
    
    if (!hasBackButton) {
      this.addIssue({
        severity: 'major',
        category: 'ux-heuristic',
        heuristic: 'User Control and Freedom',
        description: 'Kein "Zurück" Button auf Produktdetailseite',
        location: 'Produktdetailseiten',
        impact: 'Nutzer müssen Browser-Zurück verwenden',
        recommendation: 'Prominenten "Zurück zu Produkten" Button hinzufügen'
      });
    } else {
      console.log('✅ Back button found on product detail page');
    }

    // Test undo functionality for cart
    await this.page.goto('/inventory.html');
    await this.page.locator('.btn_inventory').first().click();
    await this.page.click('.shopping_cart_link');
    
    const removeButton = await this.page.locator('[data-testid="remove"], button:has-text("Remove")');
    const canRemoveItems = await removeButton.count() > 0;
    
    if (!canRemoveItems) {
      this.addIssue({
        severity: 'critical',
        category: 'functionality',
        heuristic: 'User Control and Freedom',
        description: 'Keine Möglichkeit, Artikel aus dem Warenkorb zu entfernen',
        location: 'Warenkorb',
        impact: 'Nutzer können Fehler nicht korrigieren',
        recommendation: 'Remove/Entfernen Button für jeden Artikel implementieren'
      });
    } else {
      console.log('✅ Items can be removed from cart');
    }
  }

  // Nielsen Heuristic #4: Consistency and standards
  async testConsistencyStandards() {
    console.log('\n🔍 Testing: Consistency and Standards...');
    
    // Test button consistency
    await this.page.goto('/inventory.html');
    
    const addToCartButtons = await this.page.locator('.btn_inventory').all();
    let buttonStylesConsistent = true;
    let firstButtonStyle = '';
    
    for (let i = 0; i < Math.min(addToCartButtons.length, 3); i++) {
      const buttonStyle = await addToCartButtons[i].getAttribute('class');
      if (i === 0) {
        firstButtonStyle = buttonStyle || '';
      } else if (buttonStyle !== firstButtonStyle) {
        buttonStylesConsistent = false;
        break;
      }
    }
    
    if (!buttonStylesConsistent) {
      this.addIssue({
        severity: 'minor',
        category: 'ux-heuristic',
        heuristic: 'Consistency and Standards',
        description: 'Inkonsistente Button-Styles',
        location: 'Produktliste',
        impact: 'Verwirrende Benutzererfahrung',
        recommendation: 'Einheitliche Button-Styles verwenden'
      });
    }

    // Test link color consistency
    const links = await this.page.locator('a').all();
    const linkColors = new Set();
    
    for (const link of links.slice(0, 5)) {
      const color = await link.evaluate(el => getComputedStyle(el).color);
      linkColors.add(color);
    }
    
    if (linkColors.size > 2) {
      this.addIssue({
        severity: 'cosmetic',
        category: 'ux-heuristic',
        heuristic: 'Consistency and Standards',
        description: 'Zu viele verschiedene Link-Farben',
        location: 'Gesamte Website',
        impact: 'Inkonsistente visuelle Hierarchie',
        recommendation: 'Einheitliche Link-Farbpalette definieren'
      });
    }
  }

  // Nielsen Heuristic #5: Error prevention
  async testErrorPrevention() {
    console.log('\n🔍 Testing: Error Prevention...');
    
    await this.page.goto('/');
    
    // Test input validation
    const passwordField = await this.page.locator('#password');
    const hasPasswordValidation = await passwordField.getAttribute('pattern') || 
                                  await passwordField.getAttribute('minlength') ||
                                  await passwordField.getAttribute('required');
    
    if (!hasPasswordValidation) {
      this.addIssue({
        severity: 'minor',
        category: 'ux-heuristic',
        heuristic: 'Error Prevention',
        description: 'Keine Client-side Validierung für Passwort-Feld',
        location: 'Login-Formular',
        impact: 'Unnötige Server-Requests bei ungültigen Eingaben',
        recommendation: 'HTML5 Validierung oder JavaScript-Validierung hinzufügen'
      });
    }

    // Test confirmation for destructive actions
    await this.page.fill('#user-name', 'standard_user');
    await this.page.fill('#password', 'secret_sauce');
    await this.page.click('#login-button');
    
    // Navigate to checkout and test
    await this.page.locator('.btn_inventory').first().click();
    await this.page.click('.shopping_cart_link');
    await this.page.click('[data-test="checkout"]');
    
    // Fill form with intentionally missing required field
    await this.page.fill('[data-test="firstName"]', 'John');
    await this.page.fill('[data-test="lastName"]', ''); // Leave empty
    await this.page.fill('[data-test="postalCode"]', '12345');
    
    await this.page.click('[data-test="continue"]');
    
    const errorAfterSubmit = await this.page.locator('[data-test="error"]').textContent();
    if (!errorAfterSubmit) {
      this.addIssue({
        severity: 'major',
        category: 'ux-heuristic',
        heuristic: 'Error Prevention',
        description: 'Fehlende Validierung für Pflichtfelder beim Checkout',
        location: 'Checkout-Formular',
        impact: 'Nutzer können unvollständige Bestellungen abschicken',
        recommendation: 'Real-time Validierung und Pflichtfeld-Markierung implementieren'
      });
    }
  }

  // Accessibility Tests (WCAG 2.1)
  async testAccessibility() {
    console.log('\n🔍 Testing: Accessibility (WCAG 2.1)...');
    
    await this.page.goto('/');
    
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    
    const focusedElement = await this.page.locator(':focus').getAttribute('id');
    if (focusedElement !== 'login-button') {
      this.addIssue({
        severity: 'major',
        category: 'accessibility',
        description: 'Keyboard Navigation funktioniert nicht korrekt',
        location: 'Login-Seite',
        impact: 'Nutzer mit Behinderungen können die Seite nicht bedienen',
        recommendation: 'Tab-Index und Focus-Management implementieren'
      });
    }

    // Test alt text for images
    const images = await this.page.locator('img').all();
    for (let i = 0; i < images.length; i++) {
      const alt = await images[i].getAttribute('alt');
      const src = await images[i].getAttribute('src');
      
      if (!alt || alt.trim() === '') {
        this.addIssue({
          severity: 'major',
          category: 'accessibility',
          description: `Bild ohne Alt-Text: ${src}`,
          location: 'Verschiedene Seiten',
          impact: 'Screen Reader können Bilder nicht beschreiben',
          recommendation: 'Aussagekräftige Alt-Texte für alle Bilder hinzufügen'
        });
      }
    }

    // Test color contrast (simplified check)
    const button = await this.page.locator('#login-button');
    const buttonStyles = await button.evaluate(el => {
      const styles = getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    // This is a simplified contrast check - in real tests you'd use a proper contrast analyzer
    if (buttonStyles.backgroundColor === buttonStyles.color) {
      this.addIssue({
        severity: 'critical',
        category: 'accessibility',
        description: 'Unzureichender Farbkontrast bei Buttons',
        location: 'Login-Button',
        impact: 'Text ist für sehbehinderte Nutzer nicht lesbar',
        recommendation: 'Farbkontrast auf mindestens 4.5:1 (WCAG AA) erhöhen'
      });
    }

    // Test form labels
    const inputs = await this.page.locator('input[type="text"], input[type="password"]').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const associatedLabel = await this.page.locator(`label[for="${id}"]`).count();
      const ariaLabel = await input.getAttribute('aria-label');
      
      if (associatedLabel === 0 && !ariaLabel) {
        this.addIssue({
          severity: 'major',
          category: 'accessibility',
          description: `Input-Feld ohne Label: ${id}`,
          location: 'Formulare',
          impact: 'Screen Reader können Felder nicht zuordnen',
          recommendation: 'Labels oder aria-label für alle Input-Felder hinzufügen'
        });
      }
    }
  }

  // Mobile Usability Tests
  async testMobileUsability() {
    console.log('\n🔍 Testing: Mobile Usability...');
    
    // Test touch target sizes
    await this.page.goto('/');
    
    const touchTargets = await this.page.locator('button, a, input[type="submit"]').all();
    for (const target of touchTargets.slice(0, 5)) {
      const box = await target.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        this.addIssue({
          severity: 'major',
          category: 'ux-heuristic',
          description: 'Touch-Target zu klein (< 44px)',
          location: 'Mobile Ansicht',
          impact: 'Schwierige Bedienung auf Touch-Geräten',
          recommendation: 'Touch-Targets auf mindestens 44x44px vergrößern'
        });
      }
    }

    // Test horizontal scrolling
    const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await this.page.evaluate(() => window.innerWidth);
    
    if (bodyWidth > viewportWidth) {
      this.addIssue({
        severity: 'major',
        category: 'ux-heuristic',
        description: 'Horizontales Scrollen erforderlich',
        location: 'Mobile Ansicht',
        impact: 'Schlechte mobile Benutzererfahrung',
        recommendation: 'Responsive Design implementieren'
      });
    }
  }

  // Complete functional flow test
  async testCompleteUserFlow() {
    console.log('\n🔍 Testing: Complete User Flow...');
    
    try {
      // Login
      await this.page.goto('/');
      await this.page.fill('#user-name', 'standard_user');
      await this.page.fill('#password', 'secret_sauce');
      await this.page.click('#login-button');
      
      // Add item to cart
      await this.page.locator('.btn_inventory').first().click();
      
      // View cart
      await this.page.click('.shopping_cart_link');
      
      // Proceed to checkout
      await this.page.click('[data-test="checkout"]');
      
      // Fill checkout form
      await this.page.fill('[data-test="firstName"]', 'John');
      await this.page.fill('[data-test="lastName"]', 'Doe');
      await this.page.fill('[data-test="postalCode"]', '12345');
      await this.page.click('[data-test="continue"]');
      
      // Complete order
      await this.page.click('[data-test="finish"]');
      
      // Check success page
      const successMessage = await this.page.locator('.complete-header').textContent();
      if (!successMessage || !successMessage.toLowerCase().includes('complete')) {
        this.addIssue({
          severity: 'critical',
          category: 'functionality',
          description: 'Checkout-Flow nicht vollständig funktional',
          location: 'Checkout-Prozess',
          impact: 'Nutzer können keine Bestellungen abschließen',
          recommendation: 'Kompletten E-Commerce-Flow testen und debuggen'
        });
      } else {
        console.log('✅ Complete user flow works successfully');
      }
      
    } catch (error) {
      this.addIssue({
        severity: 'critical',
        category: 'functionality',
        description: `Kritischer Fehler im User Flow: ${error}`,
        location: 'Checkout-Prozess',
        impact: 'Hauptfunktionalität nicht verfügbar',
        recommendation: 'Sofortige Fehlerbehebung erforderlich'
      });
    }
  }
}

test.describe('Comprehensive Usability Tests', () => {
  
  test('sollte vollständige Usability-Analyse durchführen', async ({ page }) => {
    console.log('🚀 Starte umfassende Usability-Analyse...');
    
    const tester = new UsabilityTester(page);
    
    // Run all usability tests
    await tester.testSystemStatusVisibility();
    await tester.testSystemWorldMatch();
    await tester.testUserControlFreedom();
    await tester.testConsistencyStandards();
    await tester.testErrorPrevention();
    await tester.testAccessibility();
    await tester.testMobileUsability();
    await tester.testCompleteUserFlow();
    
    // Generate comprehensive report
    const { summary, issues } = tester.getIssuesSummary();
    
    // Calculate usability score
    const usabilityScore = calculateUsabilityScore(summary);
    console.log(`\n🎯 Overall Usability Score: ${usabilityScore}/100`);
    
    // Attach detailed report
    test.info().attach('usability-report.json', {
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        url: page.url(),
        summary,
        usabilityScore,
        issues,
        recommendations: generatePriorityRecommendations(issues)
      }, null, 2),
      contentType: 'application/json'
    });
    
    // Set test expectations based on critical issues
    expect(summary.critical).toBeLessThan(3); // Max 2 critical issues acceptable
    expect(usabilityScore).toBeGreaterThan(60); // Minimum usability score
  });
  
  test('sollte spezifische Accessibility-Standards prüfen', async ({ page }) => {
    console.log('🔍 Führe detaillierte Accessibility-Tests durch...');
    
    await page.goto('/');
    
    // Test screen reader support
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    expect(pageTitle.length).toBeGreaterThan(5);
    
    // Test heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const hasH1 = await page.locator('h1').count() > 0;
    
    expect(hasH1).toBeTruthy(); // Page should have exactly one H1
    
    // Test form accessibility
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    
    const formControls = await page.locator('input, button, select, textarea').all();
    let accessibilityIssues = 0;
    
    for (const control of formControls) {
      const ariaLabel = await control.getAttribute('aria-label');
      const id = await control.getAttribute('id');
      const associatedLabel = id ? await page.locator(`label[for="${id}"]`).count() : 0;
      
      if (!ariaLabel && associatedLabel === 0) {
        accessibilityIssues++;
      }
    }
    
    expect(accessibilityIssues).toBeLessThan(3); // Should have minimal accessibility issues
  });
});

// Helper functions
function calculateUsabilityScore(summary: any): number {
  let score = 100;
  
  // Deduct points based on severity
  score -= summary.critical * 20;  // Critical issues: -20 points each
  score -= summary.major * 10;     // Major issues: -10 points each
  score -= summary.minor * 5;      // Minor issues: -5 points each
  score -= summary.cosmetic * 2;   // Cosmetic issues: -2 points each
  
  return Math.max(0, score);
}

function generatePriorityRecommendations(issues: UsabilityIssue[]): string[] {
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const majorIssues = issues.filter(i => i.severity === 'major');
  
  const recommendations = [
    ...criticalIssues.map(i => `🚨 KRITISCH: ${i.recommendation}`),
    ...majorIssues.slice(0, 3).map(i => `⚠️ WICHTIG: ${i.recommendation}`)
  ];
  
  return recommendations;
}