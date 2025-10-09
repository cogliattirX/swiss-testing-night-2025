# GitHub Copilot Instructions

## Project Architecture: Swiss Testing Night 2025 Workshop

This is an AI-powered testing framework featuring **multi-agent QA systems**, **MCP (Model Context Protocol) integration**, and **observability-first test design** for workshop demonstrations. The project showcases how AI agents can collaborate like human QA teams.

## Core Framework Components

### 1. Observability Framework (`test-helpers/observability.ts`)
**Always use `createObservableActions(page)` for all test implementations**
```typescript
import { createObservableActions } from '../test-helpers/observability';
P
test('Example test', async ({ page }) => {
  const actions = createObservableActions(page);
  
  await actions.step('Login Process', async () => {
    await actions.observableGoto('https://www.saucedemo.com', 'Navigate to login');
    await actions.observableFill('#user-name', 'standard_user', 'Enter username');
    await actions.observableClick('#login-button', 'Submit login');
  });
  
  await actions.observableExpect(async () => {
    await expect(page).toHaveURL(/inventory/);
  }, 'Verify successful login');
});
```

**Key patterns:**
- Use `actions.step()` to organize test sections
- Provide descriptive messages for all observable actions
- Use `observableExpect()` instead of raw expect for better logging
- All actions automatically include screenshots and delays based on `TEST_MODE`

### 2. Execution Modes (Environment-Driven)
Configure test behavior via `TEST_MODE` environment variable:
- **`ci`**: Fast, headless, minimal logging (default)
- **`debug`**: Moderate pace, visible browser, full logging
- **`demo`**: Slow pace for presentations, 2s delays
- **`workshop`**: Slowest pace for training, 3s delays

```bash
# Use in npm scripts or test commands
npm run test:workshop  # Uses TEST_MODE=workshop
npm run test:demo      # Uses TEST_MODE=demo
npm run test:debug     # Uses TEST_MODE=debug
```

### 3. Multi-Agent AI System (`ai-agents/`)
**5 specialized AI agents that collaborate in parallel:**
- `QATestArchitectAgent`: Strategy and architecture design
- `TestImplementationAgent`: Code implementation using observability patterns
- `SecurityTestingAgent`: Security audits and vulnerability scanning
- `AccessibilityTestingAgent`: WCAG compliance and inclusive design
- `PerformanceTestingAgent`: Core Web Vitals and performance optimization

**Agent communication patterns:**
```typescript
// Agents share knowledge and collaborate via message exchange
this.sendMessage({
  to: 'ALL', // or specific agent ID
  type: 'recommendation',
  content: { guidance: 'Use observability framework for all implementations' },
  priority: 'high'
});
```

### 4. MCP Integration (`@executeautomation/playwright-mcp-server`)
**Start MCP server for enhanced GitHub Copilot context:**
```bash
npx @executeautomation/playwright-mcp-server
```

**MCP-enhanced prompting patterns:**
- "Create a test using the observability framework"
- "Add mobile responsive testing with screenshots"
- "Implement security validation with proper error handling"

**MCP provides context about:**
- Project structure and existing patterns
- Observability framework usage
- Test data (standard_user, secret_sauce credentials)
- Workshop execution modes and requirements

## Test Organization Structure

```
tests/
├── websites/
│   ├── sauce-demo/          # Sauce Demo specific tests
│   │   ├── login.spec.ts    # Authentication tests
│   │   ├── checkout-flow.spec.ts
│   │   └── shopping-cart.spec.ts
│   └── generic/             # Universal website testing
│       ├── simple-quality-check.spec.ts
│       └── quality-assessment.spec.ts
├── demo/                    # Workshop demonstration tests
│   ├── mcp-live-demo.spec.ts       # MCP integration demo
│   ├── mcp-enhanced-example.spec.ts
│   └── multi-agent-demo.spec.ts    # AI agent collaboration demo
test-helpers/
├── observability.ts         # Core observable actions framework
├── quality-reporter.ts      # Website quality assessment
└── website-analyzers/       # Generic website analysis tools
```

## Essential Workflow Commands

```bash
# Workshop setup (installs everything needed)
npm run workshop:setup

# Run demonstration tests for workshop
npm run workshop:demo    # Quick quality check demo
npm run workshop:sauce   # Complete Sauce Demo suite

# Multi-agent system demonstration
npm run test:demo -- tests/demo/multi-agent-demo.spec.ts

# MCP integration demonstration  
npm run test:demo -- tests/demo/mcp-live-demo.spec.ts

# Start MCP server for enhanced Copilot suggestions
npx @executeautomation/playwright-mcp-server
```

## Project-Specific Patterns

### Test Data Constants
```typescript
// Always use these test credentials for Sauce Demo
const SAUCE_DEMO_USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  problem: { username: 'problem_user', password: 'secret_sauce' },
  performance: { username: 'performance_glitch_user', password: 'secret_sauce' }
};
```

### Quality Assessment Pattern
```typescript
import { WebsiteQualityReporter } from '../test-helpers/quality-reporter';

// Generate comprehensive quality reports for any website
const qualityReport = await WebsiteQualityReporter.generateQualityReport(page, url);
// Automatically includes security, accessibility, performance, and usability scores
```

### Workshop Demonstration Requirements
- **Always include descriptive console logging** for live audience
- **Use emoji prefixes** for visual console output (🔄, ✅, ❌, 📊, etc.)
- **Include screenshot capture** at key verification points
- **Structure tests with clear step boundaries** using `actions.step()`

### Multi-Agent Integration
```typescript
import { MultiAgentQAOrchestrator } from '../ai-agents/multi-agent-orchestrator';

// Demonstrate parallel AI agent collaboration
const orchestrator = new MultiAgentQAOrchestrator();
const results = await orchestrator.executeComprehensiveTest(websiteUrl);
// Shows 5 agents working in parallel with real-time collaboration
```

## CI/CD Integration Notes

- **GitHub Actions** configured for multi-browser testing
- **Artifacts**: Test reports, videos, screenshots automatically stored
- **GitHub Pages**: Live test report deployment
- **PR Comments**: Automatic test status updates
- **Scheduled Runs**: Daily regression testing at 6 AM UTC

## Key Dependencies and Integrations

- **Playwright**: Core testing framework with multi-browser support
- **MCP Server**: Enhanced AI context for GitHub Copilot
- **Observability Framework**: Custom wrapper for human-followable test execution
- **Multi-Agent System**: AI collaboration framework for parallel testing
- **Quality Reporter**: Automated website assessment with scoring

When generating tests, prioritize:
1. **Observable actions** over raw Playwright commands
2. **Step organization** for clear test structure  
3. **Descriptive messaging** for workshop demonstration value
4. **Screenshot evidence** at verification points
5. **Environment-aware execution** using TEST_MODE patterns