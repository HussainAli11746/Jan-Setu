# JanSetu AI 🇮🇳
### *AI-Powered Citizen Access to Government Welfare Schemes*

> **JanSetu AI** is a voice-first, multilingual, consent-driven civic platform that bridges the gap between Indian citizens and government welfare schemes. Powered by **Google Gemini 2.5 Flash**, MongoDB Atlas, and a deterministic eligibility engine, it takes a citizen from a single spoken query to personalized scheme matching, deep-dive criteria verification, bookmarked schemes management, and step-by-step application guidance.

---

## 🌟 Key Features & Capabilities

- 🤖 **Google Gemini 2.5 Flash Intelligence**: State-of-the-art conversational engine providing instant, domain-accurate welfare scheme discovery with multi-turn conversation history and demographic profile context injection.
- 🎙️ **Voice-First & Multilingual Interaction**: Speak or type naturally in 5 languages (**English, हिन्दी, বাংলা, தமிழ், తెలుగు**). Real-time speech-to-text recognition with automatic interface and greeting synchronization.
- 🔖 **Saved Schemes & Bookmarks Manager**:
  - Save schemes with one click directly from AI chat cards, deep dive modals, or the catalog directory.
  - Dedicated **Saved Schemes** tab on citizen profile (`/profile?tab=saved`) and top navbar badge with live bookmark count.
  - Cloud persistence in MongoDB Atlas + optimistic local storage caching for offline accessibility.
- 📖 **Deep Dive Scheme Intelligence**: Instant modal view for any scheme detailing:
  - Exact eligibility criteria & age/income qualification bars
  - Required documents checklist
  - Financial & social benefits
  - Direct link to official government portal
- 📐 **Modern, Balanced Grid UI**: Clean 2-column responsive layout without horizontal scrolling clutter, with responsive actions and clear typography.
- 👤 **Citizen Demographic Profile & Onboarding**: Match schemes based on state of residence, age bracket, gender, annual income, occupation, and employment category.
- 📊 **Application Tracking Dashboard**: Track submitted applications through departmental review, document verification, and final DBT disbursement status.
- 🔐 **Privacy-First & Secure**: Consent-driven processing with JWT authentication and secure credential hashing with zero raw identity document retention.

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │            Frontend (React 18)          │
                                  │   Vite 5 · TailwindCSS · i18next (5 Lang)│
                                  │   Voice Input · Chat · Schemes · Profile│
                                  └────────────────────┬────────────────────┘
                                                       │ REST API / JSON
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │      Node.js / Express API Gateway      │
                                  │  Gemini 2.5 Flash · JWT Auth · Profiles │
                                  └───────────────┬─────────────────┬───────┘
                                                  │                 │
                           ┌──────────────────────▼──────┐   ┌──────▼──────────────────────┐
                           │    Google Gemini 2.5 Flash  │   │      MongoDB Atlas Cloud    │
                           │   Prompt & Context Pipeline │   │   Users · Profiles · Bookmarks│
                           │  Domain Dataset Aggregation │   │   Applications · Audit Logs  │
                           └─────────────────────────────┘   └──────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **AI / NLU** | Google Gemini 2.5 Flash (`@google/generative-ai`) | Real-time generative scheme recommendation and structured JSON responses |
| **Frontend** | React 18, Vite 5, TailwindCSS, Lucide React | Modern responsive UI with accessible typography & dark-accent aesthetics |
| **Localization** | `i18next`, `react-i18next`, Browser Language Detector | Full translation support across 5 Indian languages |
| **Voice / Audio** | Web Speech API | Real-time speech-to-text recognition with regional locale mappings |
| **Backend API** | Node.js 20, Express, CORS, dotenv | Resilient RESTful API gateway with token-based authentication |
| **Database** | MongoDB Atlas (Mongoose ODM) | Cloud database for user accounts, demographic profiles, and saved schemes |
| **State & Storage** | React Context API, LocalStorage | Optimistic state updates and session persistence |

---

## 📋 Sample Welfare Schemes Supported

| Category | Scheme | Ministry | Core Benefit |
|---|---|---|---|
| 🌾 **Agriculture** | **PM-KISAN** | Agriculture & Farmers Welfare | ₹6,000 / year direct income support |
| 🌾 **Agriculture** | **PMFBY** | Agriculture & Farmers Welfare | Comprehensive seasonal crop insurance |
| 🎓 **Education** | **National Scholarship Portal (NSP)** | Electronics & IT / Education | Central & state scholarship disbursements |
| 🎓 **Education** | **Central Sector Interest Subsidy** | Education | Full interest subsidy on higher education loans |
| 🎓 **Education** | **Post-Matric Scholarship (SC/OBC)** | Social Justice & Empowerment | Full academic tuition and maintenance allowance |
| 🏠 **Housing** | **PMAY-G / PMAY-U** | Rural Development / Urban Affairs | Financial assistance for pucca housing (up to ₹1.3L – ₹2.5L) |
| 🏥 **Health** | **Ayushman Bharat (PM-JAY)** | Health & Family Welfare | ₹5,00,000 / year secondary & tertiary health cover |
| 💼 **Business** | **PM SVANidhi** | Housing & Urban Affairs | ₹10,000 – ₹50,000 working capital micro-credit |
| ⚡ **Skills** | **PMKVY 4.0** | Skill Development & Entrepreneurship | Free skill certification & stipend training |
| 🛡️ **Social** | **Atal Pension Yojana (APY)** | Finance | Guaranteed monthly pension of ₹1,000 – ₹5,000 post age 60 |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [Git](https://git-scm.com/)
- [Gemini API Key](https://aistudio.google.com/)
- [MongoDB Atlas Account](https://www.mongodb.com/atlas) (or local MongoDB)

---

### Setup Instructions

#### 1. Clone the repository
```bash
git clone https://github.com/HussainAli11746/Jan-Setu.git
cd Jan-Setu
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with your credentials:
# PORT=3001
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.ehyemo8.mongodb.net/jansetu
# JWT_SECRET=your_secret_key
# GEMINI_API_KEY=your_gemini_api_key

npm run dev
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start the Vite development server
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 📁 Directory Structure

```
Jan-Setu/
├── backend/                  # Node.js Express Backend API
│   ├── src/
│   │   ├── middleware/       # JWT Auth verification
│   │   ├── models/           # Mongoose User & SavedSchemes models
│   │   ├── routes/           # Auth, Chat (Gemini), Schemes, Applications
│   │   └── services/         # Gemini 2.5 Flash service & prompt builders
│   └── package.json
├── frontend/                 # React 18 + Vite Web App
│   ├── src/
│   │   ├── components/       # Chat, DeepDiveModal, SchemeCard, Navbar, Modals
│   │   ├── context/          # AuthContext (Auth, Profile, Saved Schemes)
│   │   ├── i18n/             # Multi-language locale files (en, hi, bn, ta, te)
│   │   ├── pages/            # Home, Assistant, Profile, SchemesPage, Applications
│   │   └── services/         # API connectors & storage utilities
│   └── index.html
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
