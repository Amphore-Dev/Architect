import { TConfig } from "../types";

export const DEFAULT_CONFIG: TConfig = {
	outputDir: "src",
	language: "react-typescript",
	structure: {
		components: {
			type: "component",
			subdirs: {
				atoms: "atom",
				molecules: "molecule",
				organisms: "organism",
				templates: "template",
				pages: "page",
			},
			generateSubdirs: true,
		},
		utils: {
			type: "util",
			prefix: "U",
		},
		constants: {
			type: "constant",
			prefix: "C",
			caseFormat: {
				name: "snake-upper",
			},
		},
		types: {
			type: "type",
			prefix: "T",
		},
		hooks: {
			type: "hook",
			prefix: "use",
		},
	},
	defaultStructureItem: {
		generateIndex: true,
	},
};
