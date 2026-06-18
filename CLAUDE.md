# AII_CTO — AI-Powered Architecture Generator

> Update this file whenever a major feature is completed so future Claude sessions can orient quickly without relying on chat history.

---

## Project Overview

AII_CTO is a full-stack web application that acts as an AI CTO assistant. Given a startup idea or problem description, it generates a complete technical blueprint by orchestrating 6 specialized AI agents in sequence. The output includes a system architecture, database schema, REST API design, cloud cost estimates, security checklist, and visual Mermaid diagrams — all exportable as a PDF report.

**Core user flow:**
1. User registers / logs in
2. Submits a startup idea (≥ 10 characters) on the dashboard
3. Backend runs 6 AI agents sequentially, each building on prior output
4. Frontend renders the full blueprint with interactive diagrams
5. User can export a PDF or revisit past generations in history

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 4.18.2 |
| ORM | Prisma 5.7.0 |
| Database | SQLite (dev) / PostgreSQL (prod via Supabase) |
| Auth | JWT (access 15 min) + refresh tokens (7 days, httpOnly cookie) |
| Password hashing | bcryptjs (12 salt rounds) |
| Security headers | Helmet 7.1.0 |
| Rate limiting | express-rate-limit 7.1.5 |
| PDF generation | Puppeteer (headless Chromium) |
| AI provider | OpenRouter API (free-tier models with fallback chain) |
| Dev server | Nodemon + ts-node |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS 3.3 |
| HTTP client | Axios 1.6.2 |
| Diagrams | Mermaid 11.15 (architecture, ER, sequence) |
| Flow diagrams | ReactFlow 11.10 |
| Icons | Lucide React 0.294 |
| Utilities | clsx, tailwind-merge |

---

## Folder Structure

```
AII_CTO/
├── CLAUDE.md                   ← this file
├── .gitignore
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       ← database models
│   ├── src/
│   │   ├── agents/             ← one file per AI agent
│   │   │   ├── api.agent.ts
│   │   │   ├── architecture.agent.ts
│   │   │   ├── cost.agent.ts
│   │   │   ├── database.agent.ts
│   │   │   ├── diagram.agent.ts
│   │   │   └── security.agent.ts
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── prompts/            ← system prompts for each agent
│   │   │   ├── api.prompt.ts
│   │   │   ├── architecture.prompt.ts
│   │   │   ├── cost.prompt.ts
│   │   │   ├── database.prompt.ts
│   │   │   └── security.prompt.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── generate.routes.ts
│   │   │   └── history.routes.ts
│   │   ├── services/
│   │   │   ├── ai.service.ts   ← OpenRouter call + retry logic
│   │   │   └── pdf.service.ts  ← Puppeteer PDF generation
│   │   ├── app.ts              ← Express setup + middleware
│   │   └── index.ts            ← entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                    ← not committed (see .env.example)
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   └── register/
    │   │   ├── dashboard/      ← main generation UI
    │   │   ├── history/        ← past generations list
    │   │   ├── globals.css
    │   │   ├── layout.tsx
    │   │   └── page.tsx        ← landing / home page
    │   ├── components/
    │   │   └── MermaidDiagram.tsx
    │   ├── hooks/
    │   ├── lib/
    │   │   └── api.ts          ← Axios instance + typed API calls
    │   ├── types/
    │   │   └── index.ts        ← shared TypeScript types
    │   └── middleware.ts        ← Next.js route protection
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── .env.local              ← not committed
```

---

## Coding Conventions

- **TypeScript strict mode** is on in both backend and frontend.
- **Backend** compiles to CommonJS (tsconfig `module: commonjs`, output `dist/`).
- **Frontend** uses Next.js App Router — all pages are Server Components by default; add `"use client"` only when needed.
- **Path alias** `@/*` resolves to `frontend/src/*`.
- **Tailwind** dark mode uses the `class` strategy — the dashboard and history pages are dark-themed by default.
- **No comments** unless the reason is non-obvious. Use descriptive names instead.
- **Agents** follow a strict pattern: receive context object → build prompt → call `ai.service` → parse/validate JSON → return typed result or fallback. Do not deviate from this pattern when adding new agents.
- **Prompts** live in separate `prompts/` files, not inside agent files. Each prompt instructs the model to return pure JSON (no markdown fences, no prose).

---

## Architecture Decisions

### Sequential agent pipeline
The 6 agents run one after another; each receives the outputs of all prior agents as context. This allows later agents (e.g., cost, security) to reference concrete architecture decisions made earlier. The tradeoff is latency — a full generation takes several seconds.

**Agent order:**
1. **Architecture** — services, tech stack, infrastructure
2. **Database** — schema design (tables, relationships)
3. **API** — REST endpoints referencing the architecture and DB
4. **Cost** — AWS pricing estimates for the chosen services
5. **Security** — security checklist tailored to the stack
6. **Diagram** — Mermaid diagram source (architecture, ER, sequence)

### AI provider: OpenRouter with free-model fallback
`ai.service.ts` calls the OpenRouter API with a primary free model and falls back through a chain of free models on failure. This keeps costs at zero during development. Each call retries up to 3 times before returning a structured fallback response so the UI never crashes.

### JWT + httpOnly refresh token
Access tokens (15 min) are stored in `localStorage` on the frontend. Refresh tokens (7 days) are stored in an httpOnly cookie and also persisted in the `RefreshToken` database table for revocation support. On logout, the DB record is deleted.

### SQLite in dev, PostgreSQL in prod
Prisma abstracts the difference. The `DATABASE_URL` env var switches the provider. Run `npm run db:push` after schema changes.

### PDF via Puppeteer
`pdf.service.ts` builds an HTML string, launches a headless Chrome instance, and prints to PDF. This produces pixel-accurate output matching the web layout. The tradeoff is cold-start latency on the first PDF export (~2-3 s).

Puppeteer is installed with `PUPPETEER_SKIP_DOWNLOAD=true` so it does not download a bundled Chromium. At runtime `pdf.service.ts` resolves the Chrome executable from the `CHROME_EXECUTABLE_PATH` env var (check this first), then falls back to well-known Windows and Linux paths. Set `CHROME_EXECUTABLE_PATH` in `backend/.env` when deploying to a custom environment.

---

## API Conventions

Base URL: `http://localhost:5000` (dev) | configured via `NEXT_PUBLIC_API_URL`

All endpoints are prefixed `/api/`.

**Auth header:** `Authorization: Bearer <access_token>`

**Response format (success):**
```json
{ "data": { ... } }
```

**Response format (error):**
```json
{ "error": "Human-readable message" }
```

### Auth endpoints (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Returns access token + sets refresh cookie |
| POST | `/logout` | Yes | Deletes refresh token from DB + clears cookie |
| POST | `/refresh` | Cookie | Issues new access token |

### Generate endpoints (`/api/generate`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Yes | Run pipeline for a problem description |
| GET | `/:id` | Yes | Fetch a generation by ID |
| GET | `/:id/pdf` | Yes | Download PDF of generation |

### History endpoints (`/api/history`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List last 20 generations for current user |
| DELETE | `/:id` | Yes | Delete a generation |

### Health check
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Returns `{ status: "ok" }` |

---

## Database Design

ORM: Prisma | Current provider: SQLite (`dev.db`)

### User
```
id           String   @id @default(cuid())
email        String   @unique
name         String?
passwordHash String
createdAt    DateTime @default(now())
updatedAt    DateTime @updatedAt
```

### Generation
```
id          String   @id @default(cuid())
userId      String                          ← FK → User
input       String                          ← raw problem description
projectName String
output      String                          ← JSON blob (all 6 agent outputs)
pdfUrl      String?
createdAt   DateTime @default(now())
@@index([userId])
```

The `output` field stores the complete serialized result from all 6 agents as a JSON string. Parse it on read.

### RefreshToken
```
id        String   @id @default(cuid())
token     String   @unique
userId    String                        ← FK → User (cascade delete)
expiresAt DateTime
createdAt DateTime @default(now())
@@index([userId])
```

---

## Authentication Flow

```
Register
  POST /api/auth/register { email, password, name }
  → bcrypt hash password (12 rounds)
  → create User in DB
  → return access token + set httpOnly refresh cookie

Login
  POST /api/auth/login { email, password }
  → bcrypt compare
  → create RefreshToken record in DB
  → return access token (15 min) + set httpOnly refresh cookie (7 days)

Authenticated request
  Frontend sends: Authorization: Bearer <access_token>
  auth.middleware.ts verifies JWT → attaches userId to req

Token refresh
  POST /api/auth/refresh (cookie sent automatically)
  → validate refresh token exists in DB and not expired
  → issue new access token

Logout
  POST /api/auth/logout
  → delete RefreshToken from DB
  → clear cookie
```

Frontend stores access token in `localStorage` and attaches it via Axios request interceptor (`src/lib/api.ts`). Next.js `middleware.ts` guards `/dashboard` and `/history` routes, redirecting unauthenticated users to `/auth/login`.

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="file:./dev.db"                     # SQLite for dev
# DATABASE_URL="postgresql://..."                # Supabase for prod
JWT_SECRET="<64-char random string>"
REFRESH_SECRET="<64-char random string>"
OPENROUTER_API_KEY="<from openrouter.ai>"
GEMINI_API_KEY="<optional, from aistudio.google.com>"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CHROME_EXECUTABLE_PATH=""                        # optional; pdf.service.ts auto-detects Chrome if omitted
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Development Setup

```bash
# Backend
cd backend
PUPPETEER_SKIP_DOWNLOAD=true npm install   # skip Chromium download; uses system Chrome
npm run db:generate    # generate Prisma client
npm run db:push        # sync schema to SQLite
npm run dev            # nodemon on port 5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev            # Next.js on port 3000
```

Prisma Studio (DB browser): `cd backend && npm run db:studio`

---

## Current Project Progress

- [x] User authentication (register, login, logout, token refresh)
- [x] 6-agent sequential pipeline (architecture, database, API, cost, security, diagrams)
- [x] Dashboard generation UI
- [x] Mermaid diagram rendering
- [x] Generation history (list + delete)
- [x] PDF export via Puppeteer
- [x] Rate limiting, Helmet security headers
- [x] SQLite dev database with Prisma

---

## Known Issues

- **Puppeteer cold start:** First PDF export per server restart takes 2-3 seconds while Chrome initializes.
- **Puppeteer uses system Chrome:** `PUPPETEER_SKIP_DOWNLOAD=true` was used during install; `pdf.service.ts` auto-detects Chrome via `CHROME_CANDIDATES`. Set `CHROME_EXECUTABLE_PATH` in `.env` for non-standard environments (Docker, CI).
- **Access token in localStorage:** Susceptible to XSS. Consider moving to memory + refresh-cookie-only flow for higher security requirements.
- **Diagram agent prompt inlined:** `diagram.agent.ts` defines its system prompt inline (not in `prompts/`). This is functional but inconsistent with the pattern used by the other 5 agents.
- **Sequential pipeline latency:** 6 agents run one-by-one; total generation time depends on model response speed. No streaming to the client during generation.
- **Login page debug panel:** `auth/login/page.tsx` contains a visible debug panel and hardcoded credential hint. Remove before a public release.
- **No Docker setup:** Local dev requires Node.js and npm installed manually; no containerized dev environment.
- **No CI/CD:** No GitHub Actions or deployment pipeline configured.

---

## Future Roadmap

- [ ] Streaming agent output to the frontend (Server-Sent Events or WebSockets)
- [ ] Deployment pipeline (Docker + CI/CD)
- [ ] Switch to PostgreSQL-first (Supabase) for production
- [ ] Move access token out of localStorage (memory + refresh-cookie pattern)
- [ ] Add `diagram.prompt.ts` and standardize diagram agent
- [ ] Multi-generation comparison view
- [ ] Team / workspace support (multi-user collaboration)
- [ ] Model selection UI (let user pick from available OpenRouter models)
- [ ] Webhook / API key support so external tools can trigger generation
