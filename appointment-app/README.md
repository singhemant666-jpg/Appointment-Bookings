# ClinicSlot – Doctor Appointment App

**Stack:** Next.js 14 (frontend) · Express.js (backend) · Supabase (PostgreSQL)

## Folder structure
```
appointment-app/
├── backend/
│   ├── database/
│   │   ├── schema.sql        # tables
│   │   └── seed.sql          # 7 doctors + unke timings
│   └── src/
│       ├── config/db.js      # MySQL pool
│       ├── controllers/      # auth, doctor, appointment logic
│       ├── middleware/auth.js# JWT + admin check
│       ├── routes/index.js   # saare API routes
│       ├── services/aiService.js  # AI symptom -> specialist
│       ├── utils/slots.js    # slot generator (smart part)
│       ├── utils/createAdmin.js
│       ├── app.js
│       └── server.js
└── frontend/
    └── src/
        ├── app/              # pages: home, doctors/[id], login, register, appointments
        ├── components/Navbar.js
        └── lib/              # api helper, useAuth hook
```

## Setup

### 1. Database (Supabase)
1. supabase.com par project banao.
2. SQL Editor me `backend/database/schema.sql` paste karke Run karo, phir `seed.sql`.
3. Dashboard > Connect > **Session pooler** string copy karo.

### 2. Backend
```bash
cd backend
cp .env.example .env      # DATABASE_URL aur JWT_SECRET bharo
npm install
npm run db-check          # connection test
npm run dev               # http://localhost:5000
npm run create-admin -- admin@example.com Admin123 "Admin"   # optional
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev               # http://localhost:3000
```

## API
| Method | Route | Kaam |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | account / login |
| GET | /api/doctors?search=&specializationId= | doctors + weekly timing |
| GET | /api/doctors/:id/slots?date=YYYY-MM-DD | us din ke slots (available true/false) |
| POST | /api/appointments | slot book (login chahiye) |
| GET | /api/appointments/mine | meri appointments |
| PATCH | /api/appointments/:id/cancel | cancel |
| POST | /api/doctors | admin: naya doctor + schedule |
| POST | /api/ai/suggest | symptoms -> specialist |

## Smart kya hai
- Slots DB me store nahi hote, **doctor ke weekly schedule se on-the-fly generate** hote hain (utils/slots.js). Isliye har doctor ka slot length alag ho sakta hai (20/30 min).
- Booked aur nikal chuke (past) slots disabled dikhte hain.
- **Double booking DB level par rukti hai** (UNIQUE index). Cancel ke baad slot wapas free.
- AI symptom box: `ANTHROPIC_API_KEY` `.env` me daalo to Claude se suggest hoga, warna keyword fallback chalega.

## Extra AI features kaise add karein
Dekho chat me diya hua guide.
