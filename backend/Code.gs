// ====================================================
// CONFIGURATION
// ====================================================

// Google Sheet ID: retrieved securely from Script Properties (environment variable)
// In Apps Script: Go to Project Settings (⚙) > Script Properties > Add Property:
// Key: SPREADSHEET_ID | Value: your_spreadsheet_id
// (If container-bound to the sheet via Extensions > Apps Script, leave as empty and it auto-detects)
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || ""; 

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

      // 7. Send Confirmation Email to Registrant
      sendConfirmationEmail(email, fullName);

      // 8. Return Success JSON Response
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

  // Test email capability to ensure Gmail/Mail permissions are granted
  try {
    const userEmail = Session.getActiveUser().getEmail();
    if (userEmail) {
      Logger.log("Active user email: " + userEmail);
    }
  } catch (e) {
    Logger.log("Permission check notice: " + e.toString());
  }
}

// ====================================================
// HELPER FUNCTIONS
// ====================================================

function getOrCreateSheet() {
  let ss;
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    throw new Error("Spreadsheet not found. Please configure SPREADSHEET_ID in Script Properties or run directly inside the Google Sheet via Extensions > Apps Script.");
  }

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

// ====================================================
// CONFIRMATION EMAIL SENDER
// ====================================================

/**
 * Sends a confirmation email to the registrant upon successful registration.
 */
function sendConfirmationEmail(email, fullName) {
  try {
    if (!email) return;

    const unstopLink = PropertiesService.getScriptProperties().getProperty("DAY2_UNSTOP_URL") || "https://unstop.com/o/q92LkeV?lb=B5P1VLE&utm_medium=Share&utm_source=bloomkjs6233&utm_campaign=Workshops";
    const subject = "You’re In! Welcome to TheNextChapter 🌱";
    const senderEmail = PropertiesService.getScriptProperties().getProperty("SENDER_EMAIL") || "bloombox.kjsce@somaiya.edu";

    const plainTextBody = 
      "Hi " + fullName + ",\n\n" +
      "Your registration for TheNextChapter | In Conversation with Divya Gokulnath, Co-founder of BYJU’S is confirmed! 🎙️\n\n" +
      "Get ready for an evening of real stories, entrepreneurial insights, challenges, ideas, and conversations — with an opportunity for selected participants to interact and share their ideas.\n\n" +
      "📅 9th October 2026\n" +
      "⏰ 3:00 PM onwards\n" +
      "📍 Aryabhatta Auditorium, KJSSE\n\n" +
      "And your chapter doesn’t have to end here. 🚀\n\n" +
      "Join us on 10th October for TheNextChapter — Zero to One Workshop, where we go from IDEATE → VALIDATE → BUILD → PITCH → BLOOM.\n\n" +
      "🔗 Workshop Registration: " + unstopLink + "\n\n" +
      "We’re excited to have you with us!\n\n" +
      "Your degree is one chapter. What you build next could be TheNextChapter. 🌱\n\n" +
      "Regards,\n" +
      "Team BloomBox\n" +
      "The Entrepreneurship Cell of KJSSE";

    const htmlBody = 
      '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e1b4b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">' +
        '<div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #581c87;">' +
          '<h2 style="color: #2b0c3f; margin: 0; font-size: 22px;">TheNextChapter 🌱</h2>' +
          '<p style="color: #6b21a8; font-weight: bold; margin: 4px 0 0 0; font-size: 14px;">BloomBox — The Entrepreneurship Cell of KJSSE</p>' +
        '</div>' +
        '<div style="padding: 20px 0;">' +
          '<p style="font-size: 16px;">Hi <strong>' + escapeHtml(fullName) + '</strong>,</p>' +
          '<p>Your registration for <strong>TheNextChapter | In Conversation with Divya Gokulnath, Co-founder of BYJU’S</strong> is confirmed! 🎙️</p>' +
          '<p>Get ready for an evening of <em>real stories, entrepreneurial insights, challenges, ideas, and conversations</em> — with an opportunity for selected participants to interact and share their ideas.</p>' +
          '<div style="background-color: #f3e8ff; border-left: 4px solid #7e22ce; padding: 16px; border-radius: 8px; margin: 20px 0;">' +
            '<p style="margin: 4px 0;">📅 <strong>9th October 2026</strong></p>' +
            '<p style="margin: 4px 0;">⏰ <strong>3:00 PM onwards</strong></p>' +
            '<p style="margin: 4px 0;">📍 <strong>Aryabhatta Auditorium, KJSSE</strong></p>' +
          '</div>' +
          '<p>And your chapter doesn’t have to end here. 🚀</p>' +
          '<p>Join us on <strong>10th October</strong> for <strong>TheNextChapter — Zero to One Workshop</strong>, where we go from <strong>IDEATE → VALIDATE → BUILD → PITCH → BLOOM.</strong></p>' +
          '<p style="margin-top: 16px;">🔗 <strong>Workshop Registration:</strong> ' +
            '<a href="' + unstopLink + '" target="_blank" style="color: #7e22ce; font-weight: bold; text-decoration: underline;">' +
              'Register on Unstop Here' +
            '</a>' +
          '</p>' +
          '<p style="margin-top: 24px;">We’re excited to have you with us!</p>' +
          '<p style="font-style: italic; color: #4c1d95; font-weight: 500; margin-top: 16px;">' +
            '"Your degree is one chapter. What you build next could be TheNextChapter. 🌱"' +
          '</p>' +
        '</div>' +
        '<div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; font-size: 14px; color: #475569;">' +
          '<p style="margin: 2px 0;">Regards,</p>' +
          '<p style="margin: 2px 0; font-weight: bold; color: #2b0c3f;">Team BloomBox</p>' +
          '<p style="margin: 2px 0; color: #6b21a8;">The Entrepreneurship Cell of KJSSE</p>' +
        '</div>' +
      '</div>';

    // Build base email options
    const mailOptions = {
      to: email,
      subject: subject,
      body: plainTextBody,
      htmlBody: htmlBody,
      name: "Team BloomBox",
      replyTo: senderEmail
    };

    // Check if senderEmail is a valid verified Gmail alias for the active account
    let canUseFrom = false;
    try {
      const activeUser = Session.getActiveUser().getEmail();
      Logger.log("Script executed by account: " + activeUser);
      
      if (activeUser && activeUser.toLowerCase() === senderEmail.toLowerCase()) {
        canUseFrom = true;
      } else {
        const aliases = GmailApp.getAliases();
        Logger.log("Available Gmail aliases for " + activeUser + ": " + JSON.stringify(aliases));
        if (aliases && aliases.indexOf(senderEmail) !== -1) {
          canUseFrom = true;
        }
      }
    } catch (aliasErr) {
      Logger.log("Alias check notice: " + aliasErr.toString());
    }

    if (canUseFrom) {
      mailOptions.from = senderEmail;
    } else {
      Logger.log("Note: '" + senderEmail + "' is not a verified alias for the deploying account. Sending with replyTo: " + senderEmail);
    }

    // Try GmailApp first, fall back to MailApp
    try {
      GmailApp.sendEmail(email, subject, plainTextBody, mailOptions);
      Logger.log("Confirmation email successfully sent via GmailApp to: " + email);
    } catch (gErr) {
      Logger.log("GmailApp send failed (" + gErr.toString() + "), attempting MailApp fallback...");
      MailApp.sendEmail(mailOptions);
      Logger.log("Confirmation email successfully sent via MailApp to: " + email);
    }

  } catch (err) {
    Logger.log("Error sending confirmation email to " + email + ": " + err.toString());
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/**
 * Run this function in Apps Script editor (▷ Run) to test email sending and grant permissions
 */
function testSendConfirmationEmail() {
  const activeUser = Session.getActiveUser().getEmail();
  const testEmail = activeUser || "bloombox.kjsce@somaiya.edu";
  const quota = MailApp.getRemainingDailyQuota();

  Logger.log("=== EMAIL DIAGNOSTICS ===");
  Logger.log("Active Account: " + activeUser);
  Logger.log("Remaining Daily Email Quota: " + quota);
  Logger.log("Sending test email to: " + testEmail);

  sendConfirmationEmail(testEmail, "Test Registrant");
  Logger.log("Test finished. Please check your inbox at: " + testEmail);
}

