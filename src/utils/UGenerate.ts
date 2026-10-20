import * as fs from "fs";
import * as path from "path";

import { ArchitectError } from "../classes/ArchitectError";
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
	} catch (error) {
		throw new ArchitectError(
			FOLDER_GENERATION_ERROR,
			`Error creating out directory: ${outdirPath}`,
			"error",
			{ cause: error }
		);
	}

	// fallback to default structure item if no options are provided for the current segment
	const defaultStructureItem = config.defaultStructureItem ?? {};

	// Path (relative to the parent folder) of what the parent index must export:
	// the index of the current folder, or the file itself when the folder has no index
	let exportFromParent = "";

	// Loop through the segments, from the deepest to the root, to generate the index files
	segments
		.slice()
		.reverse()
		.forEach((segment, index) => {
			const isDeepest = index === 0;
			// What the index of the current folder must export
			const exportPath = isDeepest ? fileName : exportFromParent;

			const currentRoot = segments.slice(0, segments.length - index);
			const parentRoot = currentRoot.slice(0, -1);

			// Options of the current and parent folders (default structure item as fallback)
			const parentStructureItem =
				getStructureItem(config.structure, parentRoot) ??
				defaultStructureItem;
			const structureItem =
				getStructureItem(config.structure, currentRoot) ??
				defaultStructureItem;

			const generateIndex =
				structureItem.generateIndex ??
				parentStructureItem.generateSubIndex ??
				defaultStructureItem.generateIndex;

			const generateSubIndex =
				structureItem.generateSubIndex ??
				(parentStructureItem.generateSubIndex ||
					defaultStructureItem.generateSubIndex);

			// No index in this folder: the parent exports the path through it
			if (!generateIndex && !(isDeepest && generateSubIndex)) {
				exportFromParent = `${segment}/${exportPath}`;
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

			addImport(indexPath, `export * from "./${exportPath}";`);
			indexes.push(indexPath);

			// The parent exports the index of this folder,
			// except for the deepest folder without sub index: the file is exported directly
			exportFromParent =
				isDeepest && !generateSubIndex
					? `${segment}/${fileName}`
					: segment;
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
	} catch (error) {
		throw new ArchitectError(
			INDEX_WRITE_ERROR,
			`Error writing to file: ${path}`,
			"error",
			{ cause: error }
		);
	}
};
