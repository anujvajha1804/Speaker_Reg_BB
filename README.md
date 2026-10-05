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

## ⚡ Google Apps Script Code (Copy & Paste)

When setting up your Google Sheet backend:
1. In your Google Sheet, open **Extensions > Apps Script**.
2. Paste the following script:

```javascript
const SPREADSHEET_ID = ""; // Leave empty if script is inside the sheet
const SHEET_NAME = "SpeakerRegistrations";
const ALLOWED_EMAIL_DOMAIN = ""; // Leave empty to accept all email domains

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "VALIDATION_ERROR", message: "No data payload received." });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({ success: false, error: "VALIDATION_ERROR", message: "Invalid JSON format." });
    }

    const fullName = (data.fullName || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const contactNumber = (data.contactNumber || "").trim();
    const collegeName = (data.collegeName || "").trim();
    const courseDegree = (data.courseDegree || "").trim();
    const branchSpecialization = (data.branchSpecialization || "").trim();
    const year = (data.year || "").trim();
    const startupStage = (data.startupStage || "").trim();
    const pitchOpportunity = (data.pitchOpportunity || "").trim();
    const pitchIdea = (data.pitchIdea || "").trim();
    const speakerQuestion = (data.speakerQuestion || "").trim();
    const source = (data.source || "website").trim();

    if (!fullName || !email || !contactNumber || !collegeName || !courseDegree || !branchSpecialization || !year || !startupStage || !pitchOpportunity) {
      return createJsonResponse({ success: false, error: "VALIDATION_ERROR", message: "Please fill in all mandatory fields." });
    }

    const sheet = getOrCreateSheet();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const emails = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
        for (let i = 0; i < emails.length; i++) {
          if (emails[i][0] && emails[i][0].toString().trim().toLowerCase() === email) {
            return createJsonResponse({ success: false, error: "DUPLICATE_EMAIL", message: "This email is already registered for TheNextChapter." });
          }
        }
      }

      const registrationId = "TNC26-" + ("00000" + lastRow).slice(-5);
      const rowData = [
        new Date(),
        registrationId,
        fullName,
        email,
        contactNumber,
        collegeName,
        courseDegree,
        branchSpecialization,
        year,
        startupStage,
        pitchOpportunity,
        pitchIdea,
        speakerQuestion,
        source
      ];

      sheet.appendRow(rowData);
      return createJsonResponse({ success: true, registrationId: registrationId, message: "Registration successful" });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: "SERVER_ERROR", message: err.toString() });
  }
}

function doGet() {
  return ContentService.createTextOutput("TheNextChapter Google Apps Script API is active.").setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet() {
  const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Timestamp", "Registration ID", "Full Name", "Email", "Phone / WhatsApp",
      "College / Institution", "Course / Degree", "Branch / Specialization",
      "Current Year of Study", "Startup / Idea Stage", "Pitch Opportunity",
      "Pitch Description", "Question for Divya Gokulnath", "Source"
    ];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#2b0c3f");
    headerRange.setFontColor("#e9d5ff");
  }
  return sheet;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Deploy > New deployment > Web app**. Set access to **"Anyone"**.
4. Copy the deployed Web App URL and paste it into [`frontend/config.js`](file:///Users/anujvajhaa/Desktop/Speaker%20bb%20reg/frontend/config.js) under `GOOGLE_APPS_SCRIPT_URL`.
