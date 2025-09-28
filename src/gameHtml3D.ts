export function getGameHTML3D(opts?: {
	fontFamily?: string;
	targetGoals?: number;
	targetMove?: boolean;
	targetSpeed?: number;
	targetSize?: number;
	targetTimeExists?: number;
	enableSoundEffects?: boolean;
	soundVolume?: number;
	enableEffects?: boolean;
	isLight?: boolean;
	gameMode?: string;
	timeFrenzyDuration?: number;
	hydraTargetCount?: number;
	hydraTotalTime?: number;
	hydraMode?: string;
}): string {
	const GAME_MODE = opts?.gameMode || "target_rush";
	const ff = (opts?.fontFamily || "Segoe UI").replace(/["`]/g, "");
	const IS_LIGHT = !!opts?.isLight;
	const TARGET_GOALS = opts?.targetGoals ?? 5;
	const DEFAULT_SIZE = (opts?.targetSize ?? 100) / 50; // Scale for 3D
	const DEFAULT_MOVE = opts?.targetMove ?? false;
	const DEFAULT_SPEED = (opts?.targetSpeed ?? 3000) / 1000; // Convert to units per second
	const TIME_EXISTS =
		GAME_MODE === "hydra_targets" ? 0 : opts?.targetTimeExists ?? 3000;
	const SOUND_EFFECTS = opts?.enableSoundEffects ?? true;
	const SOUND_VOLUME = opts?.soundVolume ?? 80;
	const ENABLE_EFFECTS = opts?.enableEffects ?? true;

	const TIME_FRENZY_DURATION = opts?.timeFrenzyDuration ?? 60000;
	const HYDRA_TARGET_COUNT = opts?.hydraTargetCount ?? 20;
	const HYDRA_TOTAL_TIME = opts?.hydraTotalTime ?? 60000;
	const HYDRA_MODE = opts?.hydraMode || "target_count";

	// Theme colors
	const HUD_BG = IS_LIGHT ? "rgba(255,255,255,0.86)" : "rgba(0,0,0,0.28)";
	const HUD_TEXT = IS_LIGHT ? "#111111" : "#d4d4d4";
	const HUD_ACCENT = IS_LIGHT ? "#0a66ff" : "#007acc";
	const SCORE_COLOR = IS_LIGHT ? "#006900" : "#00ff41";

	return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AimY Game 3D</title>
            <style>
                :root {
                    --font-family: ${ff};
                    --hud-bg: ${HUD_BG};
                    --hud-text: ${HUD_TEXT};
                    --hud-accent: ${HUD_ACCENT};
                    --score-color: ${SCORE_COLOR};
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    height: 100vh;
                    font-family: var(--font-family), 'Segoe UI', Roboto, sans-serif;
                    overflow: hidden;
                    background: #87CEEB;
                }
                #game-area {
                    height: 100vh;
                    width: 100vw;
                }
                .hud {
                    position: fixed;
                    top: 16px;
                    left: 16px;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    padding: 8px 12px;
                    background: var(--hud-bg);
                    color: var(--hud-text);
                    border-radius: 10px;
                    backdrop-filter: blur(6px);
                    box-shadow: 0 4px 18px rgba(0,0,0,0.16);
                    font-size: 13px;
                }
                .hud-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--hud-accent);
                    padding-right: 12px;
                    border-right: 1px solid rgba(0,0,0,0.06);
                    margin-right: 6px;
                    white-space: nowrap;
                }
                .hud-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    color: var(--hud-text);
                    white-space: nowrap;
                }
                .score { color: var(--score-color); font-weight: 700; }
                .instructions {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    font-size: 18px;
                    z-index: 2000;
                }
                .instructions.hidden { display: none; }
            </style>
        </head>
        <body>
            <div id="game-area"></div>
            <div class="hud">
                <div class="hud-title">AimY 3D</div>
                <div class="hud-item">Score: <span class="score" id="score">0</span>/<span id="targetTotal">${TARGET_GOALS}</span></div>
                <div class="hud-item">Time: <span id="timer">0</span>s</div>
                <div class="hud-item">Acc: <span id="accuracy">100</span>%</div>
                <div class="hud-item">Streak: <span id="streak">0</span></div>
            </div>
            <div id="instructions" class="instructions">
                Click to lock mouse and start game!<br>
            </div>
        </body>
        
        <script type="module">
            import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
            import { PointerLockControls } from 'https://esm.sh/three@0.152.2/examples/jsm/controls/PointerLockControls.js';
            
            const vscode = acquireVsCodeApi();
            
            // Game variables
            let score = 0;
            let shots = 0;
            let streak = 0;
            let bestStreak = 0;
            let targetCount = ${TARGET_GOALS};
            let gameStartTime = Date.now();
            let gameEndTime = null;
            let currentTargets = [];
            let gameTimeLimit = 0;
            let gameTargetLimit = 0;
            let gameActive = false;
            
            // Game mode setup
            const GAME_MODE = "${GAME_MODE}";
            const HYDRA_MODE = "${HYDRA_MODE}";
            if (GAME_MODE === "time_frenzy") {
                gameTimeLimit = ${TIME_FRENZY_DURATION};
                targetCount = 999;
                document.getElementById('targetTotal').textContent = '∞';
            } else if (GAME_MODE === "hydra_targets") {
                if (HYDRA_MODE === "timed") {
                    gameTimeLimit = ${HYDRA_TOTAL_TIME};
                    targetCount = 999;
                    document.getElementById('targetTotal').textContent = '∞';
                } else {
                    gameTimeLimit = 0;
                    gameTargetLimit = ${HYDRA_TARGET_COUNT};
                    targetCount = gameTargetLimit;
                    document.getElementById('targetTotal').textContent = gameTargetLimit;
                }
            } else {
                document.getElementById('targetTotal').textContent = targetCount;
            }
            
            // UI elements
            const scoreElement = document.getElementById('score');
            const timerElement = document.getElementById('timer');
            const accuracyElement = document.getElementById('accuracy');
            const streakElement = document.getElementById('streak');
            const instructionsElement = document.getElementById('instructions');
            
            // Scene setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000); // Black background
            
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 10, 10);
            
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap; // Better performance than PCFSoft
            
            const container = document.getElementById("game-area");
            container.appendChild(renderer.domElement);
            
            // Lighting - optimized
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(50, 50, 0);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 1024; // Reduced for performance
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.camera.near = 0.1;
            directionalLight.shadow.camera.far = 200;
            directionalLight.shadow.camera.left = -50;
            directionalLight.shadow.camera.right = 50;
            directionalLight.shadow.camera.top = 50;
            directionalLight.shadow.camera.bottom = -50;
            scene.add(directionalLight);
            
            // Simple environment - optimized
            const groundGeometry = new THREE.PlaneGeometry(200, 200);
            const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x171b24}); // Dark ground
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);

            const borderDepth = 1;
            
            // Target Board - where targets will spawn
            const boardWidth = 30; // Made bigger (was 20)
            const boardHeight = 20; // Made bigger (was 15)
            const boardDepth = 0.5;
            const boardDistance = 15; // Closer (was 25)
            
            const boardGeometry = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
            const boardMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x2a2a2a, // Dark gray
                transparent: true,
                opacity: 0.8
            });
            const targetBoard = new THREE.Mesh(boardGeometry, boardMaterial);
            targetBoard.position.set(0, boardHeight/2, -boardDistance);
            targetBoard.receiveShadow = true;
            scene.add(targetBoard);
            
            // Optional: Add a border around the target board
            const borderMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
            const borderThickness = 0.2;
            
            // Top border
            const topBorder = new THREE.Mesh(
                new THREE.BoxGeometry(boardWidth + borderThickness*2, borderThickness, boardDepth + 0.1),
                borderMaterial
            );
            topBorder.position.set(0, boardHeight + borderThickness/2, -boardDistance);
            scene.add(topBorder);
            
            // Bottom border
            const bottomBorder = new THREE.Mesh(
                new THREE.BoxGeometry(boardWidth + borderThickness*2, borderThickness, boardDepth + 0.1),
                borderMaterial
            );
            bottomBorder.position.set(0, -borderThickness/2, -boardDistance);
            scene.add(bottomBorder);
            
            // Left border
            const leftBorder = new THREE.Mesh(
                new THREE.BoxGeometry(borderThickness, boardHeight, boardDepth + 0.1),
                borderMaterial
            );
            leftBorder.position.set(-boardWidth/2 - borderThickness/2, boardHeight/2, -boardDistance);
            scene.add(leftBorder);
            
            // Right border
            const rightBorder = new THREE.Mesh(
                new THREE.BoxGeometry(borderThickness, boardHeight, boardDepth + 0.1),
                borderMaterial
            );
            rightBorder.position.set(boardWidth/2 + borderThickness/2, boardHeight/2, -boardDistance);
            scene.add(rightBorder);
            
            // Controls
            const controls = new PointerLockControls(camera, renderer.domElement);
            scene.add(controls.getObject());
            
            // Movement
            const moveState = { forward: false, backward: false, left: false, right: false };
            const velocity = new THREE.Vector3();
            const direction = new THREE.Vector3();
            
            // Crosshair
            function createCrosshair() {
                const crosshair = new THREE.Group();
                const lineLength = 0.02;
                const centerGap = 0.008;
                
                const material = new THREE.LineBasicMaterial({
                    color: 0x00ffff,
                    transparent: true,
                    opacity: 0.9
                });
                
                const lines = [
                    [new THREE.Vector3(0, centerGap, 0), new THREE.Vector3(0, centerGap + lineLength, 0)],
                    [new THREE.Vector3(0, -centerGap, 0), new THREE.Vector3(0, -centerGap - lineLength, 0)],
                    [new THREE.Vector3(-centerGap, 0, 0), new THREE.Vector3(-centerGap - lineLength, 0, 0)],
                    [new THREE.Vector3(centerGap, 0, 0), new THREE.Vector3(centerGap + lineLength, 0, 0)]
                ];
                
                lines.forEach(linePoints => {
                    const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
                    const line = new THREE.Line(geometry, material);
                    crosshair.add(line);
                });
                
                crosshair.position.z = -0.5;
                return crosshair;
            }
            
            const crosshair = createCrosshair();
            camera.add(crosshair);
            
            // Audio setup
            let audioCtx = null;
            let masterGain = null;
            if (${SOUND_EFFECTS}) {
                try {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    masterGain = audioCtx.createGain();
                    masterGain.gain.value = Math.max(0, Math.min(1, ${SOUND_VOLUME}/100));
                    masterGain.connect(audioCtx.destination);
                } catch (e) {
                    audioCtx = null;
                    masterGain = null;
                }
            }
            
            function playHitSound() {
                if (!${SOUND_EFFECTS} || !audioCtx || !masterGain) return;
                const now = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.20, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(now);
                osc.stop(now + 0.25);
            }
            
            function playMissSound() {
                if (!${SOUND_EFFECTS} || !audioCtx || !masterGain) return;
                const now = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(260, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.14);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(now);
                osc.stop(now + 0.20);
            }
            
            // Target creation
            function createTarget() {
                const size = ${DEFAULT_SIZE};
                
                // Create target with rings (optimized geometry)
                const target = new THREE.Group();
                const colors = [0xffffff, 0xff4444, 0xffffff, 0xff4444, 0xffffff, 0xff0000];
                const radii = [1.0, 0.8, 0.6, 0.4, 0.2, 0.1].map(r => size * r);
                
                for (let i = 0; i < radii.length; i++) {
                    const geometry = new THREE.RingGeometry(
                        (i + 1 < radii.length) ? radii[i + 1] : 0, 
                        radii[i], 
                        32 // Increased segments for smoother circles
                    );
                    const material = new THREE.MeshBasicMaterial({ 
                        color: colors[i], 
                        side: THREE.DoubleSide,
                        transparent: false, // Removed transparency
                        depthWrite: true // Ensure proper depth writing
                    });
                    const ring = new THREE.Mesh(geometry, material);
                    target.add(ring);
                }
                
                const boardMargin = 2; // Keep targets away from board edges
                const x = (Math.random() - 0.5) * (boardWidth - boardMargin*2); // Within board width
                const y = Math.random() * (boardHeight - boardMargin*2) + boardMargin; // Within board height
                const z = -boardDistance + boardDepth/2 + 1.0;
                
                target.position.set(x, y, z);
                
                target.userData = {
                    isTarget: true,
                    size: size,
                    id: Date.now() + Math.random(),
                    startTime: Date.now()
                };
                
                // Add movement if enabled (only within board area)
                if (${DEFAULT_MOVE} && GAME_MODE !== "hydra_targets") {
                    target.userData.moveSpeed = ${DEFAULT_SPEED};
                    target.userData.moveDirection = new THREE.Vector3(
                        (Math.random() - 0.5) * 2, // Horizontal movement
                        (Math.random() - 0.5) * 1, // Vertical movement  
                        0 // No depth movement
                    ).normalize();
                    target.userData.boardBounds = {
                        minX: -boardWidth/2 + boardMargin,
                        maxX: boardWidth/2 - boardMargin,
                        minY: boardMargin,
                        maxY: boardHeight - boardMargin
                    };
                }
                
                scene.add(target);
                
                if (GAME_MODE === "hydra_targets") {
                    currentTargets.push(target);
                } else {
                    if (currentTargets[0]) scene.remove(currentTargets[0]);
                    currentTargets = [target];
                }
                
                // Auto-remove timer
                if (${TIME_EXISTS} > 0) {
                    setTimeout(() => {
                        const targetIndex = currentTargets.findIndex(t => t.userData.id === target.userData.id);
                        if (targetIndex !== -1) {
                            streak = 0;
                            scene.remove(target);
                            currentTargets.splice(targetIndex, 1);
                            
                            if (GAME_MODE === "hydra_targets" && currentTargets.length < 3) {
                                createTarget();
                            } else if (GAME_MODE !== "hydra_targets") {
                                createTarget();
                            }
                        }
                    }, ${TIME_EXISTS});
                }
            }
            
            // Raycasting for shooting
            const raycaster = new THREE.Raycaster();
            
            function shoot() {
                if (!gameActive) return;
                
                raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
                
                const intersects = raycaster.intersectObjects(currentTargets, true);
                shots++;
                
                if (intersects.length > 0) {
                    const hit = intersects[0];
                    const target = hit.object.parent || hit.object;
                    
                    if (target.userData.isTarget) {
                        score++;
                        streak++;
                        scoreElement.textContent = score;
                        
                        if (${SOUND_EFFECTS}) playHitSound();
                        
                        // Create hit effect
                        if (${ENABLE_EFFECTS}) {
                            const particles = new THREE.Group();
                            for (let i = 0; i < 10; i++) {
                                const particle = new THREE.Mesh(
                                    new THREE.SphereGeometry(0.1),
                                    new THREE.MeshBasicMaterial({ color: 0xff6600 })
                                );
                                particle.position.copy(hit.point);
                                particle.userData = {
                                    velocity: new THREE.Vector3(
                                        (Math.random() - 0.5) * 10,
                                        (Math.random() - 0.5) * 10,
                                        (Math.random() - 0.5) * 10
                                    ),
                                    life: 1.0
                                };
                                particles.add(particle);
                            }
                            scene.add(particles);
                            
                            // Animate particles
                            const animateParticles = () => {
                                let hasActiveParticles = false;
                                particles.children.forEach(particle => {
                                    if (particle.userData.life > 0) {
                                        particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
                                        particle.userData.velocity.multiplyScalar(0.95);
                                        particle.userData.life -= 0.02;
                                        particle.material.opacity = particle.userData.life;
                                        hasActiveParticles = true;
                                    }
                                });
                                if (hasActiveParticles) {
                                    requestAnimationFrame(animateParticles);
                                } else {
                                    scene.remove(particles);
                                }
                            };
                            animateParticles();
                        }
                        
                        // Remove target
                        const targetIndex = currentTargets.findIndex(t => t.userData.id === target.userData.id);
                        if (targetIndex !== -1) {
                            scene.remove(target);
                            currentTargets.splice(targetIndex, 1);
                        }
                        
                        // Check win conditions
                        if (GAME_MODE === "target_rush" && score >= targetCount) {
                            gameComplete();
                        } else if (GAME_MODE === "hydra_targets" && HYDRA_MODE === "target_count" && score >= gameTargetLimit) {
                            gameComplete();
                        } else {
                            // Spawn replacement targets
                            if (GAME_MODE === "hydra_targets") {
                                while (currentTargets.length < 3) {
                                    createTarget();
                                }
                            } else {
                                createTarget();
                            }
                        }
                    }
                } else {
                    streak = 0;
                    if (${SOUND_EFFECTS}) playMissSound();
                }
                
                updateStats();
            }
            
            function updateStats() {
                const accuracy = shots > 0 ? Math.round((score / shots) * 100) : 100;
                accuracyElement.textContent = accuracy;
                streakElement.textContent = streak;
                if (streak > bestStreak) bestStreak = streak;
            }
            
            function initializeGame() {
                if (GAME_MODE === "hydra_targets") {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => createTarget(), i * 200);
                    }
                } else {
                    createTarget();
                }
            }
            
            function gameComplete() {
                const finalTime = Math.floor((Date.now() - gameStartTime) / 1000);
                const finalAccuracy = shots > 0 ? Math.round((score / shots) * 100) : 100;
                
                if (gameTimer) clearInterval(gameTimer);
                currentTargets.forEach(target => scene.remove(target));
                currentTargets = [];
                gameActive = false;
                
                controls.unlock();
                
                vscode.postMessage({ 
                    command: 'gameComplete', 
                    score: score, 
                    time: finalTime, 
                    accuracy: finalAccuracy, 
                    bestStreak: bestStreak,
                    gameMode: GAME_MODE
                });
            }
            
            // Game timer
            let gameTimer = null;
            if (gameTimeLimit > 0) {
                gameEndTime = gameStartTime + gameTimeLimit;
                gameTimer = setInterval(() => {
                    const remaining = Math.max(0, Math.ceil((gameEndTime - Date.now()) / 1000));
                    timerElement.textContent = remaining + 's left';
                    if (remaining <= 0) {
                        gameComplete();
                    }
                }, 100);
            } else {
                setInterval(() => {
                    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                    timerElement.textContent = elapsed;
                }, 100);
            }
            
            // Event listeners
            controls.addEventListener('lock', () => {
                instructionsElement.classList.add('hidden');
                gameActive = true;
                gameStartTime = Date.now();
                initializeGame();
                if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            });
            
            controls.addEventListener('unlock', () => {
                if (gameActive) {
                    instructionsElement.classList.remove('hidden');
                    gameActive = false;
                }
            });
            
            // Click to start/shoot
            renderer.domElement.addEventListener('click', () => {
                if (!controls.isLocked) {
                    controls.lock();
                } else if (gameActive) {
                    shoot();
                }
            });
            
            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                
                // Movement
                if (controls.isLocked && gameActive) {
                    const delta = 0.016; // ~60fps
                    
                    velocity.x -= velocity.x * 10.0 * delta;
                    velocity.z -= velocity.z * 10.0 * delta;
                    
                    direction.z = Number(moveState.forward) - Number(moveState.backward);
                    direction.x = Number(moveState.right) - Number(moveState.left);
                    direction.normalize();
                    
                    if (moveState.forward || moveState.backward) velocity.z -= direction.z * 40.0 * delta;
                    if (moveState.left || moveState.right) velocity.x -= direction.x * 40.0 * delta;
                    
                    controls.moveRight(-velocity.x * delta);
                    controls.moveForward(-velocity.z * delta);
                }
                
                // Update moving targets
                if (${DEFAULT_MOVE} && GAME_MODE !== "hydra_targets") {
                    currentTargets.forEach(target => {
                        if (target.userData.moveSpeed && target.userData.moveDirection && target.userData.boardBounds) {
                            target.position.add(
                                target.userData.moveDirection.clone().multiplyScalar(target.userData.moveSpeed * 0.016)
                            );
                            
                            // Bounce off board boundaries
                            const bounds = target.userData.boardBounds;
                            if (target.position.x <= bounds.minX || target.position.x >= bounds.maxX) {
                                target.userData.moveDirection.x *= -1;
                            }
                            if (target.position.y <= bounds.minY || target.position.y >= bounds.maxY) {
                                target.userData.moveDirection.y *= -1;
                            }
                            
                            // Keep within bounds
                            target.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, target.position.x));
                            target.position.y = Math.max(bounds.minY, Math.min(bounds.maxY, target.position.y));
                        }
                    });
                }
                
                // Face targets toward camera
                currentTargets.forEach(target => {
                    target.lookAt(camera.position);
                });
                
                renderer.render(scene, camera);
            }
            
            // Resize handler
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
            
            animate();
            updateStats();
        </script>
    </html>
    `;
}
