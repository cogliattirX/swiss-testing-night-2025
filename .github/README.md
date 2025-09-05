# CI/CD Setup for Playwright Tests

## GitHub Actions Workflows

This project includes two GitHub Actions workflows for comprehensive test automation:

### 1. Basic Playwright Tests (`playwright-tests.yml`)
- **Triggers**: Push to main/develop, Pull Requests to main
- **Features**:
  - Runs all tests on Ubuntu latest
  - Generates HTML test reports
  - Uploads test artifacts
  - Deploys reports to GitHub Pages (main branch only)

### 2. Advanced E2E Testing (`advanced-e2e.yml`)
- **Triggers**: Push, Pull Requests, Scheduled runs, Manual dispatch
- **Features**:
  - Multi-browser testing (Chromium, Firefox, WebKit)
  - Matrix strategy for parallel execution
  - Comprehensive reporting with merged results
  - PR comments with test status
  - GitHub Pages deployment
  - Test videos on failure
  - Scheduled daily runs

## Workflow Features

### 🔄 Automatic Triggers
- **Push Events**: Runs on main and develop branches
- **Pull Requests**: Validates changes before merge
- **Scheduled**: Daily runs at 6 AM UTC for regression testing
- **Manual Dispatch**: On-demand execution with browser selection

### 📊 Reporting Features
- **HTML Reports**: Interactive test results with screenshots
- **Test Artifacts**: Downloadable reports and test results
- **PR Comments**: Automatic status updates on pull requests
- **GitHub Pages**: Live test report dashboard
- **Test Videos**: Recorded failures for debugging

### 🌐 Multi-Browser Support
- **Chromium**: Default browser for fast execution
- **Firefox**: Cross-browser compatibility testing
- **WebKit**: Safari-equivalent testing
- **Parallel Execution**: All browsers tested simultaneously

## Setup Requirements

### Repository Settings
1. **GitHub Pages**: Enable in repository settings
   - Source: GitHub Actions
   - Custom domain: Optional

2. **Actions Permissions**: Ensure workflows can:
   - Write to repository
   - Deploy to Pages
   - Comment on Pull Requests

### Environment Variables
No additional environment variables required - workflows use public Sauce Demo site.

## Usage Examples

### Running Tests Locally
```bash
# Install dependencies
npm ci

# Install browsers
npm run install:browsers

# Run all tests
npm test

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit

# Run all browsers
npm run test:all-browsers

# Run with UI
npm run test:headed

# Debug mode
npm run test:debug
```

### Manual Workflow Dispatch
1. Go to Actions tab in GitHub repository
2. Select "Advanced E2E Testing" workflow
3. Click "Run workflow"
4. Choose browser: chromium, firefox, webkit, or all
5. Click "Run workflow"

## Report Access

### GitHub Pages (Live Reports)
- **URL**: `https://{username}.github.io/{repository-name}/`
- **Updates**: Automatically on every main branch push
- **Contents**: Latest test execution results

### Artifact Downloads
- Navigate to Actions → Select workflow run → Artifacts section
- Available artifacts:
  - `playwright-report-{browser}`: Individual browser reports
  - `merged-playwright-report`: Combined results
  - `test-results-{browser}`: Raw test data
  - `test-videos-{browser}`: Failure recordings (if any)

### PR Comments
Pull requests automatically receive comments with:
- ✅/❌ Test status
- 📊 Test summary
- 🔗 Links to detailed reports
- 📋 Branch and commit information

## Troubleshooting

### Common Issues

#### 1. Tests Failing in CI but Passing Locally
- **Cause**: Different environment or timing issues
- **Solution**: Check browser versions, add waits, review CI logs

#### 2. GitHub Pages Not Deploying
- **Cause**: Permissions or Pages not enabled
- **Solution**: Check repository settings → Pages → Source: GitHub Actions

#### 3. Large Artifact Sizes
- **Cause**: Many test videos or screenshots
- **Solution**: Adjust retention days or failure-only capture

#### 4. Browser Installation Failures
- **Cause**: Dependencies missing in CI environment
- **Solution**: Use `--with-deps` flag in browser installation

### Debugging Steps
1. **Check Workflow Logs**: Actions tab → Select failed run → View logs
2. **Download Artifacts**: Check test results and screenshots
3. **Review Test Videos**: Available for failed tests
4. **Compare Environments**: Local vs CI configuration differences

## Best Practices

### 1. Test Stability
- Use explicit waits instead of fixed delays
- Implement proper error handling
- Use stable selectors (data-test attributes)

### 2. CI/CD Optimization
- Run critical tests on every push
- Use browser matrix for comprehensive coverage
- Cache dependencies for faster builds

### 3. Reporting Strategy
- Keep artifact retention reasonable (30 days)
- Use meaningful test names for better reports
- Include context in test failures

### 4. Maintenance
- Regularly update browser versions
- Monitor test execution times
- Review and update test scenarios

## Integration with Workshop

### For Facilitators
- **Pre-workshop**: Verify all tests pass via latest GitHub Actions run
- **During workshop**: Show live GitHub Pages report
- **Post-workshop**: Review participant contributions via PR tests

### For Participants
- **Fork Repository**: Get own CI/CD setup automatically
- **Create PR**: See automated testing in action
- **View Reports**: Access detailed test results and debugging info

This CI/CD setup provides a production-ready testing pipeline suitable for demonstrating modern DevOps practices in the Swiss Testing Night 2025 workshop.
