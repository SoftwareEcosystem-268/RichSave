## CI/CD Pipeline

### Pipeline Overview

```
Push to main → GitHub Actions → ตรวจสอบ HTML → [Deploy to EC2 — Planned]
```

> ⚠️ **โปรเจกต์ยังอยู่ระหว่าง development** — ปัจจุบัน pipeline ทำหน้าที่ CI (ตรวจสอบไฟล์) เท่านั้น  
> ส่วน Deploy to EC2 จะเพิ่มเมื่อโค้ดพร้อม

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: Simple CI

on:
  push:
    branches: [main]

jobs:
  check-html:
    runs-on: ubuntu-latest # เครื่อง Ubuntu สะอาด → แก้ "Works on my machine!"

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4 # clone repo ลง runner

      - name: ตรวจสอบว่า index.html มีอยู่จริง
        run: |
          if [ ! -f index.html ]; then
            echo "❌ ERROR: ไม่พบ index.html"
            exit 1         # exit 1 = บอก CI ว่า step นี้ FAIL
          fi
          echo "✅ พบไฟล์ index.html"

      - name: ตรวจสอบว่ามี HTML tag
        run: |
          if ! grep -qi "<html" index.html; then
            echo "❌ ERROR: ไม่พบ <html> tag"
            exit 1
          fi
          echo "✅ พบ <html> tag"

      - name: สรุปผล CI
        run: echo "🎉 CI ผ่านทั้งหมด — พร้อม deploy"
```

### Secrets Required in GitHub

ปัจจุบันยังไม่ต้องการ secrets — จะเพิ่มเมื่อ setup EC2 พร้อม

| Secret Name | Description       |
| ----------- | ----------------- |
| `EC2_HOST`  | Server IP address |
| `EC2_USER`  | SSH username      |
| `EC2_KEY`   | SSH private key   |

### Manual Deploy (Emergency)

```bash
# ถ้า CI/CD ไม่ทำงาน ให้ deploy manual ผ่าน SSH:
ssh <EC2_USER>@<EC2_HOST>
cd /var/www/richsave
git pull origin main
npm install
npm run build
pm2 restart richsave
```
