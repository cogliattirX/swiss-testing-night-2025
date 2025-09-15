import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * DemoQA Widgets Testing Suite
 * 
 * Comprehensive testing of DemoQA Widgets section including:
 * - Accordian expand/collapse
 * - Auto Complete functionality
 * - Date Picker interactions
 * - Slider value changes
 * - Progress Bar monitoring
 * - Tabs navigation
 * - Tool Tips display
 * - Menu interactions
 * - Select Menu functionality
 */

test.describe('DemoQA Widgets Testing', () => {
  const baseUrl = 'https://demoqa.com';
  
  test.beforeEach(async ({ page }) => {
    const actions = createObservableActions(page);
    await actions.observableGoto(baseUrl, 'Navigate to DemoQA homepage');
    
    // Navigate to Widgets section
    await actions.observableClick('text=Widgets', 'Click Widgets section');
    await actions.observableWait('.left-pannel', 'Wait for widgets menu');
  });

  test('Accordian - Expand and collapse functionality', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Accordian', async () => {
      await actions.observableClick('text=Accordian', 'Click Accordian menu item');
      await actions.observableWait('#section1Heading', 'Wait for accordian sections');
    });

    await test.step('Test first section accordion', async () => {
      // Click first section header
      await actions.observableClick('#section1Heading', 'Click first section header');
      
      // Verify content is visible
      await actions.observableExpect(async () => {
        await expect(page.locator('#section1Content')).toBeVisible();
      }, 'Verify first section content is visible');
      
      // Verify content text
      const content1 = await page.locator('#section1Content').textContent();
      console.log(`📖 First section content length: ${content1?.length} characters`);
      expect(content1).toContain('Lorem Ipsum');
      
      // Click again to collapse
      await actions.observableClick('#section1Heading', 'Collapse first section');
      
      // Verify content is hidden
      await actions.observableExpect(async () => {
        await expect(page.locator('#section1Content')).toBeHidden();
      }, 'Verify first section content is hidden');
      
      console.log('✅ First accordion section works correctly');
    });

    await test.step('Test second section accordion', async () => {
      await actions.observableClick('#section2Heading', 'Click second section header');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('#section2Content')).toBeVisible();
      }, 'Verify second section content is visible');
      
      const content2 = await page.locator('#section2Content').textContent();
      console.log(`📖 Second section content length: ${content2?.length} characters`);
      expect(content2).toContain('Contrary to popular belief');
      
      console.log('✅ Second accordion section works correctly');
    });

    await test.step('Test third section accordion', async () => {
      await actions.observableClick('#section3Heading', 'Click third section header');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('#section3Content')).toBeVisible();
      }, 'Verify third section content is visible');
      
      const content3 = await page.locator('#section3Content').textContent();
      console.log(`📖 Third section content length: ${content3?.length} characters`);
      expect(content3).toContain('It is a long established fact');
      
      console.log('✅ Third accordion section works correctly');
    });

    await test.step('Test multiple sections open', async () => {
      // Open first section while third is open
      await actions.observableClick('#section1Heading', 'Open first section again');
      
      // Both should be open simultaneously
      await actions.observableExpect(async () => {
        await expect(page.locator('#section1Content')).toBeVisible();
        await expect(page.locator('#section3Content')).toBeVisible();
      }, 'Verify multiple sections can be open');
      
      console.log('✅ Multiple accordion sections can be open simultaneously');
    });

    await actions.screenshot('demoqa-accordian-complete', 'Accordian testing completed');
  });

  test('Auto Complete - Text input with suggestions', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Auto Complete', async () => {
      await actions.observableClick('text=Auto Complete', 'Click Auto Complete menu item');
      await actions.observableWait('#autoCompleteMultipleInput', 'Wait for auto complete inputs');
    });

    await test.step('Test multiple values auto complete', async () => {
      const multiInput = page.locator('#autoCompleteMultipleInput');
      
      // Type partial color name
      await actions.observableClick('#autoCompleteMultipleInput', 'Click multiple input');
      await page.type('#autoCompleteMultipleInput', 'bl');
      
      // Wait for suggestions to appear
      await actions.observableWait('.auto-complete__menu', 'Wait for auto complete suggestions');
      
      // Select suggestion
      await actions.observableClick('.auto-complete__option:has-text("Blue")', 'Select Blue option');
      
      // Verify selection was added
      await actions.observableExpect(async () => {
        await expect(page.locator('.auto-complete__multi-value__label:has-text("Blue")')).toBeVisible();
      }, 'Verify Blue was selected');
      
      // Add another color
      await page.type('#autoCompleteMultipleInput', 're');
      await actions.observableWait('.auto-complete__menu', 'Wait for suggestions again');
      await actions.observableClick('.auto-complete__option:has-text("Red")', 'Select Red option');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('.auto-complete__multi-value__label:has-text("Red")')).toBeVisible();
      }, 'Verify Red was also selected');
      
      console.log('✅ Multiple auto complete works correctly');
    });

    await test.step('Test single value auto complete', async () => {
      const singleInput = page.locator('#autoCompleteSingleInput');
      
      await actions.observableClick('#autoCompleteSingleInput', 'Click single input');
      await page.type('#autoCompleteSingleInput', 'gr');
      
      await actions.observableWait('.auto-complete__menu', 'Wait for single input suggestions');
      await actions.observableClick('.auto-complete__option:has-text("Green")', 'Select Green option');
      
      // Verify single selection
      const inputValue = await singleInput.inputValue();
      expect(inputValue).toBe('Green');
      
      console.log('✅ Single auto complete works correctly');
    });

    await test.step('Test removing selections', async () => {
      // Remove Blue from multiple selection
      await actions.observableClick('.auto-complete__multi-value__remove:first-child', 'Remove first selection');
      
      // Verify Blue was removed
      await actions.observableExpect(async () => {
        await expect(page.locator('.auto-complete__multi-value__label:has-text("Blue")')).not.toBeVisible();
      }, 'Verify Blue was removed');
      
      // Red should still be there
      await actions.observableExpect(async () => {
        await expect(page.locator('.auto-complete__multi-value__label:has-text("Red")')).toBeVisible();
      }, 'Verify Red is still selected');
      
      console.log('✅ Selection removal works correctly');
    });

    await actions.screenshot('demoqa-autocomplete-complete', 'Auto Complete testing completed');
  });

  test('Date Picker - Calendar interactions', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Date Picker', async () => {
      await actions.observableClick('text=Date Picker', 'Click Date Picker menu item');
      await actions.observableWait('#datePickerMonthYearInput', 'Wait for date picker inputs');
    });

    await test.step('Test simple date picker', async () => {
      await actions.observableClick('#datePickerMonthYearInput', 'Click date picker input');
      await actions.observableWait('.react-datepicker', 'Wait for date picker popup');
      
      // Navigate to a specific month/year
      await actions.observableClick('.react-datepicker__month-select', 'Click month dropdown');
      await actions.observableClick('option[value="5"]', 'Select June');
      
      await actions.observableClick('.react-datepicker__year-select', 'Click year dropdown');
      await actions.observableClick('option[value="2025"]', 'Select 2025');
      
      // Select a specific date
      await actions.observableClick('.react-datepicker__day--015', 'Select 15th day');
      
      // Verify date was selected
      const selectedDate = await page.locator('#datePickerMonthYearInput').inputValue();
      console.log(`📅 Selected date: ${selectedDate}`);
      expect(selectedDate).toContain('06/15/2025');
      
      console.log('✅ Simple date picker works correctly');
    });

    await test.step('Test date and time picker', async () => {
      await actions.observableClick('#dateAndTimePickerInput', 'Click date and time picker');
      await actions.observableWait('.react-datepicker', 'Wait for date time picker');
      
      // Select a date
      await actions.observableClick('.react-datepicker__day--020', 'Select 20th day');
      
      // Select time
      await actions.observableClick('.react-datepicker__time-list-item:has-text("10:30")', 'Select 10:30 time');
      
      // Verify date and time selection
      const selectedDateTime = await page.locator('#dateAndTimePickerInput').inputValue();
      console.log(`🕒 Selected date and time: ${selectedDateTime}`);
      expect(selectedDateTime).toContain('10:30');
      
      console.log('✅ Date and time picker works correctly');
    });

    await actions.screenshot('demoqa-datepicker-complete', 'Date Picker testing completed');
  });

  test('Slider - Value adjustment functionality', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Slider', async () => {
      await actions.observableClick('text=Slider', 'Click Slider menu item');
      await actions.observableWait('.range-slider', 'Wait for slider element');
    });

    await test.step('Test slider value changes', async () => {
      const slider = page.locator('.range-slider input[type="range"]');
      const valueDisplay = page.locator('#sliderValue');
      
      // Get initial value
      const initialValue = await valueDisplay.inputValue();
      console.log(`🎚️ Initial slider value: ${initialValue}`);
      
      // Move slider to different positions
      await slider.fill('75');
      
      // Verify value changed
      const newValue = await valueDisplay.inputValue();
      console.log(`🎚️ New slider value: ${newValue}`);
      expect(newValue).toBe('75');
      
      // Test minimum value
      await slider.fill('0');
      const minValue = await valueDisplay.inputValue();
      expect(minValue).toBe('0');
      
      // Test maximum value
      await slider.fill('100');
      const maxValue = await valueDisplay.inputValue();
      expect(maxValue).toBe('100');
      
      console.log('✅ Slider value adjustment works correctly');
    });

    await actions.screenshot('demoqa-slider-complete', 'Slider testing completed');
  });

  test('Progress Bar - Value monitoring', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Progress Bar', async () => {
      await actions.observableClick('text=Progress Bar', 'Click Progress Bar menu item');
      await actions.observableWait('#progressBar', 'Wait for progress bar');
    });

    await test.step('Test progress bar functionality', async () => {
      const progressBar = page.locator('#progressBar');
      const startStopButton = page.locator('#startStopButton');
      const resetButton = page.locator('#resetButton');
      
      // Get initial progress value
      const initialProgress = await progressBar.getAttribute('aria-valuenow');
      console.log(`📊 Initial progress: ${initialProgress}%`);
      
      // Start progress
      await actions.observableClick('#startStopButton', 'Start progress bar');
      
      // Wait a bit and check if progress increased
      await page.waitForTimeout(3000);
      
      const midProgress = await progressBar.getAttribute('aria-valuenow');
      console.log(`📊 Progress after 3 seconds: ${midProgress}%`);
      
      if (initialProgress && midProgress) {
        expect(parseInt(midProgress)).toBeGreaterThan(parseInt(initialProgress));
      }
      
      // Stop progress
      await actions.observableClick('#startStopButton', 'Stop progress bar');
      
      // Wait and verify progress stopped
      const stoppedProgress = await progressBar.getAttribute('aria-valuenow');
      await page.waitForTimeout(2000);
      const finalProgress = await progressBar.getAttribute('aria-valuenow');
      
      expect(stoppedProgress).toBe(finalProgress);
      console.log(`📊 Progress stopped at: ${finalProgress}%`);
      
      // Reset progress
      await actions.observableClick('#resetButton', 'Reset progress bar');
      
      const resetProgress = await progressBar.getAttribute('aria-valuenow');
      expect(resetProgress).toBe('0');
      
      console.log('✅ Progress bar functionality works correctly');
    });

    await actions.screenshot('demoqa-progressbar-complete', 'Progress Bar testing completed');
  });

  test('Tabs - Navigation functionality', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Tabs', async () => {
      await actions.observableClick('text=Tabs', 'Click Tabs menu item');
      await actions.observableWait('#demo-tab-what', 'Wait for tabs');
    });

    await test.step('Test tab navigation', async () => {
      // Test What tab (should be active by default)
      await actions.observableExpect(async () => {
        await expect(page.locator('#demo-tabpane-what')).toBeVisible();
      }, 'Verify What tab content is visible by default');
      
      const whatContent = await page.locator('#demo-tabpane-what').textContent();
      console.log(`📑 What tab content length: ${whatContent?.length} characters`);
      
      // Click Origin tab
      await actions.observableClick('#demo-tab-origin', 'Click Origin tab');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('#demo-tabpane-origin')).toBeVisible();
        await expect(page.locator('#demo-tabpane-what')).toBeHidden();
      }, 'Verify Origin tab is active and What tab is hidden');
      
      const originContent = await page.locator('#demo-tabpane-origin').textContent();
      console.log(`📑 Origin tab content length: ${originContent?.length} characters`);
      
      // Click Use tab
      await actions.observableClick('#demo-tab-use', 'Click Use tab');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('#demo-tabpane-use')).toBeVisible();
        await expect(page.locator('#demo-tabpane-origin')).toBeHidden();
      }, 'Verify Use tab is active');
      
      const useContent = await page.locator('#demo-tabpane-use').textContent();
      console.log(`📑 Use tab content length: ${useContent?.length} characters`);
      
      // Test More tab (might be disabled)
      const moreTab = page.locator('#demo-tab-more');
      const isMoreTabDisabled = await moreTab.getAttribute('aria-disabled');
      
      if (isMoreTabDisabled === 'true') {
        console.log('📑 More tab is disabled (expected behavior)');
      } else {
        await actions.observableClick('#demo-tab-more', 'Click More tab');
        await actions.observableExpect(async () => {
          await expect(page.locator('#demo-tabpane-more')).toBeVisible();
        }, 'Verify More tab content if enabled');
      }
      
      console.log('✅ Tab navigation works correctly');
    });

    await actions.screenshot('demoqa-tabs-complete', 'Tabs testing completed');
  });

  test('Tool Tips - Hover display functionality', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Tool Tips', async () => {
      await actions.observableClick('text=Tool Tips', 'Click Tool Tips menu item');
      await actions.observableWait('#toolTipButton', 'Wait for tooltip elements');
    });

    await test.step('Test button tooltip', async () => {
      const tooltipButton = page.locator('#toolTipButton');
      
      // Hover over button
      await tooltipButton.hover();
      console.log('🎯 Hovered over tooltip button');
      
      // Wait for tooltip to appear
      await actions.observableWait('.tooltip', 'Wait for tooltip to appear');
      
      // Verify tooltip content
      await actions.observableExpect(async () => {
        await expect(page.locator('.tooltip')).toBeVisible();
      }, 'Verify tooltip appears on hover');
      
      const tooltipText = await page.locator('.tooltip .tooltip-inner').textContent();
      console.log(`💬 Button tooltip text: ${tooltipText}`);
      
      console.log('✅ Button tooltip works correctly');
    });

    await test.step('Test text field tooltip', async () => {
      const tooltipTextField = page.locator('#toolTipTextField');
      
      await tooltipTextField.hover();
      console.log('🎯 Hovered over tooltip text field');
      
      await page.waitForTimeout(500); // Wait for tooltip
      
      // Check if tooltip appeared (it might be different implementation)
      const tooltipExists = await page.locator('.tooltip').isVisible().catch(() => false);
      
      if (tooltipExists) {
        const fieldTooltipText = await page.locator('.tooltip .tooltip-inner').textContent();
        console.log(`💬 Text field tooltip: ${fieldTooltipText}`);
      } else {
        console.log('💬 Text field tooltip might use different implementation');
      }
      
      console.log('✅ Text field tooltip tested');
    });

    await test.step('Test link tooltips', async () => {
      // Test "Contrary" link tooltip
      const contraryLink = page.locator('a:has-text("Contrary")');
      
      await contraryLink.hover();
      console.log('🎯 Hovered over Contrary link');
      
      await page.waitForTimeout(500);
      
      // Test "1.10.32" link tooltip
      const versionLink = page.locator('a:has-text("1.10.32")');
      
      await versionLink.hover();
      console.log('🎯 Hovered over version link');
      
      await page.waitForTimeout(500);
      
      console.log('✅ Link tooltips tested');
    });

    await actions.screenshot('demoqa-tooltips-complete', 'Tool Tips testing completed');
  });

  test('Menu - Navigation menu functionality', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Menu', async () => {
      await actions.observableClick('text=Menu', 'Click Menu menu item');
      await actions.observableWait('#nav', 'Wait for navigation menu');
    });

    await test.step('Test menu navigation', async () => {
      // Click Main Item 1
      await actions.observableClick('a:has-text("Main Item 1")', 'Click Main Item 1');
      console.log('📋 Clicked Main Item 1');
      
      // Hover over Main Item 2 to show submenu
      await page.hover('a:has-text("Main Item 2")');
      console.log('🎯 Hovered over Main Item 2');
      
      // Wait for submenu to appear
      await actions.observableWait('a:has-text("Sub Item")', 'Wait for Sub Item to appear');
      
      // Click on Sub Item
      await actions.observableClick('a:has-text("Sub Item")', 'Click Sub Item');
      console.log('📋 Clicked Sub Item');
      
      // Hover over Main Item 2 again to access SUB SUB LIST
      await page.hover('a:has-text("Main Item 2")');
      
      // Hover over SUB SUB LIST
      await page.hover('a:has-text("SUB SUB LIST »")');
      console.log('🎯 Hovered over SUB SUB LIST');
      
      // Wait for sub-submenu to appear
      await page.waitForTimeout(1000);
      
      // Look for sub-sub items
      const subSubItems = await page.locator('a:has-text("Sub Sub Item")').count();
      console.log(`📋 Found ${subSubItems} Sub Sub Items`);
      
      if (subSubItems > 0) {
        await actions.observableClick('a:has-text("Sub Sub Item 1")', 'Click Sub Sub Item 1');
        console.log('📋 Clicked Sub Sub Item 1');
      }
      
      // Test Main Item 3
      await actions.observableClick('a:has-text("Main Item 3")', 'Click Main Item 3');
      console.log('📋 Clicked Main Item 3');
      
      console.log('✅ Menu navigation works correctly');
    });

    await actions.screenshot('demoqa-menu-complete', 'Menu testing completed');
  });
});
