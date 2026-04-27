# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\login.spec.js >> Login - Edge Cases >> AUTH-LOG-201: Login with email in different case
- Location: tests\auth\login.spec.js:193:3

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
      - generic [ref=e10]: Invalid email or password
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: Email Address
          - textbox "Email Address" [ref=e14]:
            - /placeholder: you@example.com
            - text: LOGIN.TEST@RICHSAVE.COM
        - generic [ref=e15]:
          - generic [ref=e16]: Password
          - textbox "Password" [ref=e17]:
            - /placeholder: ••••••••
            - text: Login@123456
        - generic [ref=e18]:
          - generic [ref=e19] [cursor=pointer]:
            - checkbox "Remember me" [ref=e20]
            - generic [ref=e21]: Remember me
          - button "Forgot password?" [ref=e22] [cursor=pointer]
        - button "Sign In" [ref=e23] [cursor=pointer]
      - generic [ref=e26]: or
      - generic [ref=e28]:
        - text: Don't have an account?
        - button "Sign up" [ref=e29] [cursor=pointer]
    - button "Back to Home" [ref=e31] [cursor=pointer]:
      - img [ref=e32]
      - text: Back to Home
  - button "Open Next.js Dev Tools" [ref=e39] [cursor=pointer]:
    - img [ref=e40]
  - alert [ref=e43]
```

# Test source

```ts
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
  197 |     await page.fill('input[type="email"]', 'LOGIN.TEST@RICHSAVE.COM');
  198 |     await page.fill('input[type="password"]', testUsers.valid.password);
  199 |     await page.click('button[type="submit"]');
  200 | 
  201 |     // Assert - case-insensitive comparison
> 202 |     await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
      |                        ^ Error: expect(page).toHaveURL(expected) failed
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
  269 | 
  270 |     // This test would take too long, so we'll mock it
  271 |     // In real scenario, you'd test session persistence
  272 |     await page.click('button[type="submit"]');
  273 | 
  274 |     // Assert
  275 |     await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  276 |   });
  277 | });
  278 | 
  279 | // ============== RATE LIMITING TESTS ==============
  280 | 
  281 | test.describe('Login - Rate Limiting Tests', () => {
  282 |   test('AUTH-LOG-301: Account locked after 5 failed attempts', async ({ page }) => {
  283 |     await page.goto('/login');
  284 | 
  285 |     // Act - try 5 times with wrong password
  286 |     for (let i = 0; i < 5; i++) {
  287 |       await page.fill('input[type="email"]', testUsers.valid.email);
  288 |       await page.fill('input[type="password"]', 'WrongPassword@123');
  289 |       await page.click('button[type="submit"]');
  290 |       await page.waitForTimeout(500);
  291 |     }
  292 | 
  293 |     // Assert - should show rate limit error
  294 |     await expect(page.locator('text=/too many|locked|try again later/i')).toBeVisible();
  295 | 
  296 |     // Try with correct password - should still be blocked
  297 |     await page.fill('input[type="email"]', testUsers.valid.email);
  298 |     await page.fill('input[type="password"]', testUsers.valid.password);
  299 |     await page.click('button[type="submit"]');
  300 | 
  301 |     // Still blocked
  302 |     await expect(page.locator('text=/too many|locked/i')).toBeVisible();
```