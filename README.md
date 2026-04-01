# AfterCall — AI Discharge Follow-Up Agent

AfterCall is an AI-powered post-discharge patient follow-up system that automatically conducts structured check-in calls, detects red-flag symptoms, and escalates high-risk patients to clinical staff.

## What It Does

- **Patient Enrollment**: Discharge coordinators add patients with procedure type and discharge date. The system auto-schedules follow-up calls at Day 1, 3, and 7.
- **AI Call Simulation**: A GPT-4o powered clinical agent conducts structured interviews with procedure-specific questions (knee replacement, cardiac surgery, appendectomy, hip replacement).
- **Red-Flag Detection**: The AI detects critical symptoms (severe pain ≥8/10, chest tightness, stopped medications) and creates escalation records automatically.
- **Escalation Queue**: Nurses see a real-time queue of flagged patients with severity, reason, and one-click "Mark Contacted" resolution.
- **Analytics Dashboard**: Aggregate metrics on call volume, escalation rates, pain score distributions, and procedure breakdowns.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (custom dark clinical theme)
- **Prisma ORM** + **PostgreSQL** (Neon serverless)
- **NextAuth.js** (email/password)
- **OpenAI GPT-4o** (call simulation + analysis)
- **Recharts** (analytics charts)

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended: https://neon.tech)
- OpenAI API key

### Setup

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
AUTH_SECRET=your-random-32-char-secret  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-proj-...
```

```bash
# Create database schema
npx prisma migrate dev --name init

# Seed demo data (procedure templates + demo users)
npm run db:seed

# Start development server
npm run dev
```

Open http://localhost:3000

### Demo Credentials
- **Admin**: admin@aftercall.app / Demo@AfterCall2024
- **Nurse**: nurse@aftercall.app / Demo@AfterCall2024

## Deployment (Railway)

1. **Create a Railway project** and add a PostgreSQL database
2. **Add environment variables** in Railway dashboard:
   - `DATABASE_URL` (auto-filled by Railway Postgres plugin)
   - `AUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Railway app URL)
   - `OPENAI_API_KEY`
3. **Deploy** by connecting your GitHub repo to Railway
4. **Run migrations** in Railway shell: `npx prisma migrate deploy`
5. **Seed data**: `npm run db:seed`

### Alternative: Vercel + Neon

1. Push to GitHub
2. Import to Vercel
3. Add Neon PostgreSQL from Vercel Marketplace
4. Set environment variables in Vercel dashboard
5. Build command: `npm run build` (postinstall runs `prisma generate`)
6. Run seed: `vercel env pull && npm run db:seed`

## Key Features

### Dashboard
Real-time overview with escalation alert banner, summary statistics, and quick action links.

### Patient Management
Searchable patient list with status filtering. Add patients with automatic follow-up scheduling.

### AI Call Simulator
Browser-based chat interface simulating the AI voice call experience. Test scenario chips for rapid red-flag testing.

### Escalation Queue
Priority-ordered queue of patients requiring human callback. Auto-refreshes every 15 seconds.

### Analytics
14-day call activity chart, patient status pie chart, procedure volume breakdown, and escalation severity analysis.

## Architecture Notes

- The `(app)` route group applies auth protection at the layout level
- Prisma uses the Neon adapter (`@prisma/adapter-neon`) for serverless compatibility
- NextAuth uses JWT strategy — no database sessions
- Call analysis uses GPT-4o JSON mode for reliable structured extraction

## Important Disclaimers

⚠️ **This is an MVP prototype only.** It is NOT HIPAA-compliant and must not be used with real patient data. Production deployment requires:
- HIPAA Business Associate Agreements with all vendors
- Encryption at rest and in transit
- Audit logging
- Clinical validation of AI red-flag detection
- SOC 2 certification
