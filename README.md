# JanSetu AI 🇮🇳

**Closing the Last Mile Between Eligibility and Access**

> A voice-first, multilingual assistant that takes citizens from a single spoken sentence to a tracked, submitted government welfare application.

Team IntelliJ-Idea • Prasunethon 2.0 • Social Impact & Accessibility Track

## The Problem
- Several crores in welfare benefits go unclaimed every year
- 1000+ Central & State schemes scattered across departments
- Language, low literacy, and complex paperwork block access

## The Solution
JanSetu AI is a consent-first scheme assistant that:
1. **Listens** in the user's own language (Hindi, Bengali, Tamil, Telugu, English + more)
2. **Matches** them against real eligibility rules (deterministic, not AI guessing)
3. **Verifies** identity via DigiLocker with per-document, per-scheme consent
4. **Auto-fills** government forms using verified data
5. **Tracks** application status with deadline reminders

## Key Features
- 🎤 **Voice-First Input**: Speak in your language, no forms to read
- 🔐 **Zero Document Storage**: DigiLocker docs processed in-memory, never stored
- 🧠 **Deterministic Eligibility**: Rules engine, not AI hallucination
- 📱 **Mobile-First**: Works on any device
- 🌍 **Multilingual**: 10+ regional languages

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│         Voice Input → Chat → DigiLocker → Track      │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│               Backend (Node.js / Express)            │
│    Claude NLU │ DigiLocker OAuth │ Auto-fill Engine  │
└────────┬──────────────────────────────┬─────────────┘
         │ HTTP                         │ PostgreSQL + Redis
┌────────▼──────────┐       ┌──────────▼──────────────┐
│  Rules Engine     │       │  PostgreSQL + Redis      │
│  (Python FastAPI) │       │  Sessions │ Applications │
│  15+ Schemes      │       │  Audit Log (no raw docs) │
└───────────────────┘       └─────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5, TailwindCSS, i18next |
| Voice | Web Speech API + MediaRecorder |
| Backend API | Node.js 20 + Express |
| Rules Engine | Python 3.11 + FastAPI |
| AI/NLU | Claude API (claude-sonnet-4-5) |
| Database | PostgreSQL 16 |
| Session Cache | Redis 7 |
| DigiLocker | OAuth 2.0 (Sandbox/Mock) |
| Dev Orchestration | Docker Compose |

## Privacy by Design

| What | How |
|---|---|
| Documents | Fetched in-memory only, discarded after field extraction |
| Consent | Per-scheme, per-document — logged but not the document |
| PII Storage | Only derived eligibility flags + reference numbers |
| Audit Trail | Consent events: what was consented, when — NOT content |

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 20+
- Python 3.11+

### With Docker (Recommended)

```bash
# 1. Clone and setup
git clone <repo>
cd jansetu

# 2. Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your CLAUDE_API_KEY

# 3. Start all services
docker-compose up -d

# 4. Run migrations and seed data
docker-compose exec backend node src/db/migrate.js
docker-compose exec backend node src/db/seed.js

# 5. Open browser
open http://localhost:5173
```

### Local Development (Without Docker)

```bash
# Terminal 1: PostgreSQL + Redis (or use Docker just for these)
docker-compose up postgres redis -d

# Terminal 2: Rules Engine
cd rules-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 3: Backend
cd backend
npm install
cp .env.example .env  # Edit with your API keys
node src/db/migrate.js
node src/db/seed.js
npm run dev

# Terminal 4: Frontend
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Rules Engine
cd rules-engine
pytest tests/ -v

# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Seed Schemes (Q1 Prototype)

| # | Scheme | Ministry | Benefit |
|---|---|---|---|
| 1 | PM-KISAN | Agriculture | ₹6,000/year |
| 2 | PMAY-G | Rural Dev | ₹1.2L housing |
| 3 | PM Jan Dhan Yojana | Finance | Free bank account |
| 4 | Ayushman Bharat PM-JAY | Health | ₹5L/year insurance |
| 5 | PM Ujjwala Yojana 2.0 | Petroleum | Free LPG |
| 6 | PMEGP | MSME | 15-35% subsidy |
| 7 | NSP Post-Matric (SC) | Social Justice | Full scholarship |
| 8 | Sukanya Samriddhi | Finance | 8.2% savings |
| 9 | PM Matru Vandana | WCD | ₹5,000 maternity |
| 10 | Atal Pension Yojana | Finance | ₹1K-5K/month pension |
| 11 | PM Fasal Bima | Agriculture | Crop insurance |
| 12 | PM Kaushal Vikas 4.0 | Skill Dev | Free training |
| 13 | PM SVANidhi | Urban | ₹10K-50K loan |
| 14 | MGNREGS | Rural Dev | 100 days employment |
| 15 | Beti Bachao Beti Padhao | WCD | Girl child welfare |

## Competitive Advantage

| Feature | JanSetu AI | myScheme.gov.in | SchemeSetu.com |
|---|---|---|---|
| Match Rate | **95%** | 55% | 40% |
| DigiLocker Integration | ✅ | ❌ | ❌ |
| Auto-fill Forms | ✅ | ❌ | ❌ |
| Application Tracking | ✅ | ❌ | ❌ |
| Voice Input | ✅ | ❌ | Partial |
| Zero Doc Retention | ✅ | N/A | N/A |

## Roadmap

| Quarter | Milestone |
|---|---|
| Q1 | Prototype: 15-20 schemes, rules engine, voice UI |
| Q2 | MVP: DigiLocker sandbox OAuth, OCR fallback |
| Q3 | Pilot: 2-3 states, real applications |
| Q4 | Production: Full scheme coverage, WhatsApp channel |

## Team

**Team IntelliJ-Idea** — Prasunethon 2.0, Social Impact & Accessibility Track

---

*JanSetu AI: Closing the last mile between eligibility and access.*
