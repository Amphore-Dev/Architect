import confirm from "@inquirer/confirm";
import * as fs from "fs";
import logger from "node-color-log";

import Context from "../classes/ContextClass";
import { CPLUGIN_PREFIX, DEFAULT_LANGUAGE } from "../constants";
import { TConfig, TStructureItem } from "../types";
import { TFileExtensions } from "../types/TFileExtensions";

// Ask the user if an existing file should be overwritten
export const checkFileConflict = async (path: string): Promise<boolean> => {
	if (!fs.existsSync(path)) {
		return true;
	}

	logger
		.color("yellow")
		.append("[Warning]")
		.reset()
		.append(" - File already exists at ")
		.color("cyan")
		.append(`${path.replace(process.cwd() + "/", "")}`)
		.log();

	// a closed input (non-interactive shell) is considered as a "No"
	return confirm({
		message: "Do you want to overwrite the file?",
		default: false,
	}).catch(() => false);
};

export const getFileLanguage = (
	config: TConfig,
	structureItem?: TStructureItem
): string => {
	return structureItem?.language ?? config.language ?? DEFAULT_LANGUAGE;
};

export const getDefaultExtension = (
	config: TConfig,
	structureItem?: TStructureItem
): string => {
	const language = getFileLanguage(config, structureItem);

	const plugins = Context.getPlugins();

	const extensionMapping: TFileExtensions = {
		javascript: "js",
	};

	plugins?.forEach((plugin) => {
		if (plugin.extensions) {
			if (typeof plugin.extensions === "string") {
				extensionMapping[
					plugin.destination ??
						plugin.name.replace(CPLUGIN_PREFIX, "")
				] = plugin.extensions;
			} else {
				Object.assign(extensionMapping, plugin.extensions);
			}
		}
	});

	return extensionMapping[language] ?? "js";
};
