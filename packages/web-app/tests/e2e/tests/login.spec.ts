import { test, expect } from './auth.fixture';
import { LoginPage } from '../pages/LoginPage';

/**
 * Test for login functionality
 */
test.describe('Login functionality', () => {
  test('should redirect to login page when accessing protected route', async ({
    page,
  }) => {
    // Try to access a protected route
    await page.goto('/auth/dashboard');

    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  test('should display login page elements', async ({ loginPage }) => {
    await loginPage.goto();

    // Verify login page elements
    await expect(loginPage.loginHeading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Get login page elements
    const loginPage = new LoginPage(page);

    // Login with valid credentials from environment variables
    await loginPage.login(
      process.env.E2E_TEST_EMAIL || '',
      process.env.E2E_TEST_PASSWORD || '',
    );

    // Should be redirected to authenticated route
    await expect(page).toHaveURL('http://localhost:3020/auth');
  });
});
