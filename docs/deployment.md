## Deployment

### Architecture

```
User → Nginx (port 80/443) → Next.js (port 3000) → MongoDB
```

### Server Requirements

- Ubuntu 22.04 LTS
- Node.js 18+
- Nginx
- MongoDB 6+
- 2GB RAM minimum

### Deploy Steps

```bash
# 1. SSH to server
ssh ubuntu@your-ec2-ip

# 2. Pull latest code
cd /var/www/richsave && git pull origin main

# 3. Install dependencies
npm install --production

# 4. Build
npm run build

# 5. Restart services
pm2 restart richsave
```

> ⚠️ **ยังไม่ได้ deploy** — โปรเจกต์ยังอยู่ระหว่าง development  
> ขั้นตอนข้างต้นคือ plan สำหรับเมื่อโค้ดพร้อม
