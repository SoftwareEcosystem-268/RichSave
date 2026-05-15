/**
 * Save Playwright Report as PDF using Playwright
 * Run: node scripts/save-report-as-pdf.js [module-name]
 *
 * Examples:
 *   node scripts/save-report-as-pdf.js           → QA-Test-Report.pdf
 *   node scripts/save-report-as-pdf.js auth      → QA-Test-Report-Auth.pdf
 *   node scripts/save-report-as-pdf.js deal      → QA-Test-Report-Deal.pdf
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get module name from command line argument
const moduleName = process.argv[2];

async function saveReportAsPDF() {
  console.log('📊 Generating PDF from Playwright Report...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Path to the report
  const reportPath = `file://${path.resolve(__dirname, '../playwright-report/index.html')}`;

  console.log('🌐 Loading report...');
  await page.goto(reportPath, { waitUntil: 'networkidle' });

  // Wait for content to load
  await page.waitForTimeout(2000);

  // Generate filename based on module name
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let filename = 'QA-Test-Report';

  if (moduleName) {
    // Capitalize first letter
    const capitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    filename += `-${capitalized}`;
  }

  filename += `-${timestamp}.pdf`;

  const outputPath = path.resolve(__dirname, '../', filename);

  console.log('📄 Saving PDF...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '1cm',
      right: '1cm',
      bottom: '1cm',
      left: '1cm'
    }
  });

  await browser.close();

  console.log(`✅ PDF saved to: ${outputPath}`);
}

saveReportAsPDF().catch(console.error);
