/**
 * TheNextChapter | In Conversation with Divya Gokulnath
 * Google Apps Script Backend (Code.gs)
 * 
 * Handles registration data submission, duplicate email prevention,
 * concurrent lock safety, unique Registration ID generation (TNC26-XXXXX),
 * and automatic Google Sheets logging.
 */

// ====================================================
// CONFIGURATION
// ====================================================
// If this script is created via Extensions > Apps Script inside your Google Sheet, leave SPREADSHEET_ID as ""
// If using a standalone script, insert your Google Spreadsheet ID here (e.g. "1A2B3C4D5E6F...")
const SPREADSHEET_ID = ""; 

// Name of the tab in Google Sheets where registrations will be stored
const SHEET_NAME = "Registrations";

// Domain restriction for student emails (Set to "" to allow any college / domain since open to all colleges)
const ALLOWED_EMAIL_DOMAIN = "";


// ====================================================
// POST ENDPOINT
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

    const fullName = (data.fullName || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const contactNumber = (data.contactNumber || "").trim();
    const collegeName = (data.collegeName || "").trim();
    const courseDegree = (data.courseDegree || "").trim();
    const branchSpecialization = (data.branchSpecialization || data.branch || "").trim();
    const year = (data.year || "").trim();
    const startupStage = (data.startupStage || "").trim();
    const pitchOpportunity = (data.pitchOpportunity || "").trim();
    const pitchIdea = (data.pitchIdea || "").trim();
    const speakerQuestion = (data.speakerQuestion || "").trim();
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

    if (!courseDegree) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please select your course/degree."
      });
    }

    if (!branchSpecialization) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please select your branch/specialization."
      });
    }

    if (!year) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please select your current year of study."
      });
    }

    if (!startupStage) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please select where you are with your startup/idea."
      });
    }

    if (!pitchOpportunity) {
      return createJsonResponse({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please select whether you would like to pitch during the session."
      });
    }

    // 3. Access Google Sheet with Lock to Prevent Concurrent Collisions
    const sheet = getOrCreateSheet();
    const lock = LockService.getScriptLock();
    // Wait up to 10 seconds for lock to avoid race conditions
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
      const nextIndex = lastRow; // Since Row 1 is the header
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

// GET Endpoint for health check / status verification
function doGet() {
  return ContentService
    .createTextOutput("TheNextChapter | Bloombox Google Apps Script Backend is active and running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ====================================================
// HELPER FUNCTIONS
// ====================================================

function getOrCreateSheet() {
  let ss;
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    throw new Error("Spreadsheet not found. Please provide a valid SPREADSHEET_ID or run inside Google Sheets.");
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Set default column headers and styling if sheet is newly created
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Timestamp",
      "Registration ID",
      "Full Name",
      "Email",
      "Contact Number",
      "College / Institution",
      "Course / Degree",
      "Branch / Specialization",
      "Year of Study",
      "Startup / Idea Stage",
      "Pitch Opportunity",
      "Pitch Idea Description",
      "Question for Divya Gokulnath",
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
