class Viewer360 {
    constructor(imageUrl, container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.lon = 0;
        this.lat = 0;
        this.phi = 0;
        this.theta = 0;

        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        const texture = new THREE.Texture(imageUrl);
        const material = new THREE.MeshBasicMaterial({ map: texture });

        const sphere = new THREE.Mesh(geometry, material);
        this.scene.add(sphere);

        this.setupEventListeners();
        this.animate();
    }
    
    dispose() {
        // Remove event listeners
        this.container.removeEventListener('mousedown', this.onMouseDown);
        this.container.removeEventListener('mousemove', this.onMouseMove);
        this.container.removeEventListener('mouseup', this.onMouseUp);
        this.container.removeEventListener('mouseleave', this.onMouseUp);
        this.container.removeEventListener('touchstart', this.onTouchStart);
        this.container.removeEventListener('touchmove', this.onTouchMove);
        this.container.removeEventListener('touchend', this.onTouchEnd);

        // Dispose of Three.js objects
        this.scene.remove(this.sphere);
        /*this.geometry.dispose();
        this.material.dispose();
        this.texture.dispose();
        this.renderer.dispose();*/

        // Remove the canvas from the DOM
        this.container.removeChild(this.renderer.domElement);

        // Show the static thumbnail again
        this.container.querySelector('.static-thumbnail').style.display = 'block';
    }

    setupEventListeners() {
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.container.addEventListener('mouseleave', this.onMouseUp.bind(this));
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.container.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    onMouseMove(event) {
        if (!this.isDragging) return;

        const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y
        };

        this.lon += deltaMove.x * 0.1;
        this.lat -= deltaMove.y * 0.1;

        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
    }

    onTouchMove(event) {
        if (!this.isDragging || event.touches.length !== 1) return;

        const touch = event.touches[0];
        const deltaMove = {
            x: touch.clientX - this.previousMousePosition.x,
            y: touch.clientY - this.previousMousePosition.y
        };

        this.lon += deltaMove.x * 0.1;
        this.lat -= deltaMove.y * 0.1;

        this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
        event.preventDefault();
    }

    onTouchEnd() {
        this.isDragging = false;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = THREE.MathUtils.degToRad(90 - this.lat);
        this.theta = THREE.MathUtils.degToRad(this.lon);

        this.camera.position.x = 500 * Math.sin(this.phi) * Math.cos(this.theta);
        this.camera.position.y = 500 * Math.cos(this.phi);
        this.camera.position.z = 500 * Math.sin(this.phi) * Math.sin(this.theta);
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
    } 
