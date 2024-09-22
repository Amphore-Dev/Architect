import * as fs from "fs";
import * as path from "path";

import { FOLDER_GENERATION_ERROR, INDEX_WRITE_ERROR } from "../constants";
import { TConfig, TStructureItem, TStructurePathResult } from "../types";
import { TFileExtensions } from "../types/TFileExtensions";
import { getDefaultExtension } from "./UFiles";
import { flatAndKeepLastChild } from "./UFlat";
import { errorLog } from "./ULogs";

export const generateFoldersAndIndexes = (
	outdirPath: string,
	config: TConfig,
	outdir: TStructurePathResult,
	outName: string,
	folderName: string,
	fileName: string
) => {
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
	try {
		fs.mkdirSync(outdirPath, { recursive: true });
	} catch (e) {
		errorLog(`Error creating out directory: ${outdirPath}`, e);
		process.exit(FOLDER_GENERATION_ERROR);
	}

	// fallback to default structure item if no options are provided for the current segment
	const defaultStructureItem = config?.defaultStructureItem ?? {};

	// last index is used to keep track of the last index file created, so we can export it in the parent index file
	let lastIndex = "";

	// Loop through the segments to generate the index files
	revSegments?.forEach((segment, index) => {
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
			structureItem?.generateIndex ??
			parentStructureItem?.generateSubIndex ??
			defaultStructureItem?.generateIndex;

		// Check if it should generate an index file for the subdirectories of the current segment
		const generateSubIndex =
			structureItem?.generateSubIndex ??
			(parentStructureItem?.generateSubIndex ||
				defaultStructureItem?.generateSubIndex);

		// if it should generate an index file for the current segment
		if (generateIndex || (index === 0 && generateSubIndex)) {
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

			const parentExtensions =
				parentStructureItem.extensions ??
				(flatStructure[`${structureItemKeyParent}.extensions`] as
					| string
					| TFileExtensions);

			const defaultItemExtensions = defaultStructureItem?.extensions;

			const indexExtension =
				getIndexExtension(
					itemExtensions,
					parentExtensions,
					defaultItemExtensions
				) || getDefaultExtension(config, structureItem);

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
				lastIndex = segment + "/" + fileName;
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
};

const getIndexExtension = (
	itemExtensions: string | TFileExtensions | undefined,
	parentExtensions: string | TFileExtensions | undefined,
	defaultItemExtensions: string | TFileExtensions | undefined
): string | undefined => {
	// Check if itemExtensions is a string and return it
	if (typeof itemExtensions === "string") {
		return itemExtensions;
	}

	// Check for index or default in itemExtensions
	if (itemExtensions?.index || itemExtensions?.default) {
		return itemExtensions.index ?? itemExtensions.default!;
	}

	// Check if parentExtensions is a string and return it, otherwise check index/default
	const parentExt =
		typeof parentExtensions === "string"
			? parentExtensions
			: (parentExtensions?.index ?? parentExtensions?.default);

	// If parentExt is valid, return it; otherwise, check defaultItemExtensions and config
	return (
		parentExt ??
		(typeof defaultItemExtensions === "string"
			? defaultItemExtensions
			: (defaultItemExtensions?.index ?? defaultItemExtensions?.default))
	);
};

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
		try {
			fs.writeFileSync(path, lines.sort().join("\n"), "utf-8");
		} catch (e) {
			errorLog(`Error writing to file: ${path}`);
			errorLog(e);
			process.exit(INDEX_WRITE_ERROR);
		}
	}
};
