/**
 * TheNextChapter - Interactive Registration Form Component
 * Handles client-side validation for all event registration fields,
 * inline error feedback, honeypot anti-spam, and submission locks.
 */

class RegistrationForm {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.options = Object.assign({
            allowedDomain: window.CONFIG ? window.CONFIG.ALLOWED_EMAIL_DOMAIN : "",
            onValidSubmit: null
        }, options);

        this.isSubmitting = false;

        this.fields = {
            fullName: document.getElementById('fullName'),
            email: document.getElementById('email'),
            contactNumber: document.getElementById('contactNumber'),
            collegeName: document.getElementById('collegeName'),
            courseDegree: document.getElementById('courseDegree'),
            branchSpecialization: document.getElementById('branchSpecialization'),
            year: document.getElementById('year'),
            startupStage: document.getElementById('startupStage'),
            pitchOpportunity: document.getElementById('pitchOpportunity'),
            unstopRegistered: document.getElementById('unstopRegistered'),
            pitchIdea: document.getElementById('pitchIdea'),
            speakerQuestion: document.getElementById('speakerQuestion'),
            honeypot: document.getElementById('website_hp')
        };

        this.init();
    }

    init() {
        if (!this.form) return;

        // Populate dropdown options from CONFIG
        this.populateDropdowns();

        // Dynamic toggle for pitchIdea field based on pitchOpportunity
        this.setupPitchToggle();

        // Auto-detect source from URL and pre-select Unstop if coming from Unstop
        this.checkURLParams();

        // Attach real-time validation on blur, input & change
        const requiredKeys = [
            'fullName', 
            'email', 
            'contactNumber', 
            'collegeName', 
            'courseDegree', 
            'branchSpecialization', 
            'year', 
            'startupStage', 
            'pitchOpportunity',
            'unstopRegistered'
        ];
        
        requiredKeys.forEach(key => {
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

        // Populate Courses / Degrees
        if (this.fields.courseDegree && this.fields.courseDegree.options.length <= 1 && window.CONFIG.COURSES) {
            window.CONFIG.COURSES.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                this.fields.courseDegree.appendChild(opt);
            });
        }

        // Populate Branches / Specializations
        if (this.fields.branchSpecialization && this.fields.branchSpecialization.options.length <= 1 && window.CONFIG.BRANCHES) {
            window.CONFIG.BRANCHES.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b;
                opt.textContent = b;
                this.fields.branchSpecialization.appendChild(opt);
            });
        }

        // Populate Years
        if (this.fields.year && this.fields.year.options.length <= 1 && window.CONFIG.YEARS) {
            window.CONFIG.YEARS.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                this.fields.year.appendChild(opt);
            });
        }

        // Populate Startup Stages
        if (this.fields.startupStage && this.fields.startupStage.options.length <= 1 && window.CONFIG.STARTUP_STAGES) {
            window.CONFIG.STARTUP_STAGES.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                this.fields.startupStage.appendChild(opt);
            });
        }

        // Populate Pitch Options
        if (this.fields.pitchOpportunity && this.fields.pitchOpportunity.options.length <= 1 && window.CONFIG.PITCH_OPTIONS) {
            window.CONFIG.PITCH_OPTIONS.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p;
                this.fields.pitchOpportunity.appendChild(opt);
            });
        }

        // Populate Unstop Registration Status
        if (this.fields.unstopRegistered && this.fields.unstopRegistered.options.length <= 1 && window.CONFIG.UNSTOP_OPTIONS) {
            window.CONFIG.UNSTOP_OPTIONS.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u;
                opt.textContent = u;
                this.fields.unstopRegistered.appendChild(opt);
            });
        }
    }

    /**
     * Pitch Idea dynamic field toggle
     */
    setupPitchToggle() {
        const pitchSelect = this.fields.pitchOpportunity;
        const pitchIdeaGroup = document.getElementById('pitchIdea-group');
        if (!pitchSelect || !pitchIdeaGroup) return;

        const updateVisibility = () => {
            if (pitchSelect.value === 'Yes') {
                pitchIdeaGroup.classList.add('highlight-pitch');
                pitchIdeaGroup.style.display = 'block';
            } else {
                pitchIdeaGroup.classList.remove('highlight-pitch');
            }
        };

        pitchSelect.addEventListener('change', updateVisibility);
        updateVisibility();
    }

    /**
     * Validate an individual field by key
     */
    validateField(fieldKey) {
        const field = this.fields[fieldKey];
        if (!field) return true;

        const val = field.value.trim();
        let isValid = true;
        let errorMsg = "";

        switch (fieldKey) {
            case 'fullName':
                if (!val || val.length < 2) {
                    isValid = false;
                    errorMsg = "Please enter your full name (minimum 2 characters).";
                } else if (!/^[a-zA-Z\s\.\'\-]+$/.test(val)) {
                    isValid = false;
                    errorMsg = "Full name should only contain letters and spaces.";
                }
                break;

            case 'email':
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!val || !emailRegex.test(val)) {
                    isValid = false;
                    errorMsg = "Please enter a valid email address (e.g. name@domain.com).";
                } else if (this.options.allowedDomain && this.options.allowedDomain.trim() !== "") {
                    const domain = this.options.allowedDomain.toLowerCase();
                    if (!val.toLowerCase().endsWith("@" + domain) && !val.toLowerCase().endsWith("." + domain)) {
                        isValid = false;
                        errorMsg = `Please use your official email ID (@${domain}).`;
                    }
                }
                break;

            case 'contactNumber':
                const cleanPhone = val.replace(/\D/g, '');
                // 10 digits (or 12 digits starting with 91)
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

            case 'courseDegree':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select your course / degree.";
                }
                break;

            case 'branchSpecialization':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select your branch / specialization.";
                }
                break;

            case 'year':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select your current year of study.";
                }
                break;

            case 'startupStage':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select your current startup / idea stage.";
                }
                break;

            case 'pitchOpportunity':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select whether you'd like to pitch during the session.";
                }
                break;

            case 'unstopRegistered':
                if (!val || val === "") {
                    isValid = false;
                    errorMsg = "Please select whether you've already registered on Unstop.";
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

        // 3. Validate all required fields
        let isFormValid = true;
        let firstInvalidField = null;

        const requiredKeys = [
            'fullName', 
            'email', 
            'contactNumber', 
            'collegeName', 
            'courseDegree', 
            'branchSpecialization', 
            'year', 
            'startupStage', 
            'pitchOpportunity',
            'unstopRegistered'
        ];
        
        for (const key of requiredKeys) {
            const valid = this.validateField(key);
            if (!valid) {
                isFormValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = this.fields[key];
                }
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

        // 5. Gather sanitized form data
        const formData = {
            fullName: this.fields.fullName.value.trim(),
            email: this.fields.email.value.trim().toLowerCase(),
            contactNumber: this.fields.contactNumber.value.trim(),
            collegeName: this.fields.collegeName.value.trim(),
            courseDegree: this.fields.courseDegree.value.trim(),
            branchSpecialization: this.fields.branchSpecialization.value.trim(),
            year: this.fields.year.value,
            startupStage: this.fields.startupStage.value,
            pitchOpportunity: this.fields.pitchOpportunity.value,
            unstopRegistered: this.fields.unstopRegistered ? this.fields.unstopRegistered.value : "No, not yet",
            pitchIdea: this.fields.pitchIdea ? this.fields.pitchIdea.value.trim() : "",
            speakerQuestion: this.fields.speakerQuestion ? this.fields.speakerQuestion.value.trim() : "",
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
