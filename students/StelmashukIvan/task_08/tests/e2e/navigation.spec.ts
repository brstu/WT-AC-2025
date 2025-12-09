import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    // Стартовая страница
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что находимся на странице книг
    await expect(page).toHaveURL(/.*\/books/)
    await expect(page.locator('h1').filter({ hasText: /Каталог книг/ })).toBeVisible()
    
    // Переход на страницу добавления книги
    await page.click('text=Добавить книгу')
    await expect(page).toHaveURL(/.*\/books\/new/)
    
    // Возврат на главную через логотип
    await page.click('text=BookCatalog')
    await expect(page).toHaveURL(/.*\/books/)
  })

  test('should show 404 page for unknown route', async ({ page }) => {
    await page.goto('/unknown-route')
    await expect(page.locator('h1')).toContainText('404')
    await expect(page.locator('h2')).toContainText('Страница не найдена')
  })
})