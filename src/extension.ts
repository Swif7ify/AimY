import * as vscode from "vscode";
import { getGameHTML } from "./gameHtml";

export function activate(context: vscode.ExtensionContext) {
	let idleTimer: NodeJS.Timeout | undefined; // can be modified
	const changeDisposable = vscode.workspace.onDidChangeTextDocument(() => resetTimer());
	context.subscriptions.push(changeDisposable);

	let targets = 10; // can be modified
	let gameActive = false;
	let gamePanel: vscode.WebviewPanel | undefined;
	let openTabsDisposable: vscode.Disposable | undefined;
	let savedTabs: vscode.Tab[] = [];
	let suppressReopen = false;

	function resetTimer() {
		if (idleTimer) {
			clearTimeout(idleTimer);
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
		}, 5 * 1000); // 5 seconds
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

		gamePanel.webview.html = getGameHTML(targets, { fontFamily });

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
