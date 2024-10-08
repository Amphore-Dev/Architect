import * as fs from "fs";
import inquirer from "inquirer";
import { Answers } from "inquirer/dist/cjs/types/types";
import logger from "node-color-log";

import Context from "../classes/ContextClass";
import { CPLUGIN_PREFIX, DEFAULT_LANGUAGE } from "../constants";
import { TConfig, TStructureItem } from "../types";
import { TFileExtensions } from "../types/TFileExtensions";

export const checkFileConflict = (path: string): Promise<boolean> => {
	if (!fs.existsSync(path)) {
		return Promise.resolve(true);
	}
	const outdirProm = inquirer
		.prompt([
			{
				type: "list",
				message: () => {
					logger
						.color("yellow")
						.append("[Warning]")
						.reset()
						.append(" - File already exists at ")
						.color("cyan")
						.append(`${path.replace(process.cwd() + "/", "")}`)
						.log();
					return "Do you want to overwrite the file?";
				},
				choices: ["Yes", "No"],
				name: "overwrite",
				default: "No",
			},
		] as Answers)
		.then((answers) => {
			if (answers.overwrite === "Yes") {
				return Promise.resolve(true);
			}
			return Promise.reject(false);
		});

	return outdirProm;
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
	const language =
		structureItem?.language ?? config.language ?? DEFAULT_LANGUAGE;

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
