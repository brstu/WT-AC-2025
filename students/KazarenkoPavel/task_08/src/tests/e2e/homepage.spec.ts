import { test, expect } from '@playwright/test'

test.describe('Homepage E2E', () => {
  test('отображает главную страницу и навигацию', async ({ page }) => {
    await page.goto('/')

    // Проверяем заголовок
    await expect(page.getByRole('heading', { name: /объявления/i })).toBeVisible()

    // Проверяем наличие поиска
    await expect(page.getByPlaceholder(/поиск объявлений/i)).toBeVisible()

    // Проверяем ссылку на вход
    await expect(page.getByRole('link', { name: /войти/i })).toBeVisible()

    // Делаем скриншот для отчета
    await page.screenshot({ path: 'tests/e2e/screenshots/homepage.png' })
  })

  test('поиск объявлений работает', async ({ page }) => {
    await page.goto('/')

    // Вводим текст в поиск
    await page.getByPlaceholder(/поиск объявлений/i).fill('iPhone')
    await page.getByRole('button', { name: /найти/i }).click()

    // Проверяем, что URL изменился
    await expect(page).toHaveURL(/.*search=iPhone/)

    // Проверяем результаты поиска (мокаем данные)
    // В реальном тесте здесь будет проверка на отображение карточек
    await expect(page.getByText(/результаты поиска/i)).toBeVisible()
  })
})
