# Workshop Execution Guide

## Project Overview
This repository demonstrates AI-powered testing using GitHub Copilot with Playwright and MCP server for the Swiss Testing Night 2025 workshop.

## Quick Start (For Workshop Participants)

### Prerequisites Verification
Before starting, verify you have:
- [ ] Windows 10/11 with PowerShell 5.1+
- [ ] Internet connection for package downloads
- [ ] Administrator privileges for installations

### Step-by-Step Setup (15 minutes)

1. **Install Node.js**
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   winget install OpenJS.NodeJS.LTS
   ```
   *Restart VS Code after installation*

2. **Clone and Setup Project**
   ```powershell
   git clone https://github.com/cogliattirX/swiss-testing-night-2025.git
   cd swiss-testing-night-2025/test-automation
   npm install
   npx playwright install
   ```

3. **Verify Installation**
   ```powershell
   npx playwright test tests/login-success.spec.ts --headed
   ```

### What You'll Learn
- AI-powered test creation with GitHub Copilot
- Page Object Model implementation
- Cross-browser testing strategies
- Playwright MCP server integration

### Available Test Commands
```powershell
# Run all tests headless
npx playwright test

# Run specific test with browser visible
npx playwright test tests/login-success.spec.ts --headed

# Generate HTML report
npx playwright show-report

# Start MCP server
playwright-mcp-server
```

### Generating New Tests with Copilot
See [test-automation/docs/copilot-test-generation.md](test-automation/docs/copilot-test-generation.md) for:
- Complete Copilot prompting strategies
- Persona-based test creation workflow
- Quality gates for generated tests
- Troubleshooting common issues

## Project Structure
```
swiss-testing-day-2025/
├── README.md                          # Main project overview
├── copilot-context/
│   ├── personas.md                    # Testing personas and reviewers
│   └── copilot-reflection.md          # Session learnings
└── test-automation/
    ├── tests/
    │   └── login-success.spec.ts      # Working login test
    ├── docs/
    │   ├── test-strategy.md           # Testing approach
    │   └── setup-guide.md             # Detailed setup
    ├── playwright.config.ts           # Playwright configuration
    └── package.json                   # Dependencies
```

## Workshop Flow (30 minutes)
1. **Setup Verification** (5 min) - Ensure all tools work
2. **AI Test Creation** (15 min) - Use Copilot to create tests
3. **Persona-based Review** (5 min) - Apply critical review process
4. **MCP Integration** (5 min) - Demonstrate AI-browser interaction

## Troubleshooting
- **Node.js not recognized**: Restart terminal/VS Code after installation
- **Permission errors**: Run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
- **Browser missing**: Run `npx playwright install`
- **Test failures**: Verify internet connection and site availability

## Success Criteria
✅ Login test runs successfully in headed mode
✅ MCP server starts without errors
✅ Participants can create new tests using GitHub Copilot
✅ All personas can provide meaningful feedback
