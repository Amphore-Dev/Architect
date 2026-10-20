import * as fs from "fs";
import * as path from "path";

import { TConfig, TStructurePathResult } from "../types";
import { TBlueprintSearchResult } from "../types/TBlueprint";
import { getDefaultExtension, getFileLanguage } from "./UFiles";
import {
	getImportPaths,
	getLookupNames,
	getSearchPaths,
	resolveFileReference,
} from "./UImports";

const DEFAULT_BLUEPRINTS_PATH = path.join(__dirname, "..", "blueprints");

const readBlueprint = (
	blueprintPath: string,
	isCustom: boolean
): TBlueprintSearchResult => {
	const name = path.basename(blueprintPath);

	return {
		path: blueprintPath,
		name,
		content: fs.readFileSync(blueprintPath, "utf8"),
		extension: path.extname(name).replace(".", ""),
		isCustom,
	};
};

export function getBlueprintPath(
	config: TConfig,
	outdir: TStructurePathResult
): TBlueprintSearchResult | undefined {
	// TStructureItem.blueprint can be a path to a blueprint file
	const blueprintFile = resolveFileReference(outdir.blueprint);
	if (blueprintFile) {
		return readBlueprint(blueprintFile, true);
	}

	return getImportPaths<TBlueprintSearchResult>({
		paths: getSearchPaths(
			"blueprints",
			config,
			outdir,
			DEFAULT_BLUEPRINTS_PATH
		),
		defaultPath: DEFAULT_BLUEPRINTS_PATH,
		pathSegments: getLookupNames(config, outdir, outdir.blueprint),
		onSuccess: ({ path, isCustom }) => readBlueprint(path, isCustom),
		defaultImport: getDefaultBlueprint(config, outdir),
	});
}

const getDefaultBlueprint = (
	config: TConfig,
	outdir: TStructurePathResult
): TBlueprintSearchResult => {
	const extension = getDefaultExtension(config, outdir);
	const name = `default.bp.${extension}`;

	// Split the language by hyphens and use the parts as folder paths
	const blueprintFilePath = path.join(
		DEFAULT_BLUEPRINTS_PATH,
		...getFileLanguage(config, outdir).split("-"),
		name
	);

	if (fs.existsSync(blueprintFilePath)) {
		return readBlueprint(blueprintFilePath, false);
	}

	// If no blueprint is found, return an empty blueprint
	return {
		path: path.join(DEFAULT_BLUEPRINTS_PATH, "default.bp"),
		name: "default.bp",
		content: "",
		extension,
		isCustom: false,
	};
};
