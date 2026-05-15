#!/bin/bash

# Run All E2E Tests and Generate PDF Reports
# This script runs tests for each module and generates individual PDFs

echo "================================"
echo "  E2E Tests + PDF Generator"
echo "================================"
echo ""

MODULES=("auth" "deal" "location" "favorites" "savings")
TIMESTAMP=$(date +%Y-%m-%d)
TOTAL=${#MODULES[@]}

echo "📅 Date: $TIMESTAMP"
echo "📦 Modules to test: $TOTAL"
echo ""

for i in "${!MODULES[@]}"; do
  MODULE="${MODULES[$i]}"
  NUM=$((i + 1))

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[$NUM/$TOTAL] Testing: $MODULE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Run tests
  echo "🔄 Running tests..."
  npx playwright test tests/$MODULE/ --project chromium > /dev/null 2>&1

  # Generate PDF
  echo "📄 Generating PDF..."
  node scripts/save-report-as-pdf.js $MODULE > /dev/null 2>&1

  # Check if PDF was created
  PDF_FILE="QA-Test-Report-${MODULE^}-${TIMESTAMP}.pdf"

  if [ -f "$PDF_FILE" ]; then
    SIZE=$(ls -lh "$PDF_FILE" | awk '{print $5}')
    echo "✅ Done: $PDF_FILE ($SIZE)"
  else
    echo "⚠️  PDF not found for $MODULE"
  fi

  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All tests completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# List all generated PDFs
echo "📁 Generated PDFs:"
ls -lh QA-Test-Report-*-${TIMESTAMP}.pdf 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'

echo ""
echo "💡 View HTML report: npx playwright show-report"
