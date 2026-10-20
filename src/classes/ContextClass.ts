import {
	TConfig,
	TLoadedPlugin,
	TOptions,
	TPluginDirectory,
	TPluginDirectoryType,
} from "../types";
import { buildConfig, readUserConfig } from "../utils/UConfig";
import { loadNpmPlugins } from "../utils/UPlugins";

class Context {
	private static instance: Context;
	private plugins: TLoadedPlugin[] = [];
	private config: TConfig = {};

	private constructor() {} // Private constructor to prevent instantiation

	public static getInstance(): Context {
		return (Context.instance ??= new Context());
	}

	/**
	 * Read the user config, load its plugins and merge the plugins configs
	 */
	public init(options: TOptions = {}): TConfig {
		const userConfig = readUserConfig(options);

		this.plugins = loadNpmPlugins(userConfig.plugins);
		this.config = buildConfig(
			userConfig,
			options,
			this.plugins.map(({ plugin }) => plugin.config)
		);

		return this.config;
	}

	public getConfig(): TConfig {
		return this.config;
	}

	public getPlugins() {
		return this.plugins.map(({ plugin }) => plugin);
	}

	// Directories registered by the plugins for the given type (blueprints or builders)
	public getPluginDirectories(
		type: TPluginDirectoryType
	): TPluginDirectory[] {
		return this.plugins
			.map(({ directories }) => directories[type])
			.filter((dir): dir is TPluginDirectory => !!dir);
	}
}

export default Context.getInstance();
