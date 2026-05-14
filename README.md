# RichSave - Smart Savings & Deal Discovery Platform

A modern full-stack web application for discovering deals, tracking savings, and managing your budget. Built with Next.js, MongoDB, and Tailwind CSS.

![RichSave](https://img.shields.io/badge/Next.js-14.2-black) ![MongoDB](https://img.shields.io/badge/MongoDB-6.3-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## Features

- 🔐 **JWT Authentication** - Secure login, signup, and password reset flow
- 🔍 **Deal Search** - Search and filter deals by category, store, or keywords
- 📍 **Location-Based Deals** - Find deals near you with interactive map
- ❤️ **Save Favorites** - Bookmark deals for quick access
- 📊 **Savings Tracker** - Visualize your savings with charts and analytics
- 👤 **Profile Management** - Edit your profile and preferences
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🎨 **Modern UI** - Clean fintech-inspired design

## Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: Leaflet (OpenStreetMap)
- **QR Codes**: qrcode library

## Vision & Goals

**Problem Statement**

Most Thai people lack personal finance management habits because typical expense-tracking apps require a high level of self-discipline to log data manually — and they don't actually help users make better spending decisions in real life. As a result, many students have no idea where their money went and struggle to save, even when they intend to.

**Solution**

RichSave bridges expense tracking with real-time nearby food deal recommendations, enabling users to save money starting from their very first meal — no need to "plan finances" first. Unlike conventional budgeting apps that only record money already spent, RichSave helps users make smarter decisions before they spend.

**Target Users**

Primary: Gen Z (ages 16–27)
Secondary: Late Gen Alpha (ages 12–15) and their parents

**Success Metrics**
| Metric | Target | Current |
|------|------|------|
| Monthly active users | 1,000 users within 3 months | — |
| Day-30 retention rate | ≥ 40% | — |
| Deals used per user / month | ≥ 5 times | — |
| Average money saved per user / month | ≥ 300 THB | — |

## Roadmap

| Task | Team | Status |
|----|----|------|
| Design Dashboard UI | Design | 🟢 Done |
| Authentication system (register / login) | Backend | 🟢 Done |
| API for fetching nearby food deals | Backend | 🟢 Done |
| Deal listing page with filters | Frontend | 🟢 Done |
| Favorites / saved deals system | Frontend | 🟢 Done |
| GPS / Location permission integration | Frontend | 🟢 Done |


## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Rich-Save
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/richsave
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/richsave?retryWrites=true&w=majority

# JWT Secret (REQUIRED - generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For enhanced map features
# NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### 4. Start MongoDB

**For local MongoDB:**
```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows
# MongoDB should start automatically as a service
```

**For MongoDB Atlas:**
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add your IP to the whitelist (0.0.0.0/0 for development)
4. Create a database user
5. Copy the connection string to your `.env.local`

### 5. Seed the Database (Optional)

To populate the database with sample deals:

```bash
npm run seed
```

This will create sample deals in your MongoDB database.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Rich-Save/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── deals/           # Deal CRUD operations
│   │   └── user/            # User profile & settings
│   ├── deals/               # Deal pages
│   ├── favorites/           # Favorites page
│   ├── login/               # Login page
│   ├── nearby/              # Nearby deals with map
│   ├── profile/             # User profile
│   ├── savings/             # Savings tracker
│   ├── signup/              # Signup page
│   ├── forgot-password/     # Password reset flow
│   ├── privacy/             # Privacy policy page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # Reusable components
│   ├── Navigation.tsx       # Main navigation
│   ├── DealCard.tsx         # Deal card component
│   └── MapView.tsx          # Interactive map
├── lib/                     # Utility libraries
│   ├── db.ts               # MongoDB connection
│   ├── models.ts           # Database models
│   └── auth.ts             # JWT utilities
├── middleware.ts            # Auth middleware
├── tailwind.config.ts       # Tailwind configuration
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create a new account |
| POST | `/api/auth/login` | Login to existing account |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/reset-password` | Reset password |

### Deals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deals` | Get all deals (supports search & filters) |
| GET | `/api/deals/[id]` | Get single deal details |
| POST | `/api/deals/[id]/redeem` | Redeem a deal |
| POST | `/api/deals` | Create new deal (admin) |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |
| GET | `/api/user/favorites` | Get favorite deals |
| POST | `/api/user/favorites` | Add to favorites |
| DELETE | `/api/user/favorites` | Remove from favorites |
| GET | `/api/user/savings` | Get savings data |
| POST | `/api/user/change-password` | Change password |

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  location: String,
  favorites: [String],
  preferences: {
    pushNotifications: Boolean,
    locationServices: Boolean,
    darkMode: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Deals Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  discount: String,
  originalPrice: Number,
  discountedPrice: Number,
  storeName: String,
  image: String,
  category: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  expiresAt: Date,
  terms: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Redemptions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  dealId: String,
  dealTitle: String,
  storeName: String,
  savings: Number,
  redeemedAt: Date
}
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with sample data |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `NEXT_PUBLIC_APP_URL` | No | Application URL (default: localhost:3000) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Mapbox token for enhanced maps |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Make sure to set the `MONGODB_URI` and `JWT_SECRET` environment variables.

## Testing

โปรเจกต์ใช้การทดสอบ 2 ระดับ: **Unit/Integration** ด้วย Jest และ **E2E** ด้วย Playwright

```bash
# Unit tests
npm run test               # รัน Jest ทั้งหมด
npm run test:coverage      # รันพร้อมรายงาน coverage (threshold 70%)

# E2E tests (Playwright)
npm run test:e2e           # รันทั้งหมด
npm run test:e2e:auth      # รันเฉพาะ auth (login, register, forgot)
npm run report:show        # เปิด HTML report
```

**Test structure:**
```
tests/
├── auth/          # E2E: login, register, forgot password
├── deal/          # E2E: search, filter, detail
├── favorites/     # E2E: favorites & notification
├── location/      # E2E: map & location permission
├── savings/       # E2E: savings & history
└── *.unit.test.ts # Jest unit tests
```

ดูรายละเอียดเพิ่มเติมที่ [TESTING.md](TESTING.md)

---

## Known Issues

รายการ bug / limitation ที่ทีมทราบแล้ว (อัปเดต 2026-05-07):

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Show/Hide password toggle ยังไม่ implement | 🟡 Medium | Open |
| 2 | Login บางครั้งไม่ redirect ไป `/deals` | 🔴 High | Open |
| 3 | Rate limiting / account lock ยังไม่ทำงาน | 🔴 High | Open |
| 4 | Admin check ไม่มีบน `POST /api/deals` | 🔴 High | Open |
| 5 | Notification feature ยังไม่ implement | 🟢 Low | In Progress |
| 6 | Location search ยังไม่ implement | 🟢 Low | In Progress |
| 7 | Login email case-sensitive | 🟡 Medium | Open |

ดูรายการทั้งหมด workaround และ Bug Report Template ที่ [KNOWN_ISSUES.md](KNOWN_ISSUES.md)

---

## Quality Checklist

ใช้ checklist นี้ก่อน commit และก่อน merge เข้า `main` (trigger deploy EC2 อัตโนมัติ)

**Pre-Commit:** lint pass · ไม่มี `console.log` · ไม่มี hardcoded secret · unit tests ผ่าน · coverage ≥ 70%

**Pre-Release:** E2E pass · build pass · no High severity known issue · env vars ครบ · `npm audit` clean

**Post-Deploy:** production URL ใช้งานได้ · PM2 log ไม่มี error · API endpoints ตอบ 200

ดู checklist เต็มที่ [QUALITY_CHECKLIST.md](QUALITY_CHECKLIST.md)

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For support, email support@richsave.com or open an issue in the repository.

---

**Built with ❤️ by the RichSave team**
