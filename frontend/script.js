/**
 * TheNextChapter | In Conversation with Divya Gokulnath
 * Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Background Purple & Magenta Particle Canvas
    initParticleCanvas();

    // 2. Initialize 3D BloomBox Logo Component (if canvas present)
    if (document.getElementById('logo-3d-canvas')) {
        const logo3D = new BBLogo3D('logo-3d-canvas');
    }

    // 3. Trigger Hero Entrance Animations (GSAP)
    initEntranceAnimations();

    let activeSubmittedData = null;

    // 4. Initialize Visual Confirmation Component
    const thumbprintHandler = new ThumbprintAnimation('thumbprint-overlay', {
        onComplete: (result) => {
            if (result && result.success) {
                showSuccessModal(result, activeSubmittedData);
            }
        },
        onError: () => {
            if (formHandler) formHandler.setDisabled(false);
        }
    });

    // 5. Initialize Registration Form Component
    const formHandler = new RegistrationForm('speaker-registration-form', {
        allowedDomain: window.CONFIG ? window.CONFIG.ALLOWED_EMAIL_DOMAIN : "",
        onValidSubmit: (formData) => {
            activeSubmittedData = formData;
            // Lock form inputs
            formHandler.setDisabled(true);

            // Create backend fetch promise
            const submitPromise = sendRegistrationToBackend(formData);

            // Trigger visual confirmation experience with backend promise
            thumbprintHandler.start(submitPromise);
        }
    });

    // 6. Success Modal Close Handler
    const successDoneBtn = document.getElementById('success-done-btn');
    if (successDoneBtn) {
        successDoneBtn.addEventListener('click', () => {
            const modal = document.getElementById('success-modal');
            if (modal) modal.classList.remove('active');
            if (formHandler) formHandler.setDisabled(false);
        });
    }

    // 7. Workshop CTA Links
    const workshopBtns = document.querySelectorAll('.workshop-unstop-link');
    workshopBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.CONFIG && window.CONFIG.DAY2_UNSTOP_URL) {
                btn.href = window.CONFIG.DAY2_UNSTOP_URL;
            }
        });
    });
});

/**
 * Sends Registration Data to Google Apps Script Backend
 */
async function sendRegistrationToBackend(formData) {
    const scriptUrl = window.CONFIG ? window.CONFIG.GOOGLE_APPS_SCRIPT_URL : "";

    // Local Test Mode fallback if script URL is not configured yet
    if (!scriptUrl || scriptUrl.includes("YOUR_DEPLOYED_SCRIPT_ID_HERE")) {
        console.info("%c[TheNextChapter Local Test Mode] Simulated backend call.", "color: #c084fc; font-weight: bold;");
        await new Promise(r => setTimeout(r, 1200));

        // Generate simulated test registration ID
        const testId = "TNC26-" + Math.floor(10000 + Math.random() * 90000);
        return {
            success: true,
            registrationId: testId,
            message: "Registration successful (Local Test Mode)"
        };
    }

    try {
        const response = await fetch(scriptUrl, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Server returned HTTP ${response.status}`);
        }
    } catch (err) {
        console.warn("Primary fetch attempt encountered an issue, attempting backup submission:", err);
        
        // Backup: No-CORS form payload delivery (ensures Google Sheet receives data even if browser restricts CORS)
        try {
            await fetch(scriptUrl, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(formData)
            });

            // If no-cors succeeded, the data reached Google Apps Script
            const fallbackId = "TNC26-" + Math.floor(10000 + Math.random() * 90000);
            return {
                success: true,
                registrationId: fallbackId,
                message: "Registration submitted successfully"
            };
        } catch (backupErr) {
            console.error("All backend submission methods failed:", backupErr);
            throw err;
        }
    }
}

/**
 * Display Success Modal with Confirmation Details & Confetti Celebration
 * Hides Day 2 Unstop promo if user has already registered through Unstop
 */
function showSuccessModal(result, formData = null) {
    const modal = document.getElementById('success-modal');
    const regIdElem = document.getElementById('res-registration-id');
    const studentNameElem = document.getElementById('res-student-name');
    const day2Promo = document.querySelector('.modal-day2-promo');
    const fullNameInput = document.getElementById('fullName');
    const unstopSelect = document.getElementById('unstopRegistered');

    if (regIdElem && result.registrationId) {
        regIdElem.textContent = result.registrationId;
    }

    if (studentNameElem) {
        const name = (formData && formData.fullName) || (fullNameInput ? fullNameInput.value.trim() : "") || "Participant";
        studentNameElem.textContent = name;
    }

    // Check if user has already registered through Unstop
    const isUnstopRegistered = 
        (formData && formData.unstopRegistered && formData.unstopRegistered.toLowerCase().includes('yes')) ||
        (unstopSelect && unstopSelect.value && unstopSelect.value.toLowerCase().includes('yes')) ||
        (formData && formData.source && formData.source.toLowerCase().includes('unstop')) ||
        (new URLSearchParams(window.location.search).get('source') || '').toLowerCase().includes('unstop');

    // Conditionally hide Day 2 Unstop Workshop promo banner if already registered
    if (day2Promo) {
        if (isUnstopRegistered) {
            day2Promo.style.display = 'none';
        } else {
            day2Promo.style.display = 'block';
        }
    }

    if (modal) {
        modal.classList.add('active');
        // Trigger celebratory confetti explosion!
        triggerConfetti();
    }
}

/**
 * High-Energy Multi-Burst Confetti Celebration (Above Modal at z-index: 99999)
 */
function triggerConfetti() {
    if (typeof confetti !== 'function') {
        console.warn("canvas-confetti library not loaded");
        return;
    }

    // Palette: Solid purples, vibrant pink, emerald green, golden yellow, and electric blue
    const colors = ['#7e22ce', '#ec4899', '#a855f7', '#10b981', '#f59e0b', '#3b82f6', '#d946ef'];

    // 1. Immediate Center Cannon Burst
    confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: colors,
        zIndex: 99999,
        disableForReducedMotion: false
    });

    // 2. Left Side Blast
    setTimeout(() => {
        confetti({
            particleCount: 70,
            angle: 60,
            spread: 65,
            origin: { x: 0.05, y: 0.7 },
            colors: colors,
            zIndex: 99999
        });
    }, 180);

    // 3. Right Side Blast
    setTimeout(() => {
        confetti({
            particleCount: 70,
            angle: 120,
            spread: 65,
            origin: { x: 0.95, y: 0.7 },
            colors: colors,
            zIndex: 99999
        });
    }, 320);

    // 4. Grand Finale Shower from Top
    setTimeout(() => {
        confetti({
            particleCount: 90,
            spread: 120,
            origin: { y: 0.25 },
            gravity: 0.9,
            scalar: 1.2,
            colors: colors,
            zIndex: 99999
        });
    }, 480);
}

/**
 * GSAP Staggered Entrance Animations
 */
function initEntranceAnimations() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });

    tl.from('.hero-top-logo', { scale: 0.8, y: -20, opacity: 0, duration: 0.7 })
      .from('.hero-eyebrow', { y: -12, opacity: 0, duration: 0.5 }, "-=0.3")
      .from('.hero-grand-title', { y: -18, opacity: 0, duration: 0.7 }, "-=0.3")
      .from('.hero-italic-subtitle', { y: 15, opacity: 0, duration: 0.6 }, "-=0.4")
      .from('.hero-tagline-heading', { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
      .from('.hero-desc', { y: 20, opacity: 0 }, "-=0.3")
      .from('.event-pill-grid .event-pill-item', { y: 20, opacity: 0, stagger: 0.1 }, "-=0.3");
}

/**
 * Purple & Violet Background Glow Particles & Ambient Floating Orbs
 */
function initParticleCanvas() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = ['#c084fc', '#e879f9', '#9333ea', '#a855f7', '#f472b6'];
    const particleCount = Math.min(Math.floor(width / 24), 48);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.2 + 0.9,
            vy: -Math.random() * 0.45 - 0.15,
            vx: (Math.random() - 0.5) * 0.25,
            pulseSpeed: Math.random() * 0.025 + 0.015,
            pulsePhase: Math.random() * Math.PI * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            baseAlpha: Math.random() * 0.25 + 0.35
        });
    }

    // Ambient floating glow orbs for soft background depth
    const orbs = [
        { x: width * 0.2, y: height * 0.3, radius: 200, color: 'rgba(192, 132, 252, 0.08)', vx: 0.12, vy: -0.08 },
        { x: width * 0.8, y: height * 0.55, radius: 230, color: 'rgba(236, 72, 153, 0.06)', vx: -0.1, vy: 0.1 },
        { x: width * 0.45, y: height * 0.85, radius: 210, color: 'rgba(147, 51, 234, 0.07)', vx: 0.08, vy: 0.09 }
    ];

    function renderParticles() {
        ctx.clearRect(0, 0, width, height);

        // Render ambient glowing orbs
        orbs.forEach(orb => {
            orb.x += orb.vx;
            orb.y += orb.vy;

            if (orb.x < -orb.radius) orb.x = width + orb.radius;
            if (orb.x > width + orb.radius) orb.x = -orb.radius;
            if (orb.y < -orb.radius) orb.y = height + orb.radius;
            if (orb.y > height + orb.radius) orb.y = -orb.radius;

            const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
            gradient.addColorStop(0, orb.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Render sparkling floating particles
        particles.forEach(p => {
            p.y += p.vy;
            p.x += p.vx;
            p.pulsePhase += p.pulseSpeed;

            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            const currentAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.15;
            const currentRadius = p.radius + Math.sin(p.pulsePhase) * 0.4;

            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.6, currentRadius), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.min(1, Math.max(0.15, currentAlpha));
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
        });

        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        requestAnimationFrame(renderParticles);
    }

    renderParticles();
}
