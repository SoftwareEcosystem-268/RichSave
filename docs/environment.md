## Environment Variables

### Required Variables

| Variable              | Description               | Example                              | Secret? |
| --------------------- | ------------------------- | ------------------------------------ | ------- |
| `MONGODB_URI`         | MongoDB connection string | `mongodb://localhost:27017/richsave` | Yes ⚠️  |
| `JWT_SECRET`          | Token signing key         | `random-string-min-32-chars`         | Yes ⚠️  |
| `NEXT_PUBLIC_APP_URL` | Application base URL      | `http://localhost:3000`              | No      |

### Optional Variables

| Variable                   | Description                    | Example        | Secret? |
| -------------------------- | ------------------------------ | -------------- | ------- |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox token for enhanced maps | `pk.eyJ1Ij...` | No      |

### Setting Up .env

```bash
# Windows
copy .env.example .env.local

# Mac / Linux
cp .env.example .env.local
```

### .env.local Example

```env
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/richsave
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/richsave

# JWT Secret (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
# NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### Security Warning — อย่าทำแบบ DOPA

> **กรณีศึกษา:** หน่วยงานรัฐ (DOPA) เคยถูกเปิดเผยข้อมูลเพราะ API key และ credentials ถูก hardcode ไว้ใน source code และ commit ขึ้น public GitHub โดยไม่ตั้งใจ ทำให้ผู้ไม่หวังดีเข้าถึงระบบฐานข้อมูลประชาชนได้

สิ่งที่ **ห้ามทำ** ในโปรเจกต์นี้:

```js
// ❌ NEVER hardcode secrets in code
const uri = "mongodb+srv://admin:password123@cluster.mongodb.net/richsave";
const secret = "my-jwt-secret";
```

```bash
# ❌ NEVER commit .env files
git add .env.local        # ห้ามทำเด็ดขาด
git commit -m "add env"   # ห้ามทำเด็ดขาด
```

สิ่งที่ **ต้องทำ**:

- ใช้ `.env.local` เสมอ (ถูก ignore โดย `.gitignore` อยู่แล้ว)
- commit เฉพาะ `.env.example` ที่ไม่มีค่าจริง
- ถ้า secret หลุดขึ้น Git แล้ว → **rotate ทันที** อย่า force push แล้วคิดว่าปลอดภัย เพราะ git history ยังอยู่

```bash
# ตรวจสอบว่า .env.local ไม่ได้อยู่ใน git tracking
git ls-files | grep -i env
# ถ้ามี .env.local ขึ้นมา → แก้ไขด่วน
```

### Notes

- ⚠️ **Secret variables** ต้องไม่ commit ขึ้น Git เด็ดขาด
- ไฟล์ `.env.local` ถูก ignore โดย `.gitignore` อยู่แล้ว
- สำหรับ Production ให้ตั้งค่าผ่าน server environment หรือ Vercel dashboard
