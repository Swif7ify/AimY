export function getGameHTML(targetCount: number): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AimY Game</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, #1e1e1e, #2d2d30);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            height: 100vh;
            overflow: hidden;
            cursor: crosshair;
        }
        
        .game-container {
            position: relative;
            width: 100vw;
            height: 100vh;
        }
        
        .hud {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(0,0,0,0.7);
            padding: 15px;
            border-radius: 10px;
            border: 2px solid #007acc;
        }
        
        .target {
            position: absolute;
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, #ff4444, #cc0000);
            border-radius: 50%;
            cursor: pointer;
            border: 3px solid #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.1s ease;
            animation: pulse 2s infinite;
        }
        
        .target:hover {
            transform: scale(1.1);
            box-shadow: 0 0 20px #ff4444;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
        }
        
        .hit-effect {
            position: absolute;
            color: #00ff00;
            font-size: 30px;
            font-weight: bold;
            pointer-events: none;
            animation: hitAnimation 1s ease-out forwards;
        }
        
        @keyframes hitAnimation {
            0% { opacity: 1; transform: scale(1) translateY(0); }
            100% { opacity: 0; transform: scale(1.5) translateY(-50px); }
        }
        
        .complete-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            display: none;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 2000;
        }
        
        .complete-text {
            font-size: 48px;
            color: #00ff00;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .stats {
            font-size: 24px;
            color: #007acc;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <div class="hud">
            <div>🎯 AimY Game</div>
            <div>Score: <span id="score">0</span>/${targetCount}</div>
            <div>Time: <span id="timer">0</span>s</div>
        </div>
        
        <div id="gameArea"></div>
        
        <div class="complete-screen" id="completeScreen">
            <div class="complete-text">🎉 GAME COMPLETE! 🎉</div>
            <div class="stats">
                <div>Final Score: <span id="finalScore">0</span>/${targetCount}</div>
                <div>Time: <span id="finalTime">0</span> seconds</div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        let score = 0;
        let targetCount = ${targetCount};
        let gameStartTime = Date.now();
        let currentTarget = null;
        
        const gameArea = document.getElementById('gameArea');
        const scoreElement = document.getElementById('score');
        const timerElement = document.getElementById('timer');
        
        // Update timer
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
            timerElement.textContent = elapsed;
        }, 100);
        
        function createTarget() {
            if (currentTarget) {
                currentTarget.remove();
            }
            
            const target = document.createElement('div');
            target.className = 'target';
            target.innerHTML = '🎯';
            
            // Random position (avoiding edges)
            const x = Math.random() * (window.innerWidth - 100) + 50;
            const y = Math.random() * (window.innerHeight - 150) + 100;
            
            target.style.left = x + 'px';
            target.style.top = y + 'px';
            
            target.addEventListener('click', hitTarget);
            
            gameArea.appendChild(target);
            currentTarget = target;
            
            // Auto-move target after 3 seconds
            setTimeout(() => {
                if (currentTarget === target) {
                    createTarget();
                }
            }, 3000);
        }
        
        function hitTarget(event) {
            score++;
            scoreElement.textContent = score;
            
            // Hit effect
            const hitEffect = document.createElement('div');
            hitEffect.className = 'hit-effect';
            hitEffect.textContent = '+1';
            hitEffect.style.left = event.target.style.left;
            hitEffect.style.top = event.target.style.top;
            gameArea.appendChild(hitEffect);
            
            setTimeout(() => hitEffect.remove(), 1000);
            
            // Send message to extension
            vscode.postMessage({
                command: 'targetHit',
                score: score
            });
            
            if (score >= targetCount) {
                gameComplete();
            } else {
                createTarget();
            }
        }
        
        function gameComplete() {
            const finalTime = Math.floor((Date.now() - gameStartTime) / 1000);
            
            document.getElementById('finalScore').textContent = score;
            document.getElementById('finalTime').textContent = finalTime;
            document.getElementById('completeScreen').style.display = 'flex';
            
            if (currentTarget) {
                currentTarget.remove();
            }
            
            // Send completion message to extension
            vscode.postMessage({
                command: 'gameComplete',
                score: score,
                time: finalTime
            });
        }
        
        // Start the game
        createTarget();
    </script>
</body>
</html>`;
}
