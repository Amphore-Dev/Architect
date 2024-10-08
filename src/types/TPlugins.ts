import { TConfig } from "./TConfig";
import { TFileExtensions } from "./TFileExtensions";

export type TArchitectPlugin = {
	name: string; // the plugin's name
	destination?: string; // the destination folder name for the plugin files
	register?: (architect: TArchitectPluginAPI) => void; // the plugin's registration function
	extensions?: string | TFileExtensions; // the file extensions supported by the plugin
	config?: TConfig; // the plugin's configuration object that will be merged with the CLI's configuration
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
