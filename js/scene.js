
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// Caméra fixe, anneaux orbitaux et particules animées

const container = document.getElementById("introScene");

if (!container) {
    console.error("Le conteneur #introScene est introuvable.");
} else if (container.dataset.initialized === "true") {
    console.warn("La scène NouriTech est déjà initialisée.");
} else {
    container.dataset.initialized = "true";

    // SCÈNE ET CAMÉRA

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        50,
        Math.max(container.clientWidth, 1) /
            Math.max(container.clientHeight, 1),
        0.1,
        1000
    );

    camera.position.set(-2.25, 3.93, 5.25);
    camera.lookAt(0, 0, 0);

    // RENDU

    const mobileQuery = window.matchMedia("(max-width: 768px)");

    const isMobile = () => mobileQuery.matches;

    const renderer = new THREE.WebGLRenderer({
        antialias: !isMobile(),
        alpha: true,
        powerPreference: "default"
    });

    function getPixelRatio() {
        const maxPixelRatio = isMobile() ? 1.25 : 1.5;

        return Math.min(
            window.devicePixelRatio || 1,
            maxPixelRatio
        );
    }

    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.appendChild(renderer.domElement);

    // ÉCLAIRAGE

    scene.add(new THREE.AmbientLight(0x8877ff, 0.3));

    const violetLight = new THREE.PointLight(0x8b5cf6, 15, 12);
    violetLight.position.set(-3, 2.5, 3);
    scene.add(violetLight);

    const blueLight = new THREE.PointLight(0x635bff, 8, 10);
    blueLight.position.set(3, -1, -3);
    scene.add(blueLight);

    const rimLight = new THREE.DirectionalLight(0xb8a5ff, 1.5);
    rimLight.position.set(2, 4, -5);
    scene.add(rimLight);

    // HALO RADIAL RENFORCÉ

    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 256;
    glowCanvas.height = 256;

    const ctx = glowCanvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
        128, 128, 2,
        128, 128, 128
    );

    gradient.addColorStop(0, "rgba(139, 92, 246, 0.70)");
    gradient.addColorStop(0.20, "rgba(112, 40, 228, 0.42)");
    gradient.addColorStop(0.45, "rgba(99, 91, 255, 0.20)");
    gradient.addColorStop(0.70, "rgba(99, 91, 255, 0.07)");
    gradient.addColorStop(1, "rgba(99, 91, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    glowTexture.colorSpace = THREE.SRGBColorSpace;

    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
    });

    const glow = new THREE.Sprite(glowMaterial);
    glow.visible = false;
    scene.add(glow);

    // VARIABLES

    const clock = new THREE.Clock();

    const particles = [];
    const orbitalRings = [];

    let mainSphere = null;
    let animationFrameId = null;
    let disposed = false;
    let sceneLoaded = false;
    let introProgress = 0;

    const introDuration = 1.8;
    const sphereRotationSpeedY = 0.24;
    const sphereRotationSpeedX = 0.06;

    // MATÉRIAUX

    function configureMaterials(object) {
        object.traverse((child) => {
            if (!child.isMesh || !child.material) return;

            const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

            materials.forEach((material) => {
                if ("emissiveIntensity" in material) {
                    material.emissiveIntensity = Math.max(
                        material.emissiveIntensity,
                        0.5
                    );
                }

                if (material.emissive) {
                    material.emissive.lerp(
                        new THREE.Color(0x7028e4),
                        0.12
                    );
                }

                if ("roughness" in material) {
                    material.roughness = Math.max(
                        material.roughness,
                        0.4
                    );
                }

                if ("metalness" in material) {
                    material.metalness = Math.max(
                        material.metalness,
                        0.15
                    );
                }
            });
        });
    }

    // ANNEAUX ORBITAUX

    function createOrbitalRing(
        radius,
        color,
        opacity,
        rotation,
        rotationSpeed
    ) {
        const geometry = new THREE.TorusGeometry(
            radius,
            0.008,
            6,
            128
        );

        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false
        });

        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.set(...rotation);

        scene.add(ring);

        orbitalRings.push({
            object: ring,
            baseOpacity: opacity,
            rotationSpeed
        });
    }

    // PARTICULES DÉCORATIVES

    function createAmbientParticles(center, radius) {
        const count = 24;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        const phases = [];
        const speeds = [];
        const distances = [];
        const heights = [];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (1.3 + Math.random() * 1.1);
            const height = (Math.random() - 0.5) * radius * 2.4;

            positions[i * 3] =
                center.x + Math.cos(angle) * distance;

            positions[i * 3 + 1] = center.y + height;

            positions[i * 3 + 2] =
                center.z + Math.sin(angle) * distance;

            phases.push(Math.random() * Math.PI * 2);
            speeds.push(0.08 + Math.random() * 0.15);
            distances.push(distance);
            heights.push(height);
        }

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );

        const material = new THREE.PointsMaterial({
            color: 0xbba7ff,
            size: 0.035,
            transparent: true,
            opacity: 0,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        particles.push({
            type: "ambient",
            object: points,
            center: center.clone(),
            phases,
            speeds,
            distances,
            heights,
            radius
        });
    }

    // CHARGEMENT DE LA SCÈNE

    async function loadScene() {
        try {
            const response = await fetch(
                "scenes/scene-nouritech.json"
            );

            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const data = await response.json();

            if (disposed) return;

            const loader = new THREE.ObjectLoader();
            const loadedScene = loader.parse(data.scene);

            // SPHÈRE PRINCIPALE

            mainSphere = loadedScene.getObjectByName("Sphere_Main");

            if (mainSphere) {
                configureMaterials(mainSphere);

                const bounds = new THREE.Box3().setFromObject(
                    mainSphere
                );

                const sphereBounds = bounds.getBoundingSphere(
                    new THREE.Sphere()
                );

                const radius = Math.max(sphereBounds.radius, 0.5);

                // HALO PLUS LARGE
                glow.scale.set(
                    radius * 4.2,
                    radius * 4.2,
                    1
                );

                glow.visible = true;

                // ANNEAUX ORBITAUX

                createOrbitalRing(
                    radius * 1.15,
                    0x8b5cf6,
                    0.38,
                    [1.05, 0.2, 0.35],
                    { z: 0.035 }
                );

                createOrbitalRing(
                    radius * 1.40,
                    0x635bff,
                    0.2,
                    [0.65, 0.5, -0.55],
                    { y: 0.025 }
                );

                createOrbitalRing(
                    radius * 1.65,
                    0xa78bfa,
                    0.1,
                    [1.25, -0.35, 0.7],
                    { z: -0.018 }
                );

                createAmbientParticles(sphereBounds.center, radius);
            } else {
                console.warn("Sphere_Main est introuvable.");
            }

            // PETITES SPHÈRES DU MODÈLE

            const particleMeshes = [];

            loadedScene.traverse((object) => {
                if (
                    object.isMesh &&
                    object.name.startsWith("Particle_")
                ) {
                    particleMeshes.push(object);
                }
            });

            particleMeshes.forEach((mesh, index) => {
                const initialPosition = mesh.position.clone();

                const radius = Math.max(
                    Math.hypot(initialPosition.x, initialPosition.z),
                    1.4
                );

                const orbit = new THREE.Group();

                mesh.position.set(
                    radius,
                    initialPosition.y * 0.25,
                    0
                );

                orbit.rotation.set(
                    THREE.MathUtils.degToRad(-30 + (index % 4) * 20),
                    THREE.MathUtils.degToRad(index * 45),
                    THREE.MathUtils.degToRad(-35 + (index % 3) * 35)
                );

                loadedScene.add(orbit);
                orbit.add(mesh);

                configureMaterials(mesh);

                particles.push({
                    type: "orbit",
                    orbit,
                    mesh,
                    initialHeight: initialPosition.y * 0.25,
                    speed: 0.3 + (index % 4) * 0.08,
                    phase: index * 0.9,
                    bobbing: 0.05 + (index % 3) * 0.025
                });
            });

            if (disposed) return;

            scene.add(loadedScene);
            sceneLoaded = true;

        } catch (error) {
            if (!disposed) {
                console.error(
                    "Erreur de chargement de la scène :",
                    error
                );
            }
        }
    }

    // BOUCLE D'ANIMATION

    function animate() {
        if (disposed || document.hidden || !sceneLoaded) return;

        animationFrameId = requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.05);
        const elapsedTime = clock.elapsedTime;

        // APPARITION PROGRESSIVE

        introProgress = Math.min(
            1,
            introProgress + delta / introDuration
        );

        const introEase = 1 - Math.pow(1 - introProgress, 3);

        // SPHÈRE PRINCIPALE

        if (mainSphere) {
            mainSphere.rotation.y += sphereRotationSpeedY * delta;
            mainSphere.rotation.x += sphereRotationSpeedX * delta;

            mainSphere.getWorldPosition(glow.position);
        }

        // PETITES SPHÈRES ET PARTICULES

        particles.forEach((particle) => {
            if (particle.type === "orbit") {
                const {
                    orbit,
                    mesh,
                    initialHeight,
                    speed,
                    phase,
                    bobbing
                } = particle;

                orbit.rotation.y = elapsedTime * speed + phase;

                mesh.position.y =
                    initialHeight +
                    Math.sin(elapsedTime * 0.8 + phase) * bobbing;

                return;
            }

            const {
                object,
                center,
                phases,
                speeds,
                distances,
                heights,
                radius
            } = particle;

            const positions = object.geometry.attributes.position;

            for (let i = 0; i < phases.length; i++) {
                const angle = phases[i] + elapsedTime * speeds[i];

                positions.setXYZ(
                    i,
                    center.x + Math.cos(angle) * distances[i],
                    center.y +
                        heights[i] +
                        Math.sin(elapsedTime * 0.5 + phases[i]) *
                            radius * 0.035,
                    center.z + Math.sin(angle) * distances[i]
                );
            }

            positions.needsUpdate = true;

            object.material.opacity =
                (0.5 + Math.sin(elapsedTime * 1.2) * 0.15) *
                introEase;
        });

        // ROTATION ET APPARITION DES ANNEAUX

        orbitalRings.forEach(({ object, baseOpacity, rotationSpeed }) => {
            for (const [axis, speed] of Object.entries(rotationSpeed)) {
                object.rotation[axis] += speed * delta;
            }

            object.material.opacity = baseOpacity * introEase;
        });

        // LUMIÈRES PULSANTES

        violetLight.intensity =
            15 + Math.sin(elapsedTime * 0.8) * 1.2;

        blueLight.intensity =
            8 + Math.sin(elapsedTime * 0.6 + 1) * 0.7;

        violetLight.position.x =
            -3 + Math.sin(elapsedTime * 0.3) * 0.4;

        blueLight.position.z =
            -3 + Math.cos(elapsedTime * 0.25) * 0.4;

        // HALO PLUS LUMINEUX ET PULSANT

        glowMaterial.opacity =
            (0.85 + Math.sin(elapsedTime * 0.7) * 0.05) *
            introEase;

        renderer.render(scene, camera);
    }

    // VISIBILITÉ DE L'ONGLET

    function handleVisibilityChange() {
        if (document.hidden) {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            clock.stop();
        } else if (!disposed && sceneLoaded) {
            clock.start();
            animate();
        }
    }

    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );

    // REDIMENSIONNEMENT

    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width <= 0 || height <= 0) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(getPixelRatio());
        renderer.setSize(width, height);
    }

    window.addEventListener("resize", handleResize);

    // NETTOYAGE

    function handlePageHide() {
        if (disposed) return;

        disposed = true;

        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        window.removeEventListener("resize", handleResize);

        const disposedMaterials = new Set();
        const disposedGeometries = new Set();
        const disposedTextures = new Set();

        scene.traverse((object) => {
            if (
                object.geometry &&
                !disposedGeometries.has(object.geometry)
            ) {
                object.geometry.dispose();
                disposedGeometries.add(object.geometry);
            }

            if (!object.material) return;

            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

            materials.forEach((material) => {
                if (disposedMaterials.has(material)) return;

                for (const value of Object.values(material)) {
                    if (
                        value?.isTexture &&
                        !disposedTextures.has(value)
                    ) {
                        value.dispose();
                        disposedTextures.add(value);
                    }
                }

                material.dispose();
                disposedMaterials.add(material);
            });
        });

        renderer.dispose();
        renderer.domElement.remove();

        delete container.dataset.initialized;
    }

    window.addEventListener("pagehide", handlePageHide, { once: true });

    // DÉMARRAGE

    loadScene().then(() => {
        if (!disposed && !document.hidden && sceneLoaded) {
            clock.start();
            animate();
        }
    });
}
