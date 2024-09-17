import * as fs from "fs";
import * as path from "path";

import { DEFAULT_CONFIG, INVALID_CONFIG_FILE } from "../constants";
import { TConfig, TOptions } from "../types";
import { errorLog, infoLog } from "./ULogs";

export function loadConfig(
	_configPath: string = "architect.config.json",
	options: TOptions
): TConfig {
	const configPath = path.resolve(process.cwd(), _configPath);

	if (fs.existsSync(configPath)) {
		infoLog("Config file found");
		try {
			const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
			return {
				...DEFAULT_CONFIG,
				...userConfig,
				options,
				outputDir:
					options.output ??
					userConfig.outputDir ??
					DEFAULT_CONFIG.outputDir,
			};
		} catch {
			errorLog(`Error parsing config file '${_configPath}'`);
			process.exit(INVALID_CONFIG_FILE);
		}
	} else {
		infoLog(
			`Config file '${_configPath}' not found. Using default config.`
		);
		return DEFAULT_CONFIG;
	}
}
