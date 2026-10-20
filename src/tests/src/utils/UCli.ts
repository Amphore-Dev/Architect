import { spawn } from "child_process";
import path from "path";

export const CLI_PATH = path.join(__dirname, "../../../../dist/index.js");

export type TCliResult = {
	code: number | null;
	stdout: string;
	stderr: string;
};

// Run the built CLI, stdin is closed so prompts are answered with their default value
export const runCli = (args: string[], cwd?: string): Promise<TCliResult> =>
	new Promise((resolve, reject) => {
		const child = spawn("node", [CLI_PATH, ...args], {
			cwd,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (data) => (stdout += data));
		child.stderr.on("data", (data) => (stderr += data));
		child.on("error", reject);
		child.on("close", (code) => resolve({ code, stdout, stderr }));
	});
