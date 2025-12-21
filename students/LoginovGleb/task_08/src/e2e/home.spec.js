import { test, expect } from '@playwright/test';

test.describe('Home Page E2E Tests', () => {
  test('should display home page correctly', async ({ page }) => {
    await page.goto('/');

    // Check main title
    await expect(
      page.getByRole('heading', {
        name: /Каталог игр|Game Library/i,
      })
    ).toBeVisible();

    // Check subtitle
    await expect(page.getByText(/Управляйте коллекцией игр/i)).toBeVisible();
  });

  test('should display login button when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Check login button exists and is visible
    const loginButton = page.getByRole('link', { name: 'Войти в систему' });
    await expect(loginButton).toBeVisible();

    // Verify it links to login page
    await expect(loginButton).toHaveAttribute('href', '/login');
  });

  test('should display all feature cards', async ({ page }) => {
    await page.goto('/');

    // Check features section heading
    await expect(page.getByRole('heading', { name: 'Возможности системы' })).toBeVisible();

    // Check all 6 feature cards
    await expect(page.getByText('🎮 Каталог игр')).toBeVisible();
    await expect(page.getByText('🔍 Поиск и фильтрация')).toBeVisible();
    await expect(page.getByText('⭐ Рейтинги и отзывы')).toBeVisible();
    await expect(page.getByText('📊 Статистика')).toBeVisible();
    await expect(page.getByText('🎯 Персонализация')).toBeVisible();
    await expect(page.getByText('🔐 Безопасность')).toBeVisible();
  });

  test('should navigate to login page when clicking login button', async ({ page }) => {
    await page.goto('/');

    // Click login button
    await page.getByRole('link', { name: 'Войти в систему' }).click();

    // Verify navigation to login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /Каталог игр|Game Library/i,
      })
    ).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(
      page.getByRole('heading', {
        name: /Каталог игр|Game Library/i,
      })
    ).toBeVisible();
  });
});
