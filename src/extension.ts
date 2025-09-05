import * as vscode from "vscode";
import { getGameHTML } from "./gameHtml";

export function activate(context: vscode.ExtensionContext) {
	// game state
	const cfg = vscode.workspace.getConfiguration("aimy");

	let enableExtension = cfg.get<boolean>("enableExtension", false);
	if (!enableExtension) {
		vscode.window.showInformationMessage(
			'AimY Extension is disabled in settings. Use the "AimY: Start Game" command to run the game manually.'
		);
	}
	let idleDelay = cfg.get<number>("idleTimer", 60000); // ms delay
	let targetGoals = cfg.get<number>("targetGoals", 5); // number of targets to hit
	let targetMove = cfg.get<boolean>("targetMove", false); // moving targets enabled
	let targetSpeed = cfg.get<number>("targetSpeed", 3000); // ms per target
	let targetSize = cfg.get<number>("targetSize", 100); // px diameter
	let targetTimeExists = cfg.get<number>("targetTimeExists", 3000); // per-target timer enabled

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
		idleDelay = newCfg.get<number>("idleTimer", 10000);
		targetGoals = newCfg.get<number>("targetGoals", 5);
		targetMove = newCfg.get<boolean>("targetMove", false);
		targetSpeed = newCfg.get<number>("targetSpeed", 3000);
		targetSize = newCfg.get<number>("targetSize", 100);
		targetTimeExists = newCfg.get<number>("targetTimeExists", 3000);
		resetTimer();
	});
	context.subscriptions.push(configDisposable);

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

		gamePanel.webview.html = getGameHTML({
			fontFamily,
			targetGoals,
			targetMove,
			targetSpeed,
			targetSize,
			targetTimeExists,
		});

		// Handle messages from webview
		gamePanel.webview.onDidReceiveMessage(
			(message) => {
				switch (message.command) {
					case "gameComplete":
						suppressReopen = true;
						endGame();
						vscode.window.withProgress(
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
						return;
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
				title: "Game Manually Started! Game is starting...",
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
