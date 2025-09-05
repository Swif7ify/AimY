export function getGameHTML(opts?: {
	fontFamily?: string;
	targetGoals?: number;
	targetMove?: boolean;
	targetSpeed?: number;
	targetSize?: number;
	targetTimeExists?: number;
}): string {
	const ff = (opts?.fontFamily || "Segoe UI").replace(/["`]/g, "");
	const TARGET_GOALS = opts?.targetGoals ?? 5;
	const DEFAULT_SIZE = opts?.targetSize ?? 100;
	const DEFAULT_MOVE = opts?.targetMove ?? false;
	const DEFAULT_SPEED = opts?.targetSpeed ?? 3000;
	const TIME_EXISTS = opts?.targetTimeExists ?? true;

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
            --target-white: #ffffff;
            --target-black: #000000;
            --target-blue: #4444ff;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: var(--bg);
            color: var(--fg);
            font-family: var(--font-family), 'Segoe UI', Roboto, sans-serif;
            height: 100vh;
            overflow: hidden;
            cursor: crosshair;
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
            background: rgba(0,0,0,0.28);
            border-radius: 10px;
            backdrop-filter: blur(6px);
            box-shadow: 0 4px 18px rgba(0,0,0,0.6);
            font-size: 13px;
            color: var(--fg);
        }
        .hud-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--accent);
            padding-right: 12px;
            border-right: 1px solid rgba(255,255,255,0.06);
            margin-right: 6px;
            white-space: nowrap;
        }
        .hud-item {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            color: rgba(255,255,255,0.9);
            white-space: nowrap;
        }
        .score { color: #00ff41; font-weight: 700; text-shadow: none; }
        .hit-effect {
            position: absolute;
            color: #00ff41;
            font-size: 36px;
            font-weight: bold;
            pointer-events: none;
            animation: hitAnimation 1.5s ease-out forwards;
            text-shadow: 0 0 15px #00ff41;
            z-index: 1600;
        }
        .miss-effect {
            position: absolute;
            color: #ff4444;
            font-size: 28px;
            font-weight: bold;
            pointer-events: none;
            animation: missAnimation 1s ease-out forwards;
            text-shadow: 0 0 10px #ff4444;
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

        let score = 0;
        let shots = 0;
        let streak = 0;
        let bestStreak = 0;
        let targetCount = ${TARGET_GOALS};
        let gameStartTime = Date.now();
        let currentTarget = null;

        const gameArea = document.getElementById('gameArea');
        const scoreElement = document.getElementById('score');
        const timerElement = document.getElementById('timer');
        const accuracyElement = document.getElementById('accuracy');
        const streakElement = document.getElementById('streak');

        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.className = 'floating-particles';
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.animationDelay = Math.random() * 6 + 's';
                    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
                    particlesContainer.appendChild(particle);
                    setTimeout(() => particle.remove(), 8000);
                }, i * 400);
            }
        }

        setInterval(createParticles, 3000);
        createParticles();

        setInterval(() => {
            const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
            timerElement.textContent = elapsed;
        }, 100);

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

        function makeRealisticTarget(size = 100) {
            const group = new THREE.Group();
            const normalized = [1.0, 0.8, 0.6, 0.4, 0.2, 0.1];
            const colors = [0xffffff, 0xff4444, 0xffffff, 0xff4444, 0xffffff, 0xff0000];
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
            if (currentTarget) scene.remove(currentTarget);
            const size = ${DEFAULT_SIZE};
            const target = makeRealisticTarget(size);
            const margin = size;
            const cx = Math.random() * (window.innerWidth - margin * 2) + margin;
            const cy = Math.random() * (window.innerHeight - margin * 2) + margin;
            placeGroupAtScreenPos(target, cx, cy);
            
            target.userData.moveSpeed = ${DEFAULT_MOVE} ? ${DEFAULT_SPEED} / 1000 : 0;
            target.userData.moveDirection = {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            };
            target.userData.startTime = Date.now();
            
            scene.add(target);
            currentTarget = target;
            
            if (${TIME_EXISTS} > 0) {
                setTimeout(() => {
                    if (currentTarget === target) {
                        streak = 0;
                        spawnMissEffect(window.innerWidth / 2, window.innerHeight / 2);
                        createTarget();
                    }
                }, ${TIME_EXISTS});
            }
        }

        function screenToWorld(clientX, clientY) {
            const rect = renderer.domElement.getBoundingClientRect();
            const canvasX = clientX - rect.left;
            const canvasY = clientY - rect.top;
            return { x: canvasX - rect.width / 2, y: rect.height / 2 - canvasY };
        }

        function computePointsFromScreen(clientX, clientY) {
            if (!currentTarget) return { hit: false, points: 0 };
            const world = screenToWorld(clientX, clientY);
            const localClick = new THREE.Vector3(world.x, world.y, 0);
            const localPoint = currentTarget.worldToLocal(localClick);
            const dist = Math.hypot(localPoint.x, localPoint.y);
            const radii = currentTarget.userData.radii || [];
            for (let j = radii.length - 1; j >= 0; j--) {
                const outer = radii[j];
                const inner = (j + 1 < radii.length) ? radii[j + 1] : 0;
                if (dist <= outer && dist >= inner) return { hit: true, points: 1 };
            }
            return { hit: false, points: 0 };
        }

        function onPointerDown(e) {
            shots++;
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
            const hitResult = computePointsFromScreen(e.clientX, e.clientY);
            let hitTarget = false;
            if (hitResult.hit) {
                hitTarget = true;
                const points = hitResult.points;
                score += points;
                streak++;
                scoreElement.textContent = score;
                spawnHitEffect(e.clientX, e.clientY, points);
                let explosionPos = null;
                if (intersects.length > 0) {
                    const hit = intersects.find(i => {
                        let o = i.object;
                        while (o) {
                            if (o.name === 'target') return true;
                            o = o.parent;
                        }
                        return false;
                    });
                    if (hit) explosionPos = hit.point;
                }
                if (!explosionPos && currentTarget) explosionPos = new THREE.Vector3(currentTarget.position.x, currentTarget.position.y, 0);
                if (explosionPos) createHitExplosion(explosionPos);
                if (score >= targetCount) gameComplete();
                else createTarget();
            }
            if (!hitTarget) {
                streak = 0;
                spawnMissEffect(e.clientX, e.clientY);
            }
            updateStats();
        }

        function spawnHitEffect(clientX, clientY, points) {
            const hitEffect = document.createElement('div');
            hitEffect.className = 'hit-effect';
            hitEffect.textContent = '+' + points;
            hitEffect.style.left = clientX + 'px';
            hitEffect.style.top = clientY + 'px';
            gameArea.appendChild(hitEffect);
            setTimeout(() => hitEffect.remove(), 1500);
        }

        function spawnMissEffect(clientX, clientY) {
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
            if (currentTarget) scene.remove(currentTarget);
            vscode.postMessage({ command: 'gameComplete', score: score, time: finalTime, accuracy: finalAccuracy, bestStreak: bestStreak });
            window.removeEventListener('pointerdown', onPointerDown);
        }

        function animate() {
            requestAnimationFrame(animate);
            
            if (currentTarget && ${DEFAULT_MOVE}) {
                const deltaTime = 0.016;
                const speed = currentTarget.userData.moveSpeed || 0;
                const dir = currentTarget.userData.moveDirection || { x: 0, y: 0 };
                
                currentTarget.position.x += dir.x * speed * deltaTime * 60;
                currentTarget.position.y += dir.y * speed * deltaTime * 60;
                
                const bounds = {
                    left: -window.innerWidth / 2 + 50,
                    right: window.innerWidth / 2 - 50,
                    top: window.innerHeight / 2 - 50,
                    bottom: -window.innerHeight / 2 + 50
                };
                
                if (currentTarget.position.x <= bounds.left || currentTarget.position.x >= bounds.right) {
                    currentTarget.userData.moveDirection.x *= -1;
                }
                if (currentTarget.position.y <= bounds.bottom || currentTarget.position.y >= bounds.top) {
                    currentTarget.userData.moveDirection.y *= -1;
                }
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
        createTarget();
        updateStats();
    </script>
</body>
</html>`;
}
