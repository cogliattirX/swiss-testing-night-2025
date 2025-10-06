import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../test-helpers/observability';

/**
 * MCP-Enhanced Test Example
 * 
 * This test demonstrates how GitHub Copilot can generate better code
 * when the MCP server is running and providing project context.
 * 
 * Try these prompts with GitHub Copilot Chat:
 * 1. "Add a step to verify the product count in inventory"
 * 2. "Create error handling for invalid login attempts"
 * 3. "Add mobile responsiveness check to this test"
 */

test.describe('MCP-Enhanced Test Generation Demo', () => {
  
  test('Complete E2E Shopping Flow - Enhanced by MCP', async ({ page }) => {
    const actions = createObservableActions(page);
    
    // This test structure should be enhanced by GitHub Copilot
    // with MCP providing context about the observability framework
    
    await actions.step('🔐 Login Process', async () => {
      await actions.observableGoto('https://www.saucedemo.com', 'Navigate to Sauce Demo');
      await actions.observableFill('#user-name', 'standard_user', 'Enter username');
      await actions.observableFill('#password', 'secret_sauce', 'Enter password');
      await actions.observableClick('#login-button', 'Click login button');
    });
    
    await actions.observableExpect(async () => {
      await expect(page).toHaveURL(/inventory/);
    }, 'Verify successful login to inventory page');
    
    // TODO: Ask GitHub Copilot to complete the shopping flow
    // With MCP running, it should suggest using the observability framework
    // and follow the project patterns
    
    // Example prompts to try:
    // "Add a step to add products to cart using observable actions"
    // "Create checkout flow verification with proper error handling"
    // "Add performance measurement for page load times"
  });
  
  test('Mobile Responsive Design Check - MCP Context Aware', async ({ page }) => {
    const actions = createObservableActions(page);
    
    // TODO: Ask GitHub Copilot to create mobile testing
    // Prompt: "Create mobile viewport testing with screenshots using the observability framework"
    
    await actions.step('🌐 Load Page', async () => {
      await actions.observableGoto('https://www.saucedemo.com', 'Load for mobile testing');
    });
    
    // MCP should help Copilot suggest proper mobile testing patterns
    // that match the project structure and use screenshot capabilities
  });
});