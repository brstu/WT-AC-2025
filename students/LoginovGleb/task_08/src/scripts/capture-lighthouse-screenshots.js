import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.resolve(__dirname, '../../doc/screenshots');
const reportPath = path.join(screenshotsDir, 'lighthouse-report.html');

async function captureScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  console.log('Loading Lighthouse report...');
  await page.goto(`file://${reportPath}`, { waitUntil: 'networkidle' });

  // Wait for report to render
  await page.waitForSelector('.lh-scores-container', { timeout: 10000 });

  // Capture Performance section
  console.log('Capturing Performance screenshot...');
  const perfGauge = page.locator('.lh-category[id="performance"]').first();
  await perfGauge.screenshot({
    path: path.join(screenshotsDir, 'lighthouse-performance.png')
  });

  // Capture Accessibility section
  console.log('Capturing Accessibility screenshot...');
  const a11yGauge = page.locator('.lh-category[id="accessibility"]').first();
  await a11yGauge.screenshot({
    path: path.join(screenshotsDir, 'lighthouse-accessibility.png')
  });

  // Capture Best Practices section
  console.log('Capturing Best Practices screenshot...');
  const bpGauge = page.locator('.lh-category[id="best-practices"]').first();
  await bpGauge.screenshot({
    path: path.join(screenshotsDir, 'lighthouse-best-practices.png')
  });

  // Capture SEO section
  console.log('Capturing SEO screenshot...');
  const seoGauge = page.locator('.lh-category[id="seo"]').first();
  await seoGauge.screenshot({
    path: path.join(screenshotsDir, 'lighthouse-seo.png')
  });

  // Capture overview with all scores
  console.log('Capturing overview screenshot...');
  const scoresContainer = page.locator('.lh-scores-container').first();
  await scoresContainer.screenshot({
    path: path.join(screenshotsDir, 'lighthouse-overview.png')
  });

  await browser.close();
  console.log('✓ All Lighthouse screenshots captured!');
}

captureScreenshots()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error capturing screenshots:', error);
    process.exit(1);
  });
