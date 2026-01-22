import { test, expect } from '@playwright/test';

test('главная страница показывает список курсов', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText('Каталог курсов')).toBeVisible();
  await expect(page.getByText('React для начинающих')).toBeVisible();
});

test('переход на страницу курса', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('text=React для начинающих');
  await expect(page.getByText('Иван Петров')).toBeVisible();
  await expect(page.getByText('4990 ₽')).toBeVisible();
});