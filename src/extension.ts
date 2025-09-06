import * as vscode from "vscode";
import { getGameHTML } from "./gameHtml";
import { saveGameStats } from "./saveGameStats";

export function activate(context: vscode.ExtensionContext) {
	// game state
	const cfg = vscode.workspace.getConfiguration("aimy");

	const clamp = (v: number, min: number, max: number) => {
		if (!Number.isFinite(v)) {
			return min;
		}
		return Math.max(min, Math.min(max, Math.round(v)));
	};

	let enableExtension = cfg.get<boolean>("enableExtension", true);
	let enableSoundEffects = cfg.get<boolean>("enableSoundEffects", true);
	let soundVolume = clamp(cfg.get<number>("soundVolume", 80), 0, 100);
	let enableStatsSave = cfg.get<boolean>("enableStatsSave", true);
	let enableEffects = cfg.get<boolean>("enableEffects", true);

	if (!enableExtension) {
		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'AimY Extension is disabled in settings. Use the "AimY: Start Game" command to run the game manually.',
				cancellable: false,
			},
			async () => {
				await new Promise((res) => setTimeout(res, 3000));
			}
		);
	}
	let idleDelay = clamp(cfg.get<number>("idleTimer", 60000), 1000, 3600000); // ms
	let targetGoals = clamp(cfg.get<number>("targetGoals", 5), 1, 100);
	let targetMove = cfg.get<boolean>("targetMove", false);
	let targetSpeed = clamp(cfg.get<number>("targetSpeed", 3000), 100, 60000); // ms
	let targetSize = clamp(cfg.get<number>("targetSize", 100), 10, 1000); // px
	let targetTimeExists = clamp(cfg.get<number>("targetTimeExists", 3000), 0, 60000); // ms

	let idleTimer: NodeJS.Timeout | undefined;
	const changeDisposable = vscode.workspace.onDidChangeTextDocument(() => resetTimer());
	const selDisposable = vscode.window.onDidChangeTextEditorSelection(() => {
		resetTimer();
	});
	const activeDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
		resetTimer();
	});
	context.subscriptions.push(changeDisposable);
	context.subscriptions.push(activeDisposable);
	context.subscriptions.push(selDisposable);

	const configDisposable = vscode.workspace.onDidChangeConfiguration((e) => {
		if (!e.affectsConfiguration("aimy")) {
			return;
		}
		const newCfg = vscode.workspace.getConfiguration("aimy");
		enableExtension = newCfg.get<boolean>("enableExtension", true);
		idleDelay = clamp(newCfg.get<number>("idleTimer", 60000), 1000, 3600000);
		targetGoals = clamp(newCfg.get<number>("targetGoals", 5), 1, 100);
		targetMove = newCfg.get<boolean>("targetMove", false);
		targetSpeed = clamp(newCfg.get<number>("targetSpeed", 3000), 100, 60000);
		targetSize = clamp(newCfg.get<number>("targetSize", 100), 10, 1000);
		targetTimeExists = clamp(newCfg.get<number>("targetTimeExists", 3000), 0, 60000);
		enableSoundEffects = newCfg.get<boolean>("enableSoundEffects", true);
		soundVolume = clamp(newCfg.get<number>("soundVolume", 80), 0, 100);
		enableStatsSave = newCfg.get<boolean>("enableStatsSave", true);
		enableEffects = newCfg.get<boolean>("enableEffects", true);
		resetTimer();
	});
	context.subscriptions.push(configDisposable);

	const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	status.command = "aimy.toggle";
	context.subscriptions.push(status);

	function updateStatus() {
		status.text = enableExtension ? "AimY: On" : "AimY: Off";
		status.show();
	}
	updateStatus();

	const toggleDisposable = vscode.commands.registerCommand("aimy.toggle", async () => {
		enableExtension = !enableExtension;
		await vscode.workspace
			.getConfiguration("aimy")
			.update("enableExtension", enableExtension, vscode.ConfigurationTarget.Global);
		updateStatus();
		resetTimer();
	});
	context.subscriptions.push(toggleDisposable);

	let gameActive = false;
	let gamePanel: vscode.WebviewPanel | undefined;
	let openTabsDisposable: vscode.Disposable | undefined;
	let savedTabs: vscode.Tab[] = [];
	let suppressReopen = false;

	function resetTimer() {
		if (idleTimer) {
			clearTimeout(idleTimer);
		}

		if (!enableExtension) {
			return;
		}

		idleTimer = setTimeout(() => {
			if (!gameActive) {
				vscode.window.withProgress(
					{
						location: vscode.ProgressLocation.Notification,
						title: "You have been idle for 5 seconds! Game is starting...",
						cancellable: false,
					},
					async () => {
						await new Promise((res) => setTimeout(res, 3000));
					}
				);
				showGame();
			}
		}, idleDelay);
	}

	resetTimer();

	function showGame() {
		if (gameActive && !suppressReopen) {
			return;
		}

		if (gameActive || suppressReopen) {
			return;
		}

		gameActive = true;

		vscode.commands.executeCommand("workbench.action.closeSidebar");
		vscode.commands.executeCommand("workbench.action.closePanel");

		// Save currently open tabs
		savedTabs = vscode.window.tabGroups.all.flatMap((group) => group.tabs);

		// Close all tabs
		vscode.commands.executeCommand("workbench.action.closeAllEditors");

		// Create fullscreen game webview
		gamePanel = vscode.window.createWebviewPanel("aimyGame", "AimY - Hit the Targets!", vscode.ViewColumn.One, {
			enableScripts: true,
			retainContextWhenHidden: true,
		});

		gamePanel.onDidDispose(
			() => {
				if (gameActive && !suppressReopen) {
					gameActive = false;
					setTimeout(() => {
						showGame();
					}, 200);
				}
			},
			null,
			context.subscriptions
		);

		const editorCfg = vscode.workspace.getConfiguration("editor");
		const fontFamily = (editorCfg.get<string>("fontFamily") || "").toString();

		// Prevent new tabs from opening while game is active
		openTabsDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
			if (gameActive && vscode.window.activeTextEditor) {
				vscode.commands.executeCommand("workbench.action.closeActiveEditor");
				vscode.window.withProgress(
					{
						location: vscode.ProgressLocation.Notification,
						title: "Complete the game to unlock editing!",
						cancellable: false,
					},
					async () => {
						await new Promise((res) => setTimeout(res, 3000));
					}
				);
			}
		});

		const isLightTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light;

		gamePanel.webview.html = getGameHTML({
			fontFamily,
			targetGoals,
			targetMove,
			targetSpeed,
			targetSize,
			targetTimeExists,
			enableSoundEffects,
			soundVolume,
			enableEffects,
			isLight: isLightTheme,
		});

		// Handle messages from webview
		gamePanel.webview.onDidReceiveMessage(
			async (message) => {
				if (!message || !message.command) {
					return;
				}
				if (message.command === "gameComplete") {
					try {
						if (enableStatsSave) {
							await saveGameStats(context, {
								score: message.score,
								time: message.time,
								accuracy: message.accuracy,
								bestStreak: message.bestStreak,
								timestamp: new Date().toISOString(),
							});
						}
					} catch (err) {
						console.error("Failed saving stats:", err);
					}

					suppressReopen = true;
					endGame();

					await vscode.window.withProgress(
						{
							location: vscode.ProgressLocation.Notification,
							title: "Game Complete! Restoring your workspace...",
							cancellable: false,
						},
						async () => {
							await new Promise((res) => setTimeout(res, 3000));
						}
					);
					suppressReopen = false;
				}
			},
			undefined,
			context.subscriptions
		);
	}

	function endGame() {
		suppressReopen = true;
		gameActive = false;

		if (openTabsDisposable) {
			openTabsDisposable.dispose();
			openTabsDisposable = undefined;
		}

		if (gamePanel) {
			gamePanel.dispose();
			gamePanel = undefined;
		}

		// Restore previously open tabs
		setTimeout(() => {
			savedTabs.forEach((tab) => {
				if (tab.input && typeof tab.input === "object" && tab.input !== null && (tab.input as any).uri) {
					vscode.window.showTextDocument((tab.input as any).uri, { preview: false });
				}
			});
			savedTabs = [];
		}, 500);
	}

	const disposable = vscode.commands.registerCommand("aimy.startGame", () => {
		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: `Game Manually Started! Game is starting...`,
				cancellable: false,
			},
			async () => {
				await new Promise((res) => setTimeout(res, 3000));
			}
		);
		showGame();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
