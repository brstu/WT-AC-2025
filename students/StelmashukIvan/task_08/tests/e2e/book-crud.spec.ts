import { test, expect } from '@playwright/test'

test.describe('Book CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to book creation page', async ({ page }) => {
    await page.click('text=Добавить книгу')
    await expect(page).toHaveURL(/.*\/books\/new/)
    await expect(page.locator('h1')).toContainText('Добавить новую книгу')
  })

  test('should create a new book', async ({ page }) => {
    // Переход на страницу создания
    await page.click('text=Добавить книгу')
    
    // Заполнение формы
    await page.fill('input[name="title"]', 'E2E Test Book')
    await page.fill('input[name="author"]', 'E2E Test Author')
    await page.fill('textarea[name="description"]', 'This is a test book created by E2E tests')
    await page.fill('input[name="publishedYear"]', '2024')
    await page.fill('input[name="genre"]', 'Testing')
    
    // Отправка формы
    await page.click('button[type="submit"]')
    
    // Ждем уведомления об успехе
    await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 10000 })
    
    // Проверяем, что вернулись на страницу списка книг
    await expect(page).toHaveURL(/.*\/books/)
  })

  test('should view book details', async ({ page }) => {
    // Сначала создаем книгу для тестирования
    await page.click('text=Добавить книгу')
    await page.fill('input[name="title"]', 'Test Book for Details')
    await page.fill('input[name="author"]', 'Test Author')
    await page.fill('textarea[name="description"]', 'Test description')
    await page.fill('input[name="publishedYear"]', '2024')
    await page.fill('input[name="genre"]', 'Test')
    await page.click('button[type="submit"]')
    
    // Ждем создания книги
    await page.waitForURL(/.*\/books/)
    await page.waitForLoadState('networkidle')
    
    // Открываем детали книги
    await page.locator('.card').first().locator('text=Подробнее').click()
    
    // Проверяем, что перешли на страницу деталей
    await expect(page).toHaveURL(/.*\/books\/.*/)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText('Test Book for Details')).toBeVisible()
  })

  test('should search for books', async ({ page }) => {
    // Создаем книгу для поиска
    await page.click('text=Добавить книгу')
    await page.fill('input[name="title"]', 'Unique Search Book 123')
    await page.fill('input[name="author"]', 'Search Author')
    await page.fill('textarea[name="description"]', 'This book should be found by search')
    await page.fill('input[name="publishedYear"]', '2024')
    await page.fill('input[name="genre"]', 'Searchable')
    await page.click('button[type="submit"]')
    
    // Ждем создания и возврата на список
    await page.waitForURL(/.*\/books/)
    await page.waitForLoadState('networkidle')
    
    // Ищем созданную книгу
    const searchInput = page.locator('input[placeholder*="Поиск"]').first()
    await searchInput.fill('Unique Search Book 123')
    await searchInput.press('Enter')
    
    // Ждем результатов поиска
    await page.waitForTimeout(2000)
    
    // Проверяем, что книга найдена
    await expect(page.getByText('Unique Search Book 123')).toBeVisible({ timeout: 5000 })
  })

  test('should filter books by genre', async ({ page }) => {
    // Ждем загрузки списка книг
    await page.waitForSelector('.card', { timeout: 10000 })
    
    // Проверяем наличие селектора фильтрации
    const genreFilter = page.locator('select').first()
    await expect(genreFilter).toBeVisible()
    
    // Выбираем первый доступный жанр
    const options = await genreFilter.locator('option').all()
    if (options.length > 1) {
      await genreFilter.selectOption({ index: 1 })
      // Ждем применения фильтра
      await page.waitForTimeout(2000)
      
      // Проверяем, что книги отображаются
      const bookCards = page.locator('.card')
      await expect(bookCards.first()).toBeVisible({ timeout: 5000 })
    }
  })
})