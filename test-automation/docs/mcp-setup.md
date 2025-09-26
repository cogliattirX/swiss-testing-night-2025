# MCP Server Setup and Integration 🤖

## Overview
The Model Context Protocol (MCP) server enables GitHub Copilot to understand Playwright test context and generate more accurate test code. This guide covers setup and usage.

## Quick Setup

### 1. MCP Server Installation
```bash
cd test-automation
npm install @executeautomation/playwright-mcp-server
```

### 2. VS Code Configuration
Add to your VS Code `settings.json`:

```json
{
  "github.copilot.advanced": {
    "debug.overrideEngine": "claude-3-5-sonnet-20241022"
  },
  "github.copilot.enableAutoCompletions": true,
  "github.copilot.conversation.enableAutoSuggest": true
}
```

### 3. Start MCP Server
```bash
# Option 1: Using npx (recommended)
npx @executeautomation/playwright-mcp-server

# Option 2: Using npm script (if configured)
npm run mcp:start
```

## Integration with GitHub Copilot

### 1. Enhanced Test Generation
With MCP server running, Copilot gains context about:
- **Page Object Patterns**: Understands your page structure
- **Test Data**: Knows available test users and data
- **Custom Commands**: Aware of your helper functions
- **Project Structure**: Understands folder organization

### 2. Example Usage

**Before MCP** (Generic suggestions):
```typescript
// Prompt: "Create a login test"
// Result: Basic login test without context
```

**After MCP** (Context-aware suggestions):
```typescript
// Prompt: "Create a login test"
// Result: Test using your actual page objects, test data, and patterns
test('Login with standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/inventory/);
});
```

### 3. Workshop Integration

#### Enable MCP for Live Coding
```bash
# Terminal 1: Start MCP server
npx @executeautomation/playwright-mcp-server

# Terminal 2: Run tests with enhanced context
npm run test:workshop
```

#### Enhanced Copilot Prompts
With MCP running, use these enhanced prompts:

```typescript
// Prompt: "Generate a checkout flow test for the current project"
// Copilot now understands:
// - Your existing page objects (LoginPage, InventoryPage, etc.)
// - Test data (standard_user, problem_user, etc.) 
// - Project patterns (observability, step organization)
```

## MCP Server Features

### 1. Project Context Awareness
- **File Structure**: Understands your test organization
- **Dependencies**: Knows your installed packages
- **Configuration**: Aware of Playwright config
- **Patterns**: Recognizes your coding patterns

### 2. Test Data Integration
- **User Accounts**: Knows available test users
- **URLs**: Understands your target applications
- **Test Patterns**: Recognizes your test structure

### 3. Enhanced Suggestions
- **Page Objects**: Suggests using existing page classes
- **Helper Functions**: Recommends custom utilities
- **Assertion Patterns**: Uses project-specific assertions
- **Error Handling**: Implements your error patterns

## Troubleshooting

### Common Issues

#### 1. MCP Server Not Starting
```bash
# Check if port is in use
netstat -ano | findstr :3000

# Kill existing process if needed
taskkill /PID <process_id> /F

# Restart server
npx @executeautomation/playwright-mcp-server
```

#### 2. Copilot Not Using Context
- Ensure MCP server is running
- Check VS Code Copilot connection
- Reload VS Code window
- Verify Copilot subscription is active

#### 3. Limited Suggestions
- MCP server needs time to index project
- Generate more test files to improve context
- Use more specific prompts
- Include project patterns in prompts

### Verification Steps

#### 1. Check MCP Server Status
```bash
# Server should display:
# ✅ MCP Server running on port 3000
# ✅ Playwright context loaded
# ✅ Ready for Copilot integration
```

#### 2. Test Copilot Integration
Open any `.spec.ts` file and try:
```typescript
// Prompt: "Create a test for adding items to cart"
// Expected: Copilot suggests using your existing page objects
```

## Advanced Configuration

### 1. Custom MCP Settings
Create `mcp.config.json`:
```json
{
  "port": 3000,
  "projectPath": "./test-automation",
  "enableDebug": true,
  "contextDepth": "full"
}
```

### 2. Integration with Observability
```typescript
// MCP understands your observability framework
// Prompt: "Create an observable test for product sorting"
// Result: Uses createObservableActions automatically

test('Product sorting with observability', async ({ page }) => {
  const actions = createObservableActions(page);
  
  await actions.step('Navigate to inventory', async () => {
    await actions.observableGoto('https://www.saucedemo.com/inventory.html');
  });
  
  // ... rest of test with observable actions
});
```

## Workshop Benefits

### 1. Live Demonstration Value
- **Real-time Context**: Show how MCP improves suggestions
- **Before/After**: Demonstrate with and without MCP
- **Interactive**: Participants see immediate improvement

### 2. Educational Impact
- **Understanding AI**: How context improves AI suggestions
- **Best Practices**: Learn proper MCP integration
- **Practical Skills**: Immediately applicable knowledge

### 3. Professional Application
- **Team Productivity**: Faster, more accurate test creation
- **Consistency**: Tests follow project patterns
- **Knowledge Transfer**: New team members get better guidance

## Next Steps

1. **[Enhanced QA Team](../copilot-context/enhanced-qa-team-personas.md)** - Use AI personas with MCP
2. **[Copilot Instructions](../.copilot-instructions.md)** - Project-specific AI context
3. **[Universal Testing](universal-quality-framework.md)** - Apply MCP to any website

## Resources

- **[MCP Documentation](https://executeautomation.github.io/mcp-playwright/docs/intro)** - Official MCP guide
- **[Playwright MCP Server](https://www.npmjs.com/package/@executeautomation/playwright-mcp-server)** - NPM package
- **[GitHub Copilot](https://docs.github.com/en/copilot)** - Copilot documentation

---

**Ready to enhance your AI-powered testing? Start the MCP server and experience context-aware test generation!**
