/**
 * TheNextChapter - Visual Confirmation Animation Component
 * Visual UI animation representing registration confirmation with BloomBox styling.
 * PURELY VISUAL ANIMATION - NO biometric scanning or fingerprint processing.
 */

class ThumbprintAnimation {
    constructor(overlayId, options = {}) {
        this.overlay = document.getElementById(overlayId);
        this.options = Object.assign({
            scanDuration: window.CONFIG ? window.CONFIG.THUMBPRINT_SCAN_DURATION_MS : 1600,
            onComplete: null,
            onError: null
        }, options);

        this.elements = {
            card: this.overlay ? this.overlay.querySelector('.thumbprint-card') : null,
            spinner: this.overlay ? (this.overlay.querySelector('.registration-spinner') || this.overlay.querySelector('.thumbprint-svg')) : null,
            title: this.overlay ? this.overlay.querySelector('.thumbprint-status-title') : null,
            sub: this.overlay ? this.overlay.querySelector('.thumbprint-status-sub') : null,
            checkmark: this.overlay ? this.overlay.querySelector('.success-checkmark-icon') : null,
            errorIcon: this.overlay ? this.overlay.querySelector('.error-icon-wrap') : null,
            retryBtn: this.overlay ? this.overlay.querySelector('.retry-btn') : null
        };
    }

    /**
     * Launch the visual confirmation animation and send backend request
     */
    start(submitPromise) {
        if (!this.overlay) return;

        // Reset Overlay State
        this.resetState();
        this.overlay.classList.add('active', 'scanning');

        // Text state
        if (this.elements.title) this.elements.title.textContent = "Confirming your registration...";
        if (this.elements.sub) this.elements.sub.style.display = "none";

        const scanMinTime = new Promise(resolve => setTimeout(resolve, this.options.scanDuration));

        // Wait for both the minimum visual scan time and the actual backend submit promise
        Promise.all([submitPromise, scanMinTime])
            .then(([backendResult]) => {
                if (backendResult && backendResult.success) {
                    this.showSuccessState(backendResult);
                } else if (backendResult && backendResult.error === "DUPLICATE_EMAIL") {
                    this.showDuplicateState(backendResult);
                } else {
                    this.showErrorState(backendResult ? backendResult.message : "Unable to complete registration. Please try again.");
                }
            })
            .catch(err => {
                console.error("Submission error:", err);
                this.showErrorState("Network connection issue. Please verify your connection and try again.");
            });
    }

    /**
     * Show Success State (Burst)
     */
    showSuccessState(result) {
        this.overlay.classList.remove('scanning');
        
        if (this.elements.spinner) this.elements.spinner.style.display = 'none';
        if (this.elements.checkmark) this.elements.checkmark.style.display = 'flex';

        if (this.elements.title) this.elements.title.textContent = "Registration Confirmed! 🌱";
        if (this.elements.sub) this.elements.sub.textContent = `Welcome to TheNextChapter | ID: ${result.registrationId || ''}`;

        // Initial burst on checkmark
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.5 },
                zIndex: 99999
            });
        }

        setTimeout(() => {
            this.hide();
            if (typeof this.options.onComplete === 'function') {
                this.options.onComplete(result);
            }
        }, 1200);
    }

    /**
     * Show Duplicate Email State
     */
    showDuplicateState(result) {
        this.overlay.classList.remove('scanning');

        if (this.elements.spinner) this.elements.spinner.style.display = 'none';
        if (this.elements.checkmark) {
            this.elements.checkmark.style.display = 'flex';
            this.elements.checkmark.innerHTML = '🎉';
        }

        if (this.elements.title) this.elements.title.textContent = "You're Already Registered!";
        if (this.elements.sub) this.elements.sub.textContent = result.message || "Your email is already registered for TheNextChapter.";

        setTimeout(() => {
            this.hide();
            if (typeof this.options.onComplete === 'function') {
                this.options.onComplete(result);
            }
        }, 2000);
    }

    /**
     * Show Error State with Retry Button
     */
    showErrorState(errorMessage) {
        this.overlay.classList.remove('scanning');

        if (this.elements.spinner) this.elements.spinner.style.display = 'none';
        if (this.elements.errorIcon) this.elements.errorIcon.style.display = 'flex';

        if (this.elements.title) this.elements.title.textContent = "Something Went Wrong";
        if (this.elements.sub) {
            this.elements.sub.textContent = errorMessage;
            this.elements.sub.style.display = "block";
        }

        if (this.elements.retryBtn) {
            this.elements.retryBtn.style.display = 'inline-flex';
            this.elements.retryBtn.onclick = () => {
                this.hide();
                if (typeof this.options.onError === 'function') {
                    this.options.onError();
                }
            };
        }
    }

    /**
     * Reset UI state
     */
    resetState() {
        if (this.elements.spinner) this.elements.spinner.style.display = 'block';
        if (this.elements.checkmark) {
            this.elements.checkmark.style.display = 'none';
            this.elements.checkmark.innerHTML = '✓';
        }
        if (this.elements.errorIcon) this.elements.errorIcon.style.display = 'none';
        if (this.elements.retryBtn) this.elements.retryBtn.style.display = 'none';
    }

    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active', 'scanning');
        }
    }
}

if (typeof window !== "undefined") {
    window.ThumbprintAnimation = ThumbprintAnimation;
}
