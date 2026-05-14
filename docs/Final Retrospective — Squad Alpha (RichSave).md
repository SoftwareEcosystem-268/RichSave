**DTI 241 | EightNine Labs | ภาคการศึกษา 2/2568** ผู้จัดทำ: 

---
## ภาพรวมโครงการ

|รายการ|รายละเอียด|
|---|---|
|**ผลิตภัณฑ์**|RichSave — "ใช้เท่าเดิม แต่คุ้มกว่าเดิม"|
|**ทีม**|Squad Alpha (6 คน)|
|**ระยะเวลา**|มีนาคม – พฤษภาคม 2569 (3 Sprints)|
|**Production URL**|http://labs89.hpc-ignite.org/alpha|
|**Stack**|Next.js 14, TypeScript, MongoDB, JWT, Tailwind CSS|

---

## Sprint 1 — Foundation (10–23 มีนาคม 2569)

### Sprint Goal

วางโครงสร้างระบบและ user flow ให้พร้อมสำหรับการพัฒนา feature

### สิ่งที่ส่งมอบได้

- โครงสร้าง repo และ CI/CD pipeline พร้อมใช้งาน
- User flow และ wireframe หน้าระบบทั้งหมดจาก UX/UI
- ระบบ Authentication พื้นฐาน (Dev)
- CodeQL security scan เปิดใช้งาน (DevOps)
- Test cases ชุดแรกครอบคลุม Authentication (100+ cases) แบ่งเป็น Happy Path, Negative, Edge Cases และ Security Cases (QA)
- ตั้งค่า Jest Coverage Threshold ขั้นต่ำ 70% สำหรับ Branches, Functions, Lines, Statements (QA)

### What Went Well ✅

- **การประชุม Sprint Planning ทำให้ทีมเห็นภาพรวมชัดเจน** — PM นำ use case มาให้ทีมแตก user flow ได้ตรง ทำให้ UX/UI และ Dev เริ่มงานได้ทันทีโดยไม่ต้องรอกัน
- **DevOps ตั้ง repo และ CI/CD ได้เร็ว** — ทีมสามารถ push code และเห็น workflow result ได้ตั้งแต่สัปดาห์แรก
- **การสื่อสาร onsite สัปดาห์ละครั้งช่วยได้มาก** — ปัญหาที่คุยผ่าน async ไม่ได้ แก้ได้เร็วขึ้นเมื่อเจอกันจริง

### What Could Improve ⚠️

- **การกระจาย commit ยังไม่สม่ำเสมอ** — งาน code ส่วนใหญ่อยู่ที่ Dev คนเดียว สมาชิกบางคนยังไม่คุ้นกับ GitHub workflow
- **SM ยังไม่เข้าใจบทบาทของตัวเองใน GitHub** — ในช่วงแรก SM เข้าใจว่าไม่จำเป็นต้องมี commit หรือ PR ซึ่งเป็นความเข้าใจที่ไม่ครบถ้วน ควรบันทึก impediment เป็น Issues และ push docs ลง repo ด้วย

### Action Items

- SM จะเริ่ม push documentation ลง `/docs/` ตั้งแต่ Sprint 2
- ทีมตกลงใช้ MS Teams ติดตาม standup async ทุกวัน

---

## Sprint 2 — Core Features (24 มีนาคม – 13 เมษายน 2569)

### Sprint Goal

ส่งมอบ 3 core features ให้ครบและผ่าน QA ก่อนสิ้น Sprint

### สิ่งที่ส่งมอบได้

- **Deal Search** — ค้นหาโปรโมชันตามหมวดหมู่ ✅
- **Save Favorites** — บันทึกดีลที่สนใจ ✅
- **Location-based Deals** — แสดงดีลใกล้ตัว ✅
- ระบบ deploy ขึ้น staging environment (DevOps)
- Test cases และผล QA ครบทั้ง 3 features ครอบคลุม Unit Testing (Jest), Integration Testing, E2E Testing (Playwright)
- Security Testing: XSS, NoSQL Injection, Email Enumeration ใน Authentication flow
- Coverage ≥ 70% ผ่านทุก metric ตามเกณฑ์ที่ตั้งไว้

### What Went Well ✅

- **ส่งมอบได้ครบ 3 features ตาม Sprint Goal** — เป็น Sprint ที่ productive ที่สุดของทีม
- **กระบวนการ review ระหว่าง Dev และ QA ทำงานได้ดี** — มีการส่ง test cases กลับมาแก้และ iterate ได้ภายใน Sprint โดยไม่ล่าช้าข้าม Sprint
- **PM และ SM ติดตามงานร่วมกัน** — การที่ PM และ SM ถามความคืบหน้าทุกสัปดาห์ช่วยให้ทราบ blocker ได้ก่อนที่จะกระทบ deadline

### What Could Improve ⚠️

- **Commit ยังกระจุกที่สมาชิกคนเดียว** — แม้งานจะเสร็จ แต่ history ใน GitHub ไม่สะท้อนการมีส่วนร่วมของทีมที่แท้จริง เช่น งาน UX/UI และ QA ที่ทำจริงแต่ไม่ปรากฏใน commit log
- **ไม่มีการบันทึก Sprint Review เป็นเอกสาร** — ผลการ demo และ feedback ที่ได้รับในการประชุมไม่ได้ถูกบันทึกไว้ ทำให้ไม่มี artifact ที่อ้างอิงได้ในภายหลัง

### Action Items

- Sprint 3 จะบันทึก Sprint Review summary ทุกครั้งหลังประชุม
- สมาชิกทุกคนที่มีงาน docs หรือ config ควร commit เข้า repo โดยตรง

---

## Sprint 3 — Polish & Release (14 เมษายน – 11 พฤษภาคม 2569)

### Sprint Goal

ส่งมอบ Savings Tracker และเตรียม final submission ให้ครบ

### สิ่งที่ส่งมอบได้

- **Savings Tracker** — ติดตามยอดเงินที่ประหยัดได้ (อยู่ระหว่างดำเนินการ)
- Production deployment สำเร็จที่ `labs89.hpc-ignite.org/alpha`
- ระบบรายงานผลอัตโนมัติ (PDF Report Generator) — แปลงผลการรัน Test เป็น PDF สรุปสถานะระบบก่อน Deploy (QA)
- Final documentation ชุด (อยู่ระหว่างดำเนินการ)

### What Went Well ✅

- **Production deploy สำเร็จ** — ระบบทำงานได้จริงบน production environment ซึ่งเป็นเป้าหมายสำคัญของโครงการ
- **ทีมรับมือกับ delay ได้โดยไม่กระทบ Sprint Goal หลัก** — เมื่อ UX/UI ส่งงานล่าช้าจากวันประชุมเล็กน้อย ทีมปรับ internal deadline ไปสองวันแทนการรอข้าม Sprint ทำให้ Dev เริ่มงานต่อได้ทันที
- **CI/CD workflow ผ่านสะอาดทุก run ตลอดโครงการ** — เป็นจุดแข็งที่ทีมรักษาได้ตั้งแต่ Sprint 1

### What Could Improve ⚠️

- **Documentation ควรทำควบคู่กับการพัฒนา ไม่ใช่ทำตอนท้าย** — Sprint Review docs, Retrospective และ FP Report ควรสะสมทุก Sprint ไม่ใช่เตรียมทั้งหมดใน Sprint สุดท้าย
- **SM ควร push docs ลง repo ตลอด Sprint** — การที่ SM ไม่มี commit ใน GitHub ทำให้ contribution ของ SM ไม่ปรากฏใน project history ซึ่งเป็นบทเรียนสำคัญสำหรับการทำงานใน software ecosystem จริง
- **PR #24 "TestCaseNow" (branch QAtest) ยังไม่ถูก Merge** — QA รวมงานทั้งหมดไว้ใน PR เดียว (150 ไฟล์, +143,279 บรรทัด) ซึ่งใหญ่เกินกว่าทีมจะ Review ได้ จนเกิด Merge Conflicts สะสม งาน QA ที่สำคัญจึงไม่เข้าสาขาหลักก่อนปิดโครงการ

### Action Items

- เพิ่ม Final Retrospective, Feedback Response และ Sprint Review summary ลง `/docs/` ก่อน 15 พค.

---

## บทเรียนรวม 3 Sprint (Team-wide Learnings)

### 1. กระบวนการทำงานไม่เท่ากับ artifact ที่บันทึกไว้

ทีมประชุมทุกสัปดาห์ ติดตามงาน และแก้ปัญหาได้จริง แต่เพราะไม่ได้บันทึกสิ่งที่ทำ จึงทำให้ไม่มีหลักฐานแสดงกระบวนการ บทเรียนคือ **การทำงานที่ดีต้องมาพร้อม documentation ที่ดีด้วย**

### 2. GitHub ไม่ใช่แค่ที่เก็บ code

สมาชิกที่ไม่ได้เขียน code เช่น SM, QA, UX/UI ก็ควรมี contribution ใน repo ผ่าน Issues, docs, และ PR comments การที่ commit กระจุกที่คนเดียว (89%) ไม่ได้แปลว่าคนอื่นไม่ทำงาน แต่แปลว่าทีมยังไม่ได้ใช้ GitHub เต็มศักยภาพในฐานะ collaboration tool

### 3. Atomic Pull Request ดีกว่า Mega PR

การยัดงาน QA ทั้งหมด (Test Code, Bug Fix, UI Change) ไว้ใน PR เดียวทำให้ไม่มีใครสามารถ Review ได้จริง และงานที่ทำมาตลอด 3 Sprint ไม่ถูก Merge เข้าระบบ บทเรียนคือ **ควรแยก PR ย่อยตาม Feature หรือ Concern แต่ละส่วน** เพื่อให้ส่งมอบได้จริงและปลอดภัยกว่า

### 4. การปรับ deadline ภายใน Sprint ดีกว่าการปล่อยงานข้าม Sprint

เมื่อ UX/UI ล่าช้าใน Sprint 3 การตัดสินใจเลื่อน internal deadline ไปสองวันแทนการรอข้าม Sprint ทำให้ทีมส่งมอบได้ตาม goal วิธีนี้คือ **timeboxing ที่ยืดหยุ่นในระดับ task ไม่ใช่ระดับ Sprint**

---

## สรุปผล

|Sprint|Features ที่ส่งมอบ|CI Status|Notable|
|---|---|---|---|
|Sprint 1|Auth + Infrastructure|✅ Pass|CodeQL scan เปิดใช้|
|Sprint 2|Deal Search, Location, Favorites (3 features)|✅ Pass|Sprint ที่ productive ที่สุด|
|Sprint 3|Savings Tracker + Production Deploy|✅ Pass|Deploy สำเร็จ|

**โครงการ RichSave ส่งมอบ MVP ครบ 4 features และ deploy บน production ได้สำเร็จตามเป้าหมายของโครงการ**

---

_Squad Alpha — RichSave | DTI 241 | EightNine Labs_ | พฤษภาคม 2569