# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\login.spec.js >> Login - Negative Tests >> AUTH-LOG-106: Login with invalid email format
- Location: tests\auth\login.spec.js:161:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/valid email/i')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/valid email/i')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e7]: $
        - heading "Welcome Back" [level=1] [ref=e8]
        - paragraph [ref=e9]: Sign in to access your deals and savings
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: Email Address
          - textbox "Email Address" [active] [ref=e13]:
            - /placeholder: you@example.com
            - text: invalidemail
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
        - button "Sign In" [ref=e22] [cursor=pointer]
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
  96  |     await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
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
> 168 |     await expect(page.locator('text=/valid email/i')).toBeVisible();
      |                                                       ^ Error: expect(locator).toBeVisible() failed
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
  197 |     await page.fill('input[type="email"]', 'LOGIN.TEST@RICHSAVE.COM');
  198 |     await page.fill('input[type="password"]', testUsers.valid.password);
  199 |     await page.click('button[type="submit"]');
  200 | 
  201 |     // Assert - case-insensitive comparison
  202 |     await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  203 |   });
  204 | 
  205 |   test('AUTH-LOG-202: Login with email leading/trailing spaces', async ({ page }) => {
  206 |     await page.goto('/login');
  207 | 
  208 |     // Act
  209 |     await page.fill('input[type="email"]', '  login.test@richsave.com  ');
  210 |     await page.fill('input[type="password"]', testUsers.valid.password);
  211 |     await page.click('button[type="submit"]');
  212 | 
  213 |     // Assert - email should be trimmed
  214 |     await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  215 |   });
  216 | 
  217 |   test('AUTH-LOG-203: Login during network offline', async ({ page }) => {
  218 |     await page.goto('/login');
  219 | 
  220 |     // Arrange
  221 |     await page.fill('input[type="email"]', testUsers.valid.email);
  222 |     await page.fill('input[type="password"]', testUsers.valid.password);
  223 | 
  224 |     // Act - simulate offline
  225 |     await page.context().setOffline(true);
  226 |     await page.click('button[type="submit"]');
  227 | 
  228 |     // Assert
  229 |     await expect(page.locator('text=/network error|connection/i')).toBeVisible();
  230 |     await expect(page).toHaveURL(/\/login/);
  231 | 
  232 |     // Cleanup
  233 |     await page.context().setOffline(false);
  234 |   });
  235 | 
  236 |   test('AUTH-LOG-204: Login with slow network response', async ({ page }) => {
  237 |     await page.goto('/login');
  238 | 
  239 |     // Simulate slow network
  240 |     await page.route('**/api/auth/login', route => {
  241 |       setTimeout(() => route.continue(), 5000);
  242 |     });
  243 | 
  244 |     // Act
  245 |     await page.fill('input[type="email"]', testUsers.valid.email);
  246 |     await page.fill('input[type="password"]', testUsers.valid.password);
  247 | 
  248 |     const button = page.locator('button[type="submit"]');
  249 |     await button.click();
  250 | 
  251 |     // Assert - loading state should be visible
  252 |     await expect(button).toContainText(/signing in|loading/i);
  253 | 
  254 |     // Wait for completion
  255 |     await expect(page).toHaveURL(/\/deals/, { timeout: 10000 });
  256 |   });
  257 | 
  258 |   test('AUTH-LOG-205: Login tab away and back', async ({ page }) => {
  259 |     await page.goto('/login');
  260 | 
  261 |     // Arrange
  262 |     await page.fill('input[type="email"]', testUsers.valid.email);
  263 |     await page.fill('input[type="password"]', testUsers.valid.password);
  264 | 
  265 |     // Act - simulate tab away (wait 1 minute)
  266 |     await page.evaluate(() => {
  267 |       return new Promise(resolve => setTimeout(resolve, 60000));
  268 |     });
```