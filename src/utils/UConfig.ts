import * as fs from "fs";
import * as path from "path";

import { ArchitectError } from "../classes/ArchitectError";
import {
	DEFAULT_CONFIG,
	DEFAULT_CONFIG_FILE,
	INVALID_CONFIG_FILE,
} from "../constants";
import { TConfig, TOptions } from "../types";
import { infoLog, warningLog } from "./ULogs";
import { mergeObjects } from "./UObjects";
import { TConfigIssue, validateConfig } from "./UValidation";

/**
 * Read the user config file.
 * Fails if the file is invalid, or if a custom config file (-c) does not exist.
 */
export function readUserConfig(options: TOptions = {}): TConfig {
	const configPath = options.config ?? DEFAULT_CONFIG_FILE;
	const absolutePath = path.resolve(process.cwd(), configPath);

	if (!fs.existsSync(absolutePath)) {
		if (options.config) {
			throw new ArchitectError(
				INVALID_CONFIG_FILE,
				`Config file '${configPath}' not found`
			);
		}
		infoLog(`Config file '${configPath}' not found. Using default config.`);
		return {};
	}

	let userConfig: TConfig;
	try {
		userConfig = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
	} catch (error) {
		throw new ArchitectError(
			INVALID_CONFIG_FILE,
			`Error parsing config file '${configPath}'`,
			"error",
			{ cause: error }
		);
	}

	checkConfig(userConfig, configPath);
	return userConfig;
}

// Log the unknown options, fail on invalid values
const checkConfig = (config: TConfig, configPath: string) => {
	const issues = validateConfig(config);
	const format = ({ path, message }: TConfigIssue) =>
		`${path || "config"}: ${message}`;

	issues
		.filter(({ level }) => level === "warning")
		.forEach((issue) => warningLog(`${configPath} - ${format(issue)}`));

	const errors = issues.filter(({ level }) => level === "error");
	if (errors.length) {
		throw new ArchitectError(
			INVALID_CONFIG_FILE,
			`Invalid config file '${configPath}':\n${errors.map((e) => "  • " + format(e)).join("\n")}`
		);
	}
};

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
