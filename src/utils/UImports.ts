import esbuild from "esbuild";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import Context from "../classes/ContextClass";
import {
	TBuilderImport,
	TConfig,
	TImportPathResult,
	TPluginDirectory,
	TPluginDirectoryType,
	TStructurePathResult,
} from "../types";
import { getFileLanguage } from "./UFiles";
import { resolveStructurePath } from "./UStructure";

/**
 * Compile a custom builder (TypeScript or JavaScript) with esbuild and load it.
 * The compiled file is written in a temporary directory, so it works when Architect is installed globally.
 */
export async function compileAndLoadUserTsFile(
	userTsFilePath: string
): Promise<TBuilderImport> {
	const absolutePath = path.resolve(process.cwd(), userTsFilePath);
	const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "architect-"));
	const outputFile = path.join(outputDir, "compiled.js");

	try {
		await esbuild.build({
			entryPoints: [absolutePath],
			outfile: outputFile,
			bundle: true,
			platform: "node",
			format: "cjs",
			target: "node22",
			logLevel: "silent",
		});
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		return require(outputFile);
	} finally {
		fs.rmSync(outputDir, { recursive: true, force: true });
	}
}

export function loadBuilder(
	builder: TImportPathResult
): Promise<TBuilderImport> {
	if (builder.isCustom) {
		return compileAndLoadUserTsFile(builder.path);
	}
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	return Promise.resolve().then(() => require(builder.path));
}

/**
 * Search the first file matching one of the names in the given directories.
 * For each directory, the names are checked in order, then a "default" file.
 * (A file name is matched without its extensions: "atoms.bp.tsx" -> "atoms")
 */
export function getImportPaths<T>({
	paths,
	defaultPath,
	pathSegments,
	defaultImport,
	onSuccess,
}: {
	paths: string[];
	defaultPath: string;
	pathSegments: string[];
	onSuccess: (module: TImportPathResult) => T;
	defaultImport?: T;
}): T | undefined {
	const names = [...pathSegments.map((s) => s.toLowerCase()), "default"];

	for (const filePath of [...paths, defaultPath]) {
		if (!fs.existsSync(filePath)) continue;

		const files = fs
			.readdirSync(filePath, { withFileTypes: true })
			.filter((file) => file.isFile())
			.map((file) => file.name);

		for (const name of names) {
			const matchingFile = files.find(
				(file) => file.replace(/\..+$/, "").toLowerCase() === name
			);

			if (matchingFile) {
				return onSuccess({
					filePath,
					path: path.join(filePath, matchingFile),
					name: matchingFile,
					isCustom: !filePath.startsWith(defaultPath),
				});
			}
		}
	}

	return defaultImport;
}

/**
 * Generate the paths for each part of the language, from the deepest to the base path
 * ("react-typescript", "/bp") -> ["/bp/react/typescript", "/bp/react"]
 */
export const generateFormatPaths = (
	format: string | string[],
	basePath: string
): string[] => {
	const formatParts = Array.isArray(format) ? format : format.split("-");

	return formatParts
		.map((_, index) =>
			path.join(basePath, ...formatParts.slice(0, index + 1))
		)
		.reverse();
};

// Language paths of each custom directory, followed by the directory itself
export const generateCustomPaths = (
	language: string,
	paths: string[] = []
): string[] =>
	paths.flatMap((dir) => {
		const absoluteDir = path.resolve(process.cwd(), dir);
		return [...generateFormatPaths(language, absoluteDir), absoluteDir];
	});

/**
 * A plugin directory is used only if the language starts with the plugin namespace.
 * Plugin "react" + language "react-typescript" -> ["<plugin>/typescript", "<plugin>"]
 */
export const generatePluginPaths = (
	language: string,
	{ namespace, path: dir }: TPluginDirectory
): string[] => {
	const languageParts = language.split("-");

	if (!namespace.every((part, i) => languageParts[i] === part)) {
		return [];
	}
	return [
		...generateFormatPaths(languageParts.slice(namespace.length), dir),
		dir,
	];
};

/**
 * All the directories to search for a blueprint/builder, by priority:
 * user directories, plugins directories, then Architect's default directory
 */
export const getSearchPaths = (
	type: TPluginDirectoryType,
	config: TConfig,
	outdir: TStructurePathResult,
	defaultPath: string
): string[] => {
	const language = getFileLanguage(config, outdir);

	return [
		...generateCustomPaths(language, config[type]),
		...Context.getPluginDirectories(type).flatMap((dir) =>
			generatePluginPaths(language, dir)
		),
		...generateFormatPaths(language, defaultPath),
	];
};

/**
 * Names used to find a blueprint/builder for a structure item, by priority:
 * the folders (deepest first), then the type.
 * If a reference (TStructureItem.blueprint/builder) is the type of another structure item,
 * the names of that item are used instead.
 */
export const getLookupNames = (
	config: TConfig,
	outdir: TStructurePathResult,
	reference?: string
): string[] => {
	let item: TStructurePathResult | undefined = outdir;

	if (reference) {
		item = config.structure
			? resolveStructurePath(config.structure, reference)[0]
			: undefined;

		if (!item) return [reference];
	}

	const names = [...item.segments].reverse();
	if (item.type && !names.includes(item.type)) {
		names.push(item.type);
	}
	return names;
};

// Returns the absolute path if the reference is an existing file
export const resolveFileReference = (reference?: string) => {
	if (!reference) return undefined;

	const absolutePath = path.resolve(process.cwd(), reference);
	return fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()
		? absolutePath
		: undefined;
};
