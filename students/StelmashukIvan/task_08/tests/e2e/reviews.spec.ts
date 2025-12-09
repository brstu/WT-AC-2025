import { test, expect } from '@playwright/test'

test.describe('Review Operations', () => {
  test('should see book details with reviews section', async ({ page }) => {
    // Сначала создаем книгу
    await page.goto('/books/new')
    await page.fill('input[name="title"]', 'Review Test Book')
    await page.fill('input[name="author"]', 'Review Author')
    await page.fill('textarea[name="description"]', 'Book for testing reviews')
    await page.fill('input[name="publishedYear"]', '2024')
    await page.fill('input[name="genre"]', 'Test')
    await page.click('button[type="submit"]')
    
    // Ждем создания и возвращаемся на список
    await page.waitForURL(/.*\/books/)
    await page.waitForLoadState('networkidle')
    
    // Переходим на страницу деталей
    await page.locator('.card').first().locator('text=Подробнее').click()
    await page.waitForURL(/.*\/books\/.*/)
    
    // Проверяем секцию рецензий
    await expect(page.locator('h2').filter({ hasText: /Рецензии/ })).toBeVisible({ timeout: 5000 })
  })

  test('should add a review to a book', async ({ page }) => {
    // Создаем книгу
    await page.goto('/books/new')
    await page.fill('input[name="title"]', 'Book for Adding Review')
    await page.fill('input[name="author"]', 'Review Author')
    await page.fill('textarea[name="description"]', 'This book will get a review')
    await page.fill('input[name="publishedYear"]', '2024')
    await page.fill('input[name="genre"]', 'Review')
    await page.click('button[type="submit"]')
    
    // Ждем создания
    await page.waitForURL(/.*\/books/)
    await page.waitForLoadState('networkidle')
    
    // Переходим на страницу деталей
    await page.locator('.card').first().locator('text=Подробнее').click()
    await page.waitForURL(/.*\/books\/.*/)
    
    // Заполняем форму отзыва
    await page.fill('input[placeholder="Ваше имя"]', 'E2E Reviewer')
    await page.fill('textarea[placeholder="Ваша рецензия"]', 'This is an excellent book! Highly recommended for everyone.')
    await page.selectOption('select[name="rating"]', '5')
    
    // Отправляем отзыв
    await page.click('button[type="submit"]')
    
    // Ждем успешного добавления
    await page.waitForTimeout(2000)
    
    // Проверяем, что отзыв появился (проверяем только имя рецензента)
    await expect(page.getByText('E2E Reviewer')).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to book list from details', async ({ page }) => {
    // Переходим на страницу книги
    await page.goto('/books')
    await page.waitForLoadState('networkidle')
    
    // Проверяем, что есть хотя бы одна книга
    const bookCards = page.locator('.card')
    const count = await bookCards.count()
    
    if (count > 0) {
      // Открываем первую книгу
      await page.locator('.card').first().locator('text=Подробнее').click()
      await page.waitForURL(/.*\/books\/.*/)
      
      // Нажимаем кнопку "Назад к списку"
      await page.click('text=Назад к списку')
      
      // Проверяем, что вернулись на список книг
      await expect(page).toHaveURL(/.*\/books/)
      await expect(page.locator('h1').filter({ hasText: /Каталог книг/ })).toBeVisible()
    }
  })
})