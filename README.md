Here is a **direct copy-paste README.md** with:

* Clean architecture diagram
* Local setup instructions
* Environment variable documentation
* Academic research framing
* Backend endpoints section included
* Backend repo link

You can replace your entire `README.md` with this.

---

```markdown
# Career Mentor – Frontend  
### AI-Powered Career Decision Support System

## Overview

Career Mentor is an AI-powered career guidance platform developed as part of a Capstone Project by **Richa Sapre & Shreya Kumari**, under the guidance of **Prof. Hongmin Li**.

The system is designed to help students make data-driven career decisions by combining:

- Labor market trend analysis  
- Multi-agent AI reasoning  
- Personalized skill-gap assessment  
- Structured job discovery  
- Explainable career recommendations  

This repository contains the complete frontend application built with Next.js and deployed on Vercel.

---

## Live Application

👉 https://career-mentor-alpha.vercel.app

---

## System Architecture

### High-Level Architecture

```

User (Browser)
↓
Next.js Frontend (App Router)
↓
Next.js Proxy Route (/api/backend/[...path])
↓
Backend Server (AI + Auth + Market Engine)
↓
Database + External Job Data

```

---

### Proxy-Based Backend Communication

The frontend does NOT directly call backend IP addresses.

All requests go through:

```

/api/backend/[...path]

```

The proxy route forwards requests to the backend using the `BACKEND_URL` environment variable.

This architecture:

- Prevents CORS issues  
- Avoids mixed-content errors  
- Hides backend implementation details  
- Supports secure deployment on Vercel  

---

## Core Features

### 1️⃣ Job Search
- Filter-based job discovery
- Salary normalization and display
- Redirect to external application platforms (e.g., Handshake)
- Structured job listing interface

### 2️⃣ Market Analyzer
- Public preview mode
- Demand score visualization
- Growth trend graphs
- Key skills extraction
- Top companies & locations
- AI-generated market summaries

### 3️⃣ Career Plan (Multi-Agent AI)
- Personalized role evaluation
- 6-agent structured reasoning model
- Skill alignment score
- Gap detection
- Actionable next steps
- Confidence scoring

### 4️⃣ Profile Management
- Step-by-step onboarding
- Education & experience capture
- Skills tagging
- Editable profile dashboard
- Avatar upload

### 5️⃣ Authentication
- OTP-based login
- Account creation
- Protected routes
- Token refresh handling

---

## Multi-Agent Reasoning Model

The Career Plan integrates outputs from six conceptual agents:

1. Market Demand Agent  
2. Skill Alignment Agent  
3. Competition Agent  
4. Education & Experience Agent  
5. Strategy Agent  
6. Synthesis Agent  

This enables explainable, structured career guidance instead of black-box recommendations.

---

## Tech Stack

### Framework
- Next.js 14 (App Router)
- TypeScript

### Styling & UI
- Tailwind CSS
- Custom Glass UI Components
- Radix UI
- Recharts (Data Visualization)

### Architecture
- React Hooks
- Modular API abstraction layer (`lib/api`)
- Token-based authentication
- Next.js Route Handlers (Serverless proxy)

### Deployment
- Vercel (Frontend Hosting)
- Serverless API proxy layer

---

## Project Structure

```

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

```

---

## Backend Repository

The backend implementation powering AI analysis, authentication, and market processing is available here:

👉 https://github.com/ishreyakumari97/Capstone-backend

---

## Backend API Endpoints

The frontend communicates with the backend through the following endpoints (via proxy):

### Authentication
- `POST /auth/login`
- `POST /auth/verify-login`
- `POST /auth/refresh-token`

### Market Analysis
- `POST /market/analyze/preview`
- `POST /market/analyze/full`

### Career Plan
- `POST /career-plan/generate`

### Jobs
- `GET /jobs`
- `GET /jobs/:id`

All calls are routed through:

```

/api/backend/[...path]

```

which forwards to:

```

${BACKEND_URL}/<actual-endpoint>

````

---

## Local Development Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/RichaSapre/Career-Mentor.git
cd Career-Mentor
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the root directory:

```
BACKEND_URL=http://<production-backend-url>/alpha/api/v1
```

This variable is required for proxy routing.

### 4️⃣ Run Development Server

```bash
npm run dev
```

Application will run at:

```
http://localhost:3000
```

---

## Environment Variables (Frontend)

| Variable    | Purpose                          |
| ----------- | -------------------------------- |
| BACKEND_URL | Base URL of deployed backend API |

⚠️ The following should NEVER be added to the frontend:

* MongoDB URI
* JWT secrets
* OpenAI API keys
* Redis credentials

These belong strictly to the backend.

---

## Disclaimer

* Career Mentor is an academic research project.
* It is not a direct job board.
* Applications must be submitted via external platforms.
* AI-generated insights are advisory in nature.
* Usage limits exist due to compute constraints.
* Market data is derived from publicly available listings.

---

## Academic Contribution

This project explores:

* Explainable AI in career systems
* Structured multi-agent reasoning
* Market-driven skill alignment
* Data-informed student decision support
* Intelligent career planning interfaces

---

## Authors

**Richa Sapre**
**Shreya Kumari**

Under the guidance of **Prof. Hongmin Li**

```

---

If you'd like next, I can:

- Add a visual architecture diagram image
- Add a “Future Work” section
- Add a “Research Limitations” section
- Optimize this README for recruiters
- Add badges (Vercel, Next.js, TypeScript, etc.)

Just tell me the direction you want.
```
