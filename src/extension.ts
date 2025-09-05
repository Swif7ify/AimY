// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	vscode.window.showInformationMessage("Window Has Started"); // DEBUGGING

	let idleTimer: NodeJS.Timeout | undefined;
	const changeDisposable = vscode.workspace.onDidChangeTextDocument(() => resetTimer());
	context.subscriptions.push(changeDisposable);

	function resetTimer() {
		if (idleTimer) {
			clearTimeout(idleTimer);
		}

		idleTimer = setTimeout(() => {
			vscode.window.showInformationMessage("You've been idle for 5 seconds! Game is starting...");
			showGame();
		}, 5 * 1000); // 5 seconds
	}

	resetTimer();

	function showGame() {
		const panel = vscode.window.createWebviewPanel("aimTrainer", "AimY", vscode.ViewColumn.One, {
			enableScripts: true,
		});

		panel.webview.html = getGameHtml();
	}

	function getGameHtml(): string {
		return `
      <!DOCTYPE html>
      <html>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111;color:white;margin:0;">
        <canvas id="gameCanvas" width="600" height="400" style="background:#222;border:2px solid white;"></canvas>
        <p id="score" style="position:absolute;top:10px;left:10px;color:white;font-family:sans-serif;">Score: 0</p>
        <script>
          const canvas = document.getElementById('gameCanvas');
          const ctx = canvas.getContext('2d');
          const scoreText = document.getElementById('score');
          let score = 0;

          function spawnTarget() {
            const x = Math.random() * (canvas.width - 50) + 25;
            const y = Math.random() * (canvas.height - 50) + 25;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.fillStyle = "red";
            ctx.fill();

            // save target position
            return {x, y, r: 25};
          }

          let currentTarget = spawnTarget();

          canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            const dx = clickX - currentTarget.x;
            const dy = clickY - currentTarget.y;
            if (Math.sqrt(dx*dx + dy*dy) <= currentTarget.r) {
              score++;
              scoreText.textContent = "Score: " + score;
              currentTarget = spawnTarget();
            }
          });
        </script>
      </body>
      </html>
    `;
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand("aimy.startGame", () => {
		vscode.window.showInformationMessage("Manually Started, Game is starting...");
		showGame();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
