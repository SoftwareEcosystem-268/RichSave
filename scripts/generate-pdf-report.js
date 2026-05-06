/**
 * Generate PDF Test Report
 * Run: node scripts/generate-pdf-report.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const reportDir = 'playwright-report';
const outputFile = 'QA-Test-Report.pdf';

console.log('📊 Generating PDF Test Report...');

try {
  // Check if playwright-report exists
  if (!fs.existsSync(reportDir)) {
    console.error('❌ No test results found. Run tests first:');
    console.error('   npx playwright test');
    process.exit(1);
  }

  // Open HTML report (this will start the server)
  console.log('🌐 Opening HTML report...');
  console.log(`\nReport URL: http://localhost:9323/`);
  console.log('\n📋 To save as PDF:');
  console.log('   1. Open the URL above in your browser');
  console.log('   2. Press Ctrl+P (or Cmd+P on Mac)');
  console.log('   3. Select "Save as PDF"');
  console.log('   4. Click Save\n');

  // Start the report server
  execSync('npx playwright show-report', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
