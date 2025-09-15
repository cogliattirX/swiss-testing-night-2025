import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * DemoQA Elements Testing Suite
 * 
 * Comprehensive testing of DemoQA Elements section
 */

test.describe('DemoQA Elements Testing', () => {
  const baseUrl = 'https://demoqa.com';
  
  test.beforeEach(async ({ page }) => {
    const actions = createObservableActions(page);
    await actions.observableGoto(baseUrl, 'Navigate to DemoQA homepage');
    
    // Navigate to Elements section
    await actions.observableClick('text=Elements', 'Click Elements section');
    await actions.observableWait('.left-pannel', 'Wait for elements menu');
  });

  test('Text Box - Complete form interaction and validation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Text Box', async () => {
      await actions.observableClick('text=Text Box', 'Click Text Box menu item');
      await actions.observableWait('#userName', 'Wait for text box form');
    });

    await test.step('Fill and submit form', async () => {
      await actions.observableFill('#userName', 'John Doe Smith', 'Enter full name');
      await actions.observableFill('#userEmail', 'john.doe@testmail.com', 'Enter email address');
      await actions.observableFill('#currentAddress', '123 Main Street\nAnytown, ST 12345', 'Enter current address');
      await actions.observableFill('#permanentAddress', '456 Oak Avenue\nSomewhere, ST 67890', 'Enter permanent address');
      
      await actions.observableClick('#submit', 'Submit the form');
      await actions.observableWait('#output', 'Wait for output display');
    });

    await test.step('Validate output', async () => {
      await actions.observableExpect(async () => {
        await expect(page.locator('#output #name')).toContainText('John Doe Smith');
        await expect(page.locator('#output #email')).toContainText('john.doe@testmail.com');
      }, 'Verify output fields match input data');

      console.log('✅ Text Box form completed successfully');
    });

    await actions.screenshot('demoqa-textbox-complete', 'Text Box testing completed');
  });

  test('Check Box - Tree navigation and selection', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Check Box', async () => {
      await actions.observableClick('text=Check Box', 'Click Check Box menu item');
      await actions.observableWait('.rct-tree', 'Wait for checkbox tree');
    });

    await test.step('Expand and select items', async () => {
      await actions.observableClick('.rct-icon-expand-close', 'Expand main tree node');
      await actions.observableWait('text=Desktop', 'Wait for Desktop node');
      
      await actions.observableClick('label:has-text("Desktop") + .rct-icon', 'Expand Desktop folder');
      await actions.observableWait('text=Notes', 'Wait for Notes item');
      
      await actions.observableClick('label:has-text("Notes")', 'Select Notes checkbox');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('#result')).toContainText('notes');
      }, 'Verify selection appears in results');
    });

    await actions.screenshot('demoqa-checkbox-complete', 'Check Box testing completed');
    console.log('✅ Check Box navigation completed');
  });

  test('Radio Button - Selection validation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate and test radio buttons', async () => {
      await actions.observableClick('text=Radio Button', 'Click Radio Button menu item');
      await actions.observableWait('.custom-radio', 'Wait for radio buttons');
      
      await actions.observableClick('label[for="yesRadio"]', 'Select Yes radio button');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('.text-success')).toContainText('Yes');
      }, 'Verify Yes selection');
      
      await actions.observableClick('label[for="impressiveRadio"]', 'Select Impressive radio button');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('.text-success')).toContainText('Impressive');
      }, 'Verify Impressive selection');
    });

    await actions.screenshot('demoqa-radiobutton-complete', 'Radio Button testing completed');
    console.log('✅ Radio Button testing completed');
  });

  test('Buttons - Click interactions validation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate and test buttons', async () => {
      await actions.observableClick('text=Buttons', 'Click Buttons menu item');
      await actions.observableWait('button:has-text("Click Me")', 'Wait for buttons section');
      
      // Double click test
      await page.dblclick('#doubleClickBtn');
      console.log('🖱️ Double clicked button');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('#doubleClickMessage')).toContainText('double click');
      }, 'Verify double click message');
      
      // Right click test
      await page.click('#rightClickBtn', { button: 'right' });
      console.log('🖱️ Right clicked button');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('#rightClickMessage')).toContainText('right click');
      }, 'Verify right click message');
      
      // Dynamic click test
      await page.click('button:has-text("Click Me"):not(#doubleClickBtn):not(#rightClickBtn)');
      console.log('🖱️ Clicked dynamic button');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('#dynamicClickMessage')).toContainText('dynamic click');
      }, 'Verify dynamic click message');
    });

    await actions.screenshot('demoqa-buttons-complete', 'Buttons testing completed');
    console.log('✅ Buttons interaction testing completed');
  });

  test('Links - API response validation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate and test API links', async () => {
      await actions.observableClick('text=Links', 'Click Links menu item');
      await actions.observableWait('a[href="https://demoqa.com"]', 'Wait for links section');
      
      // Test Created link (201)
      await actions.observableClick('a:has-text("Created")', 'Click Created API link');
      await actions.observableWait('#linkResponse', 'Wait for API response');
      
      await actions.observableExpect(async () => {
        const response = await page.locator('#linkResponse').textContent();
        expect(response).toContain('201');
      }, 'Verify Created API response');
      
      // Test Bad Request link (400)
      await actions.observableClick('a:has-text("Bad Request")', 'Click Bad Request API link');
      await actions.observableWait('#linkResponse', 'Wait for API response');
      
      await actions.observableExpect(async () => {
        const response = await page.locator('#linkResponse').textContent();
        expect(response).toContain('400');
      }, 'Verify Bad Request API response');
    });

    await actions.screenshot('demoqa-links-complete', 'Links testing completed');
    console.log('✅ Links API testing completed');
  });

  test('Upload and Download - File operations', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Test file download', async () => {
      await actions.observableClick('text=Upload and Download', 'Click Upload and Download menu item');
      await actions.observableWait('#downloadButton', 'Wait for upload/download section');
      
      const downloadPromise = page.waitForEvent('download');
      await actions.observableClick('#downloadButton', 'Click Download button');
      
      const download = await downloadPromise;
      console.log(`📥 Download filename: ${download.suggestedFilename()}`);
      
      expect(download.suggestedFilename()).toBe('sampleFile.jpeg');
    });

    await actions.screenshot('demoqa-upload-download-complete', 'Upload/Download testing completed');
    console.log('✅ Upload/Download testing completed');
  });

  test('Dynamic Properties - Runtime behavior', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Test dynamic behavior', async () => {
      await actions.observableClick('text=Dynamic Properties', 'Click Dynamic Properties menu item');
      await actions.observableWait('#enableAfter', 'Wait for dynamic properties section');
      
      const enableButton = page.locator('#enableAfter');
      
      // Initially disabled
      await actions.observableExpect(async () => {
        await expect(enableButton).toBeDisabled();
      }, 'Verify button is initially disabled');
      
      // Wait for enablement (5 seconds)
      await page.waitForSelector('#enableAfter:enabled', { timeout: 6000 });
      
      await actions.observableExpect(async () => {
        await expect(enableButton).toBeEnabled();
      }, 'Verify button becomes enabled');
      
      // Wait for visible button (5 seconds)
      await page.waitForSelector('#visibleAfter', { timeout: 6000 });
      
      await actions.observableExpect(async () => {
        await expect(page.locator('#visibleAfter')).toBeVisible();
      }, 'Verify button appears after delay');
      
      await actions.observableClick('#visibleAfter', 'Click the delayed button');
    });

    await actions.screenshot('demoqa-dynamic-properties-complete', 'Dynamic Properties testing completed');
    console.log('✅ Dynamic Properties testing completed');
  });
});
