import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Accessibility & WCAG Compliance', () => {
  
  test('Keyboard navigation and focus management', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('♿ Testing keyboard accessibility and focus management');
    
    await actions.step('🌐 Setup', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate to SBB for accessibility testing');
      
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
    });

    await actions.step('⌨️ Test Tab Navigation', async () => {
      // Start from top of page
      await page.keyboard.press('Home');
      actions.logTestInfo('🎯 Starting keyboard navigation from top');
      
      // Tab through interactive elements
      const maxTabs = 20;
      const focusedElements = [];
      
      for (let i = 0; i < maxTabs; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            type: el?.getAttribute('type'),
            ariaLabel: el?.getAttribute('aria-label'),
            id: el?.id,
            className: el?.className
          };
        });
        
        if (focused.tagName) {
          focusedElements.push(focused);
          actions.logTestInfo(`Tab ${i + 1}: ${focused.tagName} ${focused.type || ''} ${focused.ariaLabel || focused.id || ''}`.trim());
        }
      }
      
      actions.logTestInfo(`✅ Successfully navigated through ${focusedElements.length} interactive elements`);
      
      // Test that journey planner is keyboard accessible
      const journeyPlannerReached = focusedElements.some(el => 
        el.ariaLabel?.toLowerCase().includes('from') || 
        el.ariaLabel?.toLowerCase().includes('to') ||
        el.id?.toLowerCase().includes('from') ||
        el.id?.toLowerCase().includes('to')
      );
      
      if (journeyPlannerReached) {
        actions.logTestInfo('✅ Journey planner is keyboard accessible');
      } else {
        actions.logTestInfo('⚠️ Journey planner may not be easily reachable via keyboard');
      }
    });

    await actions.step('🔍 Test Skip Links', async () => {
      // Go to top and look for skip links
      await page.keyboard.press('Home');
      await page.keyboard.press('Tab');
      
      const firstFocused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          text: el?.textContent?.trim(),
          href: el?.getAttribute('href'),
          isSkipLink: el?.textContent?.toLowerCase().includes('skip') || 
                     el?.getAttribute('href')?.includes('#main') ||
                     el?.getAttribute('href')?.includes('#content')
        };
      });
      
      if (firstFocused.isSkipLink) {
        actions.logTestInfo(`✅ Skip link found: "${firstFocused.text}"`);
        
        // Test skip link functionality
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        const afterSkip = await page.evaluate(() => {
          return document.activeElement?.tagName;
        });
        
        actions.logTestInfo(`✅ Skip link activated, focus moved to: ${afterSkip}`);
      } else {
        actions.logTestInfo('ℹ️ No skip link detected as first focusable element');
      }
    });

    await actions.step('📱 Test Focus Visibility', async () => {
      // Check if focus indicators are visible
      await page.keyboard.press('Tab');
      
      const focusVisible = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        
        const styles = getComputedStyle(el);
        const pseudoStyles = getComputedStyle(el, ':focus');
        
        return {
          outline: styles.outline !== 'none',
          outlineWidth: styles.outlineWidth !== '0px',
          boxShadow: styles.boxShadow !== 'none',
          backgroundColor: styles.backgroundColor,
          border: styles.border
        };
      });
      
      const hasVisibleFocus = focusVisible && (
        focusVisible.outline || 
        focusVisible.outlineWidth || 
        focusVisible.boxShadow
      );
      
      if (hasVisibleFocus) {
        actions.logTestInfo('✅ Focus indicators are visible');
      } else {
        actions.logTestInfo('⚠️ Focus indicators may not be clearly visible');
      }
      
      await actions.screenshot('sbb-focus-visibility', 'Focus visibility test');
    });
  });

  test('Screen reader compatibility and ARIA attributes', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🔊 Testing screen reader compatibility');
    
    await actions.step('🌐 Setup', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for ARIA testing');
      
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
    });

    await actions.step('🏷️ Check ARIA Labels and Roles', async () => {
      const ariaElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]');
        return Array.from(elements).map(el => ({
          tagName: el.tagName,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          ariaLabelledby: el.getAttribute('aria-labelledby'),
          ariaDescribedby: el.getAttribute('aria-describedby'),
          textContent: el.textContent?.substring(0, 50)
        }));
      });
      
      actions.logTestInfo(`📊 Found ${ariaElements.length} elements with ARIA attributes`);
      
      // Check for important journey planner ARIA
      const journeyPlannerAria = ariaElements.filter(el => 
        el.ariaLabel?.toLowerCase().includes('from') ||
        el.ariaLabel?.toLowerCase().includes('to') ||
        el.role === 'combobox'
      );
      
      actions.logTestInfo(`✅ Journey planner ARIA elements: ${journeyPlannerAria.length}`);
      
      journeyPlannerAria.forEach((el, index) => {
        actions.logTestInfo(`  ${index + 1}. ${el.tagName} - Role: ${el.role}, Label: ${el.ariaLabel}`);
      });
    });

    await actions.step('📋 Check Form Labels', async () => {
      const formElements = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, select, textarea');
        return Array.from(inputs).map(el => {
          const input = el as HTMLInputElement;
          const label = document.querySelector(`label[for="${input.id}"]`);
          return {
            id: input.id,
            type: input.type,
            hasLabel: !!label,
            labelText: label?.textContent?.trim(),
            ariaLabel: input.getAttribute('aria-label'),
            placeholder: input.getAttribute('placeholder')
          };
        });
      });
      
      const unlabeledInputs = formElements.filter(el => 
        !el.hasLabel && !el.ariaLabel && el.type !== 'hidden'
      );
      
      actions.logTestInfo(`📊 Total form elements: ${formElements.length}`);
      actions.logTestInfo(`📊 Unlabeled form elements: ${unlabeledInputs.length}`);
      
      if (unlabeledInputs.length === 0) {
        actions.logTestInfo('✅ All form elements are properly labeled');
      } else {
        actions.logTestInfo('⚠️ Some form elements may lack proper labels');
        unlabeledInputs.forEach(el => {
          actions.logTestInfo(`  - ${el.type} input (id: ${el.id})`);
        });
      }
    });

    await actions.step('🎨 Color Contrast Check', async () => {
      // Check text contrast ratios
      const contrastResults = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
        const results = [];
        
        for (let i = 0; i < Math.min(elements.length, 20); i++) {
          const el = elements[i];
          const styles = getComputedStyle(el);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          const fontSize = styles.fontSize;
          
          if (el.textContent?.trim()) {
            results.push({
              text: el.textContent.substring(0, 30),
              color,
              backgroundColor,
              fontSize,
              tagName: el.tagName
            });
          }
        }
        
        return results;
      });
      
      actions.logTestInfo(`📊 Analyzed contrast for ${contrastResults.length} text elements`);
      
      // Simple heuristic checks
      const lowContrastElements = contrastResults.filter(el => {
        const isLightText = el.color.includes('rgb(255') || el.color.includes('#fff');
        const isLightBackground = el.backgroundColor.includes('rgb(255') || el.backgroundColor.includes('#fff');
        return isLightText && isLightBackground;
      });
      
      if (lowContrastElements.length === 0) {
        actions.logTestInfo('✅ No obvious low-contrast text detected');
      } else {
        actions.logTestInfo(`⚠️ ${lowContrastElements.length} potentially low-contrast elements found`);
      }
    });
  });

  test('Mobile accessibility and touch targets', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('📱 Testing mobile accessibility');
    
    await actions.step('📱 Set Mobile Viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await actions.observableGoto('https://www.sbb.ch', 'Navigate in mobile viewport');
      
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies on mobile');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
    });

    await actions.step('👆 Check Touch Target Sizes', async () => {
      const touchTargets = await page.evaluate(() => {
        const interactive = document.querySelectorAll('button, a, input, select, [role="button"], [tabindex]');
        return Array.from(interactive).map(el => {
          const rect = el.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            area: rect.width * rect.height,
            tagName: el.tagName,
            text: el.textContent?.substring(0, 20),
            isVisible: rect.width > 0 && rect.height > 0
          };
        }).filter(target => target.isVisible);
      });
      
      // WCAG recommends minimum 44x44px touch targets
      const smallTargets = touchTargets.filter(target => 
        target.width < 44 || target.height < 44
      );
      
      actions.logTestInfo(`📊 Interactive elements: ${touchTargets.length}`);
      actions.logTestInfo(`📊 Small touch targets (<44px): ${smallTargets.length}`);
      
      if (smallTargets.length === 0) {
        actions.logTestInfo('✅ All touch targets meet minimum size requirements');
      } else {
        actions.logTestInfo('⚠️ Some touch targets may be too small for accessibility');
        smallTargets.slice(0, 5).forEach(target => {
          actions.logTestInfo(`  - ${target.tagName}: ${target.width}x${target.height}px`);
        });
      }
      
      await actions.screenshot('sbb-mobile-touch-targets', 'Mobile touch target analysis');
    });

    await actions.step('🔄 Test Mobile Orientation', async () => {
      // Test landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      actions.logTestInfo('📱 Switched to landscape orientation');
      
      await page.waitForTimeout(1000);
      
      // Check if journey planner is still accessible
      const journeyFormVisible = await page.evaluate(() => {
        const fromField = document.querySelector('[role="combobox"]');
        return fromField ? fromField.getBoundingClientRect().width > 0 : false;
      });
      
      if (journeyFormVisible) {
        actions.logTestInfo('✅ Journey planner accessible in landscape mode');
      } else {
        actions.logTestInfo('⚠️ Journey planner may have layout issues in landscape');
      }
      
      await actions.screenshot('sbb-landscape-mode', 'Landscape orientation test');
    });
  });
});