import esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

import { TBuilderImport, TConfig, TImportPathResult } from "../types";
import { getFileFormat } from "./UFiles";

export function compileAndLoadUserTsFile(userTsFilePath: string) {
	const absolutePath = path.resolve(process.cwd(), userTsFilePath);
	const outputDir = path.resolve(process.cwd(), ".react-blueprint-temp");
	const outputFile = path.join(outputDir, "compiled.js");

	// Ensure the output directory exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir);
	}

	const prom = new Promise<TBuilderImport>((resolve, reject) => {
		// Compile the TypeScript file to JavaScript using esbuild
		esbuild
			.build({
				entryPoints: [absolutePath],
				outfile: outputFile,
				bundle: true,
				platform: "node",
				format: "cjs",
				target: "es2020",
				write: true,
			})
			.then(() => {
				// Dynamically import the compiled JavaScript file
				const compiledModule = import(outputFile);

				compiledModule.then((module) => {
					resolve(module);
					return module;
				}, reject);

				return compiledModule;
			}, reject);
	});

	prom.finally(() => {
		// // Clean up the temporary directory and files after import
		if (fs.existsSync(outputFile)) {
			fs.unlinkSync(outputFile); // Delete the compiled JS file
		}
		if (fs.existsSync(outputDir)) {
			fs.rmdirSync(outputDir); // Remove the temp directory
		}
	});
	return prom;
}

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
	const _paths = [...paths, defaultPath];
	const matches = [] as TImportPathResult[];

	_paths.forEach((filePath) => {
		if (!fs.existsSync(filePath)) {
			return;
		}
		const files = fs.readdirSync(filePath);

		pathSegments.forEach((segment, i) => {
			let matchingFile = files.find((file) => {
				const fileName = file.replace(/\..+$/, "");
				return fileName === segment;
			});

			if (!matchingFile && i === pathSegments.length - 1) {
				matchingFile = files.find((file) => {
					const fileName = file.replace(/\..+$/, "");
					return fileName === "default";
				});
			}

			const fullPath = filePath + "/" + matchingFile;

			if (matchingFile && !matches.find((m) => m.path === fullPath)) {
				const res: TImportPathResult = {
					filePath,
					path: fullPath,
					name: matchingFile,
					isCustom: !filePath.includes(defaultPath),
				};
				matches.push(res);
			}
		});
	});

	if (matches.length === 0) {
		return defaultImport || undefined;
	}

	return onSuccess(matches[0]);
}

export const generateFormatPaths = (
	format: string,
	basePath: string
): string[] => {
	const formatParts = format.split("-");

	// Generate all possible paths by progressively adding format parts
	const paths = formatParts.reduce<string[]>((acc, part, index) => {
		const _path = path.join(basePath, ...formatParts.slice(0, index + 1));
		acc.push(_path);
		return acc;
	}, []);

	// Sort the paths by length in descending order
	paths.sort((a, b) => b.length - a.length);
	return paths;
};

export const generateCustomPaths = (
	config: TConfig,
	paths?: string[]
): string[] => {
	const ret = [] as string[];

	if (!paths) {
		return ret;
	}

	paths.forEach((file) => {
		ret.push(...generateFormatPaths(getFileFormat(config), file));
		ret.push(file);
	});

	return ret;
};
