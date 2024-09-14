import * as fs from "fs";
import inquirer from "inquirer";
import { Answers } from "inquirer/dist/cjs/types/types";
import logger from "node-color-log";

import { TConfig, TLanguageName } from "../types";

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
				prefix: "ddd",
				suffix: "ddd",
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

export const getFileFormat = (config: TConfig): string => {
	const { language: format } = config;
	return typeof format === "string" ? format : format.name;
};

export const getDefaultExtension = (config: TConfig): string => {
	const format = getFileFormat(config);

	const extensionMapping: { [key in TLanguageName]: string } = {
		javascript: "js",
		react: "js",
		"react-typescript": "ts",
		"react-native": "js",
		"react-native-typescript": "ts",
		php: "php",
	};

	const res = Object.keys(extensionMapping).find((key) =>
		format.includes(key)
	);

	return res ? extensionMapping[res] : format;
};
