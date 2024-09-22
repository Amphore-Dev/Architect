import { TCaseFormatConfig } from "../utils";
import { TFileExtensions } from "./TFileExtensions";

// Type de structure pour chaque élément
export type TStructureItem = {
	type?: string; // Le type de l'élément (atom, molecule, directory, etc.)
	generateDir?: boolean; // Indique si un dossier doit être généré
	generateIndex?: boolean; // Indique si un fichier index.ts doit être généré
	generateSubdirs?: boolean; // Indique si des sous-dossiers doivent être générés
	generateSubIndex?: boolean; // Indique si un fichier index.ts doit être généré dans les sous-dossiers
	subdirs?: Record<string, TStructureEntry>; // Sous-dossiers de cet élément, si applicable
	prefix?: string; // Préfixe pour le nom de l'élément
	suffix?: string; // Suffixe pour le nom de l'élément
	caseFormat?: TCaseFormatConfig; // Format du nom de l'élément
	language?: string; // Format du fichier
	extensions?: string | TFileExtensions;
};

// Union pour permettre un élément soit d'être une string soit un StructureItem
export type TStructureEntry = string | TStructureItem;

// Type principal pour la structure
export type TStructure = {
	[key: string]: TStructureEntry | TStructure;
};

export type TStructurePath = string[];

export type TStructurePathResult = TStructureItem & {
	segments: TStructurePath;
	path: string;
};
