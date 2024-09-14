import { TStructure, TStructureItem } from "./TStructure";

export type TOptions = {
	config?: string;
	yes?: boolean;
	force?: boolean;
	output?: string;
};

export type TLanguageName =
	| "javascript"
	| "react"
	| "react-typescript"
	| "react-native"
	| "react-native-typescript"
	| "vue"
	| "vue-typescript"
	| "angular"
	| "angular-typescript"
	| "php"
	| string;

export type TLanguageOptions = {
	name: string;
	extension: string;
};

export type TLanguage = TLanguageName | TLanguageOptions;

export type TConfig = TStructureItem & {
	// MVP properties
	outputDir: string; // Base directory for the project
	language: TLanguage; // The format of the project
	structure: TStructure; // The structure of the project
	defaultStructureItem: TStructureItem; // Default structure item
	blueprints?: string[]; // Blueprints to include
	builders?: string[]; // Builders to include
	options?: TOptions; // Additional options

	// Post-MVP/Todo properties
	// includeTests?: boolean; // Whether to include tests
	// style?: "css" | "scss"; // The stylesheet format
};
