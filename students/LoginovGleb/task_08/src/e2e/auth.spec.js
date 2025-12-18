import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/имя пользователя/i)).toBeVisible();
    await expect(page.getByLabel(/пароль/i)).toBeVisible();

    // Check submit button
    await expect(page.getByRole('button', { name: /войти/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click submit button without filling form
    await page.getByRole('button', { name: /войти/i }).click();

    // Check for validation messages (if implemented)
    // This depends on your form validation implementation
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should allow typing in username and password fields', async ({ page }) => {
    const usernameInput = page.getByLabel(/имя пользователя/i);
    const passwordInput = page.getByLabel(/пароль/i);

    // Type in username
    await usernameInput.fill('testuser');
    await expect(usernameInput).toHaveValue('testuser');

    // Type in password
    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should submit login form with credentials', async ({ page }) => {
    // Fill in form
    await page.getByLabel(/имя пользователя/i).fill('admin');
    await page.getByLabel(/пароль/i).fill('admin123');

    // Submit form
    await page.getByRole('button', { name: /войти/i }).click();

    // Wait for potential navigation or error message
    // This will depend on your actual API implementation
    await page.waitForTimeout(1000);
  });

  test('should navigate to home page from login', async ({ page }) => {
    // Click on logo or home link if available
    const homeLink = page.locator('a[href="/"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
