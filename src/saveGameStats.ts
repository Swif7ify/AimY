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
			targetGoals: cfg.get<number>("targetGoals", 5),
			targetMove: cfg.get<boolean>("targetMove", false),
			targetSpeed: cfg.get<number>("targetSpeed", 3000),
			targetSize: cfg.get<number>("targetSize", 100),
			targetTimeExists: cfg.get<number>("targetTimeExists", 3000),
			statsFormat: cfg.get<string>("statsFormat", "json"),
			statsDirectory: configured || "",
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
			const header = [
				"timestamp",
				"score",
				"time",
				"accuracy",
				"bestStreak",
				"targetGoals",
				"targetMove",
				"targetSpeed",
				"targetSize",
				"targetTimeExists",
			];

			const rowValues = [
				stats.timestamp ?? new Date().toISOString(),
				stats.score ?? "",
				stats.time ?? "",
				stats.accuracy ?? "",
				stats.bestStreak ?? "",
				settingsObj.targetGoals,
				settingsObj.targetMove,
				settingsObj.targetSpeed,
				settingsObj.targetSize,
				settingsObj.targetTimeExists,
			];

			const row = rowValues.map(csvEscape).join(",");

			if (!exists) {
				await fs.promises.writeFile(csvPath, header.map(csvEscape).join(",") + "\n" + row + "\n", "utf8");
			} else {
				await fs.promises.appendFile(csvPath, row + "\n", "utf8");
			}
			vscode.window.showInformationMessage(`AimY: saved stats to ${csvPath}`);
			return csvPath;
		} else {
			const out = Object.assign({}, stats, { settings: settingsObj });
			const name = `aimy-stats-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
			const filePath = path.join(outDir, name);
			await fs.promises.writeFile(filePath, JSON.stringify(out, null, 2), "utf8");
			vscode.window.showInformationMessage(`AimY: saved stats to ${filePath}`);
			return filePath;
		}
	} catch (err) {
		console.error("AimY: failed to save stats", err);
		vscode.window.showErrorMessage("AimY: failed to save stats. See developer console.");
		return null;
	}
}
