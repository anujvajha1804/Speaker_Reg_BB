/**
 * TheNextChapter | In Conversation with Divya Gokulnath
 * Central Configuration
 */

const CONFIG = {
    // ----------------------------------------------------
    // BACKEND & GOOGLE APPS SCRIPT SETTINGS
    // ----------------------------------------------------
    GOOGLE_APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwWaYbYUoEe8lsJMLzwL1eyg3PZ8KTYeS_0SEeBJAfep3M1lIK-SsdDoAPvb6WzusJp/exec",
    
    // Domain restriction for emails (Set to "" to allow any college / domain since open to all colleges)
    ALLOWED_EMAIL_DOMAIN: "",

    // ----------------------------------------------------
    // EVENT & LINKS
    // ----------------------------------------------------
    EVENT_NAME: "TheNextChapter",
    SPEAKER_NAME: "Divya Gokulnath",
    SPEAKER_ROLE: "Co-founder, BYJU'S",
    EVENT_DATE: "9th October 2026",
    EVENT_TIME: "3:00 PM Onwards",
    EVENT_VENUE: "Sakarben Auditorium, KJSSE",
    
    // Day 2 Workshop link (Replace with live Unstop URL when ready)
    DAY2_UNSTOP_URL: "https://unstop.com",

    // Contacts
    CONTACTS: [
        { name: "Pooja Vibute", phone: "+91 93721 99718" },
        { name: "Jainam Jain", phone: "+91 63762 03706" }
    ],

    // ----------------------------------------------------
    // FORM DROPDOWN / SELECT OPTIONS
    // ----------------------------------------------------
    YEARS: [
        "First Year",
        "Second Year",
        "Third Year",
        "Fourth Year"
    ],

    COURSES: [
        "B.Tech / B.E.",
        "M.Tech / M.E.",
        "BBA / MBA",
        "B.Sc / M.Sc",
        "BCA / MCA",
        "Diploma",
        "Other"
    ],

    BRANCHES: [
        "Computer Engineering",
        "Information Technology",
        "Artificial Intelligence & Data Science",
        "Electronics & Telecommunication",
        "Electronics and Computer Engineering",
        "Mechanical Engineering",
        "Computer Science and Business Systems",
        "Computer and Communication Engineering",
        "Robotics and Artificial Intelligence",
        "VLSI Design and Technology",
        "Civil Engineering",
        "Other"
    ],

    STARTUP_STAGES: [
        "I'm already working on one",
        "I have an idea, but haven't started yet",
        "I don't have one yet, but I want to explore",
        "I'm just curious about entrepreneurship"
    ],

    PITCH_OPTIONS: [
        "Yes",
        "No"
    ],

    // ----------------------------------------------------
    // 3D BB LOGO CONFIGURATION (Poster Purple / Plum Theme)
    // ----------------------------------------------------
    ENABLE_3D: true,
    ENABLE_MOUSE_INTERACTION: true,
    ENABLE_TOUCH_INTERACTION: true,
    
    LOG_SETTINGS: {
        rotationSpeedY: 0.006,
        rotationSpeedX: 0.002,
        floatAmplitude: 0.16,
        floatSpeed: 1.8,
        cubeColor: 0x2b0c3f,
        letterColor: 0xffffff,
        glowColor: 0x581c87,
        rimLightColor: 0x7e22ce
    },

    // ----------------------------------------------------
    // UI & ANIMATIONS
    // ----------------------------------------------------
    THUMBPRINT_SCAN_DURATION_MS: 1600,
    ENABLE_BG_PARTICLES: true
};

// Export configuration globally
if (typeof window !== "undefined") {
    window.CONFIG = CONFIG;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = CONFIG;
}
