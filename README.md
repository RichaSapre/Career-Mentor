# 🎯 Career Mentor Frontend

> A modern career guidance platform powered by multi-agent AI — built with Next.js, TypeScript, and a Canva-inspired glassmorphism UI.

---

## 🚀 Overview

This frontend implements the full user journey from onboarding to AI-powered career recommendations.

**Complete Flow:**

```
Welcome → Register / Login (OTP) → Onboarding → Dashboard → AI Recommendations
```

It collects a complete user profile and integrates with a backend that performs market analysis and multi-agent AI-based career recommendations.

---

## 🧭 User Flow

```
Welcome
  └── Register / Login (OTP)
        └── Onboarding
              ├── Education
              ├── Experience
              ├── Skills (min 4 + proficiency)
              ├── Citizenship
              ├── Career Preferences
              └── Salary & Links
                    └── Dashboard
                          └── Career Recommendations
```

---

## ✨ Features

- 🔐 OTP-based authentication
- 🪜 Step-by-step onboarding flow
- 📋 Complete profile capture:
  - Education history
  - Work experience
  - Skills with proficiency levels (1–5)
  - Citizenship / visa status
  - Career preferences
  - Salary expectations
  - Profile links (LinkedIn, GitHub, Portfolio)
- 🤖 AI-powered career recommendations
- 📊 Market insights visualization
- 🎨 Clean glassmorphism UI (Canva-style)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | React + TypeScript |
| Styling | Tailwind CSS (glass cards UI) |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query |
| Charts | Recharts |

---

## ⚙️ Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=/api/backend
BACKEND_URL=http://localhost:4300/api/backend
```

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Used for frontend API calls |
| `BACKEND_URL` | Used by Next.js proxy to forward requests to backend |

---

## 🔌 Backend Integration

This frontend connects to the **Career Mentor Backend API**.

👉 **Backend Repository:** [Career Mentor Backend](https://github.com/ishreyakumari97/Capstone-backend)

### 🔗 API Reference

#### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | Send OTP |
| `POST` | `/auth/verify-login` | Verify OTP |
| `POST` | `/auth/refresh-token` | Refresh JWT |
| `GET` | `/auth/user` | Get current user |
| `POST` | `/auth/logout` | Logout |

#### Market Data

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/market/analysis/:role` | Market analysis for a role |
| `GET` | `/market/trending` | Trending roles |
| `GET` | `/market/skills/:role` | In-demand skills for a role |

#### Recommendations

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/recommendations/generate` | Generate recommendations |
| `GET` | `/recommendations/generate/stream` | SSE stream |
| `GET` | `/recommendations/quick` | Quick recommendations |
| `GET` | `/recommendations/history` | Recommendation history |

---

## 🤖 How Recommendations Work

```
1. User completes onboarding profile
        ↓
2. Frontend sends POST /recommendations/generate
        ↓
3. Backend:
   ├── Authenticates user (JWT + Redis session)
   ├── Loads profile from MongoDB
   ├── Fetches market data for selected roles
   └── Runs multi-agent AI debate (LangGraph)
        ↓
4. Frontend displays:
   ├── Role rankings
   ├── Skill gaps
   ├── Action plan
   └── Market insights
```

> 📌 For full architecture details, see the backend repository.

---

## 📁 Project Structure

```
src/
├── app/                # Next.js App Router pages
├── components/         # Reusable UI components
├── features/           # Feature modules (auth, onboarding, dashboard)
├── hooks/              # Custom React hooks
├── lib/                # API clients & utilities
├── schemas/            # Zod validation schemas
├── styles/             # Global styles
└── types/              # TypeScript types
```

---

## 🧾 Notes

- Skills step enforces a **minimum of 4 skills** with proficiency ratings (1–5)
- Complete signup sends full profile payload to the backend
- Uses **TanStack Query** for API state management
- Uses **Zod + React Hook Form** for form validation
- UI design principles:
  - Teal background
  - Centered glass cards
  - Bottom navigation bar

---

## 🚀 Future Improvements
