import * as fs from "fs";
import * as path from "path";

import { DEFAULT_LANGUAGE } from "../constants";
import { TConfig, TStructurePathResult } from "../types";
import { TBlueprintSearchResult } from "../types/TBlueprint";
import { getDefaultExtension, getFileLanguage } from "./UFiles";
import {
	generateCustomPaths,
	generateFormatPaths,
	getImportPaths,
} from "./UImports";

export function getBlueprintPath(
	pathSegments: string[],
	config: TConfig,
	outdir: TStructurePathResult
): TBlueprintSearchResult | undefined {
	// Concatenate the default blueprint path with the user-defined blueprint paths
	const defaultPath = path.join(__dirname, "..", "blueprints");
	const pluginsPath = path.join(__dirname, "..", "plugins/blueprints");

	const paths = [
		...generateCustomPaths(config, config.blueprints, outdir),
		...generateCustomPaths(config, [pluginsPath], outdir),
		...generateFormatPaths(getFileLanguage(config, outdir), defaultPath),
	];

	return getImportPaths<TBlueprintSearchResult>({
		paths,
		defaultPath,
		pathSegments,
		onSuccess: ({ path: pathName, name, isCustom }) => ({
			path: pathName,
			name,
			content: fs.readFileSync(pathName, "utf8"),
			extension: path.extname(name).replace(".", ""),
			isCustom,
		}),
		defaultImport: getDefaultBlueprint(config, outdir),
	});
}

const getDefaultBlueprint = (config: TConfig, outdir: TStructurePathResult) => {
	const defaultPath = [__dirname, "..", "blueprints"].join(path.sep);
	const format = config.language ?? DEFAULT_LANGUAGE;
	const extension = getDefaultExtension(config, outdir);

	// Split the format by hyphens and use the parts as folder paths
	const formatParts = format.split("-");
	const blueprintFolderPath = path.join(defaultPath, ...formatParts);
	const blueprintFilePath = path.join(
		blueprintFolderPath,
		`default.bp.${extension}`
	);

	if (fs.existsSync(blueprintFilePath)) {
		return {
			path: blueprintFilePath,
			name: `default.bp.${extension}`,
			content: fs.readFileSync(blueprintFilePath, "utf8"),
			extension,
			isCustom: false,
		};
	}

	// If no blueprint is found, return a default blueprint object
	return {
		path: path.join(defaultPath, "default.bp"),
		name: "default.bp",
		content: "",
		extension,
		isCustom: false,
	};
};
