# Test Execution Quick Reference

## Essential Commands

### Run All Tests
```powershell
# Run all tests (headless)
npx playwright test

# Run all tests with browser visible
npx playwright test --headed

# Run tests and generate HTML report
npx playwright test --reporter=html
```

### Run Specific Test Suites
```powershell
# Shopping cart tests
npx playwright test tests/shopping-cart.spec.ts --headed

# Product sorting tests  
npx playwright test tests/product-sorting.spec.ts --headed

# Checkout flow tests
npx playwright test tests/checkout-flow.spec.ts --headed

# Error handling tests
npx playwright test tests/error-handling.spec.ts --headed

# Navigation tests
npx playwright test tests/navigation-state.spec.ts --headed
```

### Debug and Development
```powershell
# Run in debug mode (step through tests)
npx playwright test --debug

# Run specific test in debug mode
npx playwright test tests/checkout-flow.spec.ts --debug

# Generate and view HTML report
npx playwright show-report
```

### Workshop Demo Commands
```powershell
# Quick verification (login test)
npx playwright test tests/login-success.spec.ts --headed

# Full e-commerce demo (checkout flow)
npx playwright test tests/checkout-flow.spec.ts --headed

# Error handling demo (locked user)
npx playwright test tests/error-handling.spec.ts --headed --grep "locked out"
```

## Test Suite Breakdown

| Test Suite | Tests | Duration | Focus Area |
|------------|-------|----------|------------|
| Shopping Cart | 4 | ~3s | Cart operations |
| Product Sorting | 6 | ~4s | Catalog functionality |
| Checkout Flow | 4 | ~6s | E2E purchase |
| Error Handling | 10 | ~15s | Authentication & validation |
| Navigation | 8 | ~8s | User experience |
| Login | 3 | ~2s | Basic authentication |

**Total: 35 tests in ~12 seconds**

## Available Test Data

### User Accounts
- `standard_user` - Normal user access
- `locked_out_user` - Account locked (error testing)
- `problem_user` - UI display issues
- `performance_glitch_user` - Slow performance simulation

### Password
- `secret_sauce` (for all test users)

### Products Available
- Sauce Labs Backpack ($29.99)
- Sauce Labs Bike Light ($9.99)
- Sauce Labs Bolt T-Shirt ($15.99)
- Sauce Labs Fleece Jacket ($49.99)
- Sauce Labs Onesie ($7.99)
- Test.allTheThings() T-Shirt (Red) ($15.99)
