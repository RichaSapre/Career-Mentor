# Career Mentor Frontend (Next.js + TypeScript)

Matches your Canva flow: **Welcome → Register/Login (OTP) → Onboarding (Education → Experience → Skills → Citizenship → Career Preferences → Salary & Links) → Dashboard**.

Complete signup collects all API fields: education, experience, skills (with proficiency), citizenship, target roles, locations, remote preference, industry, salary range, and profile links.

## Tech
- Next.js (App Router) + React + TypeScript
- Tailwind CSS (glass cards)
- React Hook Form + Zod
- TanStack Query
- Recharts

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

### Backend endpoints used (from your Supernova collection)
- `POST /auth/signup` (minimal + complete)
- `POST /auth/login` (send OTP)
- `POST /auth/verify-login` (verify OTP)
- `POST /auth/refresh-token`
- `GET /auth/user`
- `POST /auth/logout`

## Notes
- The Skills step enforces **minimum 4 skills** with proficiency level (1–5).
- Onboarding: Education → Experience → Skills → Citizenship → Career Preferences → Salary & Links.
- Complete signup payload matches backend: `POST /auth/signup` with all fields.
- Set `NEXT_PUBLIC_API_BASE_URL=/api/backend` for frontend calls.
- Set `BACKEND_URL=http://localhost:4300/api/backend` so the Next.js proxy forwards to your backend.
- UI follows your Canva design: teal background, centered glass cards, bottom navigation.
