# CI/CD Pipeline Configuration Guide

## GitHub Pages Setup Required

The deployment failure indicates GitHub Pages is not properly configured. To fix this:

### Manual Repository Configuration (Required)
1. Go to **Settings** > **Pages** in the GitHub repository
2. Set **Source** to "GitHub Actions" 
3. Enable GitHub Pages for the repository

### Alternative: Create _config.yml
If manual setup isn't available, this file enables basic Pages configuration:

```yaml
title: "Swiss Testing Night 2025 - Test Reports"
description: "Automated test reports for AI-powered QA workshop"
theme: minima
plugins:
  - jekyll-default-layout
  - jekyll-readme-index
```

## CI/CD Pipeline Changes Made

### ✅ Fixed Issues:
1. **Removed daily schedule**: Tests now run only on push to main/develop and PRs
2. **Enhanced error handling**: Better artifact management and deployment
3. **Improved permissions**: Proper GitHub Pages deployment permissions

### Current Triggers:
- ✅ Push to `main` or `develop` branches
- ✅ Pull requests to `main` branch  
- ✅ Manual workflow dispatch with browser selection
- ❌ ~~Daily scheduled runs~~ (REMOVED)

### Deployment Flow:
1. **Test Execution**: Run tests on push/PR
2. **Report Generation**: Create HTML reports with screenshots
3. **Artifact Upload**: Store reports for 30 days
4. **Pages Deployment**: Deploy to GitHub Pages (main branch only)

## Repository Settings Checklist

### Required GitHub Repository Settings:
- [ ] **Pages** enabled in repository settings
- [ ] **Pages source** set to "GitHub Actions"
- [ ] **Pages visibility** configured appropriately
- [ ] **Actions permissions** allow workflow execution
- [ ] **Pages environment** properly configured

### Verification Commands:
```bash
# Check if Pages is configured
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/cogliattirX/swiss-testing-night-2025/pages

# Test local report generation
cd test-automation
npm test
npx playwright show-report
```

## Troubleshooting

### If Pages deployment still fails:
1. Verify repository **Settings** > **Pages** is configured
2. Check **Actions** tab for detailed error logs
3. Ensure **Pages environment** exists in repository settings
4. Verify **GITHUB_TOKEN** has proper permissions

### Manual deployment alternative:
```bash
# Generate report locally
npx playwright test
npx playwright show-report

# Manual GitHub Pages deployment
gh workflow run advanced-e2e.yml
```
