# CivicResolve – AI-Powered Citizen Grievance Management and Resolution

[![PromptWars × GDG on Campus Hackathon](https://img.shields.io/badge/GDG%20on%20Campus-PromptWars%20Hackathon-0D9488?style=for-the-badge&logo=google)](https://gdg.community.dev/)
[![Google Gemini API](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%201.5%20Flash-4285F4?style=for-the-badge&logo=google-gemini)](https://aistudio.google.com/)
[![React 18 + Vite](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react)](https://vitejs.dev/)
[![Node.js + Express](https://img.shields.io/badge/Backend-Express.js%20%7C%20TypeScript-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Leaflet GIS](https://img.shields.io/badge/Mapping-Leaflet%20%2B%20OpenStreetMap-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

**CivicResolve** is a production-grade, full-stack civic technology web application built for the **PromptWars × GDG on Campus Hackathon**. It transforms how citizens report public grievances (potholes, water leaks, garbage heaps, broken streetlights, clogged drains) and how municipal authorities triage, prioritize, and resolve them using **Google Gemini AI**.

---

## 🌟 Key Highlights & Innovations

1. **Google Gemini AI Triage Engine**:
   - Generates a 1–2 sentence executive summary of each citizen report.
   - Categorizes and classifies the technical issue.
   - Assigns priority (`Low`, `Medium`, `High`, `Critical`) with explicit reasoning.
   - **Smart Routing**: Directs complaints to the responsible municipal department:
     - *Potholes / Damaged Roads* ➔ **Road Maintenance Department**
     - *Overflowing Garbage* ➔ **Sanitation Department**
     - *Water Leakage / Pipe Bursts* ➔ **Water Supply Department**
     - *Broken Streetlights / Wiring* ➔ **Electrical Department**
     - *Drainage Blockages / Flooding* ➔ **Drainage Department**
     - *Public Infrastructure* ➔ **Public Works Department**
   - Suggests immediate field response actions for ground teams.

2. **Live Duplicate Complaint Detection**:
   - Compares incoming complaints in real-time against existing reports using **Jaccard keyword similarity** and **Haversine geo-distance calculation**.
   - If a similar issue is reported within proximity (e.g. ~500m), citizens receive an instant warning with the option to **Upvote the Existing Issue** (preventing ticket bloat) or submit anyway.

3. **5-Stage Visual Progress Timeline**:
   - Citizens track their **Unique Complaint ID** (`CR-2026-XXXX`) with full visibility:
     `Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`
   - Complete audit trail with timestamps and official resolution notes from field engineers.

4. **Municipal Administration Command Center (`/admin`)**:
   - **Pre-filled Demo Login**: One-click login for hackathon judges (`admin@civicresolve.gov` / `admin123`).
   - **Dynamic KPI Cards**: Total Complaints, Pending Action, Resolved, and High/Critical Count.
   - **Interactive Analytics (Recharts)**: Category & Resolution bar charts and Priority distribution pie charts.
   - **Geographical Hotspots Map (Leaflet)**: Color-coded priority pins (`Critical`=Red, `High`=Orange, `Medium`=Yellow, `Low`=Green) with interactive popups.
   - **Live Dispatch Management Table**: Filter by Status, Priority, Department, or keyword search; inline controls to reassign department, transition status stages, and add resolution notes.

5. **AI Civic Copilot Assistant Drawer**:
   - Built-in AI assistant for administrators and citizens to answer natural-language queries (e.g., *"Summarize today's critical road issues"*, *"Draft a status update for CR-2026-1001"*, *"Which department has the most pending grievances?"*).

6. **Bilingual Support (English & தமிழ்)**:
   - Header language toggle (**EN | தமிழ்**) provides 100% complete UI translation across the Landing Page, Complaint Form, Tracker, and Admin Dashboard.

7. **Resilient Demo Mode (Zero-Crash Architecture)**:
   - If `GEMINI_API_KEY` or Firebase credentials are not provided or invalid, the platform automatically activates **Demo Mode**.
   - Pre-seeded with realistic civic data (Chennai & Metro coordinates).
   - Features an intelligent deterministic/heuristic AI analyzer matching Gemini's exact JSON schema.
   - Seamlessly transitions to live Google Gemini 1.5 Flash when `GEMINI_API_KEY` is added to `.env`.

---

## 🏛️ Monorepo Architecture

```
hackthon project/
├── .env.example                 # Root environment configuration template
├── package.json                 # Monorepo orchestration scripts
├── test-workflow.js             # Automated 10-step hackathon workflow test script
│
├── server/                      # Express.js + TypeScript Backend
│   ├── .env.example             # Server-specific env variables template
│   ├── package.json
│   ├── tsconfig.json
│   ├── uploads/                 # Storage for citizen photo evidence
│   └── src/
│       ├── index.ts             # Express server setup, CORS, health & demo status
│       ├── config.ts            # Environment loader & demo mode detection
│       ├── types.ts             # Shared TypeScript models (Complaint, AIAnalysis, etc.)
│       ├── routes/
│       │   ├── complaints.ts    # POST /api/complaints, GET, PATCH, upvote
│       │   ├── ai.ts            # POST /api/ai/check-duplicate, POST /api/ai/assistant
│       │   └── analytics.ts     # GET /api/analytics
│       └── services/
│           ├── gemini.ts        # Google Gemini 1.5 Flash + Resilient Heuristic Fallback
│           ├── store.ts         # Firebase Firestore + In-Memory Pre-seeded Store
│           └── duplicateDetector.ts # Haversine geo-distance + NLP Jaccard matcher
│
└── client/                      # React 18 + Vite + Tailwind CSS Frontend
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx              # Multi-page tab routing & layout orchestration
        ├── index.css            # Tailwind & Leaflet styles
        ├── context/
        │   └── LanguageContext.tsx # Bilingual EN / தமிழ் state provider
        ├── i18n/
        │   └── translations.ts  # Full English and Tamil translation dictionaries
        ├── types/               # Frontend TypeScript interfaces
        ├── services/
        │   └── api.ts           # Centralized backend API client
        ├── components/
        │   ├── Logo.tsx         # Custom SVG Shield + Pin + AI Spark motif
        │   ├── Navbar.tsx       # Header with tabs, language switch & AI Assistant trigger
        │   ├── Footer.tsx       # CivicResolve branding & hackathon attribution
        │   ├── DemoBanner.tsx   # Prominent civic-tech prototype disclaimer
        │   ├── Timeline.tsx     # 5-stage visual progress timeline & audit log
        │   ├── AIAnalysisCard.tsx # Polished Gemini AI triage card & 1-click copy ID
        │   ├── DuplicateWarningModal.tsx # Proximity duplicate warning & upvote prompt
        │   ├── MapPicker.tsx    # Leaflet interactive map picker with marker drop
        │   ├── MapViewer.tsx    # Leaflet multi-pin priority hotspot visualization
        │   └── AIAssistantDrawer.tsx # Slide-out Gemini AI assistant drawer
        └── pages/
            ├── LandingPage.tsx  # Hero ("Your City. Your Voice. Your Solution."), stats, how it works
            ├── ReportPage.tsx   # Complaint submission form + Leaflet map + AI triage card
            ├── TrackPage.tsx    # Search by Complaint ID, 5-stage timeline, sample IDs
            └── AdminPage.tsx    # Admin login, KPIs, Recharts, Leaflet map, management table
```

---

## ⚡ Quick Start & Local Run

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Installation
Clone or navigate to the project directory and install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration (Optional for Live Gemini)
The application works **immediately out-of-the-box in Resilient Demo Mode** without any API keys.

To enable live Google Gemini AI and Firebase Firestore:
1. Copy `.env.example` to `server/.env`:
   ```bash
   cp .env.example server/.env
   ```
2. Open `server/.env` and insert your [Google AI Studio API Key](https://aistudio.google.com/):
   ```env
   PORT=5000
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional for production Firestore (leave blank for in-memory store)
   FIREBASE_PROJECT_ID=
   FIREBASE_CLIENT_EMAIL=
   FIREBASE_PRIVATE_KEY=
   ```

### 3. Run the Application
In two separate terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client will run on http://localhost:3000
```

Open your browser and navigate to: **`http://localhost:3000`**

---

## 🏆 Required 10-Step Hackathon Demo Workflow

You can verify the entire end-to-end lifecycle in the browser or via our automated test suite:

| Step # | Action | How to Test in CivicResolve |
|---|---|---|
| **Step 1** | **Citizen reports a pothole** | Go to **Report Issue**, enter title: *"Severe pothole cluster near Anna Flyover junction"*, click on the map to drop a pin. |
| **Step 2** | **Gemini AI analyzes complaint** | Click **Submit Grievance & Run AI Triage**. |
| **Step 3** | **AI identifies road issue** | The **AI Analysis Card** classifies it as *Road Infrastructure Hazard*. |
| **Step 4** | **AI assigns High priority** | The card displays **High Priority** with reasoning explaining the risk to two-wheelers. |
| **Step 5** | **AI routes to department** | The card recommends **Road Maintenance Department** with immediate action to deploy asphalt crew. |
| **Step 6** | **Unique ID generated** | A unique ID like `CR-2026-1006` is generated with a 1-click **Copy ID** button. |
| **Step 7** | **Admin reviews complaint** | Go to **Admin Portal**, log in (`admin@civicresolve.gov` / `admin123`), and view the grievance in the table and Leaflet map. |
| **Step 8** | **Admin updates status** | Click the **Edit (pencil)** button next to the complaint, update status from `Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` and add field resolution notes. |
| **Step 9** | **Citizen tracks complaint** | Go to **Track Complaint**, enter the Unique Complaint ID (or click on the quick-fill chip). |
| **Step 10** | **Citizen sees Resolved timeline** | The 5-stage timeline highlights **Resolved** in emerald green with full timestamped audit logs and official notes. |

### Running the Automated Workflow Test:
We have included a dedicated automated test script that verifies this exact 10-step flow via HTTP:
```bash
# With server running on port 5000:
node test-workflow.js
```
Output:
```
====================================================
✅ ALL 10 STEPS OF THE HACKATHON WORKFLOW PASSED 100%!
====================================================
```

---

## 🔐 Demo Admin Credentials

For judges and evaluators to test administrative capabilities without signup friction:
- **Email:** `admin@civicresolve.gov`
- **Password:** `admin123`

*(These credentials are also clearly displayed on the login card itself in the UI).*

---

## 🌐 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | System health, version, and Demo Mode status |
| `/api/complaints` | `GET` | List complaints with query filters (`status`, `priority`, `department`, `search`) |
| `/api/complaints/:id` | `GET` | Fetch single complaint by Unique ID |
| `/api/complaints` | `POST` | Submit new grievance with multipart image upload + Gemini AI triage |
| `/api/complaints/:id` | `PATCH` | Update status, department, priority, or resolution notes |
| `/api/complaints/:id/upvote`| `POST` | Upvote an existing complaint |
| `/api/ai/check-duplicate` | `POST` | Pre-submission geo-distance & keyword similarity duplicate check |
| `/api/ai/assistant` | `POST` | AI Copilot queries, summarization, and drafting status updates |
| `/api/analytics` | `GET` | Dynamic KPIs, category, status, and priority distributions |

---

## 🛡️ Security Best Practices
- **Server-Side API Key Storage**: Gemini API keys and Firebase Admin credentials are kept strictly on the backend (`server/.env`).
- **No Bundle Leakage**: No secret tokens or keys are exposed in the client-side JavaScript bundle.
- **Graceful Fallbacks**: Missing or blocked network calls never crash the server; resilient fallbacks maintain 100% operational uptime.

---

## 👥 Credits
Built with ❤️ for **PromptWars × GDG on Campus Hackathon**.
- **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, Google Gemini API, Leaflet, OpenStreetMap, Recharts, Express.js.
