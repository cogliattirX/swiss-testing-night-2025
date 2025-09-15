import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * DemoQA Alerts, Frame & Windows Testing Suite
 * 
 * Comprehensive testing of DemoQA Alerts, Frame & Windows section including:
 * - Browser Alert handling (simple, confirm, prompt)
 * - Modal Dialog interactions
 * - Browser Windows (new tabs/windows)
 * - Nested Frames navigation
 */

test.describe('DemoQA Alerts, Frame & Windows Testing', () => {
  const baseUrl = 'https://demoqa.com';
  
  test.beforeEach(async ({ page }) => {
    const actions = createObservableActions(page);
    await actions.observableGoto(baseUrl, 'Navigate to DemoQA homepage');
    
    // Navigate to Alerts, Frame & Windows section
    await actions.observableClick('text=Alerts, Frame & Windows', 'Click Alerts, Frame & Windows section');
    await actions.observableWait('.left-pannel', 'Wait for alerts menu');
  });

  test('Browser Windows - Handle new tabs and windows', async ({ page, context }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Browser Windows', async () => {
      await actions.observableClick('text=Browser Windows', 'Click Browser Windows menu item');
      await actions.observableWait('#tabButton', 'Wait for window buttons');
    });

    await test.step('Test new tab creation', async () => {
      // Set up listener for new page
      const newPagePromise = context.waitForEvent('page');
      
      await actions.observableClick('#tabButton', 'Click New Tab button');
      
      const newPage = await newPagePromise;
      await newPage.waitForLoadState();
      
      // Verify new tab content
      const newTabContent = await newPage.textContent('body');
      console.log(`📑 New tab content: ${newTabContent?.slice(0, 100)}...`);
      expect(newTabContent).toContain('This is a sample page');
      
      // Close new tab
      await newPage.close();
      console.log('✅ New tab functionality works correctly');
    });

    await test.step('Test new window creation', async () => {
      const newPagePromise = context.waitForEvent('page');
      
      await actions.observableClick('#windowButton', 'Click New Window button');
      
      const newWindow = await newPagePromise;
      await newWindow.waitForLoadState();
      
      // Verify new window content
      const newWindowContent = await newWindow.textContent('body');
      console.log(`🪟 New window content: ${newWindowContent?.slice(0, 100)}...`);
      expect(newWindowContent).toContain('This is a sample page');
      
      // Close new window
      await newWindow.close();
      console.log('✅ New window functionality works correctly');
    });

    await test.step('Test new window message', async () => {
      const newPagePromise = context.waitForEvent('page');
      
      await actions.observableClick('#messageWindowButton', 'Click New Window Message button');
      
      const messageWindow = await newPagePromise;
      await messageWindow.waitForLoadState();
      
      // Verify message window content
      const messageContent = await messageWindow.textContent('body');
      console.log(`💬 Message window content: ${messageContent}`);
      expect(messageContent).toBeTruthy();
      
      // Close message window
      await messageWindow.close();
      console.log('✅ New window message functionality works correctly');
    });

    await actions.screenshot('demoqa-windows-complete', 'Browser Windows testing completed');
  });

  test('Alerts - Handle browser alert dialogs', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Alerts', async () => {
      await actions.observableClick('text=Alerts', 'Click Alerts menu item');
      await actions.observableWait('#alertButton', 'Wait for alert buttons');
    });

    await test.step('Test simple alert', async () => {
      // Set up alert handler
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        console.log(`🚨 Alert message: ${alertMessage}`);
        await dialog.accept();
      });
      
      await actions.observableClick('#alertButton', 'Click simple alert button');
      
      // Verify alert was triggered
      expect(alertMessage).toContain('You clicked a button');
      console.log('✅ Simple alert works correctly');
    });

    await test.step('Test timer alert', async () => {
      let timerAlertMessage = '';
      page.on('dialog', async dialog => {
        timerAlertMessage = dialog.message();
        console.log(`⏰ Timer alert message: ${timerAlertMessage}`);
        await dialog.accept();
      });
      
      await actions.observableClick('#timerAlertButton', 'Click timer alert button');
      
      // Wait for alert to appear (5 second delay)
      console.log('⏳ Waiting for timer alert (5 seconds)...');
      await page.waitForTimeout(6000);
      
      expect(timerAlertMessage).toContain('This alert appeared after 5 seconds');
      console.log('✅ Timer alert works correctly');
    });

    await test.step('Test confirm alert - Accept', async () => {
      let confirmMessage = '';
      let confirmResult = '';
      
      page.on('dialog', async dialog => {
        confirmMessage = dialog.message();
        console.log(`❓ Confirm message: ${confirmMessage}`);
        await dialog.accept(); // Click OK
      });
      
      await actions.observableClick('#confirmButton', 'Click confirm alert button');
      
      // Check result text
      const resultText = await page.locator('#confirmResult').textContent();
      confirmResult = resultText || '';
      console.log(`✅ Confirm result: ${confirmResult}`);
      
      expect(confirmMessage).toContain('Do you confirm action?');
      expect(confirmResult).toContain('You selected Ok');
      console.log('✅ Confirm alert (Accept) works correctly');
    });

    await test.step('Test confirm alert - Dismiss', async () => {
      let dismissResult = '';
      
      page.on('dialog', async dialog => {
        console.log(`❌ Dismissing confirm: ${dialog.message()}`);
        await dialog.dismiss(); // Click Cancel
      });
      
      await actions.observableClick('#confirmButton', 'Click confirm alert button again');
      
      // Check result text
      const resultText = await page.locator('#confirmResult').textContent();
      dismissResult = resultText || '';
      console.log(`❌ Dismiss result: ${dismissResult}`);
      
      expect(dismissResult).toContain('You selected Cancel');
      console.log('✅ Confirm alert (Dismiss) works correctly');
    });

    await test.step('Test prompt alert', async () => {
      const testInput = 'Test User Input';
      let promptMessage = '';
      
      page.on('dialog', async dialog => {
        promptMessage = dialog.message();
        console.log(`📝 Prompt message: ${promptMessage}`);
        await dialog.accept(testInput); // Enter text and click OK
      });
      
      await actions.observableClick('#promtButton', 'Click prompt alert button');
      
      // Check result text
      const promptResult = await page.locator('#promptResult').textContent();
      console.log(`📝 Prompt result: ${promptResult}`);
      
      expect(promptMessage).toContain('Please enter your name');
      expect(promptResult).toContain(testInput);
      console.log('✅ Prompt alert works correctly');
    });

    await actions.screenshot('demoqa-alerts-complete', 'Alerts testing completed');
  });

  test('Frames - Navigate nested frames', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Frames', async () => {
      await actions.observableClick('text=Frames', 'Click Frames menu item');
      await actions.observableWait('#frame1', 'Wait for frames');
    });

    await test.step('Test first frame content', async () => {
      // Switch to first frame
      const frame1 = page.frameLocator('#frame1');
      
      // Get frame content
      const frame1Content = await frame1.locator('body').textContent();
      console.log(`🖼️ Frame 1 content: ${frame1Content}`);
      expect(frame1Content).toContain('This is a sample page');
      
      // Verify frame heading
      const frame1Heading = await frame1.locator('#sampleHeading').textContent();
      console.log(`📖 Frame 1 heading: ${frame1Heading}`);
      expect(frame1Heading).toBe('This is a sample page');
      
      console.log('✅ First frame content verified');
    });

    await test.step('Test second frame content', async () => {
      // Switch to second frame
      const frame2 = page.frameLocator('#frame2');
      
      // Get frame content
      const frame2Content = await frame2.locator('body').textContent();
      console.log(`🖼️ Frame 2 content: ${frame2Content}`);
      expect(frame2Content).toContain('This is a sample page');
      
      // Verify frame heading
      const frame2Heading = await frame2.locator('#sampleHeading').textContent();
      console.log(`📖 Frame 2 heading: ${frame2Heading}`);
      expect(frame2Heading).toBe('This is a sample page');
      
      console.log('✅ Second frame content verified');
    });

    await actions.screenshot('demoqa-frames-complete', 'Frames testing completed');
  });

  test('Nested Frames - Complex frame navigation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Nested Frames', async () => {
      await actions.observableClick('text=Nested Frames', 'Click Nested Frames menu item');
      await actions.observableWait('#frame1', 'Wait for nested frames');
    });

    await test.step('Test parent frame', async () => {
      // Access parent frame
      const parentFrame = page.frameLocator('#frame1');
      
      const parentContent = await parentFrame.locator('body').textContent();
      console.log(`👨‍👩‍👧‍👦 Parent frame content: ${parentContent}`);
      expect(parentContent).toContain('Parent frame');
      
      console.log('✅ Parent frame content verified');
    });

    await test.step('Test child frame within parent', async () => {
      // Access parent frame first, then child frame within it
      const parentFrame = page.frameLocator('#frame1');
      const childFrame = parentFrame.frameLocator('iframe');
      
      // Get child frame content
      const childContent = await childFrame.locator('body').textContent();
      console.log(`👶 Child frame content: ${childContent}`);
      expect(childContent).toContain('Child Iframe');
      
      console.log('✅ Nested child frame content verified');
    });

    await actions.screenshot('demoqa-nested-frames-complete', 'Nested Frames testing completed');
  });

  test('Modal Dialogs - Handle modal interactions', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Modal Dialogs', async () => {
      await actions.observableClick('text=Modal Dialogs', 'Click Modal Dialogs menu item');
      await actions.observableWait('#showSmallModal', 'Wait for modal buttons');
    });

    await test.step('Test small modal', async () => {
      await actions.observableClick('#showSmallModal', 'Click Show Small Modal button');
      
      // Wait for modal to appear
      await actions.observableWait('.modal-content', 'Wait for small modal to appear');
      
      // Verify modal is visible
      await actions.observableExpect(async () => {
        await expect(page.locator('.modal-dialog')).toBeVisible();
      }, 'Verify small modal is visible');
      
      // Check modal title and content
      const modalTitle = await page.locator('.modal-title').textContent();
      const modalBody = await page.locator('.modal-body').textContent();
      
      console.log(`📋 Small modal title: ${modalTitle}`);
      console.log(`📄 Small modal body: ${modalBody?.slice(0, 100)}...`);
      
      expect(modalTitle).toBe('Small Modal');
      expect(modalBody).toContain('This is a small modal');
      
      // Close modal
      await actions.observableClick('#closeSmallModal', 'Close small modal');
      
      // Verify modal is closed
      await actions.observableExpect(async () => {
        await expect(page.locator('.modal-dialog')).not.toBeVisible();
      }, 'Verify small modal is closed');
      
      console.log('✅ Small modal works correctly');
    });

    await test.step('Test large modal', async () => {
      await actions.observableClick('#showLargeModal', 'Click Show Large Modal button');
      
      // Wait for modal to appear
      await actions.observableWait('.modal-content', 'Wait for large modal to appear');
      
      // Verify modal is visible
      await actions.observableExpect(async () => {
        await expect(page.locator('.modal-dialog.modal-lg')).toBeVisible();
      }, 'Verify large modal is visible');
      
      // Check modal title and content
      const largeModalTitle = await page.locator('.modal-title').textContent();
      const largeModalBody = await page.locator('.modal-body').textContent();
      
      console.log(`📋 Large modal title: ${largeModalTitle}`);
      console.log(`📄 Large modal body length: ${largeModalBody?.length} characters`);
      
      expect(largeModalTitle).toBe('Large Modal');
      expect(largeModalBody).toContain('Lorem Ipsum');
      
      // Close modal using X button
      await actions.observableClick('.modal-header .close', 'Close large modal with X');
      
      // Verify modal is closed
      await actions.observableExpect(async () => {
        await expect(page.locator('.modal-dialog')).not.toBeVisible();
      }, 'Verify large modal is closed');
      
      console.log('✅ Large modal works correctly');
    });

    await test.step('Test modal overlay close', async () => {
      // Open small modal again
      await actions.observableClick('#showSmallModal', 'Open small modal again');
      await actions.observableWait('.modal-content', 'Wait for modal');
      
      // Click outside modal (on overlay) to close
      await page.click('.modal', { position: { x: 10, y: 10 } });
      
      // Verify modal is closed
      await actions.observableExpect(async () => {
        await expect(page.locator('.modal-dialog')).not.toBeVisible();
      }, 'Verify modal closes when clicking overlay');
      
      console.log('✅ Modal overlay close works correctly');
    });

    await actions.screenshot('demoqa-modals-complete', 'Modal Dialogs testing completed');
  });
});
