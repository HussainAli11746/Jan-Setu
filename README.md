# JanSetu AI 🇮🇳
### *AI-Powered Citizen Access to Government Welfare Schemes*

> **JanSetu AI** is a voice-first, multilingual, consent-driven civic platform that bridges the gap between Indian citizens and government welfare schemes. Powered by **Google Gemini 2.5 Flash**, MongoDB Atlas, and a deterministic eligibility engine, it takes a citizen from a single spoken query to personalized scheme matching, deep-dive criteria verification, bookmarked schemes management, and direct official portal application guidance.

---

## 🌟 Key Features & Capabilities

- 🤖 **Google Gemini 2.5 Flash Intelligence**: State-of-the-art conversational engine providing instant, domain-accurate welfare scheme discovery with multi-turn conversation history, intent detection, and demographic profile context injection.
- 🎙️ **Voice-First & Multilingual Interaction**: Speak or type naturally in 5 languages (**English, हिन्दी, বাংলা, தமிழ், తెలుగు**). Real-time speech-to-text recognition with automatic interface translation and greeting synchronization.
- 🎯 **Interactive Matched Schemes Hub**:
  - Dedicated **Matched Schemes** view on citizen profile (`/profile?tab=matched`) showcasing curated schemes tailored to user demographics (state, age, income bracket, occupation).
  - Hoverable, interactive stat cards with match confidence scores (e.g., `98% Match`) and match reasons.
- 🔖 **Saved Schemes & Bookmarks Manager**:
  - Save schemes with one click directly from AI chat cards, deep-dive modals, or the catalog directory.
  - Dedicated **Saved Schemes** tab on citizen profile (`/profile?tab=saved`) and top navbar badge with live bookmark count.
  - Cloud persistence in MongoDB Atlas + optimistic local storage caching for offline accessibility.
- 📖 **Deep Dive Scheme Intelligence**: Instant modal view for any scheme detailing:
  - Exact eligibility criteria & age/income qualification bars
  - Pre-verified required documents checklist
  - Financial & social benefit breakdowns
  - Verified direct links to official government application portals
- 🔗 **Verified Direct Government Application Portals**:
  - All scheme application links are updated to official live portals (e.g. Ayushman Bharat Beneficiary Portal, Skill India Digital Hub, UdyamiMitra, JanSuraksha, PMAY Urban).
- 📐 **Modern, Balanced Grid UI**: Clean 2-column responsive layout without horizontal scrolling clutter, with responsive action buttons and elegant typography.
- 👤 **Citizen Demographic Profile**: Dynamic eligibility matching based on state of residence, age category, gender, annual income bracket, primary occupation, and employment status.
- 📊 **Application Tracking Dashboard**: Track submitted applications through departmental review, document verification, and final DBT disbursement status.
- 🔐 **Privacy-First & Secure**: Consent-driven processing with JWT authentication and secure credential hashing with zero raw identity document retention.
- 🤖 **Apply Assist Co-Pilot** *(Chrome Extension)*: When a citizen clicks "Apply Now", the JanSetu Chrome extension auto-appears on the government portal. One click captures a screenshot, sends it to Gemini 2.5 Flash Vision, and returns a plain-language explanation of the current form section, which documents are needed at that exact step, and what to do next — spoken aloud in the citizen's language via `speechSynthesis`.

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
                                  │  /api/chat · /api/schemes · /api/copilot│
                                  └───────────────┬─────────────────┬───────┘
                                                  │                 │
                           ┌──────────────────────▼──────┐   ┌──────▼──────────────────────┐
                           │    Google Gemini 2.5 Flash  │   │      MongoDB Atlas Cloud    │
                           │   Text + Vision Multimodal  │   │   Users · Profiles · Schemes│
                           │  Domain Dataset Aggregation │   │   Bookmarks · Matched Schemes│
                           └─────────────────────────────┘   └──────────────────────────────┘
                                        ▲
                           ┌────────────┴────────────────┐
                           │  Chrome Extension (MV3)     │
                           │  JanSetu Apply Assist       │
                           │  Screenshot → Vision → Panel│
                           └─────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **AI / NLU** | Google Gemini 2.5 Flash (`@google/generative-ai`) | Real-time generative scheme recommendation, structured JSON responses, and vision-based form analysis |
| **Frontend** | React 18, Vite 5, TailwindCSS, Lucide React | Modern responsive UI with accessible typography & clean aesthetics |
| **Localization** | `i18next`, `react-i18next`, Browser Language Detector | Full translation support across 5 Indian languages |
| **Voice / Audio** | Web Speech API, `speechSynthesis` | Real-time speech-to-text + text-to-speech for form guidance |
| **Backend API** | Node.js 20, Express, CORS, dotenv | Resilient RESTful API gateway with token-based authentication |
| **Database** | MongoDB Atlas (Mongoose ODM) | Cloud database for user accounts, demographic profiles, and saved schemes |
| **State & Storage** | React Context API, LocalStorage | Optimistic state updates and session persistence |
| **Chrome Extension** | Manifest V3, `chrome.storage.session`, `captureVisibleTab` | Apply Assist Co-Pilot: screenshot → Gemini Vision → plain-language floating panel |

---

## 📋 Sample Welfare Schemes Supported

| Category | Scheme | Ministry | Official Portal Link |
|---|---|---|---|
| 🌾 **Agriculture** | **PM-KISAN** | Agriculture & Farmers Welfare | [pmkisan.gov.in](https://pmkisan.gov.in) |
| 🌾 **Agriculture** | **PMFBY** | Agriculture & Farmers Welfare | [pmfby.gov.in](https://pmfby.gov.in) |
| 🌾 **Agriculture** | **Kisan Credit Card (KCC)** | Agriculture & Farmers Welfare | [myscheme.gov.in](https://www.myscheme.gov.in/schemes/kcc) |
| 🏠 **Housing** | **PMAY-G / PMAY-U** | Rural Development / Urban Affairs | [pmayg.nic.in](https://pmayg.nic.in) / [pmay-urban.gov.in](https://pmay-urban.gov.in) |
| 🏥 **Health** | **Ayushman Bharat (PM-JAY)** | Health & Family Welfare | [beneficiary.nha.gov.in](https://beneficiary.nha.gov.in) |
| 🏥 **Health** | **PM Suraksha Bima Yojana** | Finance | [jansuraksha.gov.in](https://www.jansuraksha.gov.in) |
| 💼 **Business** | **PM SVANidhi** | Housing & Urban Affairs | [pmsvanidhi.mohua.gov.in](https://pmsvanidhi.mohua.gov.in) |
| 💼 **Business** | **Pradhan Mantri MUDRA Yojana** | Finance | [udyamimitra.in](https://www.udyamimitra.in) |
| ⚡ **Skills** | **PMKVY 4.0** | Skill Development & Entrepreneurship | [skillindiadigital.gov.in](https://www.skillindiadigital.gov.in) |
| ⚡ **Skills** | **PM Vishwakarma** | MSME | [pmvishwakarma.gov.in](https://pmvishwakarma.gov.in) |
| 🎓 **Education** | **Post-Matric Scholarship (SC)** | Social Justice & Empowerment | [scholarships.gov.in](https://scholarships.gov.in) |
| 🎓 **Education** | **PM POSHAN Scheme** | Education | [pmposhan.education.gov.in](https://pmposhan.education.gov.in/index.html) |
| 🛡️ **Social** | **Atal Pension Yojana (APY)** | Finance / PFRDA | [npscra.nsdl.co.in](https://www.npscra.nsdl.co.in/scheme-details.php) |

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
├── rules-engine/             # Eligibility criteria rules engine definitions
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
