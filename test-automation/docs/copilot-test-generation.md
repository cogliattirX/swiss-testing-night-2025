# Test Execution & Copilot-Driven Test Generation Guide

## Running Existing Tests

### Basic Test Execution
```powershell
# Run all tests (headless)
npx playwright test

# Run specific test with browser visible
npx playwright test tests/login-success.spec.ts --headed

# Run tests in debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

### Test Verification Checklist
- ✅ Login test runs successfully in headed mode
- ✅ Browser opens and performs login automatically
- ✅ Test passes with green status
- ✅ HTML report generates successfully

## Generating New Tests with GitHub Copilot

### Copilot Best Practices Context

When asking Copilot to generate tests, always include this context in your prompts:

```
Context for Copilot:
- We're testing the Sauce Demo e-commerce site (https://www.saucedemo.com/)
- Use Page Object Model pattern for maintainability  
- Follow the test strategy in test-automation/docs/test-strategy.md
- Apply persona-based review from copilot-context/personas.md
- Use TypeScript with Playwright framework
- Tests should be atomic, isolated, and deterministic
- Include meaningful assertions and error handling
```

### Example Copilot Prompts for Test Generation

#### 1. Shopping Cart Test
```
As a Senior Test Automation Engineer, create a Playwright test that:
1. Logs in with standard_user
2. Adds 2 products to cart
3. Verifies cart badge shows correct count
4. Opens cart and validates products are present
5. Uses Page Object Model pattern
Apply the test strategy from docs/test-strategy.md and ensure a DevOps Engineer reviewing this would approve the CI/CD readiness.
```

#### 2. Product Sorting Test  
```
As a Test Analyst with domain expertise, create a test that validates product sorting functionality:
1. Login to Sauce Demo
2. Test all sorting options (A-Z, Z-A, Price Low-High, Price High-Low)
3. Verify products are actually sorted correctly
4. Include edge cases and error scenarios
Consider that a Business Domain Expert will review this for completeness.
```

#### 3. Checkout Flow Test
```
As a Site Reliability Engineer focused on critical user journeys, create an end-to-end checkout test:
1. Complete login and product selection
2. Fill checkout form with test data
3. Complete purchase flow
4. Verify success confirmation
5. Include performance assertions and error handling
A Security Architect will review this for security best practices.
```

### Copilot Workflow for Test Creation

1. **Start with Persona Context**
   - State which persona you're adopting
   - Include their key concerns and experience level

2. **Reference Documentation**
   - Mention relevant docs (test-strategy.md, personas.md)
   - Include the critical reviewer persona

3. **Be Specific About Requirements**
   - Exact user flow to test
   - Specific assertions needed
   - Error conditions to handle

4. **Request Best Practices**
   - Ask for Page Object Model implementation
   - Request proper waiting strategies
   - Include accessibility considerations

### Example Complete Copilot Session

```
User: "As a Senior Test Automation Engineer with 5+ years experience, I need to create a product search test for Sauce Demo. This test should validate the search functionality works correctly. A DevOps Engineer will review this focusing on CI/CD integration and scalability. Please follow the test strategy documented in our test-automation/docs/test-strategy.md and use the Page Object Model pattern."

Expected Copilot Response:
- Creates proper test file structure
- Implements Page Object Model
- Includes appropriate waiting strategies
- Adds meaningful assertions
- Considers CI/CD implications
```

## Advanced Test Generation Patterns

### Data-Driven Tests
```
Prompt: "Create a data-driven login test that validates all user types from Sauce Demo (standard_user, locked_out_user, problem_user, performance_glitch_user). Use test.describe.parallel for efficiency and include proper error handling for each scenario."
```

### Cross-Browser Tests
```
Prompt: "Extend our test suite to run across Chrome, Firefox, and WebKit browsers. Ensure the configuration follows our CI/CD pipeline requirements and includes proper reporting for each browser."
```

### API + UI Integration Tests
```
Prompt: "Create a test that combines API calls with UI validation. First verify backend data via API, then validate the UI displays this data correctly. Follow our infrastructure guidelines from test-automation/docs/infrastructure.md."
```

## Quality Gates for Generated Tests

Before accepting Copilot-generated tests, verify:

### Technical Quality (Test Automation Engineer perspective)
- [ ] Uses proper selectors (data-testid preferred)
- [ ] Includes explicit waits (no arbitrary sleeps)
- [ ] Follows Page Object Model pattern
- [ ] Has meaningful test names and descriptions

### Business Quality (Business Analyst perspective)  
- [ ] Tests realistic user scenarios
- [ ] Covers happy path and edge cases
- [ ] Validates business rules correctly
- [ ] Includes appropriate test data

### Process Quality (Scrum Master perspective)
- [ ] Tests are atomic and independent
- [ ] Clear documentation and comments
- [ ] Follows team conventions
- [ ] Ready for CI/CD pipeline

### Infrastructure Quality (DevOps Engineer perspective)
- [ ] Parallelizable execution
- [ ] Proper resource cleanup
- [ ] Environment-agnostic configuration
- [ ] Monitoring and reporting ready

## Troubleshooting Copilot-Generated Tests

### Common Issues and Fixes
1. **Flaky selectors**: Ask Copilot to use more stable selectors
2. **Timing issues**: Request explicit waits instead of sleeps
3. **Hard-coded values**: Ask for configurable test data
4. **Missing error handling**: Request comprehensive try-catch blocks

### Refinement Prompts
```
"The test you generated is flaky due to timing issues. Please refactor to use Playwright's auto-waiting features and explicit expectations instead of fixed delays."

"This test needs better error handling. As a Site Reliability Engineer, I need comprehensive logging and graceful failure handling for production monitoring."
```

## Integration with Workshop Flow

### For Workshop Participants
1. Start with provided login test as working example
2. Use Copilot prompts above to generate next test
3. Apply persona-based review process
4. Share learnings with group

### For Facilitators
- Demonstrate live Copilot test generation
- Show before/after of persona-based improvements
- Highlight best practices in real-time
- Address common generation issues immediately
