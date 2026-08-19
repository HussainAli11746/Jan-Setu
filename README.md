# JanSetu AI 🇮🇳
### *Empowering Citizen Access to Government Welfare Schemes*

> **JanSetu AI** is a voice-first, multilingual, consent-driven civic platform that bridges the gap between Indian citizens and government welfare schemes. It takes a citizen from a single spoken sentence to a tracked, verified application with zero document retention.

---

## 🌟 Key Highlights & Features

- 🎙️ **Voice-First & Multilingual Interaction**: Speak or type naturally in 5 languages (**English, हिन्दी, বাংলা, தமிழ், తెలుగు**). Powered by the Web Speech API with real-time intent extraction.
- 🎯 **Dynamic Scheme-Dependent Dialog**: The AI only asks for information required by relevant schemes (e.g., land details for farmers, academic category for students, dwelling type for housing assistance).
- ⚡ **Deterministic Rules Engine**: High-accuracy eligibility matching backed by a Python FastAPI rules evaluator with built-in resilient in-memory fallbacks.
- 🔐 **Privacy-First (DigiLocker Integration)**: Consent-driven Aadhaar and land record authentication. Zero raw document storage—data is processed in-memory and discarded.
- 📝 **Live Profile Confirmation & In-line Editing**: Citizens review extracted details on clean information tiles with inline edit support before matching schemes.
- 📊 **End-to-End Tracking Dashboard**: Real-time status timeline for submitted applications from department review to DBT disbursement.

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │            Frontend (React 18)          │
                                  │   Vite 5 · TailwindCSS · i18next (5 Lang)│
                                  │   Voice Input · Chat · Schemes · Apply   │
                                  └────────────────────┬────────────────────┘
                                                       │ REST API / JSON
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │      Node.js / Express API Gateway      │
                                  │   NLP Entity Extraction · Auth · Proxy  │
                                  └───────────────┬─────────────────┬───────┘
                                                  │                 │
                           ┌──────────────────────▼──────┐   ┌──────▼──────────────────────┐
                           │   FastAPI Rules Engine      │   │     PostgreSQL 16 + Redis    │
                           │   Deterministic Evaluation  │   │  Sessions · Schemes Catalog  │
                           │   15+ Central/State Schemes │   │  Audit Logs (Zero Raw Docs)  │
                           └─────────────────────────────┘   └──────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite 5, TailwindCSS, Lucide React | Modern, responsive UI with accessible typography & dark-accent aesthetics |
| **Localization** | `i18next`, `react-i18next`, Browser Language Detector | Full translation support across 5 Indian languages |
| **Voice / Audio** | Web Speech API | Real-time speech-to-text recognition |
| **Backend** | Node.js 20, Express, `pg`, `ioredis` | Resilient RESTful API gateway with automated failover |
| **Rules Engine** | Python 3.11, FastAPI, Pydantic | Scheme qualification & eligibility calculation microservice |
| **Database** | PostgreSQL 16 | Relational store for schemes, application tracking & consent audits |
| **Caching** | Redis 7 | Ephemeral session tokens & rate-limiting |
| **Orchestration** | Docker & Docker Compose | Multi-container setup for seamless local & cloud deployment |

---

## 📋 Welfare Schemes Supported (Catalog)

| # | Scheme | Ministry | Core Benefit |
|---|---|---|---|
| 1 | **PM-KISAN** | Agriculture & Farmers Welfare | ₹6,000 / year direct income support |
| 2 | **PMAY-G** | Rural Development | Financial assistance for pucca housing (up to ₹1.3L) |
| 3 | **PMFBY** | Agriculture & Farmers Welfare | Comprehensive seasonal crop insurance |
| 4 | **PM SVANidhi** | Housing & Urban Affairs | ₹10,000 – ₹50,000 working capital credit for vendors |
| 5 | **Post-Matric Scholarship (SC/OBC)** | Social Justice & Empowerment | Full academic fee allowance for higher education |
| 6 | **Ayushman Bharat (PM-JAY)** | Health & Family Welfare | ₹5,00,000 / year secondary & tertiary health cover |
| 7 | **MGNREGS** | Rural Development | 100 days guaranteed wage employment |
| 8 | **PMKVY 4.0** | Skill Development & Entrepreneurship | Free skill certification & training programs |
| 9 | **PMMVY** | Women & Child Development | ₹5,000 maternity support for first child |
| 10 | **Atal Pension Yojana (APY)** | Finance | Guaranteed monthly pension of ₹1,000 – ₹5,000 post age 60 |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [Python](https://www.python.org/) (v3.10 or v3.11+)
- [Git](https://git-scm.com/)

---

### Option A: Running with Docker (Recommended)

```bash
# 1. Clone repository
git clone <YOUR_REPOSITORY_URL>
cd Jan-Setu

# 2. Configure environment variables
cp backend/.env.example backend/.env

# 3. Start all services
docker-compose up -d

# 4. Migrate database schema and seed schemes
docker-compose exec backend node src/db/migrate.js
docker-compose exec backend node src/db/seed.js

# 5. Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
# Rules Engine Docs: http://localhost:8000/docs
```

---

### Option B: Local Setup (Standalone Mode)

#### 1. Rules Engine (FastAPI)
```bash
cd rules-engine
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Backend (Node.js & Express)
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🔒 Privacy & Consent Architecture

- **No Permanent PII Storage**: Government identity proofs (Aadhaar, Land Records) processed through DigiLocker are authenticated in-memory and immediately discarded.
- **Granular Consent**: Clear user consent is captured before sharing data with respective departmental endpoints.
- **Auditable History**: Stores only timestamps, reference numbers, and anonymized eligibility scores.

---

## 📁 Project Structure

```
Jan-Setu/
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── db/               # PostgreSQL migrations & seed data
│   │   ├── routes/           # Chat, Schemes, DigiLocker & Applications routes
│   │   └── services/         # Claude NLU & Rules engine connectors
│   └── .env.example
├── frontend/                 # React 18 + Vite Web App
│   ├── src/
│   │   ├── components/       # Layout, Navbar, Footer, Modals
│   │   ├── i18n/             # Multi-language locale bundles (en, hi, bn, ta, te)
│   │   ├── pages/            # Assistant, Schemes, Apply, Status Dashboard
│   │   └── services/         # API clients & client-side state store
│   └── index.html
├── rules-engine/             # Python FastAPI Microservice
│   ├── app/                  # Evaluation rules & scheme predicates
│   ├── tests/                # Scheme evaluation test suites
│   └── requirements.txt
├── docker-compose.yml        # Docker composition
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
