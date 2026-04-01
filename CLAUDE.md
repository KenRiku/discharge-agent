# AfterCall — CLAUDE.md

## What This Project Is

AfterCall is an AI-powered post-discharge follow-up system for hospitals. When patients are discharged, a discharge coordinator enrolls them in the system, which automatically schedules AI-driven check-in calls at Day 1, 3, and 7 post-discharge. The AI conducts structured clinical interviews with procedure-specific question sets, detects red-flag symptoms (severe pain, medication non-adherence, cardiac symptoms), and escalates flagged patients to human nurses. The MVP simulates phone calls as a browser-based chat interface using GPT-4o.

## Architecture

```
app/
├── (app)/              # Protected routes (require auth) wrapped in AppLayout
│   ├── dashboard/      # Main overview with stats + escalation alerts
│   ├── patients/       # Patient list, detail view, and enrollment form
│   ├── escalations/    # Escalation queue with resolve actions
│   ├── simulator/      # AI call chat interface
│   └── analytics/      # Charts and aggregate metrics
├── api/                # Next.js API routes (REST-like)
│   ├── auth/           # NextAuth handler
│   ├── signup/         # User registration
│   ├── patients/       # Patient CRUD + schedule creation
│   ├── escalations/    # Escalation listing + resolve
│   ├── simulator/      # AI call orchestration
│   ├── analytics/      # Aggregate stats
│   └── dashboard/      # Dashboard stats
├── login/              # Login page (unauthenticated)
└── signup/             # Signup page (unauthenticated)

components/
├── providers.tsx       # SessionProvider client wrapper
├── nav.tsx             # Left sidebar navigation
├── app-layout.tsx      # Shell with Nav + main content
└── status-badge.tsx    # Reusable badge components

lib/
├── prisma.ts           # Prisma client singleton (Neon adapter)
├── auth.ts             # NextAuth config and options
├── openai.ts           # GPT-4o call simulation logic
└── utils.ts            # Formatting and color utilities

prisma/
├── schema.prisma       # Data model
└── seed.ts             # Demo data seeder
```

## Key Files

- `lib/openai.ts` — Core AI logic. `runSimulatedCall()` manages the multi-turn conversation, `analyzeCallTranscript()` extracts structured data (pain score, med adherence, flag status) using JSON mode GPT-4o.
- `prisma/schema.prisma` — Full data model. Key relationships: Patient → CallSchedule (1:3), Patient → Call, Call → Escalation (1:0-1).
- `prisma/seed.ts` — Seeds 4 procedure templates (Knee, Hip, Cardiac, Appendectomy) and demo patients including one active RED escalation.
- `app/api/simulator/route.ts` — Orchestrates the AI call: calls OpenAI, saves transcript to DB, creates Escalation records if red flags detected, updates patient status.
- `app/api/patients/route.ts` — POST creates patient + auto-generates 3 CallSchedule entries.
- `app/(app)/layout.tsx` — Server component that checks session and redirects to /login if unauthenticated.

## Data Flow

**Patient enrollment:**
`/patients/new form` → `POST /api/patients` → creates `Patient` + 3 `CallSchedule` rows → redirects to `/patients`

**AI call simulation:**
`/simulator` → `POST /api/simulator` (greeting) → patient responds → `POST /api/simulator` (with transcript) → OpenAI chat → response streamed back → on completion: saves `Call`, maybe creates `Escalation`, updates `Patient.status`

**Escalation resolution:**
`/escalations` → `PATCH /api/escalations/[id]` with `{resolve: true}` → sets `resolvedAt`, checks if patient has remaining escalations, updates `Patient.status`

## Stack Decisions

- **Next.js 14 App Router**: Full-stack in one repo. Server components for auth checks, client components for interactive UI.
- **Prisma + Neon PostgreSQL**: Type-safe queries, relational data model fits perfectly (patients → schedules → calls → escalations). Neon chosen for serverless compatibility.
- **NextAuth v4 with Credentials**: Simple email/password MVP auth. JWT strategy for stateless sessions.
- **OpenAI GPT-4o**: JSON mode for structured analysis, streaming not used (fire-and-forget for MVP). System prompt contains procedure-specific question sets and red-flag rules.
- **Recharts**: Simple, React-native chart library. No D3 complexity needed.
- **No state management library**: React Server Components + local useState. SWR-style polling via setInterval for escalation refresh.

## Environment Variables

- `DATABASE_URL`: Neon PostgreSQL connection string. Must include `?sslmode=require` for Neon.
- `AUTH_SECRET`: Random 32-byte base64 string. Used to sign/verify JWT session tokens. Generate: `openssl rand -base64 32`
- `NEXTAUTH_URL`: Full base URL of the app. Required for OAuth redirects and CSRF. Use `http://localhost:3000` in dev.
- `OPENAI_API_KEY`: GPT-4o API key. Required for the simulator. Without this, simulator calls fail.

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your vars (see .env.example)
cp .env.example .env.local
# Edit .env.local with real DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY

# 3. Create the database schema
npx prisma migrate dev --name init

# 4. Seed demo data
npm run db:seed

# 5. Start the dev server
npm run dev
# Open http://localhost:3000
```

## Known Quirks

- **Prisma 7 + Neon adapter**: The `lib/prisma.ts` passes adapter as `any` to avoid TypeScript errors from the experimental adapter API. This works correctly at runtime.
- **OpenAI key required for simulator**: The `/simulator` page fails gracefully if no API key is set, but the rest of the app (patient management, escalation queue) works without it.
- **Call "completion" detection**: The AI call ends when the agent response contains certain phrases ("take care", "care team will review") OR after 14 message turns. This is heuristic and may occasionally end too early/late.
- **Date handling**: Discharge dates stored as UTC midnight. Day calculation uses Math.round on millisecond difference, which handles timezone edge cases reasonably.
- **Escalation severity ordering**: The escalations API orders by severity DESC (RED before YELLOW) then createdAt DESC. Prisma doesn't support enum ordering natively, so RED sorts before YELLOW lexicographically by coincidence — this should be made explicit if procedures change.

## What's NOT Implemented

- **Real telephony**: No Twilio/Vonage integration. All calls are browser-based chat simulations.
- **EHR integration**: No FHIR/Epic API. Patient data is entered manually.
- **HIPAA compliance**: No audit logs, no encryption at rest, no BAAs with vendors. This is a demo prototype only.
- **Real voice synthesis**: Text-only chat interface simulates voice calls.
- **Email/SMS notifications**: No outbound notifications when escalations are created.
- **Role-based access control**: All authenticated users see all patients. Role field exists in DB but no enforcement.
- **Pagination**: Patient list loads all patients. Fine for demo, needs pagination for production.
- **Billing/payments**: No monetization features.
- **Test suite**: No automated tests. Manual QA only.
