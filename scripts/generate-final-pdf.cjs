/**
 * Generate Final PDF Test Report
 */

const { execSync } = require('child_process');
const fs = require('fs');

const reportFile = 'QA-TEST-REPORT-FINAL.md';
const htmlFile = 'QA-TEST-REPORT-FINAL.html';
const pdfName = 'QA-Test-Report-Final-' + new Date().toISOString().split('T')[0] + '.pdf';

console.log('📊 Generating Final PDF Test Report...\n');

// Read markdown
const markdown = fs.readFileSync(reportFile, 'utf8');

// Convert to HTML
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>QA Test Report - RichSave</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
      page-break-after: avoid;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      page-break-after: avoid;
    }
    h3 {
      color: #1e3a8a;
      page-break-after: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 12px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      border: 1px solid #e5e7eb;
      padding: 10px;
    }
    tr:nth-child(even) { background: #f9fafb; }
    .critical { color: #dc2626; font-weight: bold; }
    .high { color: #f59e0b; font-weight: bold; }
    .medium { color: #16a34a; }
    .pass { color: #16a34a; font-weight: bold; }
    .fail { color: #dc2626; font-weight: bold; }
    pre {
      background: #1f2937;
      color: #e5e7eb;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-size: 11px;
    }
    code {
      background: #e5e7eb;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    .status-good { color: #16a34a; }
    .status-warning { color: #f59e0b; }
    .status-bad { color: #dc2626; }
    ul { margin: 10px 0; }
    li { margin: 5px 0; }
    .summary-box {
      background: #f0f9ff;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
    }
    .bug-box {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 15px;
      margin: 20px 0;
    }
    .emoji { font-size: 1.2em; }
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
    return '<tr>' + cells.map(c => {
      let cell = c.trim();
      if (cell.includes('✅')) cell = cell.replace('✅', '<span class="pass">✅</span>');
      if (cell.includes('❌')) cell = cell.replace('❌', '<span class="fail">❌</span>');
      if (cell.includes('⚠️')) cell = cell.replace('⚠️', '<span class="high">⚠️</span>');
      if (cell.includes('🔴')) cell = cell.replace('🔴', '<span class="critical">🔴</span>');
      if (cell.includes('🟢')) cell = cell.replace('🟢', '<span class="pass">🟢</span>');
      if (cell.includes('🟡')) cell = cell.replace('🟡', '<span class="high">🟡</span>');
      return `<${tag}>${cell}</${tag}>`;
    }).join('') + '</tr>';
  })
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/^- \[x\] (.*)/gim, '<li><input type="checkbox" checked disabled> $1</li>')
  .replace(/^- \[ \] (.*)/gim, '<li><input type="checkbox" disabled> $1</li>')
  .replace(/^- ([\u{1F300}-\u{1F9FF}])\s+(.*)/gimu, '<li><span class="emoji">$1</span> $2</li>')
  .replace(/^- (.*)/gim, '<li>$1</li>')
  .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
  .replace(/\n\n/g, '</p><p>')
  .replace(/^(?!<[hp])<p>/gm, '<p>')
  .replace(/<p><h/g, '<h')
  .replace(/<\/h(\d+)><\/p>/g, '</h$1>')
  .replace(/<p><t(abl|r)/g, '<t$1')
  .replace(/<\/t(abl|r)><\/p>/g, '</t$1')
  .replace(/<p><(ul|li|pre)/g, '<$1')
  .replace(/<\/(ul|li|pre)><\/p>/g, '</$1>')
  .replace(/<p><\/p>/g, '')
}
</body>
</html>`;

// Write HTML
fs.writeFileSync(htmlFile, html);

console.log('✅ HTML report created: ' + htmlFile);
console.log('\n📄 Instructions:');
console.log('   1. The HTML report is opening in your browser');
console.log('   2. Press Ctrl+P (or Cmd+P on Mac)');
console.log('   3. Select "Save as PDF" or "Microsoft Print to PDF"');
console.log('   4. Click Save\n');
console.log('📁 Suggested filename: ' + pdfName);

// Open in browser
const opener = process.platform === 'win32' ? 'start' :
               process.platform === 'darwin' ? 'open' : 'xdg-open';
execSync(`${opener} ${htmlFile}`, { stdio: 'ignore' });

console.log('\n✅ Done! Browser opened with the report.');
