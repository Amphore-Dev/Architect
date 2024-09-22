import * as path from "path";

import {
	FILE_CONFLICT,
	FOLDER_GENERATION_ERROR,
	INVALID_FOLDER_STRUCTURE,
	INVALID_NAME_FORMAT,
} from "../constants";
import {
	TBuilderArgs,
	TBuilderSearchResult,
	TBuildPaths,
	TConfig,
	TStructureItem,
} from "../types";
import {
	checkFileConflict,
	getDefaultExtension,
	getFileLanguage,
} from "./UFiles";
import { generateFoldersAndIndexes } from "./UGenerate";
import {
	generateCustomPaths,
	generateFormatPaths,
	getImportPaths,
} from "./UImports";
import { errorLog, infoLog } from "./ULogs";
import { formatName } from "./UStrings";

export function getBuilderPath(
	pathSegments: string[],
	config: TConfig,
	outdir?: TStructureItem
) {
	const defaultPath = path.join(__dirname, "..", "builders");
	const pluginsPath = path.join(__dirname, "..", "plugins/builders");

	const paths = [
		...generateCustomPaths(config, config.builders, outdir),
		...generateCustomPaths(config, [pluginsPath], outdir),
		...generateFormatPaths(getFileLanguage(config, outdir), defaultPath),
	];

	return getImportPaths<TBuilderSearchResult>({
		paths,
		defaultPath,
		pathSegments,
		onSuccess: ({ path, name, isCustom }) => ({
			path,
			name,
			isCustom,
		}),
		defaultImport: {
			path: defaultPath + "/default.builder.ts",
			name: "default.builder.ts",
			isCustom: false,
		},
	});
}

export const prepareBuild = (args: TBuilderArgs): Promise<TBuildPaths> => {
	const { config, name, blueprint, type, outdir } = args;

	// check if name is correct
	if (!/^[a-zA-Z_]/.test(name)) {
		errorLog("Name should start with a letter or an underscore");
		process.exit(INVALID_NAME_FORMAT);
	}

	const baseName = outdir.prefix || "";
	const folderName =
		baseName +
		formatName(name, outdir.caseFormat, "folder") +
		(outdir.suffix ?? "");
	const fileName =
		baseName +
		formatName(name, outdir.caseFormat, "file") +
		(outdir.suffix ?? "");
	const outName =
		baseName +
		formatName(name, outdir.caseFormat, "name") +
		(outdir.suffix ?? "");
	// Resolve the structure path using the provided type

	if (!outdir) {
		errorLog(
			`No valid folder structure found for type "${type}" in the configuration.`
		);
		process.exit(INVALID_FOLDER_STRUCTURE);
	}

	// Construct the output directory path based on the resolved structure item
	const outdirPath = path.join(
		process.cwd(),
		config.options?.output ?? config.outputDir ?? "",
		outdir.path,
		outdir.generateSubdirs || outdir.generateSubIndex ? folderName : ""
	);

	const fileExtension =
		typeof outdir.extensions === "string"
			? outdir.extensions
			: (outdir.extensions?.default ??
				blueprint.extension ??
				getDefaultExtension(config));
	// Construct the output file path based on the directory and file name
	const fileOutputPath = path.join(
		outdirPath,
		`${fileName}${fileExtension ? `.${fileExtension}` : ""}`
	);

	const prom = new Promise((resolve, reject) => {
		if (config.options?.force) return resolve(true);
		return checkFileConflict(fileOutputPath).then(resolve, reject);
	});

	return prom.then(
		() => {
			let indexes: string[] = [];
			try {
				indexes = generateFoldersAndIndexes(
					outdirPath,
					config,
					outdir,
					outName,
					folderName,
					fileName
				);
			} catch (e) {
				errorLog(e);
				process.exit(FOLDER_GENERATION_ERROR);
			}
			return {
				outdirPath,
				fileOutputPath,
				outName,
				indexes,
			};
		},
		() => {
			infoLog("File already exists, skipping");
			process.exit(FILE_CONFLICT);
		}
	);
};
