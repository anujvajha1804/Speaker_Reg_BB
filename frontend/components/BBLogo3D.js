/**
 * TheNextChapter - 3D Animated BB Logo Component (Three.js WebGL)
 * Stylized BB cube logo with extruded bevel geometry,
 * rich deep plum/purple metallic finish, white letter faces with purple emissive glow,
 * floating idle motion, desktop cursor parallax, mobile touch drag, and WebGL fallback.
 */

class BBLogo3D {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.options = Object.assign({}, window.CONFIG ? window.CONFIG.LOG_SETTINGS : {}, options);
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.logoGroup = null;
        this.cubeMesh = null;
        
        // Mouse / Touch interaction tracking
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.isDragging = false;
        this.previousTouchX = 0;
        this.previousTouchY = 0;
        
        this.clock = null;
        this.isInitialized = false;

        this.init();
    }

    /**
     * Check WebGL Support
     */
    static isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    init() {
        if (!this.canvas) return;

        // Check WebGL availability
        if (!BBLogo3D.isWebGLSupported() || (window.CONFIG && window.CONFIG.ENABLE_3D === false)) {
            console.warn("WebGL not supported or 3D disabled. Falling back to 2D logo.");
            this.showFallback();
            return;
        }

        try {
            // 1. Scene setup
            this.scene = new THREE.Scene();
            this.clock = new THREE.Clock();

            // 2. Camera setup
            const aspect = this.canvas.clientWidth / this.canvas.clientHeight || 1;
            this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
            this.camera.position.set(0, 0, 8.5);

            // 3. Renderer setup
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true,
                powerPreference: "high-performance"
            });
            this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.3;

            // 4. Create Logo Geometry & Group
            this.createBBLogoGroup();

            // 5. Lighting Setup
            this.setupLighting();

            // 6. Event Listeners
            this.addEventListeners();

            // 7. Start Render Loop
            this.isInitialized = true;
            this.animate();

        } catch (err) {
            console.error("Error initializing 3D BB Logo:", err);
            this.showFallback();
        }
    }

    /**
     * Builds the stylized 3D BB Cube Logo Group
     */
    createBBLogoGroup() {
        this.logoGroup = new THREE.Group();

        const cubeSize = 2.4;
        
        // --- 1. Base Dark Plum / Purple Metallic Cube Geometry ---
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshStandardMaterial({
            color: this.options.cubeColor || 0x2b0c3f,
            roughness: 0.2,
            metalness: 0.85,
            envMapIntensity: 1.2
        });
        
        this.cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
        this.logoGroup.add(this.cubeMesh);

        // --- 2. Create Extruded 'B' Letter Shape ---
        const bShape = this.createBShape();
        
        const extrudeSettings = {
            steps: 2,
            depth: 0.18,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.04,
            bevelSegments: 4
        };

        const bGeometry = new THREE.ExtrudeGeometry(bShape, extrudeSettings);
        bGeometry.center();

        // White Glowing Letter Material with Violet emissive sheen
        const bMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xc77dff,
            emissiveIntensity: 0.25,
            roughness: 0.15,
            metalness: 0.3
        });

        // Scale and position B letters on visible cube faces
        const offset = (cubeSize / 2) + 0.01;

        // Front Face (+Z)
        const frontB = new THREE.Mesh(bGeometry, bMaterial);
        frontB.position.set(0, 0, offset);
        frontB.scale.set(0.65, 0.65, 0.65);
        this.logoGroup.add(frontB);

        // Right Face (+X)
        const rightB = new THREE.Mesh(bGeometry, bMaterial);
        rightB.position.set(offset, 0, 0);
        rightB.rotation.y = Math.PI / 2;
        rightB.scale.set(0.65, 0.65, 0.65);
        this.logoGroup.add(rightB);

        // Top Face (+Y)
        const topB = new THREE.Mesh(bGeometry, bMaterial);
        topB.position.set(0, offset, 0);
        topB.rotation.x = -Math.PI / 2;
        topB.rotation.z = Math.PI / 2;
        topB.scale.set(0.65, 0.65, 0.65);
        this.logoGroup.add(topB);

        // Left Face (-X)
        const leftB = new THREE.Mesh(bGeometry, bMaterial);
        leftB.position.set(-offset, 0, 0);
        leftB.rotation.y = -Math.PI / 2;
        leftB.scale.set(0.65, 0.65, 0.65);
        this.logoGroup.add(leftB);

        // Back Face (-Z)
        const backB = new THREE.Mesh(bGeometry, bMaterial);
        backB.position.set(0, 0, -offset);
        backB.rotation.y = Math.PI;
        backB.scale.set(0.65, 0.65, 0.65);
        this.logoGroup.add(backB);

        // --- 3. Beveled Corner Accent Lines (Lilac/Purple Glow) ---
        const edges = new THREE.EdgesGeometry(cubeGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xdb2777, transparent: true, opacity: 0.7 });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        wireframe.scale.set(1.002, 1.002, 1.002);
        this.logoGroup.add(wireframe);

        // Initial isometric rotation
        this.logoGroup.rotation.x = 0.35;
        this.logoGroup.rotation.y = -0.65;

        this.scene.add(this.logoGroup);
    }

    /**
     * Creates a custom 2D vector Shape for the letter 'B'
     */
    createBShape() {
        const shape = new THREE.Shape();
        
        const w = 1.4, h = 2.0;

        shape.moveTo(-w/2, -h/2);
        shape.lineTo(0, -h/2);
        shape.bezierCurveTo(w/2 + 0.2, -h/2, w/2 + 0.2, 0, 0, 0);
        shape.bezierCurveTo(w/2, 0, w/2, h/2, 0, h/2);
        shape.lineTo(-w/2, h/2);
        shape.closePath();

        // Top counter hole
        const topHole = new THREE.Path();
        topHole.moveTo(-w/2 + 0.35, 0.2);
        topHole.lineTo(0, 0.2);
        topHole.bezierCurveTo(w/4, 0.2, w/4, h/2 - 0.25, 0, h/2 - 0.25);
        topHole.lineTo(-w/2 + 0.35, h/2 - 0.25);
        topHole.closePath();
        shape.holes.push(topHole);

        // Bottom counter hole
        const botHole = new THREE.Path();
        botHole.moveTo(-w/2 + 0.35, -h/2 + 0.25);
        botHole.lineTo(0, -h/2 + 0.25);
        botHole.bezierCurveTo(w/4 + 0.1, -h/2 + 0.25, w/4 + 0.1, -0.2, 0, -0.2);
        botHole.lineTo(-w/2 + 0.35, -0.2);
        botHole.closePath();
        shape.holes.push(botHole);

        return shape;
    }

    /**
     * Sets up lights with purple & lilac neon accents
     */
    setupLighting() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
        keyLight.position.set(5, 8, 5);
        this.scene.add(keyLight);

        // Vivid Purple / Violet Rim Light
        const purpleRim = new THREE.PointLight(0xa855f7, 4.0, 25);
        purpleRim.position.set(-6, 4, -4);
        this.scene.add(purpleRim);

        // Magenta / Rose Bottom Accent
        const magentaRim = new THREE.PointLight(0xec4899, 2.5, 20);
        magentaRim.position.set(4, -5, 4);
        this.scene.add(magentaRim);
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());

        if (window.CONFIG && window.CONFIG.ENABLE_MOUSE_INTERACTION) {
            window.addEventListener('mousemove', (e) => {
                this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            });
        }

        if (window.CONFIG && window.CONFIG.ENABLE_TOUCH_INTERACTION) {
            this.canvas.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    this.isDragging = true;
                    this.previousTouchX = e.touches[0].clientX;
                    this.previousTouchY = e.touches[0].clientY;
                }
            }, { passive: true });

            this.canvas.addEventListener('touchmove', (e) => {
                if (this.isDragging && e.touches.length === 1) {
                    const deltaX = e.touches[0].clientX - this.previousTouchX;
                    const deltaY = e.touches[0].clientY - this.previousTouchY;

                    this.targetRotationY += deltaX * 0.01;
                    this.targetRotationX += deltaY * 0.01;

                    this.previousTouchX = e.touches[0].clientX;
                    this.previousTouchY = e.touches[0].clientY;
                }
            }, { passive: true });

            this.canvas.addEventListener('touchend', () => {
                this.isDragging = false;
            });
        }
    }

    onWindowResize() {
        if (!this.canvas || !this.renderer || !this.camera) return;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        if (!this.isInitialized) return;

        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        const rotY = this.options.rotationSpeedY || 0.006;
        const floatAmp = this.options.floatAmplitude || 0.16;
        const floatSpd = this.options.floatSpeed || 1.8;

        if (!this.isDragging) {
            this.logoGroup.rotation.y += rotY;
            this.targetRotationX = this.mouseY * 0.4;
            this.targetRotationY += (this.mouseX * 0.4 - this.targetRotationY) * 0.05;
        }

        this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
        this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;

        this.logoGroup.rotation.x = 0.35 + this.currentRotationX;
        this.logoGroup.position.y = Math.sin(elapsedTime * floatSpd) * floatAmp;

        this.renderer.render(this.scene, this.camera);
    }

    showFallback() {
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
        const fallbackContainer = document.querySelector('.logo-fallback-container');
        if (fallbackContainer) {
            fallbackContainer.style.display = 'flex';
        }
    }
}

if (typeof window !== "undefined") {
    window.BBLogo3D = BBLogo3D;
}
