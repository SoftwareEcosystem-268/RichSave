# รายงานผล QA Unit Test — ระบบ Authentication
**โปรเจกต์:** RichSave  
**ไฟล์ทดสอบ:** `tests/auth.unit.test.ts`  
**วันที่รัน:** 4 เมษายน 2026  
**เครื่องมือ:** Jest  
**เวลาที่ใช้:** 3.9 วินาที  

---

## 1. สรุปผลการทดสอบโดยรวม

| รายการ | ผลลัพธ์ |
|---|---|
| Test Suites ทั้งหมด | 1 |
| Test Suites ผ่าน | ✅ 1 |
| Tests ทั้งหมด | 45 |
| Tests ผ่าน | ✅ 45 |
| Tests ล้มเหลว | ❌ 0 |
| Snapshots | 0 |
| เวลารวม | 3.9s (ประมาณ 7s) |

> **สถานะโดยรวม: PASS** — ทดสอบผ่านทั้งหมด 45/45 รายการ ไม่มีรายการที่ล้มเหลว

---

## 2. รายละเอียดการทดสอบแต่ละหมวด

### 🔐 หมวดที่ 1: Authentication Token Utilities (10 tests)

ทดสอบฟังก์ชันใน `lib/auth.ts` ครอบคลุม 3 ฟังก์ชันหลัก

#### 2.1 `generateToken` — สร้าง JWT Token (3 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 1 | should generate a valid JWT token | ✅ PASS | ตรวจสอบว่า token เป็น string และมีครบ 3 ส่วน (header.payload.signature) |
| 2 | should include userId and email in token payload | ✅ PASS | ตรวจสอบว่า userId และ email ถูกฝังใน payload ครบถ้วน |
| 3 | should set expiration to 7 days by default | ✅ PASS | ตรวจสอบว่า token หมดอายุใน 7 วัน (604,800 วินาที) |

#### 2.2 `verifyToken` — ตรวจสอบความถูกต้อง JWT (4 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 4 | should verify a valid token | ✅ PASS | ตรวจสอบว่า token ที่ถูกต้องถอดรหัสได้สำเร็จ |
| 5 | should return null for invalid token | ✅ PASS | ตรวจสอบว่า token ที่ผิดรูปแบบคืนค่า null |
| 6 | should return null for expired token | ✅ PASS | ตรวจสอบว่า token หมดอายุแล้วคืนค่า null |
| 7 | should return null for token with wrong secret | ✅ PASS | ตรวจสอบว่า token ที่ sign ด้วย secret ผิดคืนค่า null |

#### 2.3 `getUserFromToken` — ดึง User จาก Bearer Token (3 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 8 | should extract user from valid Bearer token | ✅ PASS | ตรวจสอบว่าดึง user จาก `Bearer <token>` ได้ถูกต้อง |
| 9 | should extract user from token without Bearer prefix | ✅ PASS | ตรวจสอบว่าดึง user จาก token ล้วนๆ ได้เช่นกัน |
| 10 | should return null for invalid token | ✅ PASS | ตรวจสอบว่า token ผิดคืนค่า null |

---

### 🔒 หมวดที่ 2: User Model — Password Security (6 tests)

ทดสอบความปลอดภัยของรหัสผ่านใน `lib/models.ts` — `UserModel`

#### 2.4 Password Hashing — การเข้ารหัสรหัสผ่าน (3 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 11 | should hash password when creating user | ✅ PASS | ตรวจสอบว่า password ถูก hash ด้วย bcrypt (format `$2a$`, `$2b$`, `$2y$`) ก่อนบันทึก |
| 12 | should use bcrypt with salt rounds 10 | ✅ PASS | ตรวจสอบว่าใช้ salt rounds = 10 และ hash ใช้ได้จริง |
| 13 | should not store plain text password | ✅ PASS | ตรวจสอบว่า password ต้นฉบับไม่ถูกเก็บลง database เด็ดขาด |

#### 2.5 Password Verification — การตรวจสอบรหัสผ่าน (2 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 14 | should correctly verify password with bcrypt.compare | ✅ PASS | ตรวจสอบว่า `bcrypt.compare` คืนค่า true เมื่อ password ถูก และ false เมื่อผิด |
| 15 | should prevent timing attacks with consistent comparison time | ✅ PASS | ตรวจสอบว่าเวลาเปรียบเทียบ password ถูก/ผิด ต่างกันไม่เกิน 100ms (ป้องกัน timing attack) |

#### 2.6 Password Update — การอัปเดตรหัสผ่าน (1 test)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 16 | should hash new password when updating | ✅ PASS | ตรวจสอบว่า password ใหม่ถูก hash ก่อน update ลง database |

---

### 📱 หมวดที่ 3: OTP Model — Security (7 tests)

ทดสอบระบบ One-Time Password ใน `lib/models.ts` — `OTPModel`

#### 2.7 OTP Generation — การสร้าง OTP (3 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 17 | should generate 6-digit numeric OTP | ✅ PASS | ตรวจสอบว่า OTP มี 6 หลักและเป็นตัวเลขล้วน |
| 18 | should create OTP with 15 minute expiration | ✅ PASS | ตรวจสอบว่า OTP หมดอายุใน 15 นาที (900,000ms ±10,000ms) |
| 19 | should set used flag to false initially | ✅ PASS | ตรวจสอบว่าสร้าง OTP ใหม่ค่า `used = false` เสมอ |

#### 2.8 OTP Verification — การยืนยัน OTP (4 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 20 | should mark OTP as used after verification | ✅ PASS | ตรวจสอบว่า OTP ถูก mark `used = true` หลังใช้งาน |
| 21 | should not verify expired OTP | ✅ PASS | ตรวจสอบว่า OTP หมดอายุแล้วไม่สามารถใช้ได้ |
| 22 | should not verify already used OTP | ✅ PASS | ตรวจสอบว่า OTP ที่ใช้ไปแล้วไม่สามารถใช้ซ้ำ |
| 23 | should prevent double use of OTP | ✅ PASS | ตรวจสอบ race condition — การ verify 2 ครั้งต่อเนื่อง ครั้งที่ 2 ต้องล้มเหลว |

---

### 🛡️ หมวดที่ 4: Input Validation & Sanitization (14 tests)

#### 2.9 Email Validation — การตรวจสอบรูปแบบอีเมล (9 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 24 | should accept valid email: test@example.com | ✅ PASS | อีเมลรูปแบบมาตรฐาน |
| 25 | should accept valid email: user.name@example.com | ✅ PASS | อีเมลมี `.` ในชื่อผู้ใช้ |
| 26 | should accept valid email: user+tag@example.co.th | ✅ PASS | อีเมลมี `+` tag และโดเมน `.co.th` |
| 27 | should accept valid email: test123@test-domain.com | ✅ PASS | อีเมลมีตัวเลขและ `-` ในโดเมน |
| 28 | should reject invalid email: invalidemail | ✅ PASS | ไม่มี `@` |
| 29 | should reject invalid email: @example.com | ✅ PASS | ไม่มีชื่อผู้ใช้ก่อน `@` |
| 30 | should reject invalid email: test@ | ✅ PASS | ไม่มีโดเมนหลัง `@` |
| 31 | should reject invalid email: test @example.com | ✅ PASS | มีช่องว่างในชื่อผู้ใช้ |
| 32 | should reject invalid email: test@exam ple.com | ✅ PASS | มีช่องว่างในโดเมน |

#### 2.10 Password Strength — ความแข็งแกร่งรหัสผ่าน (3 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 33 | should reject passwords less than 6 characters | ✅ PASS | ปฏิเสธรหัสผ่านที่สั้นกว่า 6 ตัวอักษร |
| 34 | should accept passwords with 6+ characters | ✅ PASS | ยอมรับรหัสผ่านที่ยาว 6 ตัวขึ้นไป |
| 35 | should check for complexity if required | ✅ PASS | ตรวจสอบว่ามี uppercase, lowercase, ตัวเลข, และอักขระพิเศษ |

#### 2.11 NoSQL Injection Prevention — ป้องกัน NoSQL Injection (2 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 36 | should sanitize regex special characters in search | ✅ PASS | escape อักขระพิเศษ regex เช่น `$`, `{`, `}` |
| 37 | should escape MongoDB operators in user input | ✅ PASS | ลบหรือ escape MongoDB operators (`$where`, `$ne`, `$in`, `$gt`, `$or`) |

#### 2.12 XSS Prevention — ป้องกัน Cross-Site Scripting (2 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 38 | should escape HTML tags in user input | ✅ PASS | แปลง `<script>` เป็น `&lt;script&gt;` |
| 39 | should escape event handlers | ✅ PASS | แปลง `<img onerror=...>` ให้ event handler ไม่ทำงาน |

---

### ⏱️ หมวดที่ 5: Rate Limiting Tests (2 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 40 | should track login attempts by IP/email | ✅ PASS | นับจำนวนครั้งที่ login ผิด และ lock เมื่อถึง 5 ครั้ง |
| 41 | should reset attempts after timeout | ✅ PASS | รีเซ็ตการนับหลังจากผ่านไป 15 นาที |

---

### 🍪 หมวดที่ 6: Cookie Security Tests (4 tests)

| # | ชื่อ Test | ผล | รายละเอียด |
|---|---|---|---|
| 42 | should set httpOnly flag on authentication cookie | ✅ PASS | ตรวจสอบ `httpOnly: true` เพื่อป้องกัน JavaScript เข้าถึง cookie |
| 43 | should set secure flag in production | ✅ PASS | ตรวจสอบ `secure: true` ใน production environment |
| 44 | should set appropriate SameSite attribute | ✅ PASS | ตรวจสอบว่า SameSite เป็น `strict` หรือ `lax` |
| 45 | should set appropriate expiration time | ✅ PASS | ตรวจสอบว่า maxAge = 7 วัน (604,800 วินาที) |

---

## 3. Coverage Map — สิ่งที่ทดสอบแล้ว

```
lib/auth.ts
  ✅ generateToken()
  ✅ verifyToken()
  ✅ getUserFromToken()

lib/models.ts
  ✅ UserModel.create()        — password hashing
  ✅ UserModel.updatePassword() — password re-hashing
  ✅ OTPModel.create()         — generation + expiry + initial state
  ✅ OTPModel.verify()         — marking used, expiry check, double-use prevention

Validation Logic
  ✅ Email format validation
  ✅ Password minimum length
  ✅ Password complexity check
  ✅ NoSQL injection sanitization
  ✅ XSS HTML escaping

Security Headers/Features
  ✅ JWT signature verification
  ✅ JWT expiry enforcement
  ✅ Rate limiting logic
  ✅ Cookie flags (httpOnly, secure, sameSite, maxAge)
```

---

## 4. ปัญหาและข้อบกพร่องที่ตรวจพบ (แม้ tests จะ PASS)

> ⚠️ Tests ผ่านทั้งหมด แต่การวิเคราะห์โค้ดพบจุดเสี่ยงที่ควรปรับปรุง

### 🔴 Critical — ต้องแก้ไขโดยด่วน

#### C1: JWT Secret มี Fallback ค่าเริ่มต้นที่ไม่ปลอดภัย
**ไฟล์:** `lib/auth.ts` บรรทัด 3  
```typescript
// ⚠️ อันตราย: หาก JWT_SECRET ไม่ได้ตั้งค่า จะใช้ค่านี้
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
```
**ความเสี่ยง:** หาก environment variable ไม่ได้ set ใน production ผู้ไม่ประสงค์ดีสามารถ forge JWT token ได้  
**แนวทางแก้ไข:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}
```

#### C2: Rate Limiting เป็นแค่ In-Memory — ไม่รองรับ Multi-Instance
**ไฟล์:** `tests/auth.unit.test.ts` หมวด Rate Limiting  
**ความเสี่ยง:** การ implement rate limiting ด้วย `Map` ใน memory จะ reset ทุกครั้งที่ server restart และไม่แชร์ข้อมูลระหว่าง server instances หลายตัว  
**แนวทางแก้ไข:** ใช้ Redis หรือ database-backed rate limiting เช่น `rate-limiter-flexible` + Redis

---

### 🟠 High — ควรแก้ไขก่อน Production

#### H1: Password Complexity ต่ำเกินไป
**ปัญหา:** test ยอมรับ password ที่มีแค่ 6 ตัว เช่น `123456`, `abcdef`  
**แนวทางแก้ไข:** บังคับให้มีครบ 4 ประเภท:
- ตัวอักษรพิมพ์ใหญ่ (A-Z)
- ตัวอักษรพิมพ์เล็ก (a-z)  
- ตัวเลข (0-9)
- อักขระพิเศษ (!@#$%^&*)
- ความยาวขั้นต่ำ 8 ตัวอักษร

#### H2: OTP ไม่มี Brute Force Protection
**ปัญหา:** ไม่มีการจำกัดจำนวนครั้งที่ verify OTP ผิด  
**ความเสี่ยง:** ผู้โจมตีสามารถ brute force OTP 6 หลัก (999,999 combinations) ได้  
**แนวทางแก้ไข:** จำกัดการ verify ไม่เกิน 5 ครั้ง/OTP แล้ว invalidate OTP นั้นทันที

#### H3: Cookie SameSite ไม่สอดคล้องกัน
**ปัญหา:** ใน test บางแห่งใช้ `sameSite: 'lax'` และบางแห่งใช้ `sameSite: 'strict'`  
```typescript
// test 42 (httpOnly test) ใช้:
sameSite: 'lax'

// test 44 (sameSite test) ใช้:
sameSite: 'strict'
```
**แนวทางแก้ไข:** กำหนดค่า SameSite เป็น `'strict'` อย่างสม่ำเสมอในทุก cookie

---

### 🟡 Medium — ควรปรับปรุง

#### M1: `getUserFromToken` ใช้ `string.replace` แทน Regex
**ไฟล์:** `lib/auth.ts` บรรทัด 23  
```typescript
// ปัญหา: ถ้า token มีคำว่า "Bearer " ฝังอยู่หลายที่อาจมีพฤติกรรมไม่คาดคิด
const cleanToken = token.replace('Bearer ', '')
```
**แนวทางแก้ไข:**
```typescript
const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token
```

#### M2: Timing Attack Test อาจ Flaky บน Server Load สูง
**ปัญหา:** test กำหนด tolerance ที่ 100ms ซึ่งอาจ fail บน CI/CD ที่มี load สูง  
**แนวทางแก้ไข:** เพิ่ม tolerance หรือรัน test นี้หลายรอบแล้วเอาค่าเฉลี่ย

#### M3: ไม่มี Test สำหรับ Token Refresh
**ปัญหา:** ระบบไม่มีกลไก refresh token ซึ่งจะบังคับให้ user login ใหม่ทุก 7 วัน  
**แนวทางแก้ไข:** พิจารณาเพิ่ม refresh token mechanism

#### M4: ไม่มี Test สำหรับ Token Revocation
**ปัญหา:** เมื่อ user logout ไม่มีกลไกทำให้ JWT token หมดอายุก่อนกำหนด  
**ความเสี่ยง:** ถ้า token รั่วไหลหลัง logout ยังคงใช้งานได้จนกว่าจะหมดอายุ 7 วัน  
**แนวทางแก้ไข:** เก็บ token blacklist ใน Redis หรือใช้ short-lived access token (15 นาที) + refresh token

---

### 🔵 Low — ควรพิจารณาเพิ่มเติม

#### L1: ไม่มี Test สำหรับ CSRF Protection
**แนวทางแก้ไข:** เพิ่ม test ตรวจสอบ CSRF token สำหรับ mutation endpoints

#### L2: ไม่มี Test สำหรับ Account Lockout Notification
**แนวทางแก้ไข:** ควรส่ง email แจ้งเตือนผู้ใช้เมื่อ account ถูก lock

#### L3: Email Regex ยังไม่ครบถ้วน 100%
**ปัญหา:** `regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/` ยอมรับ `test@.com` หรือ `test@com.` ได้  
**แนวทางแก้ไข:** ใช้ library เช่น `validator.js` สำหรับ email validation

---

## 5. สิ่งที่ยังไม่ได้ทดสอบ (Test Gaps)

| หัวข้อ | ความสำคัญ | คำอธิบาย |
|---|---|---|
| Refresh Token | 🔴 High | ระบบ renew token โดยไม่ต้อง login ใหม่ |
| Token Blacklist / Revocation | 🔴 High | ยกเลิก token เมื่อ logout |
| OTP Brute Force Lockout | 🔴 High | ล็อค OTP หลังพยายามผิดหลายครั้ง |
| Account Lockout Recovery | 🟠 Medium | unlock account หลังถูก rate limit |
| SQL/NoSQL Injection ใน API layer | 🟠 Medium | ทดสอบ API endpoints โดยตรง |
| CSRF Protection | 🟠 Medium | ตรวจสอบ CSRF token |
| Concurrent Login Sessions | 🟡 Low | จัดการกรณี login จากหลายอุปกรณ์ |
| Password History | 🟡 Low | ป้องกันการใช้ password เดิมซ้ำ |
| 2FA / TOTP | 🟡 Low | Two-Factor Authentication |

---

## 6. Priority Action Items — สิ่งที่ควรทำต่อ (เรียงตามความสำคัญ)

```
Priority 1 — ทำทันทีก่อน Production
──────────────────────────────────────
[ ] แก้ไข JWT_SECRET fallback → throw error ถ้าไม่มี env variable
[ ] เพิ่ม brute force protection สำหรับ OTP verification
[ ] ย้าย rate limiting ไปใช้ Redis เพื่อรองรับ multi-instance

Priority 2 — ทำใน Sprint ถัดไป
──────────────────────────────────
[ ] เพิ่ม password complexity requirement (uppercase + number + special char + 8 ตัวขึ้นไป)
[ ] ออกแบบ token revocation mechanism (blacklist หรือ refresh token)
[ ] ทำ SameSite cookie ให้สม่ำเสมอเป็น 'strict'
[ ] แก้ไข getUserFromToken ให้ใช้ startsWith แทน replace

Priority 3 — ปรับปรุงคุณภาพ Test
────────────────────────────────────
[ ] เพิ่ม edge case tests สำหรับ OTP: brute force, invalid format
[ ] เพิ่ม test สำหรับ CSRF protection
[ ] เพิ่ม test สำหรับ concurrent login sessions
[ ] ปรับ timing attack test ให้ไม่ flaky
[ ] แทนที่ email regex ด้วย validator library
```

---

## 7. สรุปความเสี่ยงด้านความปลอดภัย

```
ระดับความเสี่ยงโดยรวม: 🟠 MEDIUM-HIGH

สิ่งที่ดีอยู่แล้ว (Strengths):
  ✅ ใช้ bcrypt สำหรับ hash password (salt rounds 10)
  ✅ JWT verification ครบถ้วน
  ✅ OTP expiry และ single-use enforcement
  ✅ XSS prevention (HTML escaping)
  ✅ NoSQL injection prevention
  ✅ Cookie security flags (httpOnly, secure, sameSite)
  ✅ Timing attack prevention ด้วย bcrypt.compare

จุดเสี่ยงที่ต้องปรับปรุง (Weaknesses):
  ❌ JWT secret fallback ที่ทำนายได้
  ❌ In-memory rate limiting ไม่ scalable
  ❌ ไม่มี token revocation
  ❌ OTP ไม่มีการป้องกัน brute force
  ❌ Password complexity ต่ำ
```

---

*รายงานนี้จัดทำโดย GitHub Copilot QA Analysis — RichSave Project*  
*อ้างอิงจาก: `tests/auth.unit.test.ts`, `lib/auth.ts`, `lib/models.ts`*
