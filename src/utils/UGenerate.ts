import * as fs from "fs";
import * as path from "path";

import { FOLDER_GENERATION_ERROR, INDEX_WRITE_ERROR } from "../constants";
import {
	TConfig,
	TFileExtensions,
	TStructure,
	TStructureEntry,
	TStructureItem,
	TStructurePathResult,
} from "../types";
import { getDefaultExtension } from "./UFiles";
import { errorLog } from "./ULogs";

/**
 * Get the structure item matching the given folders (["components", "atoms"] -> structure.components.subdirs.atoms)
 * Items defined as a string (type only) have no options, so undefined is returned.
 */
export const getStructureItem = (
	structure: TStructure | undefined,
	segments: string[]
): TStructureItem | undefined => {
	let entries: TStructure | undefined = structure;
	let item: TStructureEntry | TStructure | undefined;

	for (const segment of segments) {
		item = entries?.[segment];
		if (!item || typeof item !== "object") return undefined;
		entries = (item as TStructureItem).subdirs as TStructure | undefined;
	}

	return segments.length ? (item as TStructureItem) : undefined;
};

export const generateFoldersAndIndexes = (
	outdirPath: string,
	config: TConfig,
	outdir: TStructurePathResult,
	folderName: string,
	fileName: string
) => {
	const indexes: string[] = [];
	const segments = [...outdir.segments];

	if (outdir.generateSubIndex || outdir.generateSubdirs) {
		segments.push(folderName);
	}

	// Create the output directory if it doesn't exist
	try {
		fs.mkdirSync(outdirPath, { recursive: true });
	} catch (e) {
		errorLog(`Error creating out directory: ${outdirPath}`, e);
		process.exit(FOLDER_GENERATION_ERROR);
	}

	// fallback to default structure item if no options are provided for the current segment
	const defaultStructureItem = config.defaultStructureItem ?? {};

	// last index is used to keep track of the last index file created, so we can export it in the parent index file
	let lastIndex = "";

	// Loop through the segments, from the deepest to the root, to generate the index files
	segments
		.slice()
		.reverse()
		.forEach((segment, index) => {
			// Get the parent root and the current root for the current segment
			const parentRoot = segments.slice(0, segments.length - index - 1);
			const currentRoot = segments.slice(0, segments.length - index);

			// Get the structure item for the current segment and the parent segment
			const parentStructureItem =
				getStructureItem(config.structure, parentRoot) ??
				defaultStructureItem;
			const structureItem =
				getStructureItem(config.structure, currentRoot) ??
				defaultStructureItem;

			// Check if it should generate an index file for the current segment
			const generateIndex =
				structureItem.generateIndex ??
				parentStructureItem.generateSubIndex ??
				defaultStructureItem.generateIndex;

			// Check if it should generate an index file for the subdirectories of the current segment
			const generateSubIndex =
				structureItem.generateSubIndex ??
				(parentStructureItem.generateSubIndex ||
					defaultStructureItem.generateSubIndex);

			if (!generateIndex && !(index === 0 && generateSubIndex)) {
				lastIndex = segment + "/" + (lastIndex || fileName);
				return;
			}

			const indexExtension =
				getIndexExtension(
					structureItem.extensions,
					parentStructureItem.extensions,
					defaultStructureItem.extensions
				) || getDefaultExtension(config, structureItem);

			const indexPath = path.resolve(
				config.outputDir ?? "",
				...currentRoot,
				`index${indexExtension ? `.${indexExtension}` : ""}`
			);

			let exportPath: string;
			if (index === 0) {
				// If it's the deepest segment, export the file
				exportPath = fileName;
			} else if (lastIndex) {
				// If it's not the deepest segment, export the last index file created
				exportPath = lastIndex;
			} else {
				// if there is no last index, export the current file depending whether there is a subIndex or not
				exportPath =
					folderName + (!generateSubIndex ? "/" + fileName : "");
			}

			addImport(indexPath, `export * from "./${exportPath}";`);
			indexes.push(indexPath);

			// Update the last index
			if (!lastIndex && !generateSubIndex) {
				// if there is no last index and no subdirectories, set the last index to the current file
				lastIndex = segment + "/" + fileName;
			} else {
				// otherwise, the parent index exports the index of the current folder
				lastIndex = segment;
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

const EXPORT_LINE = /^export \* from ".+";$/;

// Add an export line to an index file, if it's not already there
const addImport = (path: string, content: string) => {
	let existingContent: string;
	try {
		existingContent = fs.readFileSync(path, "utf-8");
	} catch {
		existingContent = "";
	}

	const lines = existingContent.split("\n").filter(Boolean);
	if (lines.some((line) => line.trim() === content)) {
		return;
	}

	lines.push(content);

	// Generated indexes are kept sorted, custom indexes are left untouched
	if (lines.every((line) => EXPORT_LINE.test(line.trim()))) {
		lines.sort();
	}

	try {
		fs.writeFileSync(path, lines.join("\n") + "\n", "utf-8");
	} catch (e) {
		errorLog(`Error writing to file: ${path}`, e);
		process.exit(INDEX_WRITE_ERROR);
	}
};
