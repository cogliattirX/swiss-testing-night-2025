# Development Environment Setup Guide

## Prerequisites Installation

### 1. Node.js and npm
1. Download Node.js LTS (18.x or later) from: https://nodejs.org/
2. Run the installer with default settings
3. Verify installation by opening a new terminal and running:
   ```powershell
   node --version
   npm --version
   ```

### 2. Visual Studio Code
1. Download VS Code from: https://code.visualstudio.com/
2. Install with default settings
3. Recommended extensions:
   - Playwright Test for VS Code
   - GitHub Copilot
   - GitHub Copilot Chat

### 3. Playwright with MCP Server
After Node.js is installed, run these commands in your terminal:
```powershell
# Install Playwright MCP Server globally
npm install -g @executeautomation/playwright-mcp-server

# Install project dependencies (run this in the project directory)
npm init -y
npm install -D @playwright/test
npx playwright install chrome
```

### 4. Git (Already installed)
Git is already set up in the system.

## Verifying Installation

Run these commands to verify everything is installed correctly:
```powershell
# Check Node.js and npm
node --version
npm --version

# Check Playwright MCP Server
npx playwright-mcp-server --version

# Check Playwright
npx playwright --version
```

## Troubleshooting

### Common Issues:
1. Command not found errors:
   - Close and reopen your terminal after installation
   - Ensure the installation paths are added to system PATH

2. Permission errors:
   - Run terminal as administrator
   - Check system execution policies

3. MCP Server connection issues:
   - Verify port 3000 is available
   - Check firewall settings

For any issues, please contact the test automation team.
