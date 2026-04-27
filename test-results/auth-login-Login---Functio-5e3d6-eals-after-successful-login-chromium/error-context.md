# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\login.spec.js >> Login - Functional Tests >> AUTH-LOG-004: Redirect to deals after successful login
- Location: tests\auth\login.spec.js:89:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/deals/
Received string:  "http://localhost:3000/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3000/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e7]: $
        - heading "Welcome Back" [level=1] [ref=e8]
        - paragraph [ref=e9]: Sign in to access your deals and savings
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: Email Address
          - textbox "Email Address" [ref=e13]:
            - /placeholder: you@example.com
            - text: login.test@richsave.com
        - generic [ref=e14]:
          - generic [ref=e15]: Password
          - textbox "Password" [ref=e16]:
            - /placeholder: ••••••••
            - text: Login@123456
        - generic [ref=e17]:
          - generic [ref=e18] [cursor=pointer]:
            - checkbox "Remember me" [ref=e19]
            - generic [ref=e20]: Remember me
          - button "Forgot password?" [ref=e21] [cursor=pointer]
        - button "Signing in..." [disabled] [ref=e22]
      - generic [ref=e25]: or
      - generic [ref=e27]:
        - text: Don't have an account?
        - button "Sign up" [ref=e28] [cursor=pointer]
    - button "Back to Home" [ref=e30] [cursor=pointer]:
      - img [ref=e31]
      - text: Back to Home
  - button "Open Next.js Dev Tools" [ref=e38] [cursor=pointer]:
    - img [ref=e39]
  - alert [ref=e42]
```

# Test source

```ts
  1   | /**
  2   |  * Login Module Test Suite
  3   |  * RichSave Application
  4   |  *
  5   |  * Covers: User Login Flow
  6   |  * Test Categories: Functional, Negative, Edge Cases, Rate Limiting, Security, UI/UX
  7   |  */
  8   | 
  9   | import { test, expect } from '@playwright/test';
  10  | 
  11  | // Test Data
  12  | const testUsers = {
  13  |   valid: {
  14  |     email: 'login.test@richsave.com',
  15  |     password: 'Login@123456'
  16  |   },
  17  |   unregistered: {
  18  |     email: 'notexist@richsave.com',
  19  |     password: 'Test@123456'
  20  |   }
  21  | };
  22  | 
  23  | // Setup - Create test user before running tests
  24  | test.beforeAll(async ({ request }) => {
  25  |   // Create test user via API
  26  |   await request.post('/api/auth/signup', {
  27  |     data: {
  28  |       name: 'Login Test User',
  29  |       email: testUsers.valid.email,
  30  |       password: testUsers.valid.password
  31  |     }
  32  |   });
  33  | });
  34  | 
  35  | // ============== FUNCTIONAL TESTS (Happy Path) ==============
  36  | 
  37  | test.describe('Login - Functional Tests', () => {
  38  |   test.beforeEach(async ({ page }) => {
  39  |     await page.goto('/login');
  40  |   });
  41  | 
  42  |   test('AUTH-LOG-001: Login with valid credentials', async ({ page }) => {
  43  |     // Act
  44  |     await page.fill('input[type="email"]', testUsers.valid.email);
  45  |     await page.fill('input[type="password"]', testUsers.valid.password);
  46  |     await page.click('button[type="submit"]');
  47  | 
  48  |     // Assert
  49  |     await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  50  |     await expect(page.locator('text=Logout').or(page.locator('[data-testid="user-menu"]'))).toBeVisible();
  51  |   });
  52  | 
  53  |   test('AUTH-LOG-002: Remember me functionality', async ({ page }) => {
  54  |     // Act
  55  |     await page.fill('input[type="email"]', testUsers.valid.email);
  56  |     await page.fill('input[type="password"]', testUsers.valid.password);
  57  |     await page.check('input[type="checkbox"]'); // Remember me
  58  |     await page.click('button[type="submit"]');
  59  | 
  60  |     // Assert
  61  |     await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  62  | 
  63  |     // Verify token/storage for persistent session
  64  |     const localStorage = await page.evaluate(() => window.localStorage);
  65  |     expect(localStorage).toBeDefined();
  66  |   });
  67  | 
  68  |   test('AUTH-LOG-003: Show/Hide password toggle', async ({ page }) => {
  69  |     // Arrange
  70  |     const passwordInput = page.locator('input[type="password"]');
  71  | 
  72  |     // Act - type password
  73  |     await passwordInput.fill(testUsers.valid.password);
  74  |     await expect(passwordInput).toHaveValue(testUsers.valid.password);
  75  | 
  76  |     // Find and click eye icon (if exists)
  77  |     const eyeIcon = page.locator('svg').first();
  78  |     if (await eyeIcon.isVisible()) {
  79  |       await eyeIcon.click();
  80  | 
  81  |       // Assert - password should become visible (type="text")
  82  |       const visiblePassword = page.locator('input[type="text"]');
  83  |       await expect(visiblePassword).toBeVisible();
  84  |     } else {
  85  |       test.skip(true, 'Show/hide password toggle not implemented');
  86  |     }
  87  |   });
  88  | 
  89  |   test('AUTH-LOG-004: Redirect to deals after successful login', async ({ page }) => {
  90  |     // Act
  91  |     await page.fill('input[type="email"]', testUsers.valid.email);
  92  |     await page.fill('input[type="password"]', testUsers.valid.password);
  93  |     await page.click('button[type="submit"]');
  94  | 
  95  |     // Assert
> 96  |     await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  97  |   });
  98  | });
  99  | 
  100 | // ============== NEGATIVE TESTS ==============
  101 | 
  102 | test.describe('Login - Negative Tests', () => {
  103 |   test.beforeEach(async ({ page }) => {
  104 |     await page.goto('/login');
  105 |   });
  106 | 
  107 |   test('AUTH-LOG-101: Login with unregistered email', async ({ page }) => {
  108 |     // Act
  109 |     await page.fill('input[type="email"]', testUsers.unregistered.email);
  110 |     await page.fill('input[type="password"]', testUsers.unregistered.password);
  111 |     await page.click('button[type="submit"]');
  112 | 
  113 |     // Assert - generic error, no email enumeration
  114 |     await expect(page.locator('text=/invalid email or password|login failed/i')).toBeVisible();
  115 |     await expect(page).toHaveURL(/\/login/);
  116 |   });
  117 | 
  118 |   test('AUTH-LOG-102: Login with valid email, wrong password', async ({ page }) => {
  119 |     // Act
  120 |     await page.fill('input[type="email"]', testUsers.valid.email);
  121 |     await page.fill('input[type="password"]', 'WrongPassword@123');
  122 |     await page.click('button[type="submit"]');
  123 | 
  124 |     // Assert - generic error
  125 |     await expect(page.locator('text=/invalid email or password|login failed/i')).toBeVisible();
  126 | 
  127 |     // Should not reveal which field is wrong
  128 |     await expect(page.locator('text=/email/i')).not.toBeVisible();
  129 |   });
  130 | 
  131 |   test('AUTH-LOG-103: Login with empty email field', async ({ page }) => {
  132 |     // Act
  133 |     await page.fill('input[type="password"]', testUsers.valid.password);
  134 |     await page.click('button[type="submit"]');
  135 | 
  136 |     // Assert
  137 |     const emailError = page.locator('input[type="email"]').evaluate(el => el.validationMessage);
  138 |     expect(await emailError).toBeTruthy();
  139 |   });
  140 | 
  141 |   test('AUTH-LOG-104: Login with empty password field', async ({ page }) => {
  142 |     // Act
  143 |     await page.fill('input[type="email"]', testUsers.valid.email);
  144 |     await page.click('button[type="submit"]');
  145 | 
  146 |     // Assert
  147 |     const passwordError = page.locator('input[type="password"]').evaluate(el => el.validationMessage);
  148 |     expect(await passwordError).toBeTruthy();
  149 |   });
  150 | 
  151 |   test('AUTH-LOG-105: Login with both fields empty', async ({ page }) => {
  152 |     // Act
  153 |     await page.click('button[type="submit"]');
  154 | 
  155 |     // Assert - HTML5 validation should trigger
  156 |     const emailInput = page.locator('input[type="email"]');
  157 |     const isInvalid = await emailInput.evaluate(el => !el.checkValidity());
  158 |     expect(isInvalid).toBeTruthy();
  159 |   });
  160 | 
  161 |   test('AUTH-LOG-106: Login with invalid email format', async ({ page }) => {
  162 |     // Act
  163 |     await page.fill('input[type="email"]', 'invalidemail');
  164 |     await page.fill('input[type="password"]', testUsers.valid.password);
  165 |     await page.click('button[type="submit"]');
  166 | 
  167 |     // Assert
  168 |     await expect(page.locator('text=/valid email/i')).toBeVisible();
  169 |   });
  170 | 
  171 |   test('AUTH-LOG-107: Login with unactivated account', async ({ page }) => {
  172 |     // This test requires creating an unactivated user first
  173 |     // For now, we'll skip or mock this scenario
  174 | 
  175 |     // Act - assuming unactivated user exists
  176 |     await page.fill('input[type="email"]', 'unactivated@richsave.com');
  177 |     await page.fill('input[type="password"]', 'Test@123456');
  178 |     await page.click('button[type="submit"]');
  179 | 
  180 |     // Assert
  181 |     const activationError = page.locator('text=/activate|verify/i');
  182 |     if (await activationError.isVisible()) {
  183 |       await expect(activationError).toBeVisible();
  184 |     } else {
  185 |       test.skip(true, 'Unactivated account scenario not set up');
  186 |     }
  187 |   });
  188 | });
  189 | 
  190 | // ============== EDGE CASES ==============
  191 | 
  192 | test.describe('Login - Edge Cases', () => {
  193 |   test('AUTH-LOG-201: Login with email in different case', async ({ page }) => {
  194 |     await page.goto('/login');
  195 | 
  196 |     // Act - email with different case
```