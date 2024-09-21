import * as fs from "fs";
import * as path from "path";

import ContextClass from "../classes/ContextClass";
import { DEFAULT_CONFIG, INVALID_CONFIG_FILE } from "../constants";
import { TConfig, TOptions } from "../types";
import { errorLog, infoLog } from "./ULogs";
import { mergeObjects } from "./UObjects";

export function loadConfig(
	_configPath: string = "architect.config.json",
	options: TOptions = {}
): TConfig {
	const plugins = ContextClass.getPlugins();

	// reduce all plugins.config to a single object
	const pluginConfigs = plugins.reduce((acc, plugin) => {
		return { ...acc, ...plugin.config };
	}, {});

	const configPath = path.resolve(process.cwd(), _configPath);

	if (fs.existsSync(configPath)) {
		try {
			const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

			return mergeObjects<TConfig>(
				DEFAULT_CONFIG,
				pluginConfigs,
				userConfig,
				{ options },
				{
					outputDir:
						options.output ??
						userConfig.outputDir ??
						DEFAULT_CONFIG.outputDir ??
						"",
				}
			);
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
