# AI CTO 🤖

> Type a startup idea. Get complete system architecture in seconds.

**Live Demo:** https://ai-cto-two.vercel.app  
**Built by:** Shlok Gohel

---

## What it generates

Given *"Design a food delivery app like Swiggy"*, AI CTO produces:

| Module | Output |
|--------|--------|
| 🏗️ System Architecture | Services, tech stack, communication patterns |
| 🗄️ Database Schema | Tables, columns, relationships, indexes, SQL |
| 🔌 API Design | REST endpoints, auth strategy, request/response |
| 💰 Cost Estimation | AWS pricing for small/medium/large scale |
| 🔒 Security Checklist | Auth, encryption, rate limiting, OWASP |
| 📊 Diagrams | Architecture, ER, sequence diagrams (Mermaid) |
| 📄 PDF Report | Professional downloadable CTO report |

---

## Screenshots

> Coming soon — add screenshots here

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Supabase), Prisma ORM |
| AI | OpenRouter (Gemma, GPT-OSS free models) |
| Diagrams | Mermaid.js |
| PDF | Puppeteer |
| Auth | JWT + Refresh tokens + bcrypt |
| Deploy | Vercel (frontend) + Render (backend) |

---

## AI Architecture

```
User Input (plain English)
         ↓
    Orchestrator
         ↓
  ┌──────┴──────┐
  │  6 AI Agents │
  │  Sequential  │
  └──────┬──────┘
         ↓
Architecture → Database → API → Cost → Security → Diagrams
         ↓
    JSON Output
         ↓
  React UI (6 tabs)
         ↓
    PDF Export
```

---

## Features

- ✅ JWT Authentication (register/login/logout)
- ✅ 6-agent AI pipeline with fallback chain
- ✅ In-memory caching (same input = instant result)
- ✅ Generation history with delete
- ✅ Dark mode
- ✅ 28 example prompts across 7 categories
- ✅ Custom input — type any idea
- ✅ PDF export
- ✅ Mermaid diagrams

---

## Local Setup

### Prerequisites
- Node.js 18+
- Free Supabase account — [supabase.com](https://supabase.com)
- Free OpenRouter API key — [openrouter.ai](https://openrouter.ai)

### Steps

```bash
# 1. Clone
git clone https://github.com/Shlok-2117/AI_CTO.git
cd AI_CTO

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Fill in .env with your keys

# 3. Push DB schema
npx prisma db push

# 4. Start backend
npm run dev

# 5. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

**`backend/.env`**

```env
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=random_64_char_string
REFRESH_SECRET=another_random_64_char_string
OPENROUTER_API_KEY=your_openrouter_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## API Endpoints

```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login
POST   /api/auth/logout        Logout
POST   /api/auth/refresh       Refresh JWT token

POST   /api/generate           Generate architecture (auth required)
GET    /api/generate/:id       Get generation by ID
GET    /api/generate/:id/pdf   Download PDF report

GET    /api/history            Get generation history
DELETE /api/history/:id        Delete generation
```

---

## Resume Bullets

**AI CTO** | Next.js · Node.js · Express · PostgreSQL · Prisma · OpenRouter · Mermaid · Puppeteer

- Built a multi-agent AI system that generates complete system architecture, database schemas, REST API designs, and AWS cost estimates from plain-English startup descriptions
- Engineered a 6-agent orchestration pipeline (Architecture → Database → API → Cost → Security → Diagrams) with automatic fallback between 3 free AI models via OpenRouter
- Implemented in-memory caching layer reducing repeat generation time from 3 minutes to instant (<100ms) for identical inputs
- Built JWT authentication with refresh token rotation, bcrypt password hashing, and httpOnly cookie security
- Generated Mermaid diagrams (architecture, ER, sequence) and Puppeteer PDF export producing professional 6-section CTO reports

Live: https://ai-cto-two.vercel.app | GitHub: github.com/Shlok-2117/AI_CTO

---

## Project Structure

```
ai-cto/
├── backend/
│   ├── src/
│   │   ├── agents/          # 6 AI agents
│   │   ├── prompts/         # System prompts
│   │   ├── services/        # AI, PDF, Cache
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Auth controllers
│   │   └── middleware/      # JWT middleware
│   └── prisma/
│       └── schema.prisma
└── frontend/
    └── src/
        ├── app/             # Next.js pages
        └── components/      # React components
```

---

*Built in 7 days as a portfolio project for software engineering internship applications*

*Target companies: Google · Amazon · Goldman Sachs · BNY Mellon · UnifyApps · Sprinklr*
