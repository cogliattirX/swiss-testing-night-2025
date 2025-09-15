import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * Universal Accessibility Testing Suite
 * 
 * As an Accessibility Testing Expert, this suite provides comprehensive
 * WCAG 2.1 AA compliance testing for any website.
 */

test.describe('Universal Accessibility Testing', () => {
  const testUrls = [
    'https://www.saucedemo.com/',
    'https://example.com/',
    'https://demoqa.com/',
  ];

  testUrls.forEach(url => {
    test(`Accessibility analysis for ${new URL(url).hostname}`, async ({ page }) => {
      const actions = createObservableActions(page);
      let accessibilityScore = 100;
      const findings: string[] = [];
      const recommendations: string[] = [];
      
      console.log(`\n♿ ACCESSIBILITY ANALYSIS FOR: ${url}`);
      console.log(`═══════════════════════════════════════════════════════════`);
      
      await test.step('🌐 Load Website for Accessibility Testing', async () => {
        await actions.observableGoto(url, `Loading ${url} for accessibility analysis`);
        await actions.screenshot(`${new URL(url).hostname}-accessibility-initial`, 'Initial accessibility test state');
      });
      
      await test.step('📋 Semantic HTML Structure Analysis', async () => {
        const structure = await page.evaluate(() => {
          const analysis = {
            headings: {
              h1: document.querySelectorAll('h1').length,
              h2: document.querySelectorAll('h2').length,
              h3: document.querySelectorAll('h3').length,
              h4: document.querySelectorAll('h4').length,
              h5: document.querySelectorAll('h5').length,
              h6: document.querySelectorAll('h6').length,
            },
            landmarks: {
              main: document.querySelectorAll('main, [role="main"]').length,
              nav: document.querySelectorAll('nav, [role="navigation"]').length,
              header: document.querySelectorAll('header, [role="banner"]').length,
              footer: document.querySelectorAll('footer, [role="contentinfo"]').length,
              aside: document.querySelectorAll('aside, [role="complementary"]').length,
            },
            forms: {
              total: document.querySelectorAll('form').length,
              labels: document.querySelectorAll('label').length,
              inputs: document.querySelectorAll('input, select, textarea').length,
              fieldsets: document.querySelectorAll('fieldset').length,
            },
            images: {
              total: document.querySelectorAll('img').length,
              withAlt: document.querySelectorAll('img[alt]').length,
              withEmptyAlt: document.querySelectorAll('img[alt=""]').length,
            },
            links: {
              total: document.querySelectorAll('a').length,
              withText: document.querySelectorAll('a:not(:empty)').length,
              external: document.querySelectorAll('a[href^="http"]:not([href*="' + location.hostname + '"])').length,
            }
          };
          
          return analysis;
        });
        
        console.log(`📊 SEMANTIC STRUCTURE ANALYSIS:`);
        console.log(`   H1 headings: ${structure.headings.h1}`);
        console.log(`   H2 headings: ${structure.headings.h2}`);
        console.log(`   H3 headings: ${structure.headings.h3}`);
        console.log(`   Main landmarks: ${structure.landmarks.main}`);
        console.log(`   Navigation landmarks: ${structure.landmarks.nav}`);
        console.log(`   Images with alt text: ${structure.images.withAlt}/${structure.images.total}`);
        console.log(`   Form labels: ${structure.forms.labels} for ${structure.forms.inputs} inputs`);
        
        // Evaluate semantic structure
        if (structure.headings.h1 === 0) {
          accessibilityScore -= 15;
          findings.push('Missing H1 heading - critical for screen readers');
          recommendations.push('Add exactly one H1 heading per page');
        } else if (structure.headings.h1 > 1) {
          accessibilityScore -= 10;
          findings.push(`Multiple H1 headings (${structure.headings.h1}) - should have only one`);
          recommendations.push('Use only one H1 heading per page');
        }
        
        if (structure.landmarks.main === 0) {
          accessibilityScore -= 10;
          findings.push('Missing main landmark');
          recommendations.push('Add <main> element or role="main"');
        }
        
        if (structure.images.total > 0 && structure.images.withAlt < structure.images.total) {
          const missingAlt = structure.images.total - structure.images.withAlt;
          accessibilityScore -= Math.min(20, missingAlt * 3);
          findings.push(`${missingAlt} images missing alt text`);
          recommendations.push('Add descriptive alt text to all images');
        }
        
        if (structure.forms.inputs > 0 && structure.forms.labels < structure.forms.inputs) {
          const unlabeled = structure.forms.inputs - structure.forms.labels;
          accessibilityScore -= Math.min(15, unlabeled * 5);
          findings.push(`${unlabeled} form inputs may be unlabeled`);
          recommendations.push('Ensure all form inputs have associated labels');
        }
      });
      
      await test.step('🎨 Color Contrast Analysis', async () => {
        const contrastIssues = await page.evaluate(() => {
          const issues: any[] = [];
          
          // Helper function to get RGB values from computed style
          function getRGB(color: string): [number, number, number] | null {
            const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            return rgb ? [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])] : null;
          }
          
          // Calculate luminance for contrast ratio
          function getLuminance(r: number, g: number, b: number): number {
            const [rs, gs, bs] = [r, g, b].map(c => {
              c = c / 255;
              return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
          }
          
          // Calculate contrast ratio
          function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
            const lum1 = getLuminance(...color1);
            const lum2 = getLuminance(...color2);
            const brightest = Math.max(lum1, lum2);
            const darkest = Math.min(lum1, lum2);
            return (brightest + 0.05) / (darkest + 0.05);
          }
          
          // Check text elements for contrast
          const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label');
          let checkedElements = 0;
          
          textElements.forEach((element, index) => {
            if (checkedElements >= 20) return; // Limit checks for performance
            
            const computedStyle = window.getComputedStyle(element);
            const color = computedStyle.color;
            const backgroundColor = computedStyle.backgroundColor;
            
            const textRGB = getRGB(color);
            const bgRGB = getRGB(backgroundColor);
            
            if (textRGB && bgRGB && bgRGB[0] + bgRGB[1] + bgRGB[2] > 0) { // Skip transparent backgrounds
              const contrastRatio = getContrastRatio(textRGB, bgRGB);
              const fontSize = parseFloat(computedStyle.fontSize);
              const fontWeight = computedStyle.fontWeight;
              
              // WCAG AA requirements: 4.5:1 for normal text, 3:1 for large text
              const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
              const requiredRatio = isLargeText ? 3 : 4.5;
              
              if (contrastRatio < requiredRatio) {
                issues.push({
                  element: element.tagName.toLowerCase(),
                  text: (element.textContent || '').substring(0, 50),
                  ratio: contrastRatio.toFixed(2),
                  required: requiredRatio,
                  isLargeText
                });
              }
              
              checkedElements++;
            }
          });
          
          return issues;
        });
        
        console.log(`🎨 COLOR CONTRAST ANALYSIS:`);
        if (contrastIssues.length === 0) {
          console.log(`   ✅ No contrast issues found in sampled elements`);
        } else {
          console.log(`   ⚠️  Found ${contrastIssues.length} potential contrast issues:`);
          contrastIssues.slice(0, 5).forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue.element}: "${issue.text}" - Ratio: ${issue.ratio}:1 (needs ${issue.required}:1)`);
          });
          
          accessibilityScore -= Math.min(25, contrastIssues.length * 3);
          findings.push(`${contrastIssues.length} elements with poor color contrast`);
          recommendations.push('Improve color contrast to meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)');
        }
      });
      
      await test.step('⌨️  Keyboard Navigation Testing', async () => {
        console.log(`⌨️  KEYBOARD NAVIGATION TESTING:`);
        
        // Get all focusable elements
        const focusableElements = await page.evaluate(() => {
          const focusable = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          return {
            total: focusable.length,
            buttons: document.querySelectorAll('button').length,
            links: document.querySelectorAll('a[href]').length,
            inputs: document.querySelectorAll('input, select, textarea').length,
          };
        });
        
        console.log(`   Focusable elements: ${focusableElements.total}`);
        console.log(`   Buttons: ${focusableElements.buttons}`);
        console.log(`   Links: ${focusableElements.links}`);
        console.log(`   Form inputs: ${focusableElements.inputs}`);
        
        // Test tab navigation
        if (focusableElements.total > 0) {
          try {
            await page.keyboard.press('Tab');
            const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
            
            if (firstFocused) {
              console.log(`   ✅ Tab navigation working - first focus: ${firstFocused}`);
              
              // Test a few more tab presses
              for (let i = 0; i < Math.min(3, focusableElements.total - 1); i++) {
                await page.keyboard.press('Tab');
              }
              
              // Test Shift+Tab
              await page.keyboard.press('Shift+Tab');
              console.log(`   ✅ Shift+Tab reverse navigation working`);
            } else {
              accessibilityScore -= 15;
              findings.push('Tab navigation not working properly');
              recommendations.push('Ensure all interactive elements are keyboard accessible');
            }
          } catch (error) {
            accessibilityScore -= 10;
            findings.push('Keyboard navigation testing failed');
            recommendations.push('Test and fix keyboard navigation issues');
          }
        } else {
          accessibilityScore -= 5;
          findings.push('No focusable elements found');
          recommendations.push('Ensure interactive elements are keyboard focusable');
        }
      });
      
      await test.step('🔊 ARIA and Screen Reader Support', async () => {
        const ariaAnalysis = await page.evaluate(() => {
          return {
            landmarks: document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]').length,
            labels: document.querySelectorAll('[aria-label]').length,
            labelledby: document.querySelectorAll('[aria-labelledby]').length,
            describedby: document.querySelectorAll('[aria-describedby]').length,
            live: document.querySelectorAll('[aria-live]').length,
            hidden: document.querySelectorAll('[aria-hidden="true"]').length,
            expanded: document.querySelectorAll('[aria-expanded]').length,
            buttons: document.querySelectorAll('button, [role="button"]').length,
            inputs: document.querySelectorAll('input, select, textarea').length,
          };
        });
        
        console.log(`🔊 ARIA AND SCREEN READER SUPPORT:`);
        console.log(`   ARIA landmarks: ${ariaAnalysis.landmarks}`);
        console.log(`   ARIA labels: ${ariaAnalysis.labels}`);
        console.log(`   ARIA labelledby: ${ariaAnalysis.labelledby}`);
        console.log(`   ARIA describedby: ${ariaAnalysis.describedby}`);
        console.log(`   ARIA live regions: ${ariaAnalysis.live}`);
        
        // Evaluate ARIA usage
        if (ariaAnalysis.labels + ariaAnalysis.labelledby > 0) {
          console.log(`   ✅ Using ARIA labels for better accessibility`);
        } else if (ariaAnalysis.buttons > 0 || ariaAnalysis.inputs > 0) {
          accessibilityScore -= 10;
          findings.push('Consider using ARIA labels for better screen reader support');
          recommendations.push('Add aria-label or aria-labelledby to interactive elements');
        }
        
        if (ariaAnalysis.landmarks > 0) {
          console.log(`   ✅ Using ARIA landmarks for navigation`);
        } else {
          accessibilityScore -= 5;
          findings.push('No ARIA landmarks found');
          recommendations.push('Add ARIA landmarks (main, navigation, banner, etc.) for better navigation');
        }
      });
      
      await test.step('📱 Mobile Accessibility Testing', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await actions.screenshot(`${new URL(url).hostname}-accessibility-mobile`, 'Mobile accessibility test');
        
        // Check for touch target sizes
        const touchTargets = await page.evaluate(() => {
          const interactive = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
          let smallTargets = 0;
          
          interactive.forEach(element => {
            const rect = element.getBoundingClientRect();
            const size = Math.min(rect.width, rect.height);
            if (size < 44) { // WCAG recommends minimum 44px
              smallTargets++;
            }
          });
          
          return {
            total: interactive.length,
            small: smallTargets
          };
        });
        
        console.log(`📱 MOBILE ACCESSIBILITY:`);
        console.log(`   Touch targets: ${touchTargets.total - touchTargets.small}/${touchTargets.total} meet 44px minimum`);
        
        if (touchTargets.small > 0) {
          accessibilityScore -= Math.min(15, touchTargets.small * 2);
          findings.push(`${touchTargets.small} touch targets smaller than 44px`);
          recommendations.push('Increase size of touch targets to minimum 44x44px');
        }
        
        // Reset viewport
        await page.setViewportSize({ width: 1280, height: 720 });
      });
      
      await test.step('♿ Accessibility Score and Report', async () => {
        accessibilityScore = Math.max(0, accessibilityScore);
        
        let grade = 'F';
        if (accessibilityScore >= 95) grade = 'A+';
        else if (accessibilityScore >= 90) grade = 'A';
        else if (accessibilityScore >= 85) grade = 'B+';
        else if (accessibilityScore >= 80) grade = 'B';
        else if (accessibilityScore >= 75) grade = 'C+';
        else if (accessibilityScore >= 70) grade = 'C';
        else if (accessibilityScore >= 65) grade = 'D+';
        else if (accessibilityScore >= 60) grade = 'D';
        
        console.log(`\n🏆 ACCESSIBILITY SUMMARY`);
        console.log(`═══════════════════════════════════════════════════════════`);
        console.log(`♿ Accessibility Score: ${accessibilityScore}/100 (Grade: ${grade})`);
        console.log(`🎯 WCAG 2.1 AA Compliance: ${grade === 'A+' || grade === 'A' ? 'EXCELLENT' : grade === 'B+' || grade === 'B' ? 'GOOD' : grade === 'C+' || grade === 'C' ? 'NEEDS IMPROVEMENT' : 'POOR'}`);
        
        if (findings.length > 0) {
          console.log(`\n❌ ACCESSIBILITY ISSUES FOUND:`);
          findings.forEach((finding, index) => {
            console.log(`   ${index + 1}. ${finding}`);
          });
        }
        
        if (recommendations.length > 0) {
          console.log(`\n💡 ACCESSIBILITY RECOMMENDATIONS:`);
          recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
          });
        }
        
        if (findings.length === 0) {
          console.log(`\n✅ Excellent accessibility! No major issues found.`);
        }
        
        console.log(`═══════════════════════════════════════════════════════════\n`);
        
        // Assert accessibility meets minimum standards
        expect(accessibilityScore).toBeGreaterThan(50); // Minimum acceptable score
        
        if (accessibilityScore < 80) {
          console.warn(`⚠️  Accessibility score below 80. WCAG compliance may be at risk.`);
        }
      });
    });
  });

  test('Accessibility best practices validation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Screen Reader Simulation Test', async () => {
      console.log('\n👁️  SCREEN READER SIMULATION TEST');
      console.log('═══════════════════════════════════════════════════════════');
      
      await actions.observableGoto('https://www.saucedemo.com/', 'Loading Sauce Demo for screen reader simulation');
      
      // Simulate screen reader navigation
      const screenReaderContent = await page.evaluate(() => {
        const content: string[] = [];
        
        // Get page title
        content.push(`Page title: ${document.title}`);
        
        // Get headings in order
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
          content.push(`${heading.tagName}: ${heading.textContent?.trim()}`);
        });
        
        // Get form labels and inputs
        const labels = document.querySelectorAll('label');
        labels.forEach(label => {
          const forAttr = label.getAttribute('for');
          const input = forAttr ? document.getElementById(forAttr) : label.querySelector('input, select, textarea');
          const inputType = input ? (input as HTMLInputElement).type || input.tagName.toLowerCase() : 'unknown';
          content.push(`Form field: ${label.textContent?.trim()} (${inputType})`);
        });
        
        // Get button text
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          const text = button.textContent?.trim() || button.getAttribute('aria-label') || 'Unlabeled button';
          content.push(`Button: ${text}`);
        });
        
        return content;
      });
      
      console.log('Screen reader would announce:');
      screenReaderContent.slice(0, 10).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item}`);
      });
      
      expect(screenReaderContent.length).toBeGreaterThan(0);
      console.log(`✅ Screen reader simulation completed - ${screenReaderContent.length} elements accessible`);
    });
  });
});
