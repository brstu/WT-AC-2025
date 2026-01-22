import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.resolve(__dirname, '../../doc/screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runLighthouse(url) {
  console.log('Launching Chrome...');
  const chrome = await chromeLauncher.launch({ 
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] 
  });
  
  const options = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  console.log('Running Lighthouse audit...');
  const runnerResult = await lighthouse(url, options);

  // Extract the reports
  const reportHtml = runnerResult.report[0];
  const reportJson = runnerResult.report[1];

  // Save reports
  const htmlPath = path.join(screenshotsDir, 'lighthouse-report.html');
  const jsonPath = path.join(screenshotsDir, 'lighthouse-report.json');
  
  fs.writeFileSync(htmlPath, reportHtml);
  fs.writeFileSync(jsonPath, reportJson);

  console.log('✓ Lighthouse reports saved:');
  console.log(`  - HTML: ${htmlPath}`);
  console.log(`  - JSON: ${jsonPath}`);

  // Extract scores
  const lhr = runnerResult.lhr;
  console.log('\nLighthouse Scores:');
  console.log(`  Performance: ${lhr.categories.performance.score * 100}`);
  console.log(`  Accessibility: ${lhr.categories.accessibility.score * 100}`);
  console.log(`  Best Practices: ${lhr.categories['best-practices'].score * 100}`);
  console.log(`  SEO: ${lhr.categories.seo.score * 100}`);

  await chrome.kill();
}

// URL to test
const url = process.argv[2] || 'http://localhost:4173';

console.log(`Testing URL: ${url}\n`);

runLighthouse(url)
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running Lighthouse:', error);
    process.exit(1);
  });
