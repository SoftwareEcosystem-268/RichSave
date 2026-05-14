# RichSave — แพลตฟอร์มค้นหาดีลและติดตามการประหยัด

แอปพลิเคชันเว็บสำหรับค้นหาโปรโมชัน ติดตามการประหยัด และบริหารงบประมาณ สร้างด้วย Next.js, MongoDB และ Tailwind CSS

![RichSave](https://img.shields.io/badge/Next.js-14.2-black) ![MongoDB](https://img.shields.io/badge/MongoDB-6.3-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

> **"ใช้เท่าเดิม แต่คุ้มกว่าเดิม"**
> 
> **Production:** http://labs89.hpc-ignite.org/alpha

---

## ฟีเจอร์หลัก

- 🔐 **JWT Authentication** — ระบบ login, signup และ reset password
- 🔍 **Deal Search** — ค้นหาโปรโมชันตามหมวดหมู่, ร้านค้า หรือคำค้นหา
- 📍 **Location-Based Deals** — แสดงดีลใกล้ตัวพร้อมแผนที่
- ❤️ **Save Favorites** — บันทึกดีลที่สนใจไว้ดูภายหลัง
- 📊 **Savings Tracker** — ติดตามยอดเงินที่ประหยัดได้พร้อมกราฟ
- 👤 **Profile Management** — แก้ไขโปรไฟล์และการตั้งค่า
- 📱 **Responsive Design** — รองรับทุกขนาดหน้าจอ

---

## Vision & Goals

### ปัญหาที่แก้ไข
คนไทยส่วนใหญ่ขาดนิสัยบริหารการเงินส่วนตัว เพราะแอปติดตามค่าใช้จ่ายทั่วไปต้องบันทึกข้อมูลเองทุกอย่าง และไม่ได้ช่วยให้ตัดสินใจใช้เงินได้ดีขึ้นในชีวิตจริง

### วิธีแก้ปัญหา
RichSave เชื่อมการติดตามค่าใช้จ่ายเข้ากับการแนะนำดีลอาหารใกล้ตัวแบบ real-time ทำให้ผู้ใช้เริ่มประหยัดเงินได้ตั้งแต่มื้อแรก โดยไม่ต้องวางแผนการเงินล่วงหน้า

### กลุ่มเป้าหมาย
- หลัก: Gen Z อายุ 16–27 ปี
- รอง: Late Gen Alpha อายุ 12–15 ปี และผู้ปกครอง

### Success Metrics
| Metric | Target | Current |
|---|---|---|
| Monthly Active Users | 1,000 users ใน 3 เดือน | — |
| Day-30 Retention Rate | ≥ 40% | — |
| Deals used per user / month | ≥ 5 ครั้ง | — |
| Average savings per user / month | ≥ 300 บาท | — |

---

## Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Maps**: Leaflet (OpenStreetMap)
- **Testing**: Jest, Playwright
- **CI/CD**: GitHub Actions, CodeQL security scan

---

## Sprint History

### Sprint 1 — Foundation
**ช่วงเวลา:** 10–23 มีนาคม 2569

| แผน | ผลจริง | สถานะ |
|---|---|---|
| วาง use case และ user flow ทั้งหมด | PM นำ use case มา UX/UI แตก user flow และ wireframe ได้ครบ | ✅ |
| ตั้งค่า repo + CI/CD + CodeQL | DevOps ตั้งค่าครบ เป็นทีมเดียวใน class ที่เปิด CodeQL security scan | ✅ |
| ระบบ Authentication พื้นฐาน | Dev สร้างระบบ login/signup/reset password เสร็จ | ✅ |
| เขียน Test Cases ชุดแรก | QA เขียน test cases พร้อมใช้งาน | ✅ |

**Retrospective:**
- ✅ สิ่งที่ทำได้ดี: การประชุม Sprint Planning ทำให้ทีมเห็นภาพรวมชัด UX/UI และ Dev เริ่มงานได้ทันทีโดยไม่ต้องรอกัน
- ⚠️ สิ่งที่ต้องปรับปรุง: SM ยังไม่คุ้นกับบทบาทตัวเอง ไม่ได้บันทึกผลการประชุมไว้เป็นเอกสาร
- 📌 Action items: ใช้ MS Teams ติดตาม standup async ทุกวัน

---

### Sprint 2 — Core Features
**ช่วงเวลา:** 24 มีนาคม – 13 เมษายน 2569

| แผน | ผลจริง | สถานะ |
|---|---|---|
| Deal Search | Dev พัฒนาและ QA ทดสอบเสร็จ | ✅ |
| Location-based Deals | Dev พัฒนาและ QA ทดสอบเสร็จ | ✅ |
| Save Favorites | Dev พัฒนาและ QA ทดสอบเสร็จ | ✅ |
| Deploy ขึ้น Staging | DevOps deploy สำเร็จ | ✅ |

**Retrospective:**
- ✅ สิ่งที่ทำได้ดี: ส่งมอบครบ 3 features ตาม goal โดยไม่มีงานค้างข้าม Sprint PM และ SM ติดตามงานร่วมกันทุกสัปดาห์ทำให้เห็น blocker ได้ทันที
- ⚠️ สิ่งที่ต้องปรับปรุง: Commit กระจุกที่ Dev คนเดียว งานของ QA และ UX/UI ไม่ปรากฏใน commit log ไม่มีการบันทึก Sprint Review เป็นเอกสาร
- 📌 Action items: Sprint 3 ทุกคนที่มีงาน docs หรือ config ควร push เข้า repo โดยตรง

---

### Sprint 3 — Polish & Release
**ช่วงเวลา:** 14 เมษายน – 11 พฤษภาคม 2569

| แผน | ผลจริง | สถานะ |
|---|---|---|
| Savings Tracker | Dev พัฒนาเสร็จ QA ทดสอบแล้ว | ✅ |
| Production Deploy | DevOps deploy สำเร็จที่ labs89.hpc-ignite.org/alpha | ✅ |
| Subscription System | ทำไม่ทันภายใน Sprint — เลื่อนเป็น future feature | ❌ |
| AI Chatbot | ตัดสินใจไม่ทำ เพราะซับซ้อนเกินขอบเขต MVP | ❌ |

**Retrospective:**
- ✅ สิ่งที่ทำได้ดี: Production deploy สำเร็จ CI/CD ผ่านสะอาดทุก run ตลอดทั้งโครงการ ทีมรับมือกับ UX/UI ที่ส่งงานล่าช้าได้โดยปรับ internal deadline แทนการรอข้าม Sprint
- ⚠️ สิ่งที่ต้องปรับปรุง: Documentation ควรทำควบคู่กับการพัฒนาตลอด ไม่ใช่ทำทั้งหมดใน Sprint สุดท้าย
- 📌 Action items: Push final docs ลง /docs/ ก่อน 15 พค.

---

## Known Gaps

- **Subscription System** — ทำไม่ทันใน Sprint 3 เก็บไว้เป็น future feature
- **AI Chatbot** — ตัดออกจาก MVP เพราะซับซ้อนเกินขอบเขต
- **Sprint Review docs** — ไม่ได้บันทึกระหว่างโครงการ เพิ่มย้อนหลังใน Sprint 3
- **Commit distribution** — งานของ QA, UX/UI และ SM ส่วนใหญ่ไม่ปรากฏใน commit log เพราะทำงานนอก GitHub

---

## ทีม

| ชื่อ | บทบาท | GitHub | ความรับผิดชอบ |
|---|---|---|---|
| Podsatorn Sudkong | Product Manager | @podsatornSudsud | วางแผนผลิตภัณฑ์, ดูแล backlog, นำ Sprint Review |
| Thanat Vijitrakanlikit | Scrum Master | @Thanatvij | จัด Sprint Planning, ดูแล standup, นำ Retrospective, ติดตามงานทีม |
| Nattanon Keeratiwattapong | Developer | @MuuDeng | พัฒนา frontend และ backend, เชื่อมต่อ API และฐานข้อมูล |
| Attakorn Phothong | QA Engineer | @NewmoodLev | เขียนและรัน test cases, ตรวจสอบคุณภาพทุก feature |
| Suchanya Pengprai | DevOps Engineer | @suchanya-pen | ตั้งค่า CI/CD, CodeQL, deploy บน EC2 + Nginx |
| Chayanisa Kongneing | UX/UI Designer | @chayanisa19 | ออกแบบ user flow, wireframe และ UI ทั้งหมดใน Figma |

---

## การสื่อสารในทีม

- **ประชุม**: onsite ทุกสัปดาห์ ห้อง 7315 — online เมื่อมีสมาชิกไม่สะดวก
- **Standup**: async ทุกวันผ่าน MS Teams
- **Code Review**: Dev เปิด PR → DevOps และ QA review ก่อน merge เข้า main

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/SoftwareEcosystem-268/alpha.git
cd alpha
```

### 2. Install Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
cp .env.example .env.local
```

แก้ไข `.env.local`:

```env
# MongoDB (จำเป็น)
MONGODB_URI=mongodb://localhost:27017/richsave

# JWT Secret (จำเป็น)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

---

## โครงสร้างโปรเจกต์

```
alpha/
├── app/
│   ├── api/
│   │   ├── auth/        # Authentication endpoints
│   │   ├── deals/       # Deal CRUD
│   │   └── user/        # User profile & settings
│   ├── deals/
│   ├── favorites/
│   ├── nearby/
│   ├── savings/
│   └── ...
├── components/
├── lib/
├── tests/
├── docs/
│   ├── cicd.md
│   ├── deployment.md
│   ├── environment.md
│   ├── final-retrospective.md
│   └── sprint-review.md
└── package.json
```

---

## API Endpoints

### Authentication
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | `/api/auth/signup` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| POST | `/api/auth/logout` | ออกจากระบบ |
| POST | `/api/auth/forgot-password` | ขอ reset password |
| POST | `/api/auth/verify-otp` | ยืนยัน OTP |
| POST | `/api/auth/reset-password` | ตั้ง password ใหม่ |

### Deals
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/deals` | ดึงดีลทั้งหมด (รองรับ search และ filter) |
| GET | `/api/deals/[id]` | ดึงรายละเอียดดีล |
| POST | `/api/deals/[id]/redeem` | ใช้ดีล |

### User
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/user/profile` | ดึงข้อมูลโปรไฟล์ |
| PUT | `/api/user/profile` | อัปเดตโปรไฟล์ |
| GET | `/api/user/favorites` | ดึงดีลที่บันทึกไว้ |
| POST | `/api/user/favorites` | เพิ่มดีลในรายการโปรด |
| DELETE | `/api/user/favorites` | ลบดีลจากรายการโปรด |
| GET | `/api/user/savings` | ดึงข้อมูลการประหยัด |

---

## Available Scripts

| Command | คำอธิบาย |
|---|---|
| `npm run dev` | รัน development server |
| `npm run build` | Build สำหรับ production |
| `npm start` | รัน production server |
| `npm run lint` | ตรวจสอบ code style |
| `npm run seed` | เพิ่มข้อมูลตัวอย่างใน database |

---

## เอกสารเพิ่มเติม

- [CI/CD Guide](docs/cicd.md)
- [Deployment Guide](docs/deployment.md)
- [Environment Variables](docs/environment.md)
- [Final Retrospective](docs/final-retrospective.md)
- [Sprint Review Summary](docs/sprint-review.md)

---

## License

MIT License

---

**Built with ❤️ by Squad Alpha — EightNine Labs | DTI 241**
