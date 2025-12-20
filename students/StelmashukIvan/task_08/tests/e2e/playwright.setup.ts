import { test as setup } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  // Сохраняем состояние аутентификации
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})