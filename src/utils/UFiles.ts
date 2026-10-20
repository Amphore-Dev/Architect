import confirm from "@inquirer/confirm";
import * as fs from "fs";
import logger from "node-color-log";

import Context from "../classes/ContextClass";
import { CPLUGIN_PREFIX, DEFAULT_LANGUAGE } from "../constants";
import { TConfig, TStructureItem } from "../types";
import { TFileExtensions } from "../types/TFileExtensions";
import { displayPath } from "./ULogs";

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
		.append(displayPath(path))
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

const BUILTIN_EXTENSIONS: TFileExtensions = {
	javascript: "js",
	typescript: "ts",
};

/**
 * Default extension of a language, from the plugins mappings and the built-in ones.
 * The language is matched exactly, then by its last parts:
 * "react-native-typescript" -> "native-typescript" -> "typescript" -> "ts"
 */
export const getDefaultExtension = (
	config: TConfig,
	structureItem?: TStructureItem
): string => {
	const language = getFileLanguage(config, structureItem);

	const plugins = Context.getPlugins();

	const extensionMapping: TFileExtensions = { ...BUILTIN_EXTENSIONS };

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

	const parts = language.split("-");
	for (let i = 0; i < parts.length; i++) {
		const extension = extensionMapping[parts.slice(i).join("-")];
		if (extension) return extension;
	}
	return "js";
};
