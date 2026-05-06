# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\login.spec.js >> Login - Rate Limiting Tests >> AUTH-LOG-301: Account locked after 5 failed attempts
- Location: tests\auth\login.spec.js:282:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/too many|locked|try again later/i')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/too many|locked|try again later/i')

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
            - text: login.test@richsave.com
        - generic [ref=e15]:
          - generic [ref=e16]: Password
          - textbox "Password" [ref=e17]:
            - /placeholder: ••••••••
            - text: WrongPassword@123
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
> 294 |     await expect(page.locator('text=/too many|locked|try again later/i')).toBeVisible();
      |                                                                           ^ Error: expect(locator).toBeVisible() failed
  295 | 
  296 |     // Try with correct password - should still be blocked
  297 |     await page.fill('input[type="email"]', testUsers.valid.email);
  298 |     await page.fill('input[type="password"]', testUsers.valid.password);
  299 |     await page.click('button[type="submit"]');
  300 | 
  301 |     // Still blocked
  302 |     await expect(page.locator('text=/too many|locked/i')).toBeVisible();
  303 |   });
  304 | 
  305 |   test('AUTH-LOG-302: Rate limit resets after timeout', async ({ page }) => {
  306 |     // This test would take 15 minutes to run properly
  307 |     // We'll verify the mechanism exists instead
  308 |     await page.goto('/login');
  309 | 
  310 |     // Act - trigger lock
  311 |     for (let i = 0; i < 5; i++) {
  312 |       await page.fill('input[type="email"]', testUsers.valid.email);
  313 |       await page.fill('input[type="password"]', 'WrongPassword@123');
  314 |       await page.click('button[type="submit"]');
  315 |       await page.waitForTimeout(100);
  316 |     }
  317 | 
  318 |     // Assert - should show countdown timer
  319 |     const countdown = page.locator('text=/minute|second/i').or(page.locator('[data-testid="countdown"]'));
  320 |     if (await countdown.isVisible()) {
  321 |       await expect(countdown).toBeVisible();
  322 |     } else {
  323 |       // At minimum, should show rate limit message
  324 |       await expect(page.locator('text=/too many/i')).toBeVisible();
  325 |     }
  326 |   });
  327 | 
  328 |   test('AUTH-LOG-303: Successful login resets counter', async ({ page }) => {
  329 |     await page.goto('/login');
  330 | 
  331 |     // Act - fail 4 times, then succeed
  332 |     for (let i = 0; i < 4; i++) {
  333 |       await page.fill('input[type="email"]', testUsers.valid.email);
  334 |       await page.fill('input[type="password"]', 'WrongPassword@123');
  335 |       await page.click('button[type="submit"]');
  336 |       await page.waitForTimeout(100);
  337 |     }
  338 | 
  339 |     // Now with correct password
  340 |     await page.fill('input[type="email"]', testUsers.valid.email);
  341 |     await page.fill('input[type="password"]', testUsers.valid.password);
  342 |     await page.click('button[type="submit"]');
  343 | 
  344 |     // Assert - should login successfully
  345 |     await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  346 |   });
  347 | });
  348 | 
  349 | // ============== SECURITY TESTS ==============
  350 | 
  351 | test.describe('Login - Security Tests', () => {
  352 |   test('AUTH-SEC-001: SQL Injection in email field', async ({ page }) => {
  353 |     await page.goto('/login');
  354 | 
  355 |     // Act
  356 |     await page.fill('input[type="email"]', "admin' OR '1'='1");
  357 |     await page.fill('input[type="password"]', testUsers.valid.password);
  358 |     await page.click('button[type="submit"]');
  359 | 
  360 |     // Assert - should not bypass authentication
  361 |     await expect(page).toHaveURL(/\/login/);
  362 |     await expect(page.locator('text=/invalid|error/i')).toBeVisible();
  363 |   });
  364 | 
  365 |   test('AUTH-SEC-002: XSS in email field', async ({ page }) => {
  366 |     await page.goto('/login');
  367 | 
  368 |     // Act
  369 |     await page.fill('input[type="email"]', '<script>alert("XSS")</script>@example.com');
  370 |     await page.fill('input[type="password"]', testUsers.valid.password);
  371 |     await page.click('button[type="submit"]');
  372 | 
  373 |     // Assert - no alert should execute
  374 |     await expect(page).toHaveURL(/\/login/);
  375 |     await expect(page.locator('text=/invalid|error/i')).toBeVisible();
  376 |   });
  377 | 
  378 |   test('AUTH-SEC-003: NoSQL Injection in password field', async ({ page }) => {
  379 |     await page.goto('/login');
  380 | 
  381 |     // Act
  382 |     await page.fill('input[type="email"]', testUsers.valid.email);
  383 |     await page.fill('input[type="password"]', '{$ne: null}');
  384 |     await page.click('button[type="submit"]');
  385 | 
  386 |     // Assert - should not bypass authentication
  387 |     await expect(page).toHaveURL(/\/login/);
  388 |   });
  389 | 
  390 |   test('AUTH-SEC-004: Token stored in httpOnly cookie', async ({ page }) => {
  391 |     await page.goto('/login');
  392 | 
  393 |     // Act
  394 |     await page.fill('input[type="email"]', testUsers.valid.email);
```