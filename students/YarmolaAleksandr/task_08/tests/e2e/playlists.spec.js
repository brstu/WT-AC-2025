import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('YouTube Playlist Manager E2E', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto(BASE_URL);
    // Clear localStorage (except for persist test)
    if (!testInfo.title.includes('persist')) {
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload();
    }
  });

  test('should display app header and empty state', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /YouTube Playlist Manager/i })
    ).toBeVisible();
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('should create a new playlist', async ({ page }) => {
    // Fill form
    await page.getByLabel(/title/i).fill('Gaming Highlights');
    await page.getByLabel(/description/i).fill('Best gaming moments');
    await page.getByLabel(/category/i).selectOption('gaming');
    await page.getByLabel(/video count/i).fill('25');
    await page.getByLabel(/public/i).check();

    // Submit
    await page.getByRole('button', { name: /create playlist/i }).click();

    // Verify playlist created
    await expect(page.getByText('Gaming Highlights')).toBeVisible();
    await expect(page.getByText('Best gaming moments')).toBeVisible();
    await expect(page.getByText('🎥 25 videos')).toBeVisible();
    await expect(page.getByText('🌐 Public')).toBeVisible();
  });

  test('should edit a playlist', async ({ page }) => {
    // Create playlist
    await page.getByLabel(/title/i).fill('Original Title');
    await page.getByLabel(/category/i).selectOption('music');
    await page.getByTestId('submit-button').click();

    // Wait for playlist to appear
    await expect(page.getByText('Original Title')).toBeVisible();

    // Click edit
    await page.getByTestId('edit-button').click();

    // Update title
    await page.getByLabel(/title/i).fill('Updated Title');
    await page.getByTestId('submit-button').click();

    // Verify update
    await expect(page.getByText('Updated Title')).toBeVisible();
    await expect(page.getByText('Original Title')).not.toBeVisible();
  });

  test('should delete a playlist with confirmation', async ({ page }) => {
    // Create playlist
    await page.getByLabel(/title/i).fill('Playlist to Delete');
    await page.getByLabel(/category/i).selectOption('education');
    await page.getByTestId('submit-button').click();

    // Verify created
    await expect(page.getByText('Playlist to Delete')).toBeVisible();

    // Set up dialog handler
    page.on('dialog', dialog => dialog.accept());

    // Delete
    await page.getByTestId('delete-button').click();

    // Verify deleted
    await expect(page.getByText('Playlist to Delete')).not.toBeVisible();
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    // Try to submit empty form
    await page.getByTestId('submit-button').click();

    // Check for error messages
    await expect(page.getByText(/title is required/i)).toBeVisible();
    await expect(page.getByText(/category is required/i)).toBeVisible();
  });

  test('should persist data in localStorage', async ({ page }) => {
    // Create playlist
    await page.getByLabel(/title/i).fill('Persistent Playlist');
    await page.getByLabel(/category/i).selectOption('music');
    await page.getByTestId('submit-button').click();

    await expect(page.getByText('Persistent Playlist')).toBeVisible();

    // Verify localStorage contains the playlist data
    const stored = await page.evaluate(() => {
      const data = localStorage.getItem('youtube_playlists');
      return data ? JSON.parse(data) : [];
    });

    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Persistent Playlist');
    expect(stored[0].category).toBe('music');
  });

  test('should handle multiple playlists', async ({ page }) => {
    // Create 3 playlists
    const playlists = [
      { title: 'Playlist 1', category: 'music' },
      { title: 'Playlist 2', category: 'gaming' },
      { title: 'Playlist 3', category: 'education' },
    ];

    for (const playlist of playlists) {
      await page.getByLabel(/title/i).fill(playlist.title);
      await page.getByLabel(/category/i).selectOption(playlist.category);
      await page.getByTestId('submit-button').click();
      await expect(page.getByText(playlist.title)).toBeVisible();
    }

    // Verify count
    await expect(page.getByText(/My Playlists \(3\)/i)).toBeVisible();
  });

  test('should cancel edit mode', async ({ page }) => {
    // Create playlist
    await page.getByLabel(/title/i).fill('Test Playlist');
    await page.getByLabel(/category/i).selectOption('music');
    await page.getByTestId('submit-button').click();

    // Start edit
    await page.getByTestId('edit-button').click();

    // Form should be in edit mode
    await expect(page.getByText(/Edit Playlist/i)).toBeVisible();

    // Cancel
    await page.getByTestId('cancel-button').click();

    // Should return to create mode
    await expect(page.getByText(/Create New Playlist/i)).toBeVisible();
  });
});
