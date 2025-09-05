// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getGameHTML } from "./gameHtml";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	let idleTimer: NodeJS.Timeout | undefined; // can be modified
	const changeDisposable = vscode.workspace.onDidChangeTextDocument(() => resetTimer());
	context.subscriptions.push(changeDisposable);

	// state
	let targets = 10; // can be modified
	let gameActive = false;
	let gamePanel: vscode.WebviewPanel | undefined;
	let openTabsDisposable: vscode.Disposable | undefined;
	let savedTabs: vscode.Tab[] = [];
	let suppressReopen = false; // when true, don't auto-reopen if panel is disposed

	function resetTimer() {
		if (idleTimer) {
			clearTimeout(idleTimer);
		}

		idleTimer = setTimeout(() => {
			vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: "You have been idle for 5 seconds! Game is starting...",
					cancellable: false,
				},
				async () => {
					// keep notification visible for 3 seconds
					await new Promise((res) => setTimeout(res, 3000));
				}
			);
			showGame();
		}, 5 * 1000); // 5 seconds
	}

	resetTimer();

	function showGame() {
		if (gameActive) {
			return;
		}

		gameActive = true;

		// Save currently open tabs
		savedTabs = vscode.window.tabGroups.all.flatMap((group) => group.tabs);

		// Close all tabs
		vscode.commands.executeCommand("workbench.action.closeAllEditors");

		// Create fullscreen game webview
		gamePanel = vscode.window.createWebviewPanel("aimyGame", "AimY - Hit the Targets!", vscode.ViewColumn.One, {
			enableScripts: true,
			retainContextWhenHidden: true,
		});

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

		gamePanel.webview.html = getGameHTML(targets);

		// Handle messages from webview
		gamePanel.webview.onDidReceiveMessage(
			(message) => {
				switch (message.command) {
					case "gameComplete":
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
						return;
				}
			},
			undefined,
			context.subscriptions
		);
	}

	function endGame() {
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

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand("aimy.startGame", () => {
		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: "Game Manually Started! Game is starting...",
				cancellable: false,
			},
			async () => {
				// keep notification visible for 3 seconds
				await new Promise((res) => setTimeout(res, 3000));
			}
		);
		showGame();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
