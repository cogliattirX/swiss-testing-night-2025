# Playwright MCP Server Setup Documentation

## Overview
This document details the setup, configuration, and usage of the Model Context Protocol (MCP) server for Playwright test automation. The MCP server enhances AI-powered development by providing contextual information about your Playwright test suite to AI assistants like GitHub Copilot and Claude.

## What We Accomplished

### ✅ Installation Verification
- **Package**: `@executeautomation/playwright-mcp-server` (latest version)
- **Location**: Installed in `test-automation/node_modules`
- **Configuration**: Added to `package.json` with npm script `mcp:start`

### ✅ Server Startup Process
1. **Initial Attempts**: Encountered issues with npm script execution due to path resolution
2. **Solution**: Used direct npx command: `npx @executeautomation/playwright-mcp-server`
3. **Working Directory**: Must be executed from `test-automation` directory
4. **Process Status**: Successfully started Node.js processes for MCP server

### ✅ Configuration Setup
- **Claude Desktop Config**: Created `claude_desktop_config.json` in user AppData
- **MCP Server Registration**: Configured server with proper command and working directory
- **Integration Path**: Established connection pathway for AI tools

## Key Learnings

### Technical Insights
1. **npm Script Issues**: The original `mcp:start` script had path resolution problems
2. **Direct Execution**: `npx @executeautomation/playwright-mcp-server` works reliably
3. **Background Process**: MCP server runs as a persistent background service
4. **Configuration Location**: Claude Desktop uses `%APPDATA%\Claude\claude_desktop_config.json`

### Best Practices Discovered
1. **Working Directory Matters**: Always run MCP server from the test project root
2. **Process Management**: Monitor Node.js processes to verify server status
3. **Configuration Validation**: Test configuration files after creation
4. **Environment Setup**: Development environment variables may be beneficial

## User Requirements & Setup Guide

### Prerequisites
✅ **Required Software**:
- Node.js (v16 or higher)
- npm or yarn package manager
- VS Code with GitHub Copilot extension
- OR Claude Desktop application

✅ **Project Requirements**:
- Playwright test project
- `@executeautomation/playwright-mcp-server` package installed

### Step-by-Step Setup Instructions

#### 1. Install MCP Server Package
```bash
# Navigate to your test automation directory
cd your-project/test-automation

# Install the MCP server package
npm install @executeautomation/playwright-mcp-server --save
```

#### 2. Start the MCP Server
```bash
# Method 1: Direct npx command (recommended)
npx @executeautomation/playwright-mcp-server

# Method 2: Add to package.json scripts
"scripts": {
  "mcp:start": "npx @executeautomation/playwright-mcp-server"
}
```

#### 3. Configure Claude Desktop (if using Claude)
Create configuration file at: `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@executeautomation/playwright-mcp-server"],
      "cwd": "C:\\path\\to\\your\\test-automation"
    }
  }
}
```

#### 4. Configure VS Code (if using GitHub Copilot)
Add to VS Code settings.json:
```json
{
  "github.copilot.advanced": {
    "debug.overrideEngine": "claude-3-5-sonnet-20241022"
  },
  "github.copilot.enableAutoCompletions": true,
  "github.copilot.conversation.enableAutoSuggest": true
}
```

#### 5. Verification Steps
1. **Check Server Status**:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*node*"}
   ```

2. **Test Integration**:
   - Open a Playwright test file
   - Ask AI assistant: "Create a test for login functionality"
   - Verify context-aware suggestions

### Usage Instructions

#### For GitHub Copilot Users
1. **Open Test Files**: Navigate to any `.spec.ts` file in your test suite
2. **Context-Aware Prompts**: Use comments to request specific functionality:
   ```typescript
   // Create a test for user registration with form validation
   // Generate a test for shopping cart functionality
   // Add assertions for responsive design testing
   ```
3. **Enhanced Suggestions**: Copilot will now suggest code that:
   - Uses your existing page object patterns
   - Follows your project's naming conventions
   - Includes appropriate test data and selectors

#### For Claude Desktop Users
1. **Restart Claude Desktop** after configuration
2. **Reference Your Tests**: Ask Claude to analyze or extend your test suite
3. **Context Queries**: Claude can now understand your project structure and suggest improvements

### Troubleshooting Guide

#### Common Issues & Solutions

**Issue**: `npm run mcp:start` fails with ENOENT error
- **Solution**: Run `npx @executeautomation/playwright-mcp-server` directly
- **Root Cause**: Path resolution issues in npm scripts

**Issue**: Server starts but no AI enhancement
- **Solution**: Restart VS Code or Claude Desktop after configuration
- **Verification**: Check that configuration files are properly formatted

**Issue**: Multiple Node.js processes running
- **Solution**: This is normal - MCP server may spawn multiple processes
- **Management**: Use Task Manager or Process Explorer to monitor

**Issue**: MCP server stops unexpectedly
- **Solution**: Run in a dedicated terminal session or use process manager
- **Prevention**: Avoid closing the terminal running the MCP server

### Advanced Configuration

#### Environment Variables
```bash
# Set development environment
$env:NODE_ENV="development"

# Custom port (if supported)
$env:MCP_PORT="3001"
```

#### Production Deployment
For production or CI/CD environments:
1. Use process managers (PM2, forever)
2. Configure health checks
3. Set up automatic restart policies
4. Monitor server logs

### Benefits of Using Playwright MCP Server

#### Enhanced AI Assistance
- **Project-Aware Suggestions**: AI understands your specific test patterns
- **Consistent Code Style**: Maintains your project's coding conventions
- **Faster Development**: Reduces time spent writing boilerplate test code
- **Best Practice Enforcement**: AI suggests tests following Playwright best practices

#### Improved Test Quality
- **Pattern Recognition**: Reuses successful test patterns from your codebase
- **Comprehensive Coverage**: AI can suggest missing test scenarios
- **Maintenance Efficiency**: Generates maintainable, readable test code

## Conclusion

The Playwright MCP server successfully bridges the gap between AI assistance and project-specific context. When properly configured, it transforms generic AI suggestions into targeted, project-aware code generation that follows your established patterns and conventions.

**Key Success Factors**:
1. Proper installation and configuration
2. Correct working directory management
3. Appropriate AI tool integration
4. Regular verification of server status

**Next Steps**:
1. Experiment with different prompt patterns
2. Monitor AI suggestion quality improvements
3. Share successful prompt examples with the team
4. Consider extending MCP server capabilities for project-specific needs

---

*Documentation created: September 16, 2025*
*Last updated: September 16, 2025*
*Project: Swiss Testing Night 2025*