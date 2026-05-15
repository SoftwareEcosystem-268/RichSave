# Quality / Release Checklist

ใช้ checklist นี้ก่อน **commit** เข้า `dev` และก่อน **merge เข้า `main`** (trigger deploy ไป EC2 อัตโนมัติ)

---

## Pre-Commit Checklist

ทำทุกครั้งก่อน `git commit`

### Code Quality
- [ ] Code ตาม convention ของทีม (TypeScript ใช้ type จริง ไม่ใช้ `any` โดยไม่จำเป็น)
- [ ] ไม่มี `console.log` หลงเหลือในโค้ด production — ตรวจด้วย:
  ```bash
  grep -r "console\.log" app/ lib/ --include="*.ts" --include="*.tsx"
  ```
  > ⚠️ ปัจจุบันยังมี `console.log` ใน 15 ไฟล์ (ดูใน [app/api/auth/login/route.ts](app/api/auth/login/route.ts) ฯลฯ) — ควรลบหรือเปลี่ยนเป็น proper logger ก่อน merge `main`
- [ ] ไม่มี hardcoded secret, API key, หรือ credential ในโค้ด — ตรวจ:
  ```bash
  grep -r "mongodb+srv\|JWT_SECRET\|sk-\|Bearer " app/ lib/ --include="*.ts"
  ```
- [ ] ไม่มี `TODO` / `FIXME` ที่เป็น security risk ค้างอยู่ (เช่น admin check ที่ [app/api/deals/route.ts:219](app/api/deals/route.ts#L219))
- [ ] ESLint ไม่มี error: `npm run lint`

### Tests
- [ ] Unit tests ผ่านทั้งหมด: `npm run test`
- [ ] Coverage ไม่ต่ำกว่า **70%** (branches/functions/lines/statements): `npm run test:coverage`
- [ ] E2E auth tests ผ่าน: `npm run test:e2e:auth`

---

## Pre-Release Checklist

ทำก่อน merge PR เข้า `main` ทุกครั้ง

### Tests & Quality
- [ ] E2E tests ทั้งหมดผ่าน (ไม่มี unexpected fail นอกจาก known skip): `npm run test:e2e`
- [ ] ไม่มี known issue ที่ severity **High** ค้างอยู่ (ดูที่ [KNOWN_ISSUES.md](KNOWN_ISSUES.md))
- [ ] `npm run build` สำเร็จ ไม่มี TypeScript error

### Security
- [ ] **Admin check** บน `POST /api/deals` ถูก implement แล้ว ([app/api/deals/route.ts:219](app/api/deals/route.ts#L219))
- [ ] **Rate limiting** บน login endpoint ทำงานถูกต้อง (AUTH-LOG-301 ผ่าน)
- [ ] **JWT_SECRET** ใน production ไม่ใช่ค่า default จาก `.env.example`
- [ ] ไม่มีข้อมูล PII (email, password hash, token) ใน log ที่จะถูก print ออกมา
- [ ] Dependencies ไม่มี known vulnerability: `npm audit --audit-level=high`

### Environment Variables
ตรวจว่า EC2 / production มีค่าครบทุกตัวใน `.env.example`:
- [ ] `MONGODB_URI` — ชี้ไป production cluster (ไม่ใช่ test/dev)
- [ ] `JWT_SECRET` — random string ที่ปลอดภัย (≥32 chars)
- [ ] `NEXT_PUBLIC_APP_URL` — domain จริง ไม่ใช่ `localhost`
- [ ] `NEXTAUTH_SECRET` / `NEXTAUTH_URL` — ตั้งค่าใน GitHub Secrets แล้ว
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` หรือ `NEXT_PUBLIC_GOOGLE_MAPS_KEY` — ถ้าใช้ location feature

### Documentation
- [ ] [README.md](README.md) อัปเดตถ้ามีการเปลี่ยน setup / dependency ใหม่
- [ ] [KNOWN_ISSUES.md](KNOWN_ISSUES.md) อัปเดต issue ที่แก้แล้วเป็น `Fixed` และเพิ่ม issue ใหม่ที่พบ
- [ ] [TESTING.md](TESTING.md) อัปเดตถ้ามี test command หรือ folder structure เปลี่ยน

### Performance
- [ ] หน้าหลัก (`/deals`) load ได้ภายใน 3 วินาที บน network ปกติ
- [ ] ไม่มี N+1 query ใหม่ใน MongoDB (ตรวจ API route ที่แก้)

---

## Post-Deploy Checklist

ทำหลัง CI/CD deploy ไป EC2 สำเร็จ

- [ ] เปิด production URL แล้วใช้งานได้จริง (login → deals → favorites)
- [ ] ตรวจ PM2 log ไม่มี error: `pm2 logs alpha --lines 50`
- [ ] ตรวจ Nginx ทำงานถูกต้อง: `sudo nginx -t`
- [ ] API endpoint หลักตอบสนอง:
  - [ ] `GET /api/deals` → 200
  - [ ] `POST /api/auth/login` → 200 พร้อม cookie
  - [ ] `GET /api/user/profile` (with auth) → 200
- [ ] ไม่มี broken link บนหน้า `/deals` และ `/favorites`
- [ ] Mobile layout แสดงผลถูกต้องบน viewport 375px

---

## Security Checklist (ทุก Sprint)

รัน security checklist อย่างน้อย 1 ครั้งต่อ sprint

- [ ] Authentication ต้องการ JWT ทุก endpoint ที่ sensitive (ใช้ `cookies().get('token')`)
- [ ] Input sanitization — ไม่มี raw user input ถูก pass เข้า MongoDB query โดยตรง
- [ ] ไม่มี PII ใน log (email, password, OTP, token ไม่ควรอยู่ใน `console.log`)
- [ ] Dependencies อัปเดต: `npm outdated` และ `npm audit`
- [ ] HTTPS ถูกเปิดใช้งานบน production (Nginx + SSL cert ยังไม่หมดอายุ)
- [ ] OTP expiry ทำงานถูกต้อง — OTP หมดอายุหลังเวลาที่กำหนด ใช้ซ้ำไม่ได้
- [ ] Cross-browser ทดสอบ Firefox / Safari ก่อน release ใหญ่ (uncomment ใน [playwright.config.ts](playwright.config.ts))

---

> **ย้ำ:** CI pipeline (`ci.yml`) รัน build + deploy เฉพาะตอน push ไป `main` เท่านั้น  
> ต้องมั่นใจว่า checklist นี้ผ่านก่อน merge ทุกครั้ง — production พัง = ทุกคนเห็น
