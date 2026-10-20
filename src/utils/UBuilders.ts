import * as path from "path";

import { ArchitectError } from "../classes/ArchitectError";
import {
	FILE_CONFLICT,
	INVALID_FOLDER_STRUCTURE,
	INVALID_NAME_FORMAT,
} from "../constants";
import {
	TBuilderArgs,
	TBuilderSearchResult,
	TBuildPaths,
	TConfig,
	TStructurePathResult,
} from "../types";
import { checkFileConflict, getDefaultExtension } from "./UFiles";
import { generateFoldersAndIndexes } from "./UGenerate";
import {
	getImportPaths,
	getLookupNames,
	getSearchPaths,
	resolveFileReference,
} from "./UImports";
import { formatName } from "./UStrings";

const DEFAULT_BUILDERS_PATH = path.join(__dirname, "..", "builders");

export function getBuilderPath(
	config: TConfig,
	outdir: TStructurePathResult
): TBuilderSearchResult | undefined {
	// TStructureItem.builder can be a path to a builder file
	const builderFile = resolveFileReference(outdir.builder);
	if (builderFile) {
		return {
			path: builderFile,
			name: path.basename(builderFile),
			isCustom: true,
		};
	}

	return getImportPaths<TBuilderSearchResult>({
		paths: getSearchPaths(
			"builders",
			config,
			outdir,
			DEFAULT_BUILDERS_PATH
		),
		defaultPath: DEFAULT_BUILDERS_PATH,
		pathSegments: getLookupNames(config, outdir, outdir.builder),
		onSuccess: ({ path, name, isCustom }) => ({ path, name, isCustom }),
		defaultImport: {
			path: path.join(DEFAULT_BUILDERS_PATH, "default.builder.js"),
			name: "default.builder.js",
			isCustom: false,
		},
	});
}

// Path separators, ".." and characters forbidden in file names are not allowed
const INVALID_NAME_CHARS = /[\\/:*?"<>|\0]|\.\./;

export const isValidName = (name: string) =>
	/^[a-zA-Z_]/.test(name) && !INVALID_NAME_CHARS.test(name);

export const prepareBuild = (args: TBuilderArgs): Promise<TBuildPaths> => {
	const { config, name, blueprint, type, outdir } = args;

	if (!isValidName(name)) {
		return Promise.reject(
			new ArchitectError(
				INVALID_NAME_FORMAT,
				"Name should start with a letter or an underscore and should not contain path separators or special characters"
			)
		);
	}

	if (!outdir) {
		return Promise.reject(
			new ArchitectError(
				INVALID_FOLDER_STRUCTURE,
				`No valid folder structure found for type "${type}" in the configuration.`
			)
		);
	}

	const genName = (formatType: "folder" | "file" | "name") =>
		(outdir.prefix ?? "") +
		formatName(name, outdir.caseFormat, formatType, undefined, {
			preserveAcronyms: outdir.preserveAcronyms,
		}) +
		(outdir.suffix ?? "");

	const folderName = genName("folder");
	const fileName = genName("file");
	const outName = genName("name");

	// Construct the output directory path based on the resolved structure item
	const outdirPath = path.resolve(
		process.cwd(),
		config.outputDir ?? "",
		"." + outdir.path,
		outdir.generateSubdirs || outdir.generateSubIndex ? folderName : ""
	);

	// A language-agnostic blueprint has no extension, the language's default extension is used
	const fileExtension =
		typeof outdir.extensions === "string"
			? outdir.extensions
			: outdir.extensions?.default ||
				blueprint.extension ||
				getDefaultExtension(config, outdir);

	// Construct the output file path based on the directory and file name
	const fileOutputPath = path.join(
		outdirPath,
		`${fileName}${fileExtension ? `.${fileExtension}` : ""}`
	);

	const conflictCheck = config.options?.force
		? Promise.resolve(true)
		: checkFileConflict(fileOutputPath);

	return conflictCheck.then((overwrite) => {
		if (!overwrite) {
			throw new ArchitectError(
				FILE_CONFLICT,
				"File already exists, skipping",
				"info"
			);
		}

		const indexes = generateFoldersAndIndexes(
			outdirPath,
			config,
			outdir,
			folderName,
			fileName
		);
		return {
			outdirPath,
			fileOutputPath,
			outName,
			indexes,
		};
	});
};
