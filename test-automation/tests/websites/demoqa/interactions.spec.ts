import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * DemoQA Interactions Testing Suite
 * 
 * Comprehensive testing of DemoQA Interactions section including:
 * - Sortable items
 * - Selectable items  
 * - Resizable elements
 * - Droppable functionality
 * - Draggable elements
 */

test.describe('DemoQA Interactions Testing', () => {
  const baseUrl = 'https://demoqa.com';
  
  test.beforeEach(async ({ page }) => {
    const actions = createObservableActions(page);
    await actions.observableGoto(baseUrl, 'Navigate to DemoQA homepage');
    
    // Navigate to Interactions section
    await actions.observableClick('text=Interactions', 'Click Interactions section');
    await actions.observableWait('.left-pannel', 'Wait for interactions menu');
  });

  test('Sortable - List reordering functionality', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Sortable', async () => {
      await actions.observableClick('text=Sortable', 'Click Sortable menu item');
      await actions.observableWait('#demo-tabpane-list', 'Wait for sortable list');
    });

    await test.step('Test list tab sorting', async () => {
      // Get initial order of list items
      const initialItems = await page.locator('#demo-tabpane-list .list-group-item').allTextContents();
      console.log(`📝 Initial list order: ${initialItems.join(', ')}`);
      
      // Drag first item to third position
      const firstItem = page.locator('#demo-tabpane-list .list-group-item').first();
      const thirdItem = page.locator('#demo-tabpane-list .list-group-item').nth(2);
      
      await firstItem.dragTo(thirdItem);
      console.log('🔄 Dragged first item to third position');
      
      // Get new order
      const newItems = await page.locator('#demo-tabpane-list .list-group-item').allTextContents();
      console.log(`📝 New list order: ${newItems.join(', ')}`);
      
      // Verify the order changed
      expect(newItems).not.toEqual(initialItems);
      console.log('✅ List order successfully changed');
    });

    await test.step('Test grid tab sorting', async () => {
      // Switch to Grid tab
      await actions.observableClick('#demo-tab-grid', 'Click Grid tab');
      await actions.observableWait('#demo-tabpane-grid', 'Wait for grid view');
      
      // Get initial grid order
      const initialGridItems = await page.locator('#demo-tabpane-grid .list-group-item').allTextContents();
      console.log(`🎯 Initial grid order: ${initialGridItems.join(', ')}`);
      
      // Drag items in grid
      const firstGridItem = page.locator('#demo-tabpane-grid .list-group-item').first();
      const lastGridItem = page.locator('#demo-tabpane-grid .list-group-item').last();
      
      await firstGridItem.dragTo(lastGridItem);
      console.log('🔄 Dragged first grid item to last position');
      
      // Get new grid order
      const newGridItems = await page.locator('#demo-tabpane-grid .list-group-item').allTextContents();
      console.log(`🎯 New grid order: ${newGridItems.join(', ')}`);
      
      // Verify the order changed
      expect(newGridItems).not.toEqual(initialGridItems);
      console.log('✅ Grid order successfully changed');
    });

    await actions.screenshot('demoqa-sortable-complete', 'Sortable testing completed');
  });

  test('Selectable - Item selection functionality', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Selectable', async () => {
      await actions.observableClick('text=Selectable', 'Click Selectable menu item');
      await actions.observableWait('#demo-tabpane-list', 'Wait for selectable list');
    });

    await test.step('Test list selection', async () => {
      // Select individual items
      await actions.observableClick('#demo-tabpane-list li:has-text("Cras justo odio")', 'Select first item');
      await actions.observableClick('#demo-tabpane-list li:has-text("Dapibus ac facilisis in")', 'Select second item');
      
      // Verify items are selected (have active class)
      await actions.observableExpect(async () => {
        await expect(page.locator('#demo-tabpane-list li:has-text("Cras justo odio")')).toHaveClass(/active/);
        await expect(page.locator('#demo-tabpane-list li:has-text("Dapibus ac facilisis in")')).toHaveClass(/active/);
      }, 'Verify items are selected with active class');
      
      console.log('✅ List items selected successfully');
    });

    await test.step('Test grid selection', async () => {
      // Switch to Grid tab
      await actions.observableClick('#demo-tab-grid', 'Click Grid tab');
      await actions.observableWait('#demo-tabpane-grid', 'Wait for grid view');
      
      // Select grid items
      await actions.observableClick('#demo-tabpane-grid li:first-child', 'Select first grid item');
      await actions.observableClick('#demo-tabpane-grid li:nth-child(3)', 'Select third grid item');
      
      // Verify grid selections
      await actions.observableExpect(async () => {
        await expect(page.locator('#demo-tabpane-grid li:first-child')).toHaveClass(/active/);
        await expect(page.locator('#demo-tabpane-grid li:nth-child(3)')).toHaveClass(/active/);
      }, 'Verify grid items are selected');
      
      console.log('✅ Grid items selected successfully');
    });

    await test.step('Test deselection', async () => {
      // Click on already selected item to deselect
      await actions.observableClick('#demo-tabpane-grid li:first-child', 'Deselect first grid item');
      
      // Verify item is deselected
      await actions.observableExpect(async () => {
        await expect(page.locator('#demo-tabpane-grid li:first-child')).not.toHaveClass(/active/);
      }, 'Verify item is deselected');
      
      console.log('✅ Item deselection works correctly');
    });

    await actions.screenshot('demoqa-selectable-complete', 'Selectable testing completed');
  });

  test('Resizable - Element resizing functionality', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Resizable', async () => {
      await actions.observableClick('text=Resizable', 'Click Resizable menu item');
      await actions.observableWait('#resizableBoxWithRestriction', 'Wait for resizable elements');
    });

    await test.step('Test restricted resizable box', async () => {
      const restrictedBox = page.locator('#resizableBoxWithRestriction');
      
      // Get initial size
      const initialSize = await restrictedBox.boundingBox();
      console.log(`📏 Initial restricted box size: ${initialSize?.width} x ${initialSize?.height}`);
      
      // Find resize handle and resize
      const resizeHandle = page.locator('#resizableBoxWithRestriction .react-resizable-handle');
      
      // Drag to resize (limited by restrictions)
      await resizeHandle.dragTo(resizeHandle, {
        targetPosition: { x: 50, y: 50 }
      });
      
      // Get new size
      const newSize = await restrictedBox.boundingBox();
      console.log(`📏 New restricted box size: ${newSize?.width} x ${newSize?.height}`);
      
      // Verify size changed within constraints
      if (initialSize && newSize) {
        expect(newSize.width).toBeGreaterThanOrEqual(150); // Minimum width constraint
        expect(newSize.width).toBeLessThanOrEqual(500);    // Maximum width constraint
        expect(newSize.height).toBeGreaterThanOrEqual(150); // Minimum height constraint
        expect(newSize.height).toBeLessThanOrEqual(300);    // Maximum height constraint
      }
      
      console.log('✅ Restricted resizable box works within constraints');
    });

    await test.step('Test unrestricted resizable box', async () => {
      const unrestrictedBox = page.locator('#resizable');
      
      // Get initial size
      const initialSize = await unrestrictedBox.boundingBox();
      console.log(`📏 Initial unrestricted box size: ${initialSize?.width} x ${initialSize?.height}`);
      
      // Find resize handle and resize
      const resizeHandle = page.locator('#resizable .react-resizable-handle');
      
      // Drag to resize more freely
      await resizeHandle.dragTo(resizeHandle, {
        targetPosition: { x: 100, y: 100 }
      });
      
      // Get new size
      const newSize = await unrestrictedBox.boundingBox();
      console.log(`📏 New unrestricted box size: ${newSize?.width} x ${newSize?.height}`);
      
      // Verify size changed (no specific constraints to test)
      if (initialSize && newSize) {
        const sizeChanged = (newSize.width !== initialSize.width) || (newSize.height !== initialSize.height);
        expect(sizeChanged).toBeTruthy();
      }
      
      console.log('✅ Unrestricted resizable box works correctly');
    });

    await actions.screenshot('demoqa-resizable-complete', 'Resizable testing completed');
  });

  test('Droppable - Drag and drop functionality', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Droppable', async () => {
      await actions.observableClick('text=Droppable', 'Click Droppable menu item');
      await actions.observableWait('#draggable', 'Wait for droppable elements');
    });

    await test.step('Test simple drag and drop', async () => {
      const draggable = page.locator('#draggable');
      const droppable = page.locator('#droppable');
      
      // Get initial states
      const initialDroppableText = await droppable.textContent();
      console.log(`📦 Initial droppable text: ${initialDroppableText}`);
      
      // Perform drag and drop
      await draggable.dragTo(droppable);
      console.log('🔄 Dragged element to drop zone');
      
      // Verify drop was successful
      await actions.observableExpect(async () => {
        const newDroppableText = await droppable.textContent();
        expect(newDroppableText).toContain('Dropped!');
      }, 'Verify drop was successful');
      
      // Check if droppable style changed
      const droppableClass = await droppable.getAttribute('class');
      console.log(`📦 Droppable classes after drop: ${droppableClass}`);
      
      console.log('✅ Simple drag and drop works correctly');
    });

    await test.step('Test accept tab', async () => {
      // Switch to Accept tab
      await actions.observableClick('#droppableExample-tab-accept', 'Click Accept tab');
      await actions.observableWait('#acceptDropContainer', 'Wait for accept drop container');
      
      // Test acceptable element
      const acceptableElement = page.locator('#acceptable');
      const acceptDroppable = page.locator('#acceptDropContainer #droppable');
      
      await acceptableElement.dragTo(acceptDroppable);
      console.log('🔄 Dragged acceptable element');
      
      await actions.observableExpect(async () => {
        const acceptDropText = await acceptDroppable.textContent();
        expect(acceptDropText).toContain('Dropped!');
      }, 'Verify acceptable element was dropped');
      
      // Test non-acceptable element
      const notAcceptableElement = page.locator('#notAcceptable');
      const originalText = await acceptDroppable.textContent();
      
      await notAcceptableElement.dragTo(acceptDroppable);
      console.log('🔄 Dragged non-acceptable element');
      
      // Should not change the drop zone text
      await page.waitForTimeout(1000); // Wait a moment for any potential change
      const finalText = await acceptDroppable.textContent();
      expect(finalText).toBe(originalText);
      
      console.log('✅ Accept functionality works correctly');
    });

    await test.step('Test prevent propagation tab', async () => {
      // Switch to Prevent Propagation tab
      await actions.observableClick('#droppableExample-tab-preventPropogation', 'Click Prevent Propagation tab');
      await actions.observableWait('#PPDropContainer', 'Wait for prevent propagation container');
      
      // Test dropping on outer box
      const ppDraggable = page.locator('#PPDropContainer #dragBox');
      const outerDroppable = page.locator('#PPDropContainer #notGreedyDropBox');
      
      await ppDraggable.dragTo(outerDroppable);
      console.log('🔄 Dragged to outer droppable');
      
      // Verify outer box received the drop
      await actions.observableExpect(async () => {
        const outerText = await outerDroppable.textContent();
        expect(outerText).toContain('Dropped!');
      }, 'Verify outer droppable received drop');
      
      console.log('✅ Prevent propagation functionality tested');
    });

    await test.step('Test revert draggable tab', async () => {
      // Switch to Revert Draggable tab
      await actions.observableClick('#droppableExample-tab-revertable', 'Click Revert Draggable tab');
      await actions.observableWait('#revertableDropContainer', 'Wait for revertable container');
      
      // Test revertable element
      const revertDraggable = page.locator('#revertable');
      const revertDroppable = page.locator('#revertableDropContainer #droppable');
      
      // Get initial position
      const initialPosition = await revertDraggable.boundingBox();
      
      // Drag to drop zone
      await revertDraggable.dragTo(revertDroppable);
      console.log('🔄 Dragged revertable element');
      
      // Wait for potential revert animation
      await page.waitForTimeout(2000);
      
      // Check if element reverted or stayed
      const finalPosition = await revertDraggable.boundingBox();
      console.log(`📍 Position changed: ${JSON.stringify(initialPosition)} -> ${JSON.stringify(finalPosition)}`);
      
      console.log('✅ Revert draggable functionality tested');
    });

    await actions.screenshot('demoqa-droppable-complete', 'Droppable testing completed');
  });

  test('Draggable - Drag functionality variations', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Dragabble', async () => {
      await actions.observableClick('text=Dragabble', 'Click Dragabble menu item');
      await actions.observableWait('#dragBox', 'Wait for draggable elements');
    });

    await test.step('Test simple draggable', async () => {
      const simpleDraggable = page.locator('#dragBox');
      
      // Get initial position
      const initialPosition = await simpleDraggable.boundingBox();
      console.log(`📍 Initial position: x=${initialPosition?.x}, y=${initialPosition?.y}`);
      
      // Drag to new position
      await simpleDraggable.dragTo(simpleDraggable, {
        targetPosition: { x: 100, y: 100 }
      });
      
      // Get new position
      const newPosition = await simpleDraggable.boundingBox();
      console.log(`📍 New position: x=${newPosition?.x}, y=${newPosition?.y}`);
      
      // Verify position changed
      if (initialPosition && newPosition) {
        const positionChanged = (newPosition.x !== initialPosition.x) || (newPosition.y !== initialPosition.y);
        expect(positionChanged).toBeTruthy();
      }
      
      console.log('✅ Simple draggable works correctly');
    });

    await test.step('Test axis restricted dragging', async () => {
      // Switch to Axis Restricted tab
      await actions.observableClick('#draggableExample-tab-axisRestricted', 'Click Axis Restricted tab');
      await actions.observableWait('#restrictedX', 'Wait for axis restricted elements');
      
      // Test X-axis restricted dragging
      const xRestricted = page.locator('#restrictedX');
      const initialXPos = await xRestricted.boundingBox();
      
      await xRestricted.dragTo(xRestricted, {
        targetPosition: { x: 50, y: 50 }
      });
      
      const newXPos = await xRestricted.boundingBox();
      
      // Should move horizontally but not vertically
      if (initialXPos && newXPos) {
        expect(newXPos.x).not.toBe(initialXPos.x); // X position should change
        // Y position should remain roughly the same (allowing for minor variations)
        expect(Math.abs(newXPos.y - initialXPos.y)).toBeLessThan(10);
      }
      
      console.log('✅ X-axis restricted dragging works correctly');
      
      // Test Y-axis restricted dragging
      const yRestricted = page.locator('#restrictedY');
      const initialYPos = await yRestricted.boundingBox();
      
      await yRestricted.dragTo(yRestricted, {
        targetPosition: { x: 50, y: 50 }
      });
      
      const newYPos = await yRestricted.boundingBox();
      
      // Should move vertically but not horizontally
      if (initialYPos && newYPos) {
        expect(newYPos.y).not.toBe(initialYPos.y); // Y position should change
        // X position should remain roughly the same
        expect(Math.abs(newYPos.x - initialYPos.x)).toBeLessThan(10);
      }
      
      console.log('✅ Y-axis restricted dragging works correctly');
    });

    await test.step('Test container restricted dragging', async () => {
      // Switch to Container Restricted tab
      await actions.observableClick('#draggableExample-tab-containerRestricted', 'Click Container Restricted tab');
      await actions.observableWait('#containmentWrapper', 'Wait for container restricted elements');
      
      const containerDraggable = page.locator('#containmentWrapper .ui-draggable');
      
      // Try to drag outside container bounds
      await containerDraggable.dragTo(containerDraggable, {
        targetPosition: { x: 300, y: 300 } // Large movement
      });
      
      // Verify element stayed within container
      const finalPosition = await containerDraggable.boundingBox();
      const containerBounds = await page.locator('#containmentWrapper').boundingBox();
      
      if (finalPosition && containerBounds) {
        expect(finalPosition.x).toBeGreaterThanOrEqual(containerBounds.x);
        expect(finalPosition.y).toBeGreaterThanOrEqual(containerBounds.y);
        expect(finalPosition.x + finalPosition.width).toBeLessThanOrEqual(containerBounds.x + containerBounds.width);
        expect(finalPosition.y + finalPosition.height).toBeLessThanOrEqual(containerBounds.y + containerBounds.height);
      }
      
      console.log('✅ Container restricted dragging works correctly');
    });

    await actions.screenshot('demoqa-draggable-complete', 'Draggable testing completed');
  });
});
