export function getGameHTML(opts?: {
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
	const DEFAULT_SIZE = opts?.targetSize ?? 100;
	const DEFAULT_MOVE = opts?.targetMove ?? false;
	const DEFAULT_SPEED = opts?.targetSpeed ?? 3000;
	const TIME_EXISTS = GAME_MODE === "hydra_targets" ? 0 : opts?.targetTimeExists ?? 3000;
	const SOUND_EFFECTS = opts?.enableSoundEffects ?? true;
	const SOUND_VOLUME = opts?.soundVolume ?? 80;
	const ENABLE_EFFECTS = opts?.enableEffects ?? true;

	const TIME_FRENZY_DURATION = opts?.timeFrenzyDuration ?? 60000;
	const HYDRA_TARGET_COUNT = opts?.hydraTargetCount ?? 20;
	const HYDRA_TOTAL_TIME = opts?.hydraTotalTime ?? 60000;
	const HYDRA_MODE = opts?.hydraMode || "target_count"; 

	// theme-aware colors for HUD and effects
	const TARGET_WHITE = IS_LIGHT ? "#111111" : "#ffffff";
	const TARGET_WHITE_HEX = IS_LIGHT ? "0x111111" : "0xffffff";

	const HUD_BG = IS_LIGHT ? "rgba(255,255,255,0.86)" : "rgba(0,0,0,0.28)";
	const HUD_TEXT = IS_LIGHT ? "#111111" : "var(--fg)";
	const HUD_ACCENT = IS_LIGHT ? "#0a66ff" : "var(--accent)";
	const SCORE_COLOR = IS_LIGHT ? "#006900" : "#00ff41";
	const HIT_SHADOW = IS_LIGHT ? "0 0 8px rgba(0, 150, 0, 0.25)" : "0 0 15px #00ff41";
	const HIT_COLOR = IS_LIGHT ? "#008000" : "#00ff41";
	const MISS_COLOR = IS_LIGHT ? "#b30000" : "#ff4444";

	const makeCursorDataUrl = (strokeColor: string) => {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="12" stroke="${strokeColor}" stroke-width="2" fill="none"/><line x1="16" y1="4" x2="16" y2="28" stroke="${strokeColor}" stroke-width="2"/><line x1="4" y1="16" x2="28" y2="16" stroke="${strokeColor}" stroke-width="2"/></svg>`;
		return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 16 16, crosshair`;
	};

	const CURSOR_COLOR = IS_LIGHT ? makeCursorDataUrl("#111") : makeCursorDataUrl("#ffffff");

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AimY Game</title>
    <style>
        :root {
            --font-family: ${ff};
            --bg: var(--vscode-editor-background, #1e1e1e);
            --fg: var(--vscode-editor-foreground, #d4d4d4);
            --accent: var(--vscode-button-background, #007acc);
            --target-red: #ff4444;
            --target-white: ${TARGET_WHITE};
            --cursor: ${CURSOR_COLOR};

            /* HUD theme-aware vars */
            --hud-bg: ${HUD_BG};
            --hud-text: ${HUD_TEXT};
            --hud-accent: ${HUD_ACCENT};
            --score-color: ${SCORE_COLOR};
            --hit-shadow: ${HIT_SHADOW};
            --hit-color: ${HIT_COLOR};
            --miss-color: ${MISS_COLOR};
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: var(--bg);
            color: var(--fg);
            font-family: var(--font-family), 'Segoe UI', Roboto, sans-serif;
            height: 100vh;
            overflow: hidden;
            cursor: var(--cursor, crosshair);
        }
        .game-container { position: relative; width: 100vw; height: 100vh; }
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
        .score { color: var(--score-color); font-weight: 700; text-shadow: none; }
        .hit-effect {
            position: absolute;
            color: var(--hit-color);
            font-size: 36px;
            font-weight: bold;
            pointer-events: none;
            animation: hitAnimation 1.5s ease-out forwards;
            text-shadow: var(--hit-shadow);
            z-index: 1600;
        }
        .miss-effect {
            position: absolute;
            color: var(--miss-color);
            font-size: 28px;
            font-weight: bold;
            pointer-events: none;
            animation: missAnimation 1s ease-out forwards;
            text-shadow: 0 0 10px rgba(0,0,0,0.15);
            z-index: 1600;
        }
        @keyframes hitAnimation {
            0% { opacity: 1; transform: scale(1) translateY(0); }
            50% { opacity: 1; transform: scale(1.5) translateY(-20px); }
            100% { opacity: 0; transform: scale(2) translateY(-80px); }
        }
        @keyframes missAnimation {
            0% { opacity: 1; transform: scale(1) rotate(0deg); }
            100% { opacity: 0; transform: scale(1.2) rotate(10deg); }
        }
        .floating-particles {
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: float 6s infinite linear;
        }
        @keyframes float {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-10px) rotate(360deg); opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="game-container">
        <div id="particles"></div>
        <div class="hud">
            <div class="hud-title">AimY</div>
            <div class="hud-item">Score: <span class="score" id="score">0</span>/<span id="targetTotal">${TARGET_GOALS}</span></div>
            <div class="hud-item">Time: <span id="timer">0</span>s</div>
            <div class="hud-item">Acc: <span id="accuracy">100</span>%</div>
            <div class="hud-item">Streak: <span id="streak">0</span></div>
        </div>
        <div id="gameArea"></div>
    </div>

    <script type="module">
        import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
        const vscode = acquireVsCodeApi();

        const SOUND_EFFECTS = ${JSON.stringify(SOUND_EFFECTS)};
        const SOUND_VOLUME = ${Number(SOUND_VOLUME)};
        const ENABLE_EFFECTS = ${JSON.stringify(ENABLE_EFFECTS)};
        const TARGET_WHITE_HEX = ${TARGET_WHITE_HEX};

        let audioCtx = null;
        let masterGain = null;
        if (SOUND_EFFECTS) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                masterGain = audioCtx.createGain();
                masterGain.gain.value = Math.max(0, Math.min(1, SOUND_VOLUME/100));
                masterGain.connect(audioCtx.destination);
            } catch (e) {
                audioCtx = null;
                masterGain = null;
            }
        }

        function ensureAudioResume() {
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
        }

        function playHitSound() {
            if (!SOUND_EFFECTS || !audioCtx || !masterGain) return;
            ensureAudioResume();
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
            if (!SOUND_EFFECTS || !audioCtx || !masterGain) return;
            ensureAudioResume();
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

        let score = 0;
        let shots = 0;
        let streak = 0;
        let bestStreak = 0;
        let targetCount = ${TARGET_GOALS};
        let gameStartTime = Date.now();
        let gameEndTime = null;
        let currentTargets = []; // Changed to array for hydra mode
        let gameTimeLimit = 0;
        let gameTargetLimit = 0;

        // Game mode setup
        const GAME_MODE = "${GAME_MODE}";
        const HYDRA_MODE = "${HYDRA_MODE}";
        if (GAME_MODE === "time_frenzy") {
            gameTimeLimit = ${TIME_FRENZY_DURATION};
            targetCount = 999; // unlimited targets in time mode
            document.getElementById('targetTotal').textContent = '∞';
        } else if (GAME_MODE === "hydra_targets") {
            if (HYDRA_MODE === "timed") {
                gameTimeLimit = ${HYDRA_TOTAL_TIME};
                targetCount = 999; // unlimited targets in timed hydra mode
                document.getElementById('targetTotal').textContent = '∞';
            } else {
                // target_count mode
                gameTimeLimit = 0; // no time limit
                gameTargetLimit = ${HYDRA_TARGET_COUNT};
                targetCount = gameTargetLimit;
                document.getElementById('targetTotal').textContent = gameTargetLimit;
            }
        } else {
            document.getElementById('targetTotal').textContent = targetCount;
        }

        const gameArea = document.getElementById('gameArea');
        const scoreElement = document.getElementById('score');
        const timerElement = document.getElementById('timer');
        const accuracyElement = document.getElementById('accuracy');
        const streakElement = document.getElementById('streak');

        // Game timer for time-limited modes
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
            // Regular timer for target_rush
            setInterval(() => {
                const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                timerElement.textContent = elapsed;
            }, 100);
        }

        const w = window.innerWidth;
        const h = window.innerHeight;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        gameArea.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -1000, 1000);
        camera.position.z = 10;
        scene.add(camera);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function makeTarget(size = 100) {
            const group = new THREE.Group();
            const colors = [TARGET_WHITE_HEX, 0xff4444, TARGET_WHITE_HEX, 0xff4444, TARGET_WHITE_HEX, 0xff0000];
            const normalized = [1.0, 0.8, 0.6, 0.4, 0.2, 0.1];
            const radii = normalized.map(r => (size / 2) * r);

            for (let i = 0; i < radii.length; i++) {
                const outer = radii[i];
                const inner = (i + 1 < radii.length) ? radii[i + 1] : 0;
                const geo = new THREE.RingGeometry(inner, outer, 64);
                const mat = new THREE.MeshBasicMaterial({ color: colors[i], side: THREE.DoubleSide });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.z = -i * 0.01;
                group.add(mesh);
            }

            const hitGeo = new THREE.CircleGeometry(size / 2, 64);
            const hitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0001, side: THREE.DoubleSide });
            const hitMesh = new THREE.Mesh(hitGeo, hitMat);
            hitMesh.position.z = 0.01;
            hitMesh.name = 'hitMask';
            group.add(hitMesh);

            group.userData = {
                isTarget: true,
                radii: radii
            };

            group.name = 'target';
            return group;
        }

        function placeGroupAtScreenPos(group, clientX, clientY) {
            const x = clientX - window.innerWidth / 2;
            const y = window.innerHeight / 2 - clientY;
            group.position.set(x, y, 0);
        }

        function createTarget() {
            const size = ${DEFAULT_SIZE};
            const target = makeTarget(size);
            const margin = size;
            const cx = Math.random() * (window.innerWidth - margin * 2) + margin;
            const cy = Math.random() * (window.innerHeight - margin * 2) + margin;
            placeGroupAtScreenPos(target, cx, cy);
            
            // Disable movement for hydra mode, use normal movement settings for other modes
            const shouldMove = GAME_MODE === "hydra_targets" ? false : ${DEFAULT_MOVE};
            target.userData.moveSpeed = shouldMove ? ${DEFAULT_SPEED} / 1000 : 0;
            target.userData.moveDirection = {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            };
            target.userData.startTime = Date.now();
            target.userData.id = Date.now() + Math.random(); // unique ID
            
            scene.add(target);
            
            if (GAME_MODE === "hydra_targets") {
                currentTargets.push(target);
            } else {
                if (currentTargets[0]) scene.remove(currentTargets[0]);
                currentTargets = [target];
            }
            
            if (${TIME_EXISTS} > 0) {
                setTimeout(() => {
                    const targetIndex = currentTargets.findIndex(t => t.userData.id === target.userData.id);
                    if (targetIndex !== -1) {
                        streak = 0;
                        spawnMissEffect(window.innerWidth / 2, window.innerHeight / 2);
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

        function initializeGame() {
            if (GAME_MODE === "hydra_targets") {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => createTarget(), i * 200);
                }
            } else {
                createTarget();
            }
        }

        function screenToWorld(clientX, clientY) {
            const rect = renderer.domElement.getBoundingClientRect();
            const canvasX = clientX - rect.left;
            const canvasY = clientY - rect.top;
            return { x: canvasX - rect.width / 2, y: rect.height / 2 - canvasY };
        }

        function computePointsFromClick(clientX, clientY) {
            let bestHit = { hit: false, points: 0, target: null };
            
            for (const target of currentTargets) {
                const world = screenToWorld(clientX, clientY);
                const localClick = new THREE.Vector3(world.x, world.y, 0);
                const localPoint = target.worldToLocal(localClick);
                const dist = Math.hypot(localPoint.x, localPoint.y);
                const radii = target.userData.radii || [];
                
                for (let j = radii.length - 1; j >= 0; j--) {
                    const outer = radii[j];
                    const inner = (j + 1 < radii.length) ? radii[j + 1] : 0;
                    if (dist <= outer && dist >= inner) {
                        bestHit = { hit: true, points: 1, target };
                        break;
                    }
                }
                if (bestHit.hit) break;
            }
            
            return bestHit;
        }

        function onPointerDown(e) {
            shots++;
            if (SOUND_EFFECTS && audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            
            const hitResult = computePointsFromClick(e.clientX, e.clientY);
            
            if (hitResult.hit && hitResult.target) {
                const points = hitResult.points;
                score += points;
                streak++;
                scoreElement.textContent = score;
                
                if (ENABLE_EFFECTS) spawnHitEffect(e.clientX, e.clientY, points);
                if (SOUND_EFFECTS) playHitSound();
                
                const targetIndex = currentTargets.findIndex(t => t.userData.id === hitResult.target.userData.id);
                if (targetIndex !== -1) {
                    scene.remove(hitResult.target);
                    currentTargets.splice(targetIndex, 1);
                    
                    // Create explosion effect
                    createHitExplosion(hitResult.target.position);
                }
                
                // Win / end conditions
                if (GAME_MODE === "target_rush" && score >= targetCount) {
                    gameComplete();
                } else if (GAME_MODE === "hydra_targets" && HYDRA_MODE === "target_count" && score >= gameTargetLimit) {
                    gameComplete();
                } else {
                    // Spawn replacements:
                    // - Hydra mode (both timed and target-count): keep 3 targets on screen
                    // - Other modes: spawn a single new target as before
                    if (GAME_MODE === "hydra_targets") {
                        while (currentTargets.length < 3) {
                            createTarget();
                        }
                    } else {
                        createTarget();
                    }
                }
            } else {
                streak = 0;
                spawnMissEffect(e.clientX, e.clientY);
            }
            updateStats();
        }

        function spawnHitEffect(clientX, clientY, points) {
            if (!ENABLE_EFFECTS) return;
            const hitEffect = document.createElement('div');
            hitEffect.className = 'hit-effect';
            hitEffect.textContent = '+' + points;
            hitEffect.style.left = clientX + 'px';
            hitEffect.style.top = clientY + 'px';
            gameArea.appendChild(hitEffect);
            setTimeout(() => hitEffect.remove(), 1500);
        }

        function spawnMissEffect(clientX, clientY) {
            if (SOUND_EFFECTS && audioCtx) {
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume().then(() => { try { playMissSound(); } catch (e) {} }).catch(() => {});
                } else {
                    try { playMissSound(); } catch (e) {}
                }
            }
            if (!ENABLE_EFFECTS) return;
            const missEffect = document.createElement('div');
            missEffect.className = 'miss-effect';
            missEffect.textContent = 'MISS';
            missEffect.style.left = clientX + 'px';
            missEffect.style.top = clientY + 'px';
            gameArea.appendChild(missEffect);
            setTimeout(() => missEffect.remove(), 1000);
        }

        function updateStats() {
            const accuracy = shots > 0 ? Math.round((score / shots) * 100) : 100;
            accuracyElement.textContent = accuracy;
            streakElement.textContent = streak;
            if (streak > bestStreak) bestStreak = streak;
        }

        function createHitExplosion(position) {
            if (!ENABLE_EFFECTS) return;
            const particleCount = 15;
            const particles = [];
            for (let i = 0; i < particleCount; i++) {
                const geo = new THREE.SphereGeometry(2, 8, 8);
                const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(Math.random(), 1, 0.5), transparent: true, opacity: 1 });
                const particle = new THREE.Mesh(geo, mat);
                particle.position.copy(position);
                particle.userData = { velocity: new THREE.Vector3((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 50), life: 1.0 };
                scene.add(particle);
                particles.push(particle);
            }
            const animateParticles = () => {
                particles.forEach((particle, index) => {
                    if (particle.userData.life > 0) {
                        particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
                        particle.userData.velocity.multiplyScalar(0.95);
                        particle.userData.life -= 0.02;
                        particle.material.opacity = particle.userData.life;
                        particle.scale.setScalar(particle.userData.life);
                        if (particle.userData.life <= 0) {
                            scene.remove(particle);
                            particles.splice(index, 1);
                        }
                    }
                });
                if (particles.length > 0) requestAnimationFrame(animateParticles);
            };
            animateParticles();
        }

        function gameComplete() {
            const finalTime = Math.floor((Date.now() - gameStartTime) / 1000);
            const finalAccuracy = shots > 0 ? Math.round((score / shots) * 100) : 100;
            
            if (gameTimer) clearInterval(gameTimer);
            currentTargets.forEach(target => scene.remove(target));
            currentTargets = [];
            
            vscode.postMessage({ 
                command: 'gameComplete', 
                score: score, 
                time: finalTime, 
                accuracy: finalAccuracy, 
                bestStreak: bestStreak,
                gameMode: GAME_MODE
            });
            window.removeEventListener('pointerdown', onPointerDown);
        }

        function animate() {
            requestAnimationFrame(animate);
            
            // Update moving targets - skip movement entirely for hydra mode
            if (${DEFAULT_MOVE} && GAME_MODE !== "hydra_targets") {
                const deltaTime = 0.016;
                currentTargets.forEach(target => {
                    const speed = target.userData.moveSpeed || 0;
                    const dir = target.userData.moveDirection || { x: 0, y: 0 };
                    
                    target.position.x += dir.x * speed * deltaTime * 60;
                    target.position.y += dir.y * speed * deltaTime * 60;
                    
                    const bounds = {
                        left: -window.innerWidth / 2 + 50,
                        right: window.innerWidth / 2 - 50,
                        top: window.innerHeight / 2 - 50,
                        bottom: -window.innerHeight / 2 + 50
                    };
                    
                    if (target.position.x <= bounds.left || target.position.x >= bounds.right) {
                        target.userData.moveDirection.x *= -1;
                    }
                    if (target.position.y <= bounds.bottom || target.position.y >= bounds.top) {
                        target.userData.moveDirection.y *= -1;
                    }
                });
            }
            
            renderer.render(scene, camera);
        }

        function onResize() {
            const W = window.innerWidth;
            const H = window.innerHeight;
            renderer.setSize(W, H);
            camera.left = W / -2;
            camera.right = W / 2;
            camera.top = H / 2;
            camera.bottom = H / -2;
            camera.updateProjectionMatrix();
        }

        window.addEventListener('resize', onResize, false);
        window.addEventListener('pointerdown', onPointerDown, false);

        animate();
        initializeGame();
        updateStats();
    </script>
</body>
</html>`;
}
