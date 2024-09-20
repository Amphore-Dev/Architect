import * as fs from "fs";
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
	TStructurePathResult,
} from "../types";
import { TFileExtensions } from "../types/TFileExtensions";
import {
	checkFileConflict,
	getDefaultExtension,
	getFileLanguage,
} from "./UFiles";
import { flatAndKeepLastChild } from "./UFlat";
import {
	generateCustomPaths,
	generateFormatPaths,
	getImportPaths,
} from "./UImports";
import { errorLog, infoLog } from "./ULogs";
import { formatName } from "./UStrings";

export function getBuilderPath(pathSegments: string[], config: TConfig) {
	const defaultPath = path.join(__dirname, "..", "builders");
	const pluginsPath = path.join(__dirname, "..", "plugins/builders");

	const paths = [
		...generateCustomPaths(config, config.builders),
		...generateCustomPaths(config, [pluginsPath]),
		...generateFormatPaths(getFileLanguage(config), defaultPath),
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
	const folderName = baseName + formatName(name, outdir.caseFormat, "folder");
	const fileName = baseName + formatName(name, outdir.caseFormat, "file");
	const outName = baseName + formatName(name, outdir.caseFormat, "name");
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
				indexes = generateFolders(
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

function generateFolders(
	outdirPath: string,
	config: TConfig,
	outdir: TStructurePathResult,
	outName: string,
	folderName: string,
	fileName: string
) {
	const indexes: string[] = [];
	const segments = outdir.segments;
	const structure = config.structure;

	if (outdir.generateSubIndex || outdir.generateSubdirs) {
		segments.push(folderName);
	}

	// Reverse the segments to start from the root
	const revSegments = segments.slice().reverse();
	// Flatten the structure to easily access the structure item for each segment
	const flatStructure = flatAndKeepLastChild(structure);
	// Create the output directory if it doesn't exist
	fs.mkdirSync(outdirPath, { recursive: true });

	// fallback to default structure item if no options are provided for the current segment
	const defaultStructureItem = (structure?.defaultStructureItem ||
		{}) as TStructureItem;

	// last index is used to keep track of the last index file created, so we can export it in the parent index file
	let lastIndex = "";

	// Loop through the segments to generate the index files
	revSegments.forEach((segment, index) => {
		// Get the parent root and the current root for the current segment
		const parentRoot = segments.slice(0, segments.length - index - 1);
		const currentRoot = segments.slice(0, segments.length - index);

		// generate the key for the current structure item and the parent structure item
		const structureItemKey = currentRoot.join(".subdirs.");
		const structureItemKeyParent = parentRoot.join(".subdirs.");

		// Get the structure item for the current segment and the parent segment
		const parentStructureItem =
			(flatStructure[structureItemKeyParent] as TStructureItem) ||
			defaultStructureItem;
		const structureItem = (flatStructure[structureItemKey] ||
			defaultStructureItem) as TStructureItem;

		// Check if it should generate an index file for the current segment
		const generateIndex =
			structureItem.generateIndex ??
			(parentStructureItem.generateSubIndex ||
				defaultStructureItem.generateIndex);

		// Check if it should generate an index file for the subdirectories of the current segment
		const generateSubIndex =
			structureItem.generateSubIndex ??
			(parentStructureItem.generateSubIndex ||
				defaultStructureItem.generateSubIndex);

		// if it should generate an index file for the current segment
		if (generateIndex) {
			// Get the path to the current index file
			const currentRootPath = path.join(
				config.outputDir ?? "",
				...currentRoot
			);

			// need to do this because "extenstions" is a distinc item in flatStructure (need to fix "flatAndKeepLastChild" in the future)
			const itemExtensions =
				structureItem.extensions ??
				(flatStructure[`${structureItemKey}.extensions`] as
					| string
					| TFileExtensions);

			const indexExtension =
				typeof itemExtensions === "string"
					? itemExtensions
					: (itemExtensions?.index ??
						itemExtensions?.default ??
						getDefaultExtension(config));

			const indexPath = path.join(
				currentRootPath,
				`index${indexExtension ? `.${indexExtension}` : ""}`
			);

			let content = "";

			if (index === 0) {
				// If it's the deepest segment, export the file
				content = `export * from "./${fileName}";`;
			} else if (lastIndex) {
				// If it's not the deepest segment, export the last index file created
				content = `export * from "./${lastIndex}";`;
			} else {
				// if there is no last index, export the current file depending whether there is a subIndex or not
				const exportPath =
					folderName +
					(!generateSubIndex
						? "/" + fileName // if there is no subIndex, export the file directly
						: "");
				content = `export * from "./${exportPath}";`;
			}

			// Add the import to the index file
			addImport(indexPath, content);
			indexes.push(indexPath);

			// Update the last index
			if (!lastIndex && !generateSubIndex) {
				// if there is no last index and no subdirectories, set the last index to the current file
				lastIndex = folderName + "/" + fileName;
			} else if (!lastIndex) {
				// if there is no last index but there are subdirectories, set the last index to the folder name
				// so the next index file can export the folder
				// otherwise, set the last index to the file name
				lastIndex = segment + generateSubIndex ? folderName : fileName;
			} else {
				lastIndex = segment;
			}
		} else {
			lastIndex = segment + "/" + (!lastIndex ? fileName : lastIndex);
		}
	});

	return indexes;
}

const addImport = (path: string, content: string) => {
	let existingContent = "";
	try {
		existingContent = fs.readFileSync(path, "utf-8");
	} catch {
		existingContent = "";
	}
	const lines = existingContent?.split("\n").filter(Boolean);
	const hasImport = lines?.some((line) => line.includes(content));

	if (!hasImport) {
		lines.push(content);
		fs.writeFileSync(path, lines.sort().join("\n"), "utf-8");
	}
};
