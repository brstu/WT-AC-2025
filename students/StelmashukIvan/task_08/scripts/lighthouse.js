const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

const LIGHTHOUSE_DIR = path.join(__dirname, '../lighthouse');
const REPORT_DIR = path.join(LIGHTHOUSE_DIR, 'reports');

// Создаем директории для отчетов
if (!fs.existsSync(LIGHTHOUSE_DIR)) {
  fs.mkdirSync(LIGHTHOUSE_DIR, { recursive: true });
}
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

async function runLighthouse(url, outputPath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportName = `lighthouse-report-${timestamp}.html`;
  const reportPath = path.join(REPORT_DIR, reportName);

  console.log(`Running Lighthouse for ${url}...`);
  
  try {
    const { stdout, stderr } = await execAsync(
      `npx lighthouse ${url} --output=html --output-path=${reportPath} --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`
    );

    if (stderr) {
      console.error('Lighthouse stderr:', stderr);
    }

    console.log(`Report saved to: ${reportPath}`);
    
    // Копируем отчет в указанный путь
    if (outputPath) {
      fs.copyFileSync(reportPath, outputPath);
      console.log(`Report also saved to: ${outputPath}`);
    }

    // Генерируем JSON отчет для анализа
    const jsonReportPath = reportPath.replace('.html', '.json');
    await execAsync(
      `npx lighthouse ${url} --output=json --output-path=${jsonReportPath} --chrome-flags="--headless --no-sandbox"`
    );

    return { htmlReport: reportPath, jsonReport: jsonReportPath };
  } catch (error) {
    console.error('Lighthouse failed:', error);
    throw error;
  }
}

async function generateLighthouseReport() {
  const urls = [
    'http://localhost:3000',
    'http://localhost:3000/books',
    'http://localhost:3000/books/new',
  ];

  const reports = [];
  
  for (const url of urls) {
    try {
      const report = await runLighthouse(url);
      reports.push(report);
    } catch (error) {
      console.error(`Failed to audit ${url}:`, error);
    }
  }

  // Создаем индексный файл со всеми отчетами
  const indexPath = path.join(LIGHTHOUSE_DIR, 'index.html');
  const indexContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lighthouse Reports</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .report { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .date { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>📊 Lighthouse Reports</h1>
  <p class="date">Generated on: ${new Date().toLocaleString()}</p>
  
  ${reports.map((report, index) => `
    <div class="report">
      <h3>Report ${index + 1}: ${urls[index]}</h3>
      <p><a href="reports/${path.basename(report.htmlReport)}">View HTML Report</a></p>
      <p><a href="reports/${path.basename(report.jsonReport)}">Download JSON Data</a></p>
    </div>
  `).join('')}
  
  <footer>
    <p>Generated with Lighthouse CI</p>
  </footer>
</body>
</html>
  `;

  fs.writeFileSync(indexPath, indexContent);
  console.log(`Index file created: ${indexPath}`);
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
  generateLighthouseReport().catch(console.error);
}

module.exports = { runLighthouse, generateLighthouseReport };