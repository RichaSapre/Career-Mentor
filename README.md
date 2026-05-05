📘 Career Mentor – Frontend
AI-Powered Career Decision Support System
📌 Overview

Career Mentor is an AI-driven career guidance platform developed as part of a Capstone Project by Richa Sapre & Shreya Kumari, under the supervision of Prof. Hongmin Li.

The system is designed to address a key problem in modern job search:

Students often make career decisions based on incomplete information about market demand, skill relevance, and competitiveness.

Career Mentor integrates structured labor market analysis, multi-agent reasoning, and personalized profile evaluation to provide transparent, data-driven career insights.

This repository contains the complete frontend system, built using Next.js and deployed on Vercel.

🎯 Research Objectives

The project explores:

Explainable AI in career recommendation systems
Multi-agent structured reasoning
Market-informed decision support
Skill-gap identification frameworks
Data-driven student career planning

The goal is not to replace job boards, but to enhance decision-making clarity through structured analysis.

🏗️ System Architecture
High-Level Architecture


┌────────────────────────────┐
│        User Interface       │
│     (Next.js Frontend)      │
└───────────────┬────────────┘
                │
                ▼
┌────────────────────────────┐
│ Next.js Proxy Route Layer  │
│  /api/backend/[...path]    │
└───────────────┬────────────┘
                │
                ▼
┌────────────────────────────┐
│    Backend API Server      │
│  Market + AI + Auth Logic  │
└───────────────┬────────────┘
                │
                ▼
┌────────────────────────────┐
│   External Data Sources    │
│ Job Listings + Market Data │
└────────────────────────────┘

Frontend Layer Responsibilities
User authentication (OTP-based)
Profile onboarding & management
Job search & filtering interface
Market analysis visualization
Career plan rendering (multi-agent output)
Proxy-based secure backend communication


Backend Communication Flow
Browser
   ↓
/api/backend/auth/login
   ↓
Next.js Route Handler
   ↓
Production Backend URL
   ↓
AI + Database + Market Analysis Engine

The proxy architecture eliminates CORS issues and avoids direct exposure of backend endpoints.



🧩 Core Frontend Modules
1️⃣ Job Search
Filter-based job discovery
Salary parsing & normalization
External job application redirection
2️⃣ Market Analyzer
Public preview analysis
Demand score computation
Growth trend visualization
Top skills & companies
AI-generated summaries
3️⃣ Career Plan
Multi-agent structured reasoning (6 agents)
Skill alignment analysis
Gap detection
Confidence scoring
Actionable recommendations
4️⃣ Profile System
Step-by-step onboarding
Education & experience capture
Skills tagging
Editable user dashboard
🧠 Multi-Agent Reasoning Model (Frontend Integration)

The Career Plan system renders structured outputs from six conceptual agents:

Market Demand Agent
Skill Alignment Agent
Competition Agent
Education & Experience Agent
Strategy Agent
Synthesis Agent

Each agent contributes to a transparent, explainable recommendation system.

🛠️ Tech Stack
Framework
Next.js 14 (App Router)
TypeScript
UI & Styling
Tailwind CSS
Custom Glass UI Components
Radix UI
Recharts (Data Visualization)
State & Architecture
React Hooks
Modular API abstraction layer
Token-based authentication handling
Next.js Route Handlers (Serverless proxy)
Deployment
Vercel (Frontend Hosting)
Serverless proxy endpoints


📂 Project Structure
src/
 ├── app/
 │   ├── (auth)/
 │   ├── (main)/
 │   ├── (public)/
 │   ├── (onboarding)/
 │   └── api/backend/[...path]/
 ├── components/
 ├── lib/
 │   ├── api/
 │   ├── auth/
 │   ├── data/
 │   └── utils/

 🔗 Backend Repository

The backend implementation (AI engine, authentication, database, and market processing) is available here:

👉 https://github.com/ishreyakumari97/Capstone-backend

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



💻 Local Development Setup
1️⃣ Clone Repository
git clone https://github.com/RichaSapre/Career-Mentor.git
cd Career-Mentor
2️⃣ Install Dependencies
npm install
3️⃣ Configure Environment Variables

Create a file:

.env.local

Add:

BACKEND_URL=http://<production-backend-url>/alpha/api/v1

This is required for the proxy route to forward requests.

4️⃣ Run Development Server
npm run dev

Application runs at:

http://localhost:3000
🌍 Environment Variables
Required (Frontend)
Variable	Description
BACKEND_URL	Production backend base URL used by proxy route
Not Required on Frontend

The following must NOT be added to frontend environment:

MongoDB URI
JWT secrets
OpenAI API keys
Redis configuration
Bcrypt config

These belong strictly to the backend.

⚠️ Project Disclaimer
Career Mentor is a research-based academic project.
It is not a direct job board.
Applications must be submitted via external platforms.
AI recommendations are advisory in nature.
Limited usage per account due to compute constraints.
Market data is derived from publicly available listings.
📊 Academic Contribution

This project contributes to:

AI transparency in career systems
Data-driven career planning
Market-informed skill alignment
Structured decision-support design
Student-focused intelligent systems
👩‍💻 Authors

Richa Sapre
Shreya Kumari

Under the guidance of Prof. Hongmin Li


