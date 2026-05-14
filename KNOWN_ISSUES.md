# Known Issues

รายการ bug / limitation ที่ทีมทราบแล้วในโปรเจกต์ **RichSave** พร้อม workaround ชั่วคราว
อัปเดตล่าสุด: 2026-05-07

| #  | Issue | Severity | Status | Workaround |
|----|-------|----------|--------|------------|
| 1  | **Show/Hide password toggle ยังไม่ได้ implement** บนหน้า Login — test [AUTH-LOG-003](tests/auth/login.spec.js#L68) ถูก skip / fail | 🟡 Medium | Open | ผู้ใช้ต้องพิมพ์ password ให้ระวังเอง รอ implement icon eye ใน login form |
| 2  | **Login บางครั้งไม่ redirect ไป `/deals`** หลัง submit สำเร็จ — ค้างอยู่ที่ `/login` (เห็นใน [test-results-bugs-only.txt](test-results-bugs-only.txt) AUTH-LOG-004) | 🔴 High | Open | refresh หน้าหรือกด link ไป `/deals` เอง กำลังตรวจ race condition ระหว่าง set cookie กับ `router.push` |
| 3  | **Error message บน Login เปิดเผยว่า field ไหนผิด** — AUTH-LOG-102 fail เพราะ message มีคำว่า "email" (`Invalid email or password` แสดงพร้อม label "Email Address") | 🟡 Medium | Open | ปรับ assertion ใน test ให้เจาะจง selector หรือเปลี่ยนข้อความให้ generic ขึ้น เช่น "Invalid credentials" |
| 4  | **Rate limiting / account lock หลัง login ผิด 5 ครั้งยังไม่ทำงานครบ** — AUTH-LOG-301, AUTH-LOG-302 fail | 🔴 High | Open | ระวังการ brute force ผ่าน API ตรง ๆ — แนะนำเพิ่ม rate limit middleware ที่ [app/api/auth](app/api/auth/) ก่อน production |
| 5  | **Admin check ไม่มีบน `POST /api/deals`** — มี `// TODO: Add admin check` ที่ [app/api/deals/route.ts:219](app/api/deals/route.ts#L219) ทำให้ user ใดก็ได้ที่ login สามารถสร้าง deal ได้ | 🔴 High | Open | จำกัด endpoint นี้ที่ระดับ infrastructure (nginx/ACL) จนกว่าจะเพิ่ม `isAdmin` check |
| 6  | **Notification feature ยังไม่ implement** — [tests/favorites/notification.spec.js](tests/favorites/notification.spec.js) ถูก `test.skip` 11 จุด | 🟢 Low | In Progress | Favorites ใช้งานได้ปกติ เพียงไม่มีการแจ้งเตือนเมื่อ deal ที่ favorite เปลี่ยนแปลง |
| 7  | **Location search ยังไม่ implement** — [tests/location/search_location.spec.js](tests/location/search_location.spec.js) ถูก `test.skip` 22 จุด | 🟢 Low | In Progress | ใช้แผนที่ ([map.spec.js](tests/location/map.spec.js)) และ permission flow ที่มีอยู่ก่อน รอเพิ่ม search box |
| 8  | **OTP flow ทดสอบ end-to-end ไม่ได้** — ต้องการ API mock จึงไม่ได้รัน — [auth.e2e.spec.ts:315](tests/auth.e2e.spec.ts#L315), [forgot.spec.js:86](tests/auth/forgot.spec.js#L86) | 🟢 Low | Open | ทดสอบเฉพาะ UI step ก่อน หรือใส่ค่า OTP `1` ใน dev environment ที่ตั้ง bypass ไว้ |
| 9  | **E2E ทดสอบเฉพาะ Chromium** — Firefox / WebKit / Mobile project ถูก comment ไว้ใน [playwright.config.ts:24-42](playwright.config.ts#L24-L42) | 🟢 Low | Open | uncomment project ใน config เมื่อต้องการรัน cross-browser regression ก่อน release |
| 10 | **Login email case-sensitive** — AUTH-LOG-201 fail (email ตัวพิมพ์ใหญ่/เล็กต่างกัน login ไม่ผ่าน) | 🟡 Medium | Open | ผู้ใช้ต้องพิมพ์ email ให้ตรง case ที่สมัคร — ควร normalize ที่ backend ([app/api/auth](app/api/auth/)) ด้วย `.toLowerCase()` |
| 11 | **SQL/XSS injection ใน email field ไม่ถูก sanitize ฝั่ง UI** — AUTH-SEC-001, AUTH-SEC-002 fail | 🟡 Medium | Open | Backend validate อยู่แล้ว แต่ควรเพิ่ม client-side input filter ใน login form |

> ℹ️ ดูสถานะการรัน test ล่าสุดที่ [test-results-bugs-only.txt](test-results-bugs-only.txt) และเปิด HTML report ด้วย `npm run report:show`

---

## Bug Report Template

เมื่อเจอ bug ใหม่ ให้เปิด GitHub issue ใน [SoftwareEcosystem-268/alpha](https://github.com/SoftwareEcosystem-268/alpha/issues) ตาม format นี้:

- **Title**: สรุปปัญหาสั้น ๆ (เช่น `[Login] Submit ปุ่มกดไม่ติดเมื่อ password มี emoji`)
- **Steps to Reproduce**:
  1. ไปที่หน้า ...
  2. กรอก ...
  3. กด ...
- **Expected**: ผลลัพธ์ที่ควรเป็น
- **Actual**: ผลลัพธ์ที่เกิดจริง (พร้อมข้อความ error / screenshot ถ้ามี)
- **Environment**:
  - Browser & version: (เช่น Chrome 131, Safari iOS 17)
  - OS: (เช่น Windows 11, macOS 14)
  - Branch / commit: (เช่น `dev` @ `e5e9ee3`)
  - URL: (เช่น `http://localhost:3000/login`)
- **Severity**: 🔴 High / 🟡 Medium / 🟢 Low
- **Attachments**: screenshot, console log, network HAR ถ้ามี

### Severity Guideline

| Level | ความหมาย | SLA |
|-------|----------|-----|
| 🔴 **High** (P1) | Block flow หลัก, security risk, data loss | แก้ภายใน 1-2 วัน |
| 🟡 **Medium** (P2) | ใช้งานได้แต่มี side effect / มี workaround | แก้ภายใน 1 สัปดาห์ |
| 🟢 **Low** (P3) | Cosmetic, feature ยังไม่ครบ, edge case หายาก | จัดเข้า backlog |
