# DawaCard Lite — Portable Health Summary & AI Prescription Reader

> **Live Deployment:** [https://dawa-card-lite.vercel.app](https://dawa-card-lite.vercel.app)  
> **Version:** 1.0 — Production MVP  
> **Core Principle:** AI-assisted, human-verified, clinical safety, cloud sync, bilingual (English & Urdu).

DawaCard Lite is an intelligent, patient-centric personal medication record, AI prescription reader, and emergency health card web application.

---

## Key Features

- **Local-First Storage:** All medication, allergy, and patient profile records are stored locally in your browser using IndexedDB. No account or cloud database required.
- **Medication Management:** Add, edit, filter, search, discontinue, and track prescription instructions, doses, routes, and frequencies.
- **Explicit Allergy Status:** Maintains three distinct states:
  1. *Known Allergies Recorded*
  2. *No Known Allergies (NKA)* explicitly reported
  3. *Allergy Status Unknown / Not Yet Recorded*
- **Cloud Authentication (Supabase):** Optional email/password sign-in and account registration powered by Supabase with persistent sessions.
- **Offline Emergency QR Pass:** Compact QR pass encoding vital emergency payload with branded center logo for instant scan-to-view access without internet.
- **4-Box Visual Daily Pill Schedule Grid:** Intuitive Morning, Afternoon, Evening, Bedtime categorization for daily dose adherence.
- **AI Prescription Reader (Optional):** Upload prescription photos (JPEG, PNG, WebP) for structured field extraction via Google Gemini AI through a secure backend proxy.
- **Mandatory Human Verification:** Every AI-extracted candidate field must be reviewed, edited, and confirmed by the user before saving.
- **Printable Health Summary:** One-page A4 print layout with print-to-PDF formatting, high-contrast tables, and no navigation controls in print mode.
- **JSON Export & Import:** Backup your data to a local `.json` file and restore it on any device.

---

## System Architecture

```text
+-------------------------------------------------------------+
|                 DawaCard Lite (React + Vite)                |
|                                                             |
|  +-------------------+  +------------------+  +----------+  |
|  | Medication Record |  | Allergy Record   |  | Patient  |  |
|  +---------+---------+  +--------+---------+  +----+-----+  |
|            |                     |                 |        |
|            +----------+----------+-----------------+        |
|                       |                                     |
|             IndexedDB Local Storage (Browser)               |
+-----------------------+-------------------------------------+
                        |
            (Optional AI Image Scan)
                        |
                        v
+-------------------------------------------------------------+
|        Backend Proxy Server (Node.js Express :3001)         |
|  - Holds GEMINI_API_KEY securely                            |
|  - Enforces JSON Schema & Safety Rules                      |
|  - Calls Google Gemini 1.5 / 2.5 Flash Vision Model         |
+-------------------------------------------------------------+
```

---

## Quick Start / Local Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional for AI)

Copy the placeholder `.env.example` file:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

If you wish to enable Gemini AI prescription scanning, set your `GEMINI_API_KEY` in `backend/.env`:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

*Note: If the backend or API key is not configured, DawaCard Lite operates smoothly with 100% manual entry capability.*

### 3. Run Development Servers

**Run Frontend:**

```bash
npm run dev
```

**Run Backend Proxy Server (in another terminal):**

```bash
npm run backend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running Tests

Execute unit and integration tests using Vitest:

```bash
npm test
```

---

## Privacy & Safety Disclaimers

- **Not a Diagnostic Tool:** DawaCard Lite does not diagnose diseases, recommend drug dosages, check for drug interactions, or generate prescriptions.
- **Human Verification Required:** AI output is treated as candidate text. Users MUST verify every field against their prescription paper.
- **Local Storage Limitations:** Local browser storage is not an encrypted vault. Clearing browser cache or site data will erase stored records unless you maintain an exported JSON backup file.

---

## Contributing

We welcome open-source contributions! Please review [CONTRIBUTING.md](CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting Pull Requests.

---

## License

This project is licensed under the [MIT License](LICENSE).
