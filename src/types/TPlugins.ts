export type TArchitectPlugin = {
	name: string;
	register: (architect: TArchitectPluginAPI) => void;
	extensions?: string | TPluginExtensionsMapping;
};

export type TArchitectPluginAPI = {
	registerBuilders: (
		buildersSourcePath: string,
		buildersDestinationPath: string
	) => void;

	registerBlueprints: (
		blueprintsSourcePath: string,
		blueprintsDestinationPath: string
	) => void;

	registerCommand: (
		commandName: string,
		handler: (args: object) => void
	) => void;

	config: object; // the CLI's configuration, if needed by plugins
};

export type TPluginExtensionsMapping = Record<string, string>;
