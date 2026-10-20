import { TCaseFormatConfig } from "../utils";
import { TFileExtensions } from "./TFileExtensions";

// Options of a folder of the structure
export type TStructureItem = {
	type?: string; // The type of the items generated in this folder (atom, molecule, page, etc.)
	generateIndex?: boolean; // Generate an index file in this folder
	generateSubdirs?: boolean; // Generate a folder for each generated item
	generateSubIndex?: boolean; // Generate an index file in the subdirectories
	subdirs?: Record<string, TStructureEntry>; // Subdirectories of this folder
	prefix?: string; // Prefix of the generated names
	suffix?: string; // Suffix of the generated names
	caseFormat?: TCaseFormatConfig; // Case format of the generated names
	preserveAcronyms?: boolean; // Keep the acronyms (API, HTTP) in uppercase in camel/pascal case
	language?: string; // Language of this folder (overrides the project language)
	extensions?: string | TFileExtensions; // Extension of the generated files (and indexes)
	blueprint?: string; // Type of another structure item, or path to a blueprint file
	builder?: string; // Type of another structure item, or path to a builder file
};

// A folder is either a type (string) or its options
export type TStructureEntry = string | TStructureItem;

// The folders of the project, by name
export type TStructure = {
	[key: string]: TStructureEntry | TStructure;
};

export type TStructurePath = string[];

export type TStructurePathResult = TStructureItem & {
	segments: TStructurePath;
	path: string;
};
