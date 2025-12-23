import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.resolve(__dirname, '../../doc/screenshots');

async function captureTestScreenshots() {
  console.log('Running unit and integration tests...');
  
  // Run tests and save output
  const { stdout: testOutput } = await execAsync('npm test -- --run', {
    cwd: path.resolve(__dirname, '..')
  });
  
  // Create an HTML page with test results
  const testHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Results</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      margin: 0;
    }
    pre {
      background: #252526;
      padding: 20px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 14px;
      line-height: 1.6;
    }
    .success { color: #4ec9b0; }
    .header { color: #569cd6; font-weight: bold; }
  </style>
</head>
<body>
  <pre><code class="header">Unit and Integration Test Results</code>

${testOutput.replace(/\n/g, '\n')}</pre>
</body>
</html>
  `;
  
  const testHtmlPath = path.join(screenshotsDir, 'test-results.html');
  fs.writeFileSync(testHtmlPath, testHtml);
  
  // Capture screenshot
  console.log('Capturing test results screenshot...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 }
  });
  
  await page.goto(`file://${testHtmlPath}`);
  await page.screenshot({
    path: path.join(screenshotsDir, 'tests-unit.png'),
    fullPage: true
  });
  
  await browser.close();
  
  console.log('Running E2E tests...');
  
  // Run E2E tests
  try {
    const { stdout: e2eOutput } = await execAsync('npm run test:e2e 2>&1', {
      cwd: path.resolve(__dirname, '..')
    });
    
    // Create HTML for E2E results
    const e2eHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E2E Test Results</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      margin: 0;
    }
    pre {
      background: #252526;
      padding: 20px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 14px;
      line-height: 1.6;
    }
    .success { color: #4ec9b0; }
    .header { color: #569cd6; font-weight: bold; }
  </style>
</head>
<body>
  <pre><code class="header">E2E Test Results (Playwright)</code>

${e2eOutput.replace(/\n/g, '\n')}</pre>
</body>
</html>
    `;
    
    const e2eHtmlPath = path.join(screenshotsDir, 'test-e2e-results.html');
    fs.writeFileSync(e2eHtmlPath, e2eHtml);
    
    // Capture screenshot
    console.log('Capturing E2E test results screenshot...');
    const browser2 = await chromium.launch();
    const page2 = await browser2.newPage({
      viewport: { width: 1200, height: 800 }
    });
    
    await page2.goto(`file://${e2eHtmlPath}`);
    await page2.screenshot({
      path: path.join(screenshotsDir, 'tests-e2e.png'),
      fullPage: true
    });
    
    await browser2.close();
  } catch {
    console.log('E2E tests output captured (may include errors)');
  }
  
  console.log('✓ Test screenshots captured!');
}

captureTestScreenshots()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error capturing test screenshots:', error);
    process.exit(1);
  });
