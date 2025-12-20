test('vacancies page opens', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Вакансии');
  await expect(page).toHaveURL(/vacancies/);
});