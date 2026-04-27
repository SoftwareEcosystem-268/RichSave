# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\login.spec.js >> Login - Security Tests >> AUTH-SEC-002: XSS in email field
- Location: tests\auth\login.spec.js:365:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/invalid|error/i')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/invalid|error/i')

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
            - text: <script>alert("XSS")</script>@example.com
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
> 375 |     await expect(page.locator('text=/invalid|error/i')).toBeVisible();
      |                                                         ^ Error: expect(locator).toBeVisible() failed
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
  395 |     await page.fill('input[type="password"]', testUsers.valid.password);
  396 |     await page.click('button[type="submit"]');
  397 | 
  398 |     // Wait for login
  399 |     await page.waitForURL(/\/deals/);
  400 | 
  401 |     // Assert - check cookies
  402 |     const cookies = await page.context().cookies();
  403 |     const tokenCookie = cookies.find(c => c.name === 'token');
  404 | 
  405 |     if (tokenCookie) {
  406 |       expect(tokenCookie.httpOnly).toBe(true);
  407 |     }
  408 | 
  409 |     // Check localStorage (should NOT have token in production)
  410 |     const tokenInLocalStorage = await page.evaluate(() => {
  411 |       return localStorage.getItem('token');
  412 |     });
  413 | 
  414 |     // In demo mode, it might be there, but production should use httpOnly
  415 |     // This is more of a documentation check
  416 |   });
  417 | 
  418 |   test('AUTH-SEC-005: Timing attack prevention', async ({ page }) => {
  419 |     await page.goto('/login');
  420 | 
  421 |     // Measure time for wrong password
  422 |     const start1 = Date.now();
  423 |     await page.fill('input[type="email"]', testUsers.valid.email);
  424 |     await page.fill('input[type="password"]', 'WrongPassword@123');
  425 |     await page.click('button[type="submit"]');
  426 |     await page.waitForTimeout(100);
  427 |     const time1 = Date.now() - start1;
  428 | 
  429 |     // Measure time for non-existent user
  430 |     const start2 = Date.now();
  431 |     await page.fill('input[type="email"]', testUsers.unregistered.email);
  432 |     await page.fill('input[type="password"]', 'WrongPassword@123');
  433 |     await page.click('button[type="submit"]');
  434 |     await page.waitForTimeout(100);
  435 |     const time2 = Date.now() - start2;
  436 | 
  437 |     // Assert - times should be similar (within 100ms)
  438 |     const timeDiff = Math.abs(time1 - time2);
  439 |     expect(timeDiff).toBeLessThan(100);
  440 |   });
  441 | });
  442 | 
  443 | // ============== UI/UX TESTS ==============
  444 | 
  445 | test.describe('Login - UI/UX Tests', () => {
  446 |   test('AUTH-UI-LOG-001: Forgot password link visible and accessible', async ({ page }) => {
  447 |     await page.goto('/login');
  448 | 
  449 |     // Assert
  450 |     const forgotLink = page.locator('text=Forgot password');
  451 |     await expect(forgotLink).toBeVisible();
  452 | 
  453 |     // Act - click it
  454 |     await forgotLink.click();
  455 | 
  456 |     // Assert - should navigate to forgot password page
  457 |     await expect(page).toHaveURL(/\/forgot-password/, { timeout: 3000 });
  458 |   });
  459 | 
  460 |   test('AUTH-UI-LOG-002: Sign up link for new users', async ({ page }) => {
  461 |     await page.goto('/login');
  462 | 
  463 |     // Assert
  464 |     await expect(page.locator('text=Don\'t have an account')).toBeVisible();
  465 |     await expect(page.locator('text=Sign up')).toBeVisible();
  466 | 
  467 |     // Act
  468 |     await page.click('text=Sign up');
  469 | 
  470 |     // Assert
  471 |     await expect(page).toHaveURL(/\/signup/, { timeout: 3000 });
  472 |   });
  473 | 
  474 |   test('AUTH-UI-LOG-003: Submit button loading state', async ({ page }) => {
  475 |     await page.goto('/login');
```