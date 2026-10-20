import * as fs from "fs";
import * as path from "path";

import {
	DEFAULT_CONFIG,
	DEFAULT_CONFIG_FILE,
	INVALID_CONFIG_FILE,
} from "../constants";
import { TConfig, TOptions } from "../types";
import { errorLog, infoLog } from "./ULogs";
import { mergeObjects } from "./UObjects";

/**
 * Read the user config file.
 * Fails if the file is invalid, or if a custom config file (-c) does not exist.
 */
export function readUserConfig(options: TOptions = {}): TConfig {
	const configPath = options.config ?? DEFAULT_CONFIG_FILE;
	const absolutePath = path.resolve(process.cwd(), configPath);

	if (!fs.existsSync(absolutePath)) {
		if (options.config) {
			errorLog(`Config file '${configPath}' not found`);
			process.exit(INVALID_CONFIG_FILE);
		}
		infoLog(`Config file '${configPath}' not found. Using default config.`);
		return {};
	}

	try {
		return JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
	} catch {
		errorLog(`Error parsing config file '${configPath}'`);
		process.exit(INVALID_CONFIG_FILE);
	}
}

/**
 * Merge the default config, the plugins configs, the user config and the CLI options
 */
export function buildConfig(
	userConfig: TConfig = {},
	options: TOptions = {},
	pluginConfigs: (TConfig | undefined)[] = []
): TConfig {
	const config = mergeObjects<TConfig>(
		DEFAULT_CONFIG,
		...pluginConfigs,
		userConfig,
		{ options }
	);

	config.outputDir = options.output ?? config.outputDir ?? "";
	return config;
}

export function loadConfig(
	options: TOptions = {},
	pluginConfigs: (TConfig | undefined)[] = []
): TConfig {
	return buildConfig(readUserConfig(options), options, pluginConfigs);
}
