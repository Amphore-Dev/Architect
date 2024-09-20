import * as fs from "fs";
import inquirer from "inquirer";
import { Answers } from "inquirer/dist/cjs/types/types";
import logger from "node-color-log";

import PluginsManager from "../classes/PluginsManagerClass";
import { CPLUGIN_PREFIX } from "../constants";
import { TConfig } from "../types";
import { TPluginExtensionsMapping } from "../types/TPlugins";

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

export const getFileLanguage = (config: TConfig): string => {
	const { language } = config;
	return typeof language === "string" ? language : (language?.name ?? "");
};

export const getDefaultExtension = (config: TConfig): string => {
	const language = getFileLanguage(config);

	const plugins = PluginsManager.getPlugins();

	const extensionMapping: TPluginExtensionsMapping = {
		javascript: "js",
	};

	plugins?.forEach((plugin) => {
		if (plugin.extensions) {
			if (typeof plugin.extensions === "string") {
				extensionMapping[plugin.name.replace(CPLUGIN_PREFIX, "")] =
					plugin.extensions;
			} else {
				Object.assign(extensionMapping, plugin.extensions);
			}
		}
	});

	const res = Object.keys(extensionMapping).find((key) =>
		language.includes(key)
	);

	return res ? extensionMapping[res] : "js";
};
