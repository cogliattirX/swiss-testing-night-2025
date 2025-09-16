# Playwright MCP Server - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Start the Server
```bash
cd test-automation
npx @executeautomation/playwright-mcp-server
```

### 2. Configure Your AI Tool

#### For GitHub Copilot (VS Code):
- Add to VS Code settings.json:
```json
{
  "github.copilot.enableAutoCompletions": true,
  "github.copilot.conversation.enableAutoSuggest": true
}
```
- Restart VS Code

#### For Claude Desktop:
- Create: `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@executeautomation/playwright-mcp-server"],
      "cwd": "C:\\your\\path\\test-automation"
    }
  }
}
```
- Restart Claude Desktop

### 3. Test It Works
Open a test file and try:
```typescript
// Create a test for user login with error handling
```

## 🎯 What You Get

✅ **Context-Aware Code**: AI knows your project structure  
✅ **Pattern Recognition**: Follows your existing test patterns  
✅ **Best Practices**: Suggests Playwright best practices  
✅ **Faster Development**: Less boilerplate, more focus on logic  

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Server won't start | Use `npx @executeautomation/playwright-mcp-server` directly |
| No AI enhancement | Restart your AI tool after configuration |
| Server keeps stopping | Run in dedicated terminal, don't close it |

## 📋 Verification Checklist

- [ ] MCP server package installed
- [ ] Server running (check Node.js processes)
- [ ] Configuration file created
- [ ] AI tool restarted
- [ ] Test with sample prompt

## 🆘 Need Help?

1. Check the full documentation: `docs/mcp-setup-documentation.md`
2. Verify server status: `Get-Process | Where-Object {$_.ProcessName -like "*node*"}`
3. Test configuration with simple prompts first

---
*Keep the server running while coding for best results!*