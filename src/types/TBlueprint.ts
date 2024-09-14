import { TImportPathResult } from "./TImports";

export type TBlueprintSearchResult = TImportPathResult & {
	content: string;
	extension: string;
};
