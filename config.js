/**
 * TheNextChapter | In Conversation with Divya Gokulnath
 * Central Configuration
 */

const CONFIG = {
    // ----------------------------------------------------
    // BACKEND & GOOGLE APPS SCRIPT SETTINGS
    // ----------------------------------------------------
    GOOGLE_APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyMED-U_gqHypWVNJa-GQN6i0aEb6oSbMoLjxUzEZ50Ws_HwNha-S7uZDAXhLZUMIdGIg/exec",
    
    // Domain restriction for emails (Compulsory @somaiya.edu)
    ALLOWED_EMAIL_DOMAIN: "somaiya.edu",

    // ----------------------------------------------------
    // EVENT & LINKS
    // ----------------------------------------------------
    EVENT_NAME: "TheNextChapter",
    SPEAKER_NAME: "Divya Gokulnath",
    SPEAKER_ROLE: "Co-founder, BYJU'S",
    EVENT_DATE: "9th October 2026",
    EVENT_TIME: "3:00 PM Onwards",
    EVENT_VENUE: "Aryabhatta Auditorium, KJSSE",
    
    // Zero to One Workshop Unstop link
    DAY2_UNSTOP_URL: "https://unstop.com/o/q92LkeV?lb=B5P1VLE&utm_medium=Share&utm_source=bloomkjs6233&utm_campaign=Workshops",

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
        "Fourth Year",
        "Postgraduate",
        "Other"
    ],

    BRANCHES: [
        "Computer Engineering (COMPS)",
        "Information Technology (IT)",
        "Artificial Intelligence & Data Science (AI & DS)",
        "Computer Science & Business Systems (CSBS)",
        "Computer & Communication Engineering (CCE)",
        "Robotics & Artificial Intelligence (RAI)",
        "Electronics & Computer Engineering (EXCP)",
        "Electronics & Telecommunication Engineering (EXTC)",
        "Electronics Engineering (VLSI Design & Technology)",
        "Mechanical Engineering (MECH)",
        "Other"
    ],

    AI_FAMILIARITY: [
        "I use AI Tools regularly",
        "I have experimented with AI Tools",
        "I understand the concept but haven't used them much",
        "I have heard of AI Tools but don't know much about them",
        "This is completely new to me"
    ],

    AI_CONCERNS: [
        "Over-dependence on AI",
        "Reduced critical thinking",
        "Accuracy / misinformation",
        "Privacy concerns",
        "Academic integrity",
        "Lack of human interaction",
        "I don't have any major concerns",
        "Other"
    ],

    AI_AGENTS: [
        "ChatGPT",
        "Claude",
        "Gemini",
        "Perplexity",
        "Microsoft Copilot",
        "GitHub Copilot",
        "Cursor",
        "Manus",
        "Other",
        "I don't currently use any AI Tools"
    ],

    BYJUS_FAMILIARITY: [
        "I have used BYJU'S",
        "I know about BYJU'S but haven't used it",
        "I have only heard the name",
        "I wasn't familiar with BYJU'S"
    ],

    PITCH_OPTIONS: [
        "No, I would only like to attend the session",
        "Yes, I would like to pitch my idea"
    ],

    PITCH_TYPES: [
        "Startup / Business Idea",
        "MVP / Working Prototype",
        "Product Idea",
        "Technology / AI-based Solution",
        "Social Impact Idea",
        "EdTech Idea",
        "Other"
    ],

    PITCH_STAGES: [
        "Just an idea",
        "Research / validation stage",
        "Prototype",
        "MVP developed",
        "Currently being tested",
        "Already launched",
        "Other"
    ],

    UNSTOP_OPTIONS: [
        "No, not yet",
        "Yes, already registered on Unstop"
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
