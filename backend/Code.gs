/**
 * TheNextChapter | In Conversation with Divya Gokulnath
 * Google Apps Script Backend (Code.gs)
 * 
 * Directly connected to Google Sheet:
 * https://docs.google.com/spreadsheets/d/18_HAVxoha6-lqeo2lrJFKsk2uCR7o9Re4wq4hLoAD7A/edit
 */

// ====================================================
// CONFIGURATION
// ====================================================

// Your Google Sheet ID
const SPREADSHEET_ID = "18_HAVxoha6-lqeo2lrJFKsk2uCR7o9Re4wq4hLoAD7A"; 

// Tab name inside your Google Sheet
const SHEET_NAME = "Registrations";

// Domain restriction (Compulsory @somaiya.edu)
const ALLOWED_EMAIL_DOMAIN = "somaiya.edu";


// ====================================================
// POST ENDPOINT (Handles Form Submission)
// ====================================================
function doPost(e) {
  try {
    // 1. Parse JSON Payload
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "No data payload received."
      });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid JSON format."
      });
    }

    // Section 1: About You
    const fullName = (data.fullName || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const contactNumber = (data.contactNumber || "").trim();
    const collegeName = (data.collegeName || "").trim();
    const branchSpecialization = (data.branchSpecialization || data.branch || "").trim();
    const division = (data.division || "").trim();
    const year = (data.year || "").trim();
    const courseDegree = (data.courseDegree || "").trim();

    // Section 2: AI & Learning
    const aiFamiliarity = (data.aiFamiliarity || "").trim();
    const byjusFamiliarity = (data.byjusFamiliarity || "").trim();
    const aiEducationConcerns = (data.aiEducationConcerns || "").trim();
    const aiAgentsUsed = (data.aiAgentsUsed || "").trim();
    const unstopRegistered = (data.unstopRegistered || "").trim();

    // Section 3: Pitch To Divya
    const pitchOpportunity = (data.pitchOpportunity || "").trim();
    const pitchType = (data.pitchType || "").trim();
    const pitchTitle = (data.pitchTitle || "").trim();
    const pitchStage = (data.pitchStage || "").trim();
    const pitchDeckFile = (data.pitchDeckFile || "").trim();
    const pitchDeckLink = (data.pitchDeckLink || "").trim();
    const pitchWhyDivya = (data.pitchWhyDivya || "").trim();

    const source = (data.source || "speaker_session_link").trim();

    // 2. Server-Side Data Validation
    if (!fullName || fullName.length < 2) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please enter your full name (minimum 2 letters)."
      });
    }

    if (!email || !isValidEmail(email)) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please enter a valid email address."
      });
    }

    if (ALLOWED_EMAIL_DOMAIN && ALLOWED_EMAIL_DOMAIN.trim() !== "") {
      const domain = ALLOWED_EMAIL_DOMAIN.toLowerCase();
      if (!email.endsWith("@" + domain) && !email.endsWith("." + domain)) {
        return createJsonResponse({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Only @" + ALLOWED_EMAIL_DOMAIN + " email addresses are eligible."
        });
      }
    }

    const digitsOnly = contactNumber.replace(/\D/g, "");
    if (!contactNumber || (digitsOnly.length !== 10 && digitsOnly.length !== 12)) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please enter a valid 10-digit WhatsApp/mobile number."
      });
    }

    if (!collegeName || collegeName.length < 2) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please enter your college or institution name."
      });
    }

    if (!year) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please select your year of study."
      });
    }

    if (!courseDegree) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please enter your programme / course."
      });
    }

    // 3. Access Google Sheet with Lock to Prevent Concurrent Collisions
    const sheet = getOrCreateSheet();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      // 4. Duplicate Check by Email Column (Column 4)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const emails = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
        for (let i = 0; i < emails.length; i++) {
          if (emails[i][0] && emails[i][0].toString().trim().toLowerCase() === email) {
            return createJsonResponse({
              success: false,
              error: "DUPLICATE_EMAIL",
              message: "This email is already registered for TheNextChapter."
            });
          }
        }
      }

      // 5. Generate Unique Registration ID (e.g. TNC26-00001)
      const nextIndex = lastRow; // Since Row 1 is header
      const registrationId = "TNC26-" + padZero(nextIndex, 5);

      // 6. Append New Row to Google Sheet
      const timestamp = new Date();
      const rowData = [
        timestamp,
        registrationId,
        fullName,
        email,
        contactNumber,
        collegeName,
        branchSpecialization,
        division,
        year,
        courseDegree,
        aiFamiliarity,
        byjusFamiliarity,
        aiEducationConcerns,
        aiAgentsUsed,
        unstopRegistered,
        pitchOpportunity,
        pitchType,
        pitchTitle,
        pitchStage,
        pitchDeckFile || pitchDeckLink,
        pitchWhyDivya,
        source
      ];

      sheet.appendRow(rowData);

      // 7. Return Success JSON Response
      return createJsonResponse({
        success: true,
        registrationId: registrationId,
        message: "Registration successful"
      });

    } finally {
      lock.releaseLock();
    }

  } catch (err) {
    Logger.log("Error in doPost: " + err.toString());
    return createJsonResponse({
      success: false,
      error: "SERVER_ERROR",
      message: "An internal server error occurred: " + err.toString()
    });
  }
}

// GET Endpoint for status check
function doGet() {
  return ContentService
    .createTextOutput("TheNextChapter | Bloombox Google Apps Script Backend is active and running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ====================================================
// ONE-CLICK PERMISSION & INITIALIZATION FUNCTION
// ====================================================
function testPermission() {
  const sheet = getOrCreateSheet();
  const ss = sheet.getParent();
  Logger.log("Successfully connected to Google Sheet!");
  Logger.log("Sheet Name: " + ss.getName());
  Logger.log("Sheet URL: " + ss.getUrl());
}

// ====================================================
// HELPER FUNCTIONS
// ====================================================

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Set default column headers and styling if sheet is newly created or empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Timestamp",
      "Registration ID",
      "Full Name",
      "Email",
      "Contact Number",
      "College / Institution",
      "Branch",
      "Division",
      "Year of Study",
      "Programme / Course",
      "AI Agents Familiarity",
      "BYJU'S Familiarity",
      "AI Education Concerns",
      "AI Agents Used",
      "Zero to One Workshop (Unstop) Status",
      "Pitch Opportunity",
      "Pitch Category",
      "Pitch Idea Title",
      "Pitch Stage",
      "Pitch Deck / Link",
      "Why Hear Pitch (50 Words)",
      "Source"
    ];
    sheet.appendRow(headers);
    
    // Format Header Row (Poster Plum Theme)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#2b0c3f");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function padZero(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
