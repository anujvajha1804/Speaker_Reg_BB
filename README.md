# TheNextChapter | In Conversation with Divya Gokulnath — Registration Portal

> **BloomBox – The Entrepreneurship Cell of KJSSE** presents **TheNextChapter: Dream. Build. Bloom. 🌱**

A mobile-first registration portal for the speaker session featuring **Divya Gokulnath (Co-founder, BYJU’S)** and the Day 2 **Zero to One Workshop**.

---

## 📁 Directory Structure

```
Speaker bb reg/
├── frontend/
│   ├── assets/
│   │   └── bb-logo.png              # BloomBox Official Logo
│   ├── components/
│   │   ├── BBLogo3D.js              # Three.js 3D Animated BloomBox Cube Logo
│   │   ├── RegistrationForm.js      # Form validation & submission handler (11 fields)
│   │   └── ThumbprintAnimation.js   # Visual confirmation laser animation
│   ├── config.js                    # Centralized settings & links
│   ├── index.html                   # Semantic HTML5 frontend
│   ├── script.js                    # Main application controller & GSAP animations
│   └── styles.css                   # Custom Vanilla CSS design system (Poster theme)
└── README.md                        # Documentation & Google Apps Script snippet
```

---

## 🚀 Quick Start (Frontend)

To run the frontend locally:
```bash
cd frontend
npx serve .
# or
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## ⚡ Google Apps Script Backend & Confirmation Mail

The Google Apps Script code is located in [`backend/Code.gs`](file:///c:/Users/naiti/OneDrive/Desktop/SpeakerRegi/Speaker_Reg_BB/backend/Code.gs).

### 📊 Google Sheet Connected
- **Sheet URL**: [TheNextChapter Registrations Sheet](https://docs.google.com/spreadsheets/d/12UocD7WUFXtrxLidG9GcvCOEfah7EYVR508xns8mf5s/edit)
- **Spreadsheet ID**: `12UocD7WUFXtrxLidG9GcvCOEfah7EYVR508xns8mf5s`
- **Tab Name**: `Registrations`

### 📧 Confirmation Email Feature
When a registration is saved:
1. Google Sheet row is appended with lock synchronization.
2. A confirmation email with event details (9th Oct, 3 PM @ A building auditorium) and Day 2 Zero to One Workshop Unstop link is automatically dispatched via `MailApp`.

### 🛠️ Setup Instructions
1. Open your Google Sheet -> **Extensions > Apps Script**.
2. Replace all content in `Code.gs` with the complete code from [`backend/Code.gs`](file:///c:/Users/naiti/OneDrive/Desktop/SpeakerRegi/Speaker_Reg_BB/backend/Code.gs).
3. Click **Deploy > New deployment > Web app**. Set access to **"Anyone"**.
4. Copy the Web App URL and update `.env` / `config.js` (`GOOGLE_APPS_SCRIPT_URL`).

