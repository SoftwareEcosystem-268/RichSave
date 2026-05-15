/**
 * Generate PDF Test Report from Markdown
 * Run: node scripts/generate-pdf-report.cjs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const reportFile = 'QA-TEST-FAILURE-REPORT.md';
const outputFile = 'QA-Test-Report-Failure-' + new Date().toISOString().split('T')[0] + '.pdf';

console.log('📊 Generating PDF Test Report...');

try {
  // Check if markdown report exists
  if (!fs.existsSync(reportFile)) {
    console.error('❌ No report found. Run tests first.');
    process.exit(1);
  }

  // Read markdown content
  const markdown = fs.readFileSync(reportFile, 'utf8');

  // Create HTML version
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    h3 { color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #2563eb; color: white; padding: 12px; text-align: left; }
    td { border: 1px solid #e5e7eb; padding: 10px; }
    tr:nth-child(even) { background: #f9fafb; }
    .critical { background: #fee2e2; }
    .high { background: #fef3c7; }
    .medium { background: #dcfce7; }
    .pass { color: #16a34a; font-weight: bold; }
    .fail { color: #dc2626; font-weight: bold; }
    pre { background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #e5e7eb; padding: 2px 6px; border-radius: 3px; }
    .status-p0 { color: #dc2626; font-weight: bold; }
    .status-p1 { color: #f59e0b; font-weight: bold; }
    .status-p2 { color: #16a34a; }
    ul { margin: 10px 0; }
    li { margin: 5px 0; }
  </style>
</head>
<body>
${markdown
  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
  .replace(/^\|.*\|$/gim, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    if (cells.length < 2) return '';
    const isHeader = match.includes('---');
    const tag = isHeader ? 'th' : 'td';
    return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
  })
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/^-\s+(.*$)/gim, '<li>$1</li>')
  .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
  .replace(/\n/g, '<br>')
  .replace(/<br><br>/g, '</p><p>')
  .replace(/^(.+)$/gm, '<p>$1</p>')
  .replace(/<p><h/g, '<h')
  .replace(/<\/h(\d)><\/p>/g, '</h$1>')
  .replace(/<p><t(abl|r)/g, '<t$1')
  .replace(/<\/t(abl|r)><\/p>/g, '</t$1')
  .replace(/<p><(ul|pre|li)/g, '<$1')
  .replace(/<\/(ul|pre|li)><\/p>/g, '</$1>')
}
</body>
</html>`;

  // Write HTML file
  const htmlFile = 'temp-report.html';
  fs.writeFileSync(htmlFile, html);

  console.log('✅ HTML report created: ' + htmlFile);
  console.log('📋 Converting to PDF...');
  console.log('\n📄 To save as PDF:');
  console.log('   1. Open ' + htmlFile + ' in your browser');
  console.log('   2. Press Ctrl+P (or Cmd+P on Mac)');
  console.log('   3. Select "Save as PDF"');
  console.log('   4. Click Save');
  console.log('\n📁 Output file: ' + outputFile);

  // Try to open in browser
  const opener = process.platform === 'win32' ? 'start' :
                 process.platform === 'darwin' ? 'open' : 'xdg-open';
  execSync(`${opener} ${htmlFile}`, { stdio: 'ignore' });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
