export type TArchitectPlugin = {
	name: string; // the plugin's name
	destination: string; // the destination folder name for the plugin files
	register: (architect: TArchitectPluginAPI) => void; // the plugin's registration function
	extensions?: string | TPluginExtensionsMapping; // the file extensions supported by the plugin
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
