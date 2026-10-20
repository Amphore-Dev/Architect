import { TConfig } from "./TConfig";
import { TFileExtensions } from "./TFileExtensions";

export type TArchitectPlugin = {
	name: string; // the plugin's name
	destination?: string; // the namespace of the plugin files (defaults to the name without the "architect-plugin-" prefix)
	register?: (architect: TArchitectPluginAPI) => void; // the plugin's registration function
	extensions?: string | TFileExtensions; // the file extensions supported by the plugin
	config?: TConfig; // the plugin's configuration object that will be merged with the CLI's configuration
};

export type TArchitectPluginAPI = {
	// sourcePath is relative to the plugin's package root (defaults to "builders")
	registerBuilders: (sourcePath?: string) => void;

	// sourcePath is relative to the plugin's package root (defaults to "blueprints")
	registerBlueprints: (sourcePath?: string) => void;

	registerCommand: (
		commandName: string,
		handler: (args: object) => void
	) => void;

	config: object; // the CLI's configuration, if needed by plugins
};

export type TPluginDirectoryType = "blueprints" | "builders";

// A directory registered by a plugin, searched when the language starts with the plugin namespace
export type TPluginDirectory = {
	namespace: string[];
	path: string;
};

export type TPluginDirectories = Partial<
	Record<TPluginDirectoryType, TPluginDirectory>
>;

export type TLoadedPlugin = {
	plugin: TArchitectPlugin;
	directories: TPluginDirectories;
};
