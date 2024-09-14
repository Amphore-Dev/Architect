import { TBlueprintSearchResult } from "./TBlueprint";
import { TConfig } from "./TConfig";
import { TImportPathResult } from "./TImports";
import { TStructurePathResult } from "./TStructure";

export type TBuilderArgs = {
	name: string;
	config: TConfig;
	outdir: TStructurePathResult;
	type: string;
	blueprint: TBlueprintSearchResult;
};

export type TBuilderImport = {
	default: (args: TBuilderArgs) => Promise<string[]>;
};

export type TBuilderSearchResult = TImportPathResult & {};

export type TBuildPaths = {
	outdirPath: string;
	fileOutputPath: string;
	outName: string;
};
