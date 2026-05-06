# QA Test Cases — Authentication System
**โปรเจกต์:** RichSave
**สร้างโดย:** Senior QA Engineer
**วันที่:** 19 เมษายน 2026
**เวอร์ชัน:** 1.0

---

## Table of Contents
1. [Register Test Cases](#register-test-cases)
2. [Login Test Cases](#login-test-cases)
3. [Forgot Password Test Cases](#forgot-password-test-cases)
4. [Logout Test Cases](#logout-test-cases)
5. [Security Test Cases](#security-test-cases)
6. [UI/UX Test Cases](#uiux-test-cases)

---

## Register Test Cases

### Functional Tests (Happy Path)

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-REG-001 | Register with valid data | User is on signup page | 1. Enter valid name<br>2. Enter valid email<br>3. Enter password (6+ chars)<br>4. Confirm password matching<br>5. Accept terms & conditions<br>6. Click "Create Account" | Account created successfully<br>Redirect to /deals<br>Success message displayed | P0 |
| AUTH-REG-002 | Email verification sent | User completed registration | 1. Complete registration<br>2. Check email inbox | Verification email sent<br>Email contains valid verification link<br>Link expires in 15 minutes | P0 |
| AUTH-REG-003 | Activate account via email | User received verification email | 1. Click verification link in email<br>2. Wait for redirect | Account activated<br>User can now login<br>Success message: "Account activated successfully" | P0 |
| AUTH-REG-004 | Resend verification email | User didn't receive first email | 1. Click "Resend verification email"<br>2. Check email inbox | New verification email sent<br>Previous link invalidated<br>Rate limit applied (max 3/hour) | P1 |

### Negative Tests

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-REG-101 | Register with empty name field | User is on signup page | 1. Leave name empty<br>2. Fill other valid fields<br>3. Click "Create Account" | Error: "Name is required"<br>Form submission blocked | P0 |
| AUTH-REG-102 | Register with empty email field | User is on signup page | 1. Leave email empty<br>2. Fill other valid fields<br>3. Click "Create Account" | Error: "Email is required"<br>Form submission blocked | P0 |
| AUTH-REG-103 | Register with empty password fields | User is on signup page | 1. Leave password empty<br>2. Leave confirm password empty<br>3. Fill other valid fields<br>4. Click "Create Account" | Error: "Password is required"<br>Form submission blocked | P0 |
| AUTH-REG-104 | Register with mismatched passwords | User is on signup page | 1. Fill valid name, email<br>2. Enter password: "Test@123"<br>3. Enter confirm: "Different@123"<br>4. Click "Create Account" | Error: "Passwords do not match"<br>User stays on signup page | P0 |
| AUTH-REG-105 | Register with password less than 6 characters | User is on signup page | 1. Fill valid name, email<br>2. Enter password: "12345"<br>3. Confirm same password<br>4. Click "Create Account" | Error: "Password must be at least 6 characters"<br>Form submission blocked | P0 |
| AUTH-REG-106 | Register with invalid email format | User is on signup page | 1. Fill valid name, password<br>2. Enter email: "invalidemail"<br>3. Click "Create Account" | Error: "Please enter a valid email"<br>Form submission blocked | P0 |
| AUTH-REG-107 | Register with email without @ | User is on signup page | 1. Fill valid name, password<br>2. Enter email: "testexample.com"<br>3. Click "Create Account" | Error: "Please enter a valid email"<br>Form submission blocked | P0 |
| AUTH-REG-108 | Register with email without domain | User is on signup page | 1. Fill valid name, password<br>2. Enter email: "test@"<br>3. Click "Create Account" | Error: "Please enter a valid email"<br>Form submission blocked | P0 |
| AUTH-REG-109 | Register with spaces in email | User is on signup page | 1. Fill valid name, password<br>2. Enter email: "test @example.com"<br>3. Click "Create Account" | Error: "Please enter a valid email"<br>Form submission blocked | P0 |
| AUTH-REG-110 | Register with already registered email | Email already exists in database | 1. Use existing email from database<br>2. Fill other valid fields<br>3. Click "Create Account" | Error: "Email already registered"<br>Option to login or reset password | P0 |
| AUTH-REG-111 | Register without accepting terms | User is on signup page | 1. Fill all valid fields<br>2. Don't check terms checkbox<br>3. Click "Create Account" | Error: "You must accept the terms and conditions"<br>Form submission blocked | P1 |

### Edge Cases

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-REG-201 | Register with name containing special characters | User is on signup page | 1. Enter name: "José María-Garcia" (accents, hyphen)<br>2. Fill valid email, password<br>3. Accept terms<br>4. Click "Create Account" | Account created<br>Name stored correctly<br>No character corruption | P2 |
| AUTH-REG-202 | Register with very long name (100 chars) | User is on signup page | 1. Enter name with 100 characters<br>2. Fill valid email, password<br>3. Accept terms<br>4. Click "Create Account" | Account created if within limit<br>Or error: "Name too long (max 100 chars)" | P2 |
| AUTH-REG-203 | Register with name containing only spaces | User is on signup page | 1. Enter name: "   "<br>2. Fill valid email, password<br>3. Click "Create Account" | Error: "Name cannot be empty or only spaces"<br>Form submission blocked | P2 |
| AUTH-REG-204 | Register with email in different case | Email: test@example.com exists | 1. Enter email: "TEST@EXAMPLE.COM"<br>2. Fill other valid fields<br>3. Click "Create Account" | Error: "Email already registered"<br>Email comparison is case-insensitive | P1 |
| AUTH-REG-205 | Register with password exactly 6 characters | User is on signup page | 1. Enter password: "123456"<br>2. Confirm same<br>3. Fill other valid fields<br>4. Click "Create Account" | Account created successfully<br>Minimum boundary accepted | P1 |
| AUTH-REG-206 | Register with very long password (200 chars) | User is on signup page | 1. Enter password with 200 characters<br>2. Confirm same<br>3. Fill other valid fields<br>4. Click "Create Account" | Account created if within limit<br>Or error: "Password too long" | P2 |
| AUTH-REG-207 | Register with copy-paste in password field | User is on signup page | 1. Type password in password field<br>2. Copy and paste to confirm field<br>3. Fill other valid fields<br>4. Click "Create Account" | Passwords match<br>Account created<br>Paste functionality works | P2 |
| AUTH-REG-208 | Register with Unicode email | User is on signup page | 1. Enter email: "test@例え.jp" or "test@münchen.de"<br>2. Fill other valid fields<br>3. Click "Create Account" | Account created if supported<br>Or error: "Invalid email format" | P2 |
| AUTH-REG-209 | Rapid submit attempts (double-click) | User is on signup page | 1. Fill all valid fields<br>2. Click "Create Account" twice rapidly | Only one account created<br>No duplicate user error<br>Idempotent API call | P1 |
| AUTH-REG-210 | Register during network offline | Device has no internet connection | 1. Fill all valid fields<br>2. Turn off network<br>3. Click "Create Account" | Error: "Network error. Please check your connection."<br>No account created<br>User stays on page with data | P1 |

### Security Tests

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-REG-SEC-001 | SQL Injection in name field | User is on signup page | 1. Enter name: "admin' OR '1'='1"<br>2. Fill valid email, password<br>3. Click "Create Account" | Input sanitized/safely escaped<br>No SQL injection occurs<br>Account may be created with literal name | P0 |
| AUTH-REG-SEC-002 | XSS attack in name field | User is on signup page | 1. Enter name: "<script>alert('XSS')</script>"<br>2. Fill valid email, password<br>3. Click "Create Account" | Script tags escaped<br>No alert executed<br>Name stored safely as HTML entity | P0 |
| AUTH-REG-SEC-003 | NoSQL Injection in email field | User is on signup page | 1. Enter email: "{$ne: null}"<br>2. Fill valid name, password<br>3. Click "Create Account" | Input sanitized<br>No MongoDB operator injection<br>Proper error returned | P0 |
| AUTH-REG-SEC-004 | Email enumeration prevention | Multiple registration attempts | 1. Try to register with existing email<br>2. Observe error message | Generic error message<br>Doesn't reveal if email exists<br>"If account exists, check your email" | P0 |

---

## Login Test Cases

### Functional Tests (Happy Path)

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-LOG-001 | Login with valid credentials | User has activated account | 1. Enter valid email<br>2. Enter valid password<br>3. Click "Sign In" | Login successful<br>Redirect to /deals<br>User data stored in localStorage<br>Token generated and stored | P0 |
| AUTH-LOG-002 | Remember me functionality | User is on login page | 1. Enter valid credentials<br>2. Check "Remember me"<br>3. Click "Sign In"<br>4. Close browser<br>5. Reopen browser | Session persisted<br>User remains logged in<br>Token stored with extended expiry | P1 |
| AUTH-LOG-003 | Show/Hide password toggle | User is on login page | 1. Enter password<br>2. Click eye icon to show<br>3. Click eye icon to hide | Password visible as text when shown<br>Password masked as bullets when hidden<br>Toggle state changes correctly | P2 |

### Negative Tests

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-LOG-101 | Login with unregistered email | User is on login page | 1. Enter non-existent email<br>2. Enter any password<br>3. Click "Sign In" | Error: "Invalid email or password"<br>Generic error (no email enumeration)<br>User stays on login page | P0 |
| AUTH-LOG-102 | Login with valid email, wrong password | User account exists | 1. Enter valid email<br>2. Enter incorrect password<br>3. Click "Sign In" | Error: "Invalid email or password"<br>Generic error (doesn't reveal which is wrong)<br>Attempt counted towards rate limit | P0 |
| AUTH-LOG-103 | Login with empty email field | User is on login page | 1. Leave email empty<br>2. Enter valid password<br>3. Click "Sign In" | HTML5 validation triggered<br>Or error: "Email is required"<br>Form submission blocked | P0 |
| AUTH-LOG-104 | Login with empty password field | User is on login page | 1. Enter valid email<br>2. Leave password empty<br>3. Click "Sign In" | HTML5 validation triggered<br>Or error: "Password is required"<br>Form submission blocked | P0 |
| AUTH-LOG-105 | Login with both fields empty | User is on login page | 1. Leave both fields empty<br>2. Click "Sign In" | HTML5 validation triggered<br>Or error: "Please fill in all fields"<br>Form submission blocked | P0 |
| AUTH-LOG-106 | Login with invalid email format | User is on login page | 1. Enter email: "invalidemail"<br>2. Enter any password<br>3. Click "Sign In" | HTML5 email validation triggered<br>Or error: "Please enter a valid email"<br>Form submission blocked | P0 |
| AUTH-LOG-107 | Login with unactivated account | User registered but not activated | 1. Enter valid email<br>2. Enter valid password<br>3. Click "Sign In" | Error: "Please activate your account first"<br>Option to resend activation email<br>Login blocked | P1 |

### Edge Cases

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-LOG-201 | Login with email in different case | User email: test@example.com | 1. Enter email: "TEST@EXAMPLE.COM"<br>2. Enter valid password<br>3. Click "Sign In" | Login successful<br>Email comparison is case-insensitive | P1 |
| AUTH-LOG-202 | Login with email leading/trailing spaces | User account exists | 1. Enter email: " test@example.com "<br>2. Enter valid password<br>3. Click "Sign In" | Login successful<br>Email trimmed automatically | P2 |
| AUTH-LOG-203 | Login during network offline | Device has no internet connection | 1. Enter valid credentials<br>2. Turn off network<br>3. Click "Sign In" | Error: "Network error. Please check your connection."<br>Login failed<br>No token stored | P1 |
| AUTH-LOG-204 | Login with slow network response | Network latency > 5 seconds | 1. Enter valid credentials<br>2. Click "Sign In" | Loading indicator shows<br>Button shows "Signing in..."<br>No timeout before 30 seconds | P2 |
| AUTH-LOG-205 | Login tab away and back | User is on login page | 1. Enter credentials<br>2. Switch to another tab<br>3. Wait 1 minute<br>4. Return and click "Sign In" | Session still valid<br>Login proceeds normally<br>No unexpected behavior | P2 |

### Rate Limiting Tests

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-LOG-301 | Account locked after 5 failed attempts | User account exists | 1. Attempt login with wrong password 5 times<br>2. On 6th attempt, enter correct credentials | Error: "Too many failed attempts. Account locked for 15 minutes."<br>Login blocked even with correct credentials<br>Timer displayed | P0 |
| AUTH-LOG-302 | Rate limit resets after 15 minutes | Account is locked | 1. Wait 15 minutes<br>2. Enter correct credentials<br>3. Click "Sign In" | Login successful<br>Lock expired<br>Attempt counter reset | P0 |
| AUTH-LOG-303 | Rate limit counts per email | Multiple users failing login | 1. User A fails 5 times<br>2. User B attempts login | User A locked<br>User B can still login (different email)<br>Rate limiting is email-specific | P1 |
| AUTH-LOG-304 | Rate limit counts per IP address | Multiple users from same IP | 1. User A fails 5 times from IP X<br>2. User B (different email) tries from IP X | Both users rate limited<br>IP-based limiting works<br>Protection against distributed attacks | P1 |
| AUTH-LOG-305 | Rate limit with correct password after failures | User failed 4 times | 1. Enter correct password on 5th attempt | Login successful<br>Successful login resets counter<br>No lock triggered | P1 |

---

## Forgot Password Test Cases

### Functional Tests (Happy Path)

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-FP-001 | Request OTP with registered email | User account exists | 1. Enter registered email<br>2. Click "Send OTP" | Success message: "OTP sent to your email"<br>Move to OTP verification step<br>OTP valid for 15 minutes | P0 |
| AUTH-FP-002 | Verify correct OTP | User is on OTP step | 1. Enter correct 6-digit OTP<br>2. Click "Verify OTP" | OTP verified<br>Move to reset password step<br>Success message displayed | P0 |
| AUTH-FP-003 | Reset password with valid data | User is on reset password step | 1. Enter new password (6+ chars)<br>2. Confirm matching password<br>3. Click "Reset Password" | Password updated successfully<br>Redirect to login page<br>Can login with new password<br>Old password no longer works | P0 |
| AUTH-FP-004 | Complete forgot password flow | User forgot password | 1. Request OTP with email<br>2. Verify OTP<br>3. Reset password<br>4. Login with new password | Complete flow successful<br>User can access account<br>All steps connected properly | P0 |

### Negative Tests

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-FP-101 | Request OTP with unregistered email | User is on forgot password page | 1. Enter non-existent email<br>2. Click "Send OTP" | Generic response: "If email exists, OTP sent"<br>No email enumeration<br>Same message as registered email | P0 |
| AUTH-FP-102 | Request OTP with empty email | User is on forgot password page | 1. Leave email empty<br>2. Click "Send OTP" | Error: "Email is required"<br>Form submission blocked<br>Or HTML5 validation | P0 |
| AUTH-FP-103 | Request OTP with invalid email format | User is on forgot password page | 1. Enter email: "invalidemail"<br>2. Click "Send OTP" | Error: "Please enter a valid email"<br>Form submission blocked<br>Or HTML5 validation | P0 |
| AUTH-FP-104 | Verify OTP with empty fields | User is on OTP step | 1. Leave all OTP fields empty<br>2. Click "Verify OTP" | Error: "Please enter the 6-digit code"<br>Form submission blocked | P0 |
| AUTH-FP-105 | Verify OTP with incorrect code | User is on OTP step | 1. Enter wrong 6-digit OTP<br>2. Click "Verify OTP" | Error: "Invalid OTP. Please try again."<br>User stays on OTP step<br>Attempt counted | P0 |
| AUTH-FP-106 | Verify expired OTP | OTP sent > 15 minutes ago | 1. Enter expired OTP code<br>2. Click "Verify OTP" | Error: "OTP has expired. Please request a new one."<br>Option to request new OTP<br>Cannot proceed with expired code | P0 |
| AUTH-FP-107 | Reset password with mismatched passwords | User is on reset password step | 1. Enter new password<br>2. Enter different confirm password<br>3. Click "Reset Password" | Error: "Passwords do not match"<br>User stays on reset step<br>Passwords not changed | P0 |
| AUTH-FP-108 | Reset password with short password | User is on reset password step | 1. Enter password: "12345"<br>2. Confirm same<br>3. Click "Reset Password" | Error: "Password must be at least 6 characters"<br>User stays on reset step<br>Passwords not changed | P0 |
| AUTH-FP-109 | Reuse already used OTP | OTP already verified once | 1. Try to verify same OTP again | Error: "OTP already used or invalid"<br>Cannot use same OTP twice<br>Security enforced | P0 |

### Edge Cases

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-FP-201 | Request OTP multiple times | User is on forgot password page | 1. Click "Send OTP"<br>2. Click "Send OTP" again quickly | Rate limiting applied<br>Or: New OTP sent, old invalidated<br>Consistent behavior | P1 |
| AUTH-FP-202 | OTP auto-focus next field | User is on OTP step | 1. Type digit in first field<br>2. Observe cursor behavior | Focus moves to next field automatically<br>Smooth user experience<br>Backspace moves to previous field | P2 |
| AUTH-FP-203 | OTP paste from clipboard | User copied OTP from email | 1. Paste OTP code<br>2. Observe field behavior | All fields populated automatically<br>Or: Paste in first field distributes digits<br>Good user experience | P2 |
| AUTH-FP-204 | Change email during flow | User is on OTP step | 1. Click "Change email"<br>2. Enter different email<br>3. Click "Send OTP" | Returns to email step<br>New OTP sent to new email<br>Previous OTP invalidated | P1 |
| AUTH-FP-205 | Network error during OTP request | Network connection lost | 1. Enter email<br>2. Turn off network<br>3. Click "Send OTP" | Error: "Network error. Please try again."<br>User can retry<br>Data preserved in form | P1 |
| AUTH-FP-206 | Set new password same as old password | User is resetting password | 1. Enter current password as new<br>2. Confirm matching<br>3. Click "Reset Password" | Either: Allows (user preference)<br>Or: Error "Cannot use previous password"<br>Consistent policy | P2 |
| AUTH-FP-207 | Session timeout during reset flow | User takes > 30 minutes | 1. Request OTP<br>2. Wait 30+ minutes<br>3. Try to complete flow | Error: "Session expired. Please start over."<br>Redirect to email step<br>Security enforced | P1 |

### Security Tests

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-FP-SEC-001 | Brute force OTP protection | User is on OTP step | 1. Enter wrong OTP 5 times | Error: "Too many attempts. OTP invalidated."<br>Must request new OTP<br>Brute force prevented | P0 |
| AUTH-FP-SEC-002 | OTP enumeration prevention | Attacker testing valid OTPs | 1. Submit random OTPs | No indication if OTP exists<br>Consistent error messages<br>Timing attacks prevented | P0 |
| AUTH-FP-SEC-003 | Email enumeration in forgot password | Attacker testing email existence | 1. Try existing email<br>2. Try non-existing email<br>3. Compare responses | Identical response messages<br>No timing difference<br>Email existence not revealed | P0 |

---

## Logout Test Cases

### Functional Tests (Happy Path)

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-LOGO-001 | Logout from navigation menu | User is logged in | 1. Click logout button/menu<br>2. Confirm logout if prompted | User logged out<br>Redirect to login or home page<br>Token removed from storage<br>Session cleared | P0 |
| AUTH-LOGO-002 | Verify session cleared after logout | User is logged in | 1. Click logout<br>2. Check browser storage | localStorage cleared<br>Cookies removed (auth token)<br>Session data deleted | P0 |
| AUTH-LOGO-003 | Cannot access protected routes after logout | User just logged out | 1. After logout, try to access /profile<br>2. Try to access /savings | Redirect to login page<br>Error: "Please login to continue"<br>Access denied | P0 |
| AUTH-LOGO-004 | Login again after logout | User logged out | 1. Go to login page<br>2. Enter valid credentials<br>3. Click "Sign In" | Login successful<br>New token generated<br>Access to protected routes restored | P0 |

### Negative Tests

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-LOGO-101 | Cancel logout confirmation | User is logged in, confirmation shown | 1. Click logout button<br>2. Click "Cancel" on confirmation | User remains logged in<br>No changes to session<br>Stays on current page | P1 |
| AUTH-LOGO-102 | Logout during network offline | Device has no internet connection | 1. Turn off network<br>2. Click logout button | Local session cleared<br>Offline logout succeeds<br>No network dependency | P1 |
| AUTH-LOGO-103 | Multiple rapid logout clicks | User is logged in | 1. Click logout button multiple times | Single logout executed<br>No errors<br>No multiple redirects | P2 |

### Edge Cases

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-LOGO-201 | Logout with expired token | User session has expired | 1. Try to use app (token expired)<br>2. Click logout | Logout successful<br>Graceful handling<br>Redirect to login | P1 |
| AUTH-LOGO-202 | Logout from multiple tabs | User logged in on multiple tabs | 1. Logout from tab A<br>2. Check tab B | Both tabs logged out<br>Or: Tab B shows session expired on next action<br>Consistent state across tabs | P1 |
| AUTH-LOGO-203 | Logout and back button navigation | User just logged out | 1. Complete logout<br>2. Click browser back button | No access to protected page<br>Redirected to login<br>Back-button attack prevented | P0 |
| AUTH-LOGO-204 | Logout timeout before confirmation | User is logged in, auto-logout configured | 1. Stay inactive for timeout period<br>2. Try to perform action | Auto-logout triggered<br>Redirect to login<br>Session expired message | P1 |

---

## Security Test Cases (Comprehensive)

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-SEC-001 | Password stored as hash, not plain text | User account created | 1. Check database for user record | Password field contains bcrypt hash<br>Format: $2a$10$...<br>Plain text password NOT stored | P0 |
| AUTH-SEC-002 | JWT token uses secure secret | Token generation | 1. Inspect JWT payload<br>2. Verify signature | Token signed with JWT_SECRET<br>Signature valid<br>Secret not exposed in client code | P0 |
| AUTH-SEC-003 | Token expires after 7 days | User just logged in | 1. Decode JWT token<br>2. Check expiry timestamp | Expiry set to 7 days from creation<br>Token invalid after expiry<br>Proper expiry enforcement | P0 |
| AUTH-SEC-004 | Token stored in httpOnly cookie | Login flow | 1. Check browser cookies after login | Token cookie has httpOnly flag<br>JavaScript cannot access token<br>XSS protection enabled | P0 |
| AUTH-SEC-005 | Token NOT in localStorage | Login flow | 1. Check localStorage after login | No token in localStorage<br>Security best practice followed<br>Prevents XSS token theft | P0 |
| AUTH-SEC-006 | Cookie has secure flag in production | Production environment | 1. Check cookie attributes | Cookie has secure: true<br>Only sent over HTTPS<br>MITM protection enabled | P0 |
| AUTH-SEC-007 | Cookie has SameSite attribute | Login flow | 1. Check cookie attributes | SameSite set to 'strict' or 'lax'<br>CSRF protection enabled<br>Proper cross-site handling | P0 |
| AUTH-SEC-008 | Timing attack prevention in password check | Login with wrong password | 1. Measure response time for wrong password<br>2. Measure response time for non-existent user | Response times similar (+/- 100ms)<br>bcrypt.compare used<br>Timing information not leaked | P0 |
| AUTH-SEC-009 | NoSQL injection prevention | Any input field | 1. Enter MongoDB operators: $ne, $in, $gt<br>2. Submit form | Inputs sanitized/escaped<br>Operators treated as literals<br>No injection possible | P0 |
| AUTH-SEC-010 | XSS prevention in name field | Register with XSS payload | 1. Enter: <script>alert('XSS')</script><br>2. Register and login<br>3. Check profile page display | Script tags escaped<br>No alert executed<br>HTML entities used: &lt;script&gt; | P0 |
| AUTH-SEC-011 | CSRF token on mutation endpoints | Authenticated POST request | 1. Check API requests | CSRF token present<br>Token validated on server<br>State-changing requests protected | P0 |
| AUTH-SEC-012 | Rate limiting on auth endpoints | Multiple rapid requests | 1. Send 100 rapid login requests | Rate limiting enforced<br>HTTP 429 responses after threshold<br>Server protected from DoS | P0 |
| AUTH-SEC-013 | Password complexity requirements | Registration or reset | 1. Try password: "password"<br>2. Try: "Pass@123" | Weak password rejected<br>Strong password accepted<br>Policy enforced consistently | P1 |
| AUTH-SEC-014 | OTP is single-use only | Password reset flow | 1. Verify OTP successfully<br>2. Try to verify same OTP again | Second verification fails<br>OTP marked as used<br>Replay attack prevented | P0 |
| AUTH-SEC-015 | OTP expires after 15 minutes | OTP generated | 1. Wait 16 minutes<br>2. Try to verify OTP | Verification fails<br>OTP expired message<br>Time-bound security enforced | P0 |
| AUTH-SEC-016 | Session fixation prevention | Login flow | 1. Check session ID before login<br>2. Check after login | New session ID issued<br>Old session invalidated<br>Session fixation not possible | P0 |
| AUTH-SEC-017 | Concurrent session handling | User logs in from new device | 1. Login from device A<br>2. Login from device B | Either: Both sessions allowed<br>Or: Previous session invalidated<br>Consistent policy | P1 |

---

## UI/UX Test Cases

### Register UI/UX

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-UI-REG-001 | Form has proper labels and placeholders | User is on signup page | 1. Inspect all input fields | Each field has visible label<br>Meaningful placeholder text<br>Accessible to screen readers | P1 |
| AUTH-UI-REG-002 | Password field has show/hide toggle | User is on signup page | 1. Check password field visibility | Eye icon visible<br>Click toggles visibility<br>Accessible alternative exists | P2 |
| AUTH-UI-REG-003 | Terms link opens in new tab or modal | User is on signup page | 1. Click "Terms of Service" link | Either: Opens new tab<br>Or: Opens modal dialog<br>Doesn't lose form data | P2 |
| AUTH-UI-REG-004 | Form validation shows inline errors | User is on signup page | 1. Submit with invalid data<br>2. Check error display | Error shown near field<br>Clear error message<br>Red color for errors | P1 |
| AUTH-UI-REG-005 | Submit button shows loading state | User is on signup page | 1. Fill valid data<br>2. Click "Create Account"<br>3. Wait for response | Button shows "Creating account..."<br>Button disabled during request<br>Prevents double-submit | P1 |
| AUTH-UI-REG-006 | Success message is clear and actionable | Registration successful | 1. Complete registration | Success banner/message shown<br>Next action clear (check email)<br>Professional design | P1 |
| AUTH-UI-REG-007 | Error messages are user-friendly | Various error scenarios | 1. Trigger different errors | Plain language, no jargon<br>Constructive guidance<br>Not overly technical | P1 |
| AUTH-UI-REG-008 | Mobile responsive design | User is on mobile device | 1. Open signup page on mobile<br>2. Try all fields and buttons | Layout adapts to screen<br>Fields properly sized<br>Buttons touch-friendly (44x44 min) | P1 |
| AUTH-UI-REG-009 | Keyboard navigation works | User is on signup page | 1. Tab through form<br>2. Enter data with keyboard<br>3. Submit with Enter | Logical tab order<br>All fields accessible<br>Enter submits form | P2 |
| AUTH-UI-REG-010 | Back to Home link works | User is on signup page | 1. Click "Back to Home" | Navigates to home page<br>Data preserved or warning shown<br>Clear navigation option | P2 |

### Login UI/UX

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-UI-LOG-001 | Forgot password link visible and accessible | User is on login page | 1. Check for "Forgot password?" link | Link visible below password field<br>Clickable and accessible<br>Leads to forgot password page | P1 |
| AUTH-UI-LOG-002 | Sign up link for new users | User is on login page | 1. Check for sign up prompt | "Don't have an account?" visible<br>Sign up link works<br>Clear user path | P1 |
| AUTH-UI-LOG-003 | Remember me checkbox state persists | User is on login page | 1. Check "Remember me"<br>2. Logout<br>3. Return to login page | Checkbox state remembered<br>Or state reset based on policy<br>Consistent behavior | P2 |
| AUTH-UI-LOG-004 | Generic error message prevents enumeration | Login fails | 1. Try wrong email<br>2. Try wrong password | Same error message<br>No indication which is wrong<br>"Invalid email or password" | P0 |
| AUTH-UI-LOG-005 | Rate limit countdown displayed | Account locked | 1. Trigger rate limit<br>2. Check error display | Countdown timer visible<br>Clear time until unlock<br>Reduces support burden | P1 |
| AUTH-UI-LOG-006 | Mobile password entry is easy | User is on mobile | 1. Tap password field<br>2. Enter password | Numeric keyboard option available<br>Show/hide accessible<br>No zoom on focus (input font 16px+) | P2 |

### Forgot Password UI/UX

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-UI-FP-001 | Multi-step progress indicator | User is in forgot password flow | 1. Navigate through flow | Current step highlighted<br>Total steps visible<br>Clear progress indication | P2 |
| AUTH-UI-FP-002 | OTP input fields are user-friendly | User is on OTP step | 1. Type in OTP fields | Auto-advance to next field<br>Backspace goes to previous<br>Paste works correctly | P1 |
| AUTH-UI-FP-003 | Resend OTP option available | User is on OTP step | 1. Wait or enter wrong OTP | "Resend OTP" link visible<br>Respect rate limiting<br>Clear countdown if waiting | P1 |
| AUTH-UI-FP-004 | Change email option available | User is on OTP step | 1. Check for email change option | "Change email" link/button<br>Returns to email step<br>Simple correction flow | P1 |
| AUTH-UI-FP-005 | Password strength indicator | User is on reset password step | 1. Enter new password | Strength bar/color shown<br>Real-time feedback<br>Clear requirements list | P2 |

### General UI/UX

| ID | Description | Preconditions | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| AUTH-UI-GEN-001 | Consistent styling across pages | All auth pages | 1. Visit login, signup, forgot password | Same color scheme<br>Same typography<br>Consistent layout | P2 |
| AUTH-UI-GEN-002 | Loading states on all async actions | Various operations | 1. Trigger any async operation | Spinner or progress shown<br>UI not frozen<br>User informed of activity | P1 |
| AUTH-UI-GEN-003 | Error handling for network failures | Network disconnected | 1. Disconnect network<br>2. Try any auth operation | Graceful error message<br>Retry option available<br>Data preserved | P1 |
| AUTH-UI-GEN-004 | Accessibility compliance (WCAG) | Any auth page | 1. Test with screen reader<br>2. Test keyboard only<br>3. Check color contrast | Screen reader friendly<br>Keyboard accessible<br>Contrast ratio ≥ 4.5:1 | P1 |
| AUTH-UI-GEN-005 | Browser autofill works | Login and signup pages | 1. Allow browser to save credentials<br>2. Revisit page | Fields populate correctly<br>Autocomplete attributes set<br>Convenient for users | P2 |

---

## Priority Definitions

| Priority | Description | SLA for Fix |
|---|---|---|
| **P0** | Critical - Blocks release, security vulnerability, data loss risk | Fix immediately, within 24 hours |
| **P1** | High - Major functionality broken, poor user experience | Fix within 1-2 days |
| **P2** | Medium - Minor issues, workarounds available | Fix within 1 week |
| **P3** | Low - Nice to have, cosmetic | Fix when time permits |

---

## Test Statistics

| Category | Test Count |
|---|---|
| Register Tests | 34 |
| Login Tests | 28 |
| Forgot Password Tests | 27 |
| Logout Tests | 13 |
| Security Tests | 17 |
| UI/UX Tests | 26 |
| **Total** | **145** |

---

## Test Execution Checklist

### Before Testing
- [ ] Test environment prepared (staging/dev database)
- [ ] Test accounts created (various scenarios)
- [ ] Test data prepared (valid emails, passwords)
- [ ] Email service configured for testing
- [ ] Browser tools ready (DevTools, network throttling)

### During Testing
- [ ] Execute tests by priority (P0 → P1 → P2)
- [ ] Document all deviations from expected results
- [ ] Capture screenshots for UI issues
- [ ] Record network requests for API issues
- [ ] Note any missing test cases

### After Testing
- [ ] Compile test report
- [ ] Categorize findings by severity
- [ ] Assign issues to developers
- [ ] Verify fixes with regression testing
- [ ] Update test cases for new features

---

*Document Version: 1.0*
*Last Updated: 19 April 2026*
*QA Engineer: Senior QA Engineer*
