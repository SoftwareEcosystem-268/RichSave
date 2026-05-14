# Testing

โปรเจกต์ **RichSave** ใช้การทดสอบ 2 ระดับ คือ **Unit/Integration tests** ด้วย Jest และ **End-to-End (E2E) tests** ด้วย Playwright

---

## Running Tests

```bash
# Unit tests (Jest)
npm run test                 # รัน Jest ทั้งหมด
npm run test:unit            # รันเฉพาะไฟล์ *.unit.test.ts
npm run test:watch           # รันแบบ watch mode
npm run test:coverage        # รันพร้อมรายงาน coverage

# E2E tests (Playwright) — ต้องเปิด dev server หรือให้ Playwright start ให้อัตโนมัติ
npm run test:e2e             # รัน E2E ทั้งหมด
npm run test:e2e:auth        # รันเฉพาะกลุ่ม auth (login, register, forgot)
npm run report:show          # เปิดดู HTML report ของ Playwright
npm run report:pdf           # export report เป็น PDF
```

> หมายเหตุ: Playwright config (`playwright.config.ts`) ตั้ง `webServer` ให้รัน `npm run dev` อัตโนมัติที่ `http://localhost:3000` ถ้ายังไม่มี server เปิดอยู่

---

## Test Structure

```
tests/
├── auth/                       # E2E ของ Authentication
│   ├── login.spec.js
│   ├── register.spec.js
│   └── forgot.spec.js
├── deal/                       # E2E ของหน้า Deal (search, filter, detail)
├── favorites/                  # E2E ของ Favorites & Notification
├── location/                   # E2E ของแผนที่และ location permission
├── savings/                    # E2E ของ Savings & history
├── auth.unit.test.ts           # Unit test (Jest)
├── auth.e2e.spec.ts            # E2E เพิ่มเติม
├── login.integration.test.ts   # Integration test
└── setup.ts                    # Setup สำหรับ Jest
```

หลักการตั้งชื่อไฟล์:
- `*.unit.test.ts` → Jest unit tests
- `*.integration.test.ts` → Jest integration tests
- `*.spec.{js,ts}` หรือ `*.e2e.spec.{js,ts}` → Playwright E2E tests

---

## Writing a New Test

### E2E Test (Playwright)

1. สร้างไฟล์ใหม่ใน `tests/<feature>/<name>.spec.js` (เช่น `tests/deal/promo.spec.js`)
2. เขียน test โดย import จาก `@playwright/test` และจัดกลุ่มด้วย `test.describe(...)`
3. ใช้รหัสอ้างอิง test case ที่สื่อความ เช่น `DEAL-PROMO-001` เพื่อให้ track ได้ง่ายในรายงาน
4. รัน `npm run test:e2e` เพื่อตรวจว่า test ใหม่ผ่าน

ตัวอย่างโครงสร้าง:

```js
import { test, expect } from '@playwright/test';

test.describe('Feature - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-route');
  });

  test('FEATURE-001: describe what this verifies', async ({ page }) => {
    // Arrange / Act
    await page.fill('input[type="email"]', 'user@richsave.com');
    await page.click('button:has-text("Submit")');

    // Assert
    await expect(page.locator('text=/success/i')).toBeVisible();
  });
});
```

### Unit Test (Jest)

1. สร้างไฟล์ `*.unit.test.ts` ใน `tests/`
2. รัน `npm run test:unit` หรือ `npm run test:watch`

---

## What to Test

ทุก feature ที่เพิ่มเข้ามาควรมี test ครอบคลุมหัวข้อต่อไปนี้:

- [ ] **API endpoints return correct status codes** — 200/201 บน success, 4xx บน input ผิด, 5xx ไม่ leak
- [ ] **Authentication / Authorization works** — JWT, session, role check ถูกต้อง
- [ ] **Input validation catches bad data** — email format, password length, required fields
- [ ] **Error handling returns proper messages** — ข้อความ user-friendly, ไม่เปิดเผยข้อมูล internal
- [ ] **Happy path (Functional)** — flow หลักของ feature ทำงานครบ
- [ ] **Negative cases** — ข้อมูลผิด, field ว่าง, รูปแบบไม่ถูกต้อง
- [ ] **Edge cases** — กดซ้ำหลายครั้ง, network error, session timeout, paste/auto-focus
- [ ] **Security** — brute force protection, email enumeration, OTP one-time use, password strength
- [ ] **UI/UX** — loading state, mobile responsive (≥44px tap target), clear instructions, back/cancel links

ดูตัวอย่างที่ครอบคลุมครบทุกหมวดได้ที่ [tests/auth/forgot.spec.js](tests/auth/forgot.spec.js)

---

## CI

ใน CI ใช้ `npm run test:ci` (Jest + coverage + maxWorkers=2) สำหรับ unit tests และ `npm run test:e2e` สำหรับ E2E (Playwright จะ retry 2 ครั้งอัตโนมัติเมื่อ `CI=true`)
