# E2E Testing with Playwright

This directory contains end-to-end tests using Playwright.

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in a specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run tests in UI mode
npm run test:e2e:ui

# Generate test report
npm run test:e2e:report
```

## Test Structure

- `tests/e2e/` - Root directory for E2E tests
  - `auth/` - Authentication related tests
  - `transaction/` - Transaction related tests (sales, purchases)
  - `fixtures/` - Test fixtures and data

## Best Practices

1. Keep tests independent
2. Use page objects for complex pages
3. Minimize test dependencies
4. Use descriptive test names
