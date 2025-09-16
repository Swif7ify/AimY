import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

function csvEscape(v: any) {
	const s = v === null || v === undefined ? "" : String(v);
	if (s.includes('"') || s.includes(",") || s.includes("\n")) {
		return `"${s.replace(/"/g, '""')}"`;
	}
	return s;
}

export async function saveGameStats(context: vscode.ExtensionContext, stats: any): Promise<string | null> {
	try {
		const cfg = vscode.workspace.getConfiguration("aimy");
		const configured = (cfg.get<string>("statsDirectory") || "").trim();
		const format = (cfg.get<string>("statsFormat") || "json").toLowerCase(); // "json" or "csv"

		const settingsObj = {
			// Core gameplay settings
			difficulty: cfg.get<string>("difficulty", "Normal"),
			targetGoals: cfg.get<number>("targetGoals", 5),
			targetMove: cfg.get<boolean>("targetMove", false),
			targetSpeed: cfg.get<number>("targetSpeed", 3000),
			targetSize: cfg.get<number>("targetSize", 100),
			targetTimeExists: cfg.get<number>("targetTimeExists", 3000),

			// Game modes
			gameMode: cfg.get<string>("gameMode", "Target Rush"),
			timeFrenzyDuration: cfg.get<number>("timeFrenzyDuration", 60000),
			hydraMode: cfg.get<string>("hydraMode", "Target Count"),
			hydraTargetCount: cfg.get<number>("hydraTargetCount", 20),
			hydraTotalTime: cfg.get<number>("hydraTotalTime", 60000),

			// Audio/visual settings
			enableSoundEffects: cfg.get<boolean>("enableSoundEffects", true),
			soundVolume: cfg.get<number>("soundVolume", 80),
			enableEffects: cfg.get<boolean>("enableEffects", true),

			// Stats settings
			statsFormat: cfg.get<string>("statsFormat", "json"),
			statsDirectory: configured || "",
			enableStatsSave: cfg.get<boolean>("enableStatsSave", true),

			// Extension behavior
			enableExtension: cfg.get<boolean>("enableExtension", true),
			idleTimer: cfg.get<number>("idleTimer", 60000),
			closeWorkspaceOnGameStart: cfg.get<boolean>("closeWorkspaceOnGameStart", true),
		};

		let outDir: string;
		if (configured) {
			if (path.isAbsolute(configured)) {
				outDir = configured;
			} else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]) {
				outDir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, configured);
			} else {
				outDir = path.join(
					context.globalStorageUri?.fsPath || context.globalStoragePath || os.homedir(),
					configured
				);
			}
		} else {
			outDir = context.globalStorageUri?.fsPath || context.globalStoragePath || path.join(os.homedir(), ".aimy");
		}

		await fs.promises.mkdir(outDir, { recursive: true });

		if (format === "csv") {
			const csvPath = path.join(outDir, "aimy-stats.csv");
			const exists = fs.existsSync(csvPath);

			// Updated CSV headers to include all settings
			const header = [
				// Game stats
				"timestamp",
				"score",
				"time",
				"accuracy",
				"bestStreak",
				"gameMode", // Add gameMode to stats (passed from webview)

				// Core settings
				"difficulty",
				"targetGoals",
				"targetMove",
				"targetSpeed",
				"targetSize",
				"targetTimeExists",

				// Game mode settings
				"configuredGameMode", // The setting value
				"timeFrenzyDuration",
				"hydraMode",
				"hydraTargetCount",
				"hydraTotalTime",

				// Audio/visual
				"enableSoundEffects",
				"soundVolume",
				"enableEffects",

				// Extension behavior
				"idleTimer",
				"closeWorkspaceOnGameStart",
			];

			const rowValues = [
				// Game stats
				stats.timestamp ?? new Date().toISOString(),
				stats.score ?? "",
				stats.time ?? "",
				stats.accuracy ?? "",
				stats.bestStreak ?? "",
				stats.gameMode ?? "", // From webview

				// Core settings
				settingsObj.difficulty,
				settingsObj.targetGoals,
				settingsObj.targetMove,
				settingsObj.targetSpeed,
				settingsObj.targetSize,
				settingsObj.targetTimeExists,

				// Game mode settings
				settingsObj.gameMode,
				settingsObj.timeFrenzyDuration,
				settingsObj.hydraMode,
				settingsObj.hydraTargetCount,
				settingsObj.hydraTotalTime,

				// Audio/visual
				settingsObj.enableSoundEffects,
				settingsObj.soundVolume,
				settingsObj.enableEffects,

				// Extension behavior
				settingsObj.idleTimer,
				settingsObj.closeWorkspaceOnGameStart,
			];

			const row = rowValues.map(csvEscape).join(",");

			if (!exists) {
				await fs.promises.writeFile(csvPath, header.map(csvEscape).join(",") + "\n" + row + "\n", "utf8");
			} else {
				await fs.promises.appendFile(csvPath, row + "\n", "utf8");
			}
			vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: `AimY: saved stats to ${csvPath}`,
					cancellable: false,
				},
				async () => {
					await new Promise((res) => setTimeout(res, 3000));
				}
			);
			return csvPath;
		} else {
			// JSON format includes all settings in the settings object
			const out = Object.assign({}, stats, { settings: settingsObj });
			const name = `aimy-stats-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
			const filePath = path.join(outDir, name);
			await fs.promises.writeFile(filePath, JSON.stringify(out, null, 2), "utf8");
			vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: `AimY: saved stats to ${filePath}`,
					cancellable: false,
				},
				async () => {
					await new Promise((res) => setTimeout(res, 3000));
				}
			);
			return filePath;
		}
	} catch (err) {
		console.error("AimY: failed to save stats", err);
		vscode.window.showErrorMessage("AimY: failed to save stats. Report the problem.");
		return null;
	}
}
