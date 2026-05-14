# Authentication Testing Guide

## Quick Start

### 1. Setup Test Credentials

Create a `.env.test` file with your valid credentials:

```bash
cp .env.test.example .env.test
```

Edit `.env.test`:
```
TEST_EMAIL=your-actual-email@example.com
TEST_PASSWORD=your-actual-password
```

### 2. Start Development Server

```bash
npm run dev
```

Wait for: `✓ Ready in ...` message

### 3. Run Tests

**Option A: Unit Tests (Jest)**
```bash
npm test
```

**Option B: Integration Tests (with real API)**
```bash
npm run test:unit -- tests/login.integration.test.ts
```

**Option C: E2E Tests (Playwright)**
```bash
npx playwright test tests/login.valid.spec.js
```

**Option D: All Auth Tests**
```bash
npm run test:e2e:auth
```

---

## Test Files Created

| File | Type | Description |
|------|------|-------------|
| `tests/login.integration.test.ts` | Integration | API tests with real credentials |
| `tests/login.valid.spec.js` | E2E | Playwright browser tests |
| `.env.test.example` | Config | Template for test credentials |

---

## Test Coverage Summary

### Success Scenarios (5 tests)
- ✅ LOGIN-001: Valid credentials
- ✅ LOGIN-002: Email case handling
- ✅ LOGIN-003: Remember me functionality
- ✅ LOGIN-004: Redirect after login
- ✅ LOGIN-005: UI state updates

### Failure Scenarios (6 tests)
- ❌ LOGIN-NEG-001: Invalid email format
- ❌ LOGIN-NEG-002: Wrong password
- ❌ LOGIN-NEG-003: Non-existent email
- ❌ LOGIN-NEG-004: Empty fields
- ❌ LOGIN-NEG-005: Empty password
- ❌ LOGIN-NEG-006: Rate limiting

### Edge Cases (5 tests)
- 🔍 LOGIN-EDGE-001: Whitespace handling
- 🔍 LOGIN-EDGE-002: Tab/newline trimming
- 🔍 LOGIN-EDGE-003: Special characters
- 🔍 LOGIN-EDGE-004: Brute force prevention
- 🔍 LOGIN-EDGE-005: Special char passwords

### UI/UX Tests (5 tests)
- 🎨 LOGIN-UI-001: Loading states
- 🎨 LOGIN-UI-002: Password toggle
- 🎨 LOGIN-UI-003: Focus management
- 🎨 LOGIN-UI-004: Keyboard navigation
- 🎨 LOGIN-UI-005: Accessibility

### Security Tests (3 tests)
- 🔒 LOGIN-SEC-001: Generic errors
- 🔒 LOGIN-SEC-002: Password masking
- 🔒 LOGIN-SEC-003: Autocomplete behavior

### Redirect Tests (3 tests)
- 🔄 LOGIN-REDIR-001: Default redirect
- 🔄 LOGIN-REDIR-002: Already logged in
- 🔄 LOGIN-REDIR-003: Query parameter

---

## Detailed Test Commands

### Run Specific Test Suite

```bash
# Unit tests only
npm run test:unit

# All E2E tests
npm run test:e2e

# Auth E2E only
npm run test:e2e:auth

# Generate PDF report after tests
npm run test:e2e:auth:pdf
```

### Run Single Test File

```bash
# Jest integration tests
npm test -- tests/login.integration.test.ts

# Playwright E2E tests
npx playwright test tests/login.valid.spec.js

# With UI mode (see browser)
npx playwright test tests/login.valid.spec.js --ui
```

### Run Specific Test

```bash
# By test name
npx playwright test --grep "LOGIN-001"

# By file pattern
npx playwright test --project chromium tests/auth/

# With debug mode
npx playwright test tests/login.valid.spec.js --debug
```

---

## Viewing Results

### HTML Report
```bash
npx playwright show-report
```
Opens at: `http://localhost:9323/`

### PDF Report
```bash
# Generate from latest test results
node scripts/save-report-as-pdf.js auth

# Output: QA-Test-Report-Auth-YYYY-MM-DD.pdf
```

---

## Troubleshooting

### Error: "Cannot connect to API"
**Solution:** Make sure dev server is running
```bash
npm run dev
```

### Error: "Invalid credentials"
**Solution:** Verify credentials in `.env.test`
```bash
cat .env.test | grep TEST_
```

### Error: "MongoDB connection failed"
**Solution:** Check `.env.local` has valid MONGODB_URI
```bash
cat .env.local | grep MONGODB_URI
```

### Tests timeout
**Solution:** Increase timeout in `playwright.config.ts`
```typescript
use: {
  actionTimeout: 10000, // 10 seconds
}
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Auth Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run E2E tests
        run: npm run test:e2e:auth
        env:
          TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

---

## Best Practices

### 1. Never commit real credentials
```bash
# Add to .gitignore
.env.test
.env.local
```

### 2. Use test-specific accounts
- Create dedicated test user
- Don't use personal/production accounts

### 3. Clean up test data
```javascript
afterAll(async () => {
  // Delete test user
  await UserModel.deleteByEmail(TEST_EMAIL);
});
```

### 4. Run tests before committing
```bash
# Pre-commit hook
npm run test:unit && npm run test:e2e:auth
```

---

## Summary

✅ **Frameworks Already Configured:**
- Jest (Unit/Integration)
- Playwright (E2E)

✅ **Test Files Created:**
- `tests/login.integration.test.ts` - API tests
- `tests/login.valid.spec.js` - Browser tests

✅ **Total Test Coverage:**
- 27 test scenarios
- Success, Failure, Edge, UI, Security tests

✅ **Next Steps:**
1. Create `.env.test` with your credentials
2. Run `npm run dev` to start server
3. Run `npx playwright test tests/login.valid.spec.js`
