import { TStructure, TStructureItem } from "./TStructure";

export type TOptions = {
	config?: string;

	force?: boolean;
	output?: string;
};

export type TConfig = TStructureItem & {
	// MVP properties
	outputDir?: string; // Base directory for the project
	structure?: TStructure; // The structure of the project
	language?: string; // The format of the project
	defaultStructureItem?: TStructureItem; // Default structure item
	blueprints?: string[]; // Blueprints to include
	builders?: string[]; // Builders to include
	options?: TOptions; // Additional options
	plugins?: string[]; // Plugins to include

	// Post-MVP/Todo properties
	// includeTests?: boolean; // Whether to include tests
	// style?: "css" | "scss"; // The stylesheet format
};
