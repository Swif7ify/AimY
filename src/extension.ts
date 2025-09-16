import * as vscode from "vscode";
import { getGameHTML } from "./gameHtml";
import { saveGameStats } from "./saveGameStats";

export function activate(context: vscode.ExtensionContext) {
	const cfg = vscode.workspace.getConfiguration("aimy");

	const clamp = (v: number, min: number, max: number) => {
		if (!Number.isFinite(v)) {
			return min;
		}
		return Math.max(min, Math.min(max, Math.round(v)));
	};

	const DIFFICULTY_PRESETS: Record<
		string,
		{ targetGoals: number; targetMove: boolean; targetSpeed: number; targetSize: number; targetTimeExists: number }
	> = {
		easy: { targetGoals: 10, targetMove: false, targetSpeed: 1000, targetSize: 140, targetTimeExists: 4000 },
		normal: { targetGoals: 15, targetMove: false, targetSpeed: 1500, targetSize: 100, targetTimeExists: 2000 },
		hard: { targetGoals: 30, targetMove: true, targetSpeed: 6000, targetSize: 70, targetTimeExists: 1000 },
		very_hard: { targetGoals: 50, targetMove: true, targetSpeed: 8000, targetSize: 50, targetTimeExists: 800 },
		custom: {
			targetGoals: cfg.get<number>("targetGoals", 5),
			targetMove: cfg.get<boolean>("targetMove", false),
			targetSpeed: cfg.get<number>("targetSpeed", 3000),
			targetSize: cfg.get<number>("targetSize", 100),
			targetTimeExists: cfg.get<number>("targetTimeExists", 3000),
		},
	};

	let gameMode = (cfg.get<string>("gameMode", "Target_Rush") || "Target_Rush")
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/-+/g, "_");
	let timeFrenzyDuration = clamp(cfg.get<number>("timeFrenzyDuration", 60000), 1000, 3600000);
	let hydraTargetCount = clamp(cfg.get<number>("hydraTargetCount", 20), 1, 1000);
	let hydraTotalTime = clamp(cfg.get<number>("hydraTotalTime", 60000), 1000, 3600000);
	let hydraMode = (cfg.get<string>("hydraMode", "Target Count") || "Target Count")
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/-+/g, "_");
	let enableExtension = cfg.get<boolean>("enableExtension", true);
	let enableSoundEffects = cfg.get<boolean>("enableSoundEffects", true);
	let soundVolume = clamp(cfg.get<number>("soundVolume", 80), 0, 100);
	let enableStatsSave = cfg.get<boolean>("enableStatsSave", true);
	let enableEffects = cfg.get<boolean>("enableEffects", true);
	let closeWorkspaceOnGameStart = cfg.get<boolean>("closeWorkspaceOnGameStart", true);

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
	let difficulty = (cfg.get<string>("difficulty", "Normal") || "Normal")
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/-+/g, "_");
	let idleDelay = clamp(cfg.get<number>("idleTimer", 60000), 1000, 3600000); // ms
	let targetGoals = clamp(cfg.get<number>("targetGoals", 5), 1, 100);
	let targetMove = cfg.get<boolean>("targetMove", false);
	let targetSpeed = clamp(cfg.get<number>("targetSpeed", 3000), 100, 60000); // ms
	let targetSize = clamp(cfg.get<number>("targetSize", 100), 10, 1000); // px
	let targetTimeExists = clamp(cfg.get<number>("targetTimeExists", 3000), 0, 60000); // ms

	let prevDifficulty = difficulty;

	async function applyDifficulty() {
		difficulty = (vscode.workspace.getConfiguration("aimy").get<string>("difficulty", "Normal") || "Normal")
			.toLowerCase()
			.replace(/\s+/g, "_")
			.replace(/-+/g, "_");

		const preset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;

		if (difficulty === "Custom") {
			const cfgNow = vscode.workspace.getConfiguration("aimy");
			targetGoals = clamp(cfgNow.get<number>("targetGoals", preset.targetGoals), 1, 1000);
			targetMove = cfgNow.get<boolean>("targetMove", preset.targetMove);
			targetSpeed = clamp(cfgNow.get<number>("targetSpeed", preset.targetSpeed), 100, 60000);
			targetSize = clamp(cfgNow.get<number>("targetSize", preset.targetSize), 10, 1000);
			targetTimeExists = clamp(cfgNow.get<number>("targetTimeExists", preset.targetTimeExists), 0, 60000);
		} else {
			// override with preset (in-memory)
			targetGoals = clamp(preset.targetGoals, 1, 1000);
			targetMove = preset.targetMove;
			targetSpeed = clamp(preset.targetSpeed, 100, 60000);
			targetSize = clamp(preset.targetSize, 10, 1000);
			targetTimeExists = clamp(preset.targetTimeExists, 0, 60000);

			if (prevDifficulty !== difficulty) {
				const conf = vscode.workspace.getConfiguration("aimy");
				if (conf.get<number>("targetGoals") !== preset.targetGoals) {
					await conf.update("targetGoals", preset.targetGoals, vscode.ConfigurationTarget.Global);
				}
				if (conf.get<boolean>("targetMove") !== preset.targetMove) {
					await conf.update("targetMove", preset.targetMove, vscode.ConfigurationTarget.Global);
				}
				if (conf.get<number>("targetSpeed") !== preset.targetSpeed) {
					await conf.update("targetSpeed", preset.targetSpeed, vscode.ConfigurationTarget.Global);
				}
				if (conf.get<number>("targetSize") !== preset.targetSize) {
					await conf.update("targetSize", preset.targetSize, vscode.ConfigurationTarget.Global);
				}
				if (conf.get<number>("targetTimeExists") !== preset.targetTimeExists) {
					await conf.update("targetTimeExists", preset.targetTimeExists, vscode.ConfigurationTarget.Global);
				}
			}
		}

		prevDifficulty = difficulty;
	}

	void applyDifficulty();

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
		applyDifficulty();
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
		closeWorkspaceOnGameStart = newCfg.get<boolean>("closeWorkspaceOnGameStart", true);

		gameMode = (newCfg.get<string>("gameMode", "Target_Rush") || "Target_Rush")
			.toLowerCase()
			.replace(/\s+/g, "_")
			.replace(/-+/g, "_");
		timeFrenzyDuration = clamp(newCfg.get<number>("timeFrenzyDuration", 60000), 1000, 3600000);
		hydraTargetCount = clamp(newCfg.get<number>("hydraTargetCount", 20), 1, 1000);
		hydraTotalTime = clamp(newCfg.get<number>("hydraTotalTime", 60000), 1000, 3600000);
		hydraMode = (newCfg.get<string>("hydraMode", "Target Count") || "Target Count")
			.toLowerCase()
			.replace(/\s+/g, "_")
			.replace(/-+/g, "_");
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

	const isTabDirty = (tab: vscode.Tab) => {
		try {
			const input = tab.input as any;
			if (!input || !input.uri) {
				return false;
			}
			const uri: vscode.Uri = input.uri;
			const doc = vscode.workspace.textDocuments.find((d) => d.uri.toString() === uri.toString());
			return !!(doc && doc.isDirty);
		} catch {
			return false;
		}
	};

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

	async function showGame() {
		if (gameActive && !suppressReopen) {
			return;
		}

		if (gameActive || suppressReopen) {
			return;
		}

		gameActive = true;

		vscode.commands.executeCommand("workbench.action.closeSidebar");
		vscode.commands.executeCommand("workbench.action.closePanel");

		if (closeWorkspaceOnGameStart) {
			// Save currently open tabs
			const allTabs = vscode.window.tabGroups.all.flatMap((group) => group.tabs);

			const tabsToClose = allTabs.filter((t) => {
				const input = t.input as any;
				if (!input || !input.uri) {
					return false;
				}
				return !isTabDirty(t);
			});

			savedTabs = tabsToClose.slice();

			for (const tab of tabsToClose) {
				try {
					if (
						(vscode.window as any).tabGroups &&
						typeof (vscode.window as any).tabGroups.close === "function"
					) {
						await (vscode.window as any).tabGroups.close(tab);
					} else {
						const input = tab.input as any;
						if (input && input.uri) {
							await vscode.window.showTextDocument(input.uri, { preview: false });
							await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
						}
					}
				} catch (err) {}
			}
		}

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

		if (closeWorkspaceOnGameStart && gameActive) {
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
		}

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
			gameMode,
			timeFrenzyDuration,
			hydraTargetCount,
			hydraTotalTime,
			hydraMode,
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
								gameMode: message.gameMode,
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

		if (closeWorkspaceOnGameStart) {
			// Restore previously open tabs
			setTimeout(() => {
				savedTabs.forEach((tab) => {
					try {
						if (
							tab.input &&
							typeof tab.input === "object" &&
							tab.input !== null &&
							(tab.input as any).uri
						) {
							vscode.window.showTextDocument((tab.input as any).uri, { preview: false });
						}
					} catch (err) {
						// ignore restore errors
						console.error("AimY: failed to restore tab", err);
					}
				});
				savedTabs = [];
			}, 500);
		}
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
