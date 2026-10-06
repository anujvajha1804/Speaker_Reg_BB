/**
 * TheNextChapter - Interactive Registration Form Component
 * Handles client-side validation for all 3 Sections:
 * Section 1: About You
 * Section 2: AI and Learning
 * Section 3: Pitch to Divya (Conditional)
 */

class RegistrationForm {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.options = Object.assign({
            allowedDomain: window.CONFIG ? window.CONFIG.ALLOWED_EMAIL_DOMAIN : "",
            onValidSubmit: null
        }, options);

        this.isSubmitting = false;
        this.uploadedFileBase64 = null;
        this.uploadedFileName = "";

        this.fields = {
            // Section 1: About You
            fullName: document.getElementById('fullName'),
            email: document.getElementById('email'),
            contactNumber: document.getElementById('contactNumber'),
            collegeName: document.getElementById('collegeName'),
            branchSpecialization: document.getElementById('branchSpecialization'),
            division: document.getElementById('division'),
            year: document.getElementById('year'),
            courseDegree: document.getElementById('courseDegree'),

            // Section 2: AI & Learning
            aiFamiliarity: document.getElementById('aiFamiliarity'),
            byjusFamiliarity: document.getElementById('byjusFamiliarity'),
            aiEducationConcerns: document.getElementById('aiEducationConcerns'),
            aiAgentsUsed: document.getElementById('aiAgentsUsed'),
            unstopRegistered: document.getElementById('unstopRegistered'),

            // Section 3: Pitch to Divya (Optional / Conditional)
            pitchOpportunity: document.getElementById('pitchOpportunity'),
            pitchType: document.getElementById('pitchType'),
            pitchTitle: document.getElementById('pitchTitle'),
            pitchStage: document.getElementById('pitchStage'),
            pitchDeckFile: document.getElementById('pitchDeckFile'),
            pitchWhyDivya: document.getElementById('pitchWhyDivya'),

            honeypot: document.getElementById('website_hp')
        };

        this.init();
    }

    init() {
        if (!this.form) return;

        // 1. Populate dropdown options from CONFIG
        this.populateDropdowns();

        // 2. Initialize AI Agents chips (Section 2)
        this.initAIAgentChips();

        // 3. Dynamic toggle for pitch section
        this.setupPitchToggle();

        // 4. Live word counter for Pitch Why Divya
        this.setupWordCounter();

        // 5. File upload listener
        this.setupFileUpload();

        // 6. Pre-select Unstop if URL has ?source=unstop
        this.checkURLParams();

        // 7. Attach real-time validation listeners
        const basicKeys = [
            'fullName', 
            'email', 
            'contactNumber', 
            'collegeName', 
            'year', 
            'courseDegree',
            'aiFamiliarity',
            'byjusFamiliarity',
            'aiEducationConcerns',
            'unstopRegistered',
            'pitchOpportunity'
        ];
        
        basicKeys.forEach(key => {
            const field = this.fields[key];
            if (field) {
                field.addEventListener('blur', () => this.validateField(key));
                field.addEventListener('input', () => {
                    if (field.classList.contains('is-invalid')) {
                        this.validateField(key);
                    }
                });
                field.addEventListener('change', () => {
                    this.validateField(key);
                });
            }
        });

        // Form Submit listener
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    /**
     * Check URL params for pre-fills (e.g. ?source=unstop)
     */
    checkURLParams() {
        const source = this.getURLParameter('source') || '';
        if (source.toLowerCase().includes('unstop') && this.fields.unstopRegistered) {
            this.fields.unstopRegistered.value = "Yes, already registered on Unstop";
        }
    }

    /**
     * Dynamically populate Dropdown fields from CONFIG
     */
    populateDropdowns() {
        if (!window.CONFIG) return;

        const populateSelect = (element, items, defaultLabel = "Select an option") => {
            if (!element || !items) return;
            // Keep first disabled default option if present
            element.innerHTML = `<option value="" disabled selected>${defaultLabel}</option>`;
            items.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item;
                opt.textContent = item;
                element.appendChild(opt);
            });
        };

        // Section 1
        if (this.fields.branchSpecialization && window.CONFIG.BRANCHES) {
            this.fields.branchSpecialization.innerHTML = `<option value="" selected>Select branch (Optional)</option>`;
            window.CONFIG.BRANCHES.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b;
                opt.textContent = b;
                this.fields.branchSpecialization.appendChild(opt);
            });
        }

        populateSelect(this.fields.year, window.CONFIG.YEARS, "Select your year of study");

        // Section 2
        populateSelect(this.fields.aiFamiliarity, window.CONFIG.AI_FAMILIARITY, "Select familiarity level");
        populateSelect(this.fields.byjusFamiliarity, window.CONFIG.BYJUS_FAMILIARITY, "Select familiarity with BYJU'S");
        populateSelect(this.fields.aiEducationConcerns, window.CONFIG.AI_CONCERNS, "Select your major concern");
        populateSelect(this.fields.unstopRegistered, window.CONFIG.UNSTOP_OPTIONS, "Select an option");

        // Section 3
        populateSelect(this.fields.pitchOpportunity, window.CONFIG.PITCH_OPTIONS, "Select Yes / No");
        populateSelect(this.fields.pitchType, window.CONFIG.PITCH_TYPES, "Select pitch category");
        populateSelect(this.fields.pitchStage, window.CONFIG.PITCH_STAGES, "Select current stage");
    }

    /**
     * Initialize interactive AI Agent badge chips (Section 2)
     */
    initAIAgentChips() {
        const grid = document.getElementById('ai-agents-chip-grid');
        if (!grid || !window.CONFIG || !window.CONFIG.AI_AGENTS) return;

        grid.innerHTML = "";
        const selectedAgents = new Set();

        window.CONFIG.AI_AGENTS.forEach(agent => {
            const btn = document.createElement('button');
            btn.type = "button";
            btn.className = "tag-chip-btn";
            btn.textContent = agent;

            btn.addEventListener('click', () => {
                const isNone = agent.startsWith("I don't");
                if (isNone) {
                    selectedAgents.clear();
                    selectedAgents.add(agent);
                    grid.querySelectorAll('.tag-chip-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                } else {
                    Array.from(selectedAgents).forEach(a => {
                        if (a.startsWith("I don't")) selectedAgents.delete(a);
                    });
                    const noneBtn = Array.from(grid.children).find(b => b.textContent.includes("I don't"));
                    if (noneBtn) noneBtn.classList.remove('active');

                    if (selectedAgents.has(agent)) {
                        selectedAgents.delete(agent);
                        btn.classList.remove('active');
                    } else {
                        selectedAgents.add(agent);
                        btn.classList.add('active');
                    }
                }

                if (this.fields.aiAgentsUsed) {
                    this.fields.aiAgentsUsed.value = Array.from(selectedAgents).join(', ');
                }
            });

            grid.appendChild(btn);
        });
    }

    /**
     * Dynamic toggle for Section 3 (Pitch to Divya)
     */
    setupPitchToggle() {
        const pitchSelect = this.fields.pitchOpportunity;
        const pitchCard = document.getElementById('pitch-details-card');
        if (!pitchSelect || !pitchCard) return;

        const updatePitchVisibility = () => {
            const val = pitchSelect.value || "";
            if (val.toLowerCase().includes('yes')) {
                pitchCard.style.display = 'flex';
            } else {
                pitchCard.style.display = 'none';
            }
        };

        pitchSelect.addEventListener('change', updatePitchVisibility);
        updatePitchVisibility();
    }

    /**
     * Word counter for 50-word pitch response
     */
    setupWordCounter() {
        const textarea = this.fields.pitchWhyDivya;
        const counter = document.getElementById('pitch-word-counter');
        if (!textarea || !counter) return;

        const updateCount = () => {
            const text = textarea.value.trim();
            const words = text ? text.split(/\s+/).filter(Boolean) : [];
            const count = words.length;

            counter.textContent = `${count} / 50 words`;

            if (count > 50) {
                counter.classList.add('over-limit');
            } else {
                counter.classList.remove('over-limit');
            }
        };

        textarea.addEventListener('input', updateCount);
    }

    /**
     * Setup Pitch Deck file upload listener
     */
    setupFileUpload() {
        const fileInput = this.fields.pitchDeckFile;
        const nameDisplay = document.getElementById('file-name-display');
        const promptSpan = document.getElementById('file-upload-prompt');
        if (!fileInput) return;

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                this.uploadedFileBase64 = null;
                this.uploadedFileName = "";
                if (nameDisplay) nameDisplay.style.display = 'none';
                if (promptSpan) promptSpan.style.display = 'block';
                return;
            }

            // Validate PDF
            if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
                alert("Please select a valid PDF file for your pitch deck.");
                fileInput.value = "";
                return;
            }

            // Max size 100MB
            if (file.size > 100 * 1024 * 1024) {
                alert("File exceeds maximum allowed size of 100MB.");
                fileInput.value = "";
                return;
            }

            this.uploadedFileName = file.name;
            if (nameDisplay) {
                nameDisplay.textContent = `✓ Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                nameDisplay.style.display = 'block';
            }
            if (promptSpan) promptSpan.style.display = 'none';

            // Convert small PDFs (< 5MB) to base64 for direct Google Drive sync
            if (file.size <= 5 * 1024 * 1024) {
                const reader = new FileReader();
                reader.onload = () => {
                    this.uploadedFileBase64 = reader.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    /**
     * Validate an individual field by key
     */
    validateField(fieldKey) {
        const field = this.fields[fieldKey];
        if (!field) return true;

        const val = (field.value || "").trim();
        let isValid = true;
        let errorMsg = "";

        switch (fieldKey) {
            // Section 1
            case 'fullName':
                if (!val || val.length < 2) {
                    isValid = false;
                    errorMsg = "Please enter your full name (minimum 2 characters).";
                } else if (!/^[a-zA-Z\s\.\'\-]+$/.test(val)) {
                    isValid = false;
                    errorMsg = "Full name should contain letters and spaces.";
                }
                break;

            case 'email':
                const emailLower = val.toLowerCase();
                const somaiyaEmailRegex = /^[a-zA-Z0-9._%+-]+@somaiya\.edu$/i;
                if (!val) {
                    isValid = false;
                    errorMsg = "Please enter your Somaiya email ID.";
                } else if (!emailLower.endsWith("@somaiya.edu")) {
                    isValid = false;
                    errorMsg = "Email must be an official Somaiya ID ending with @somaiya.edu.";
                } else if (!somaiyaEmailRegex.test(val)) {
                    isValid = false;
                    errorMsg = "Please enter a valid email address with letters and numbers only.";
                }
                break;

            case 'contactNumber':
                const cleanPhone = val.replace(/\D/g, '');
                let isValidPhone = false;
                if (cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone)) {
                    isValidPhone = true;
                } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91') && /^91[6-9]\d{9}$/.test(cleanPhone)) {
                    isValidPhone = true;
                }

                if (!isValidPhone) {
                    isValid = false;
                    errorMsg = "Please enter a valid 10-digit mobile number.";
                }
                break;

            case 'collegeName':
                if (!val || val.length < 2) {
                    isValid = false;
                    errorMsg = "Please enter your college or institution name.";
                }
                break;

            case 'year':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select your current year of study.";
                }
                break;

            case 'courseDegree':
                if (!val || val.length < 2) {
                    isValid = false;
                    errorMsg = "Please enter your programme / course (e.g. BTech, BSc, MBA).";
                }
                break;

            // Section 2
            case 'aiFamiliarity':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select your familiarity with AI Agents.";
                }
                break;

            case 'byjusFamiliarity':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select your familiarity with BYJU'S.";
                }
                break;

            case 'aiEducationConcerns':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select your primary concern regarding AI in education.";
                }
                break;

            case 'unstopRegistered':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select whether you've already registered on Unstop.";
                }
                break;

            // Section 3
            case 'pitchOpportunity':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select whether you'd like to participate in Pitch to Divya.";
                }
                break;

            case 'pitchType':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select what you are pitching.";
                }
                break;

            case 'pitchTitle':
                if (!val || val.length < 2) {
                    isValid = false;
                    errorMsg = "Please enter the title/name of your idea.";
                }
                break;

            case 'pitchStage':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select the current stage of your idea.";
                }
                break;

            case 'pitchWhyDivya':
                const wordCount = val ? val.split(/\s+/).filter(Boolean).length : 0;
                if (!val || wordCount === 0) {
                    isValid = false;
                    errorMsg = "Please explain why Divya should hear your pitch.";
                } else if (wordCount > 50) {
                    isValid = false;
                    errorMsg = `Response is ${wordCount} words. Maximum allowed is 50 words.`;
                }
                break;
        }

        this.setFieldErrorState(fieldKey, isValid, errorMsg);
        return isValid;
    }

    /**
     * Display or clear field error state UI
     */
    setFieldErrorState(fieldKey, isValid, message = "") {
        const field = this.fields[fieldKey];
        if (!field) return;

        const errorElem = document.getElementById(`${fieldKey}-error`);

        if (!isValid) {
            field.classList.add('is-invalid');
            field.setAttribute('aria-invalid', 'true');
            if (errorElem) {
                errorElem.textContent = message;
                errorElem.classList.add('show');
            }
        } else {
            field.classList.remove('is-invalid');
            field.removeAttribute('aria-invalid');
            if (errorElem) {
                errorElem.textContent = "";
                errorElem.classList.remove('show');
            }
        }
    }

    /**
     * Handles Form Submission
     */
    handleSubmit(e) {
        e.preventDefault();

        // 1. Prevent double submission
        if (this.isSubmitting) return;

        // 2. Check anti-spam honeypot
        if (this.fields.honeypot && this.fields.honeypot.value !== "") {
            console.warn("Spam submission detected via honeypot.");
            return;
        }

        // 3. Determine required keys based on pitch choice
        const isPitching = (this.fields.pitchOpportunity.value || "").toLowerCase().includes('yes');

        let requiredKeys = [
            'fullName', 
            'email', 
            'contactNumber', 
            'collegeName', 
            'year', 
            'courseDegree',
            'aiFamiliarity',
            'byjusFamiliarity',
            'aiEducationConcerns',
            'unstopRegistered',
            'pitchOpportunity'
        ];

        if (isPitching) {
            requiredKeys = requiredKeys.concat([
                'pitchType',
                'pitchTitle',
                'pitchStage',
                'pitchWhyDivya'
            ]);
        }

        let isFormValid = true;
        let firstInvalidField = null;

        for (const key of requiredKeys) {
            const valid = this.validateField(key);
            if (!valid) {
                isFormValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = this.fields[key];
                }
            }
        }

        // Validate pitch deck upload if pitching
        if (isPitching) {
            const hasDeck = this.uploadedFileName !== "";
            const deckError = document.getElementById('pitchDeck-error');
            if (!hasDeck) {
                isFormValid = false;
                if (deckError) {
                    deckError.textContent = "Please upload your PDF pitch deck (max 5 slides).";
                    deckError.classList.add('show');
                }
                if (!firstInvalidField) firstInvalidField = this.fields.pitchDeckFile;
            } else if (deckError) {
                deckError.textContent = "";
                deckError.classList.remove('show');
            }
        }

        // 4. Focus and scroll to first invalid field if validation fails
        if (!isFormValid) {
            if (firstInvalidField) {
                firstInvalidField.focus();
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // 5. Gather sanitized form data (with backward/forward compatibility)
        const branchVal = this.fields.branchSpecialization ? this.fields.branchSpecialization.value.trim() : "";
        const pitchStageVal = (isPitching && this.fields.pitchStage ? this.fields.pitchStage.value : "") || "Idea / Exploring";
        const pitchTitleVal = isPitching && this.fields.pitchTitle ? this.fields.pitchTitle.value.trim() : "";
        const pitchWhyVal = isPitching && this.fields.pitchWhyDivya ? this.fields.pitchWhyDivya.value.trim() : "";
        const aiConcernsVal = this.fields.aiEducationConcerns ? this.fields.aiEducationConcerns.value : "";

        const formData = {
            // Section 1: Personal Details
            fullName: this.fields.fullName.value.trim(),
            email: this.fields.email.value.trim().toLowerCase(),
            contactNumber: this.fields.contactNumber.value.trim(),
            collegeName: this.fields.collegeName.value.trim(),
            branchSpecialization: branchVal,
            branch: branchVal,
            division: this.fields.division ? this.fields.division.value.trim() : "",
            year: this.fields.year.value,
            courseDegree: this.fields.courseDegree.value.trim(),

            // Section 2: AI & Learning
            aiFamiliarity: this.fields.aiFamiliarity.value,
            byjusFamiliarity: this.fields.byjusFamiliarity.value,
            aiEducationConcerns: aiConcernsVal,
            aiAgentsUsed: this.fields.aiAgentsUsed ? this.fields.aiAgentsUsed.value : "",
            unstopRegistered: this.fields.unstopRegistered ? this.fields.unstopRegistered.value : "No, not yet",

            // Section 3: Pitch & Questions
            pitchOpportunity: this.fields.pitchOpportunity.value,
            pitchType: isPitching && this.fields.pitchType ? this.fields.pitchType.value : "",
            pitchTitle: pitchTitleVal,
            pitchStage: isPitching ? pitchStageVal : "",
            pitchDeckFile: this.uploadedFileName,
            pitchDeckBase64: this.uploadedFileBase64,
            pitchWhyDivya: pitchWhyVal,

            // Compatibility mappings for deployed Google Apps Script versions
            startupStage: pitchStageVal,
            pitchIdea: pitchTitleVal ? `${pitchTitleVal}${pitchWhyVal ? ' - ' + pitchWhyVal : ''}` : "",
            speakerQuestion: pitchWhyVal || aiConcernsVal,

            source: this.getURLParameter('source') || 'speaker_session_link'
        };

        // 6. Trigger success callback
        if (typeof this.options.onValidSubmit === 'function') {
            this.options.onValidSubmit(formData);
        }
    }

    /**
     * Disable form inputs during submit
     */
    setDisabled(disabled) {
        this.isSubmitting = disabled;
        Object.keys(this.fields).forEach(key => {
            if (this.fields[key]) {
                this.fields[key].disabled = disabled;
            }
        });
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = disabled;
        }
    }

    /**
     * Utility to read URL parameters (e.g. ?source=poster)
     */
    getURLParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
}

// Export globally
if (typeof window !== "undefined") {
    window.RegistrationForm = RegistrationForm;
}
