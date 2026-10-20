import {
	TConfig,
	TLoadedPlugin,
	TOptions,
	TPluginDirectory,
	TPluginDirectoryType,
} from "../types";
import { buildConfig, readUserConfig } from "../utils/UConfig";
import { loadNpmPlugins } from "../utils/UPlugins";

// Custom builders are bundled with their own copy of Architect,
// the instance is stored globally so they share the CLI's context (config & plugins)
const CONTEXT_KEY = Symbol.for("@amphore-dev/architect/context");
const globalStore = globalThis as unknown as Record<
	symbol,
	Context | undefined
>;

class Context {
	private plugins: TLoadedPlugin[] = [];
	private config: TConfig = {};

	private constructor() {} // Private constructor to prevent instantiation

	public static getInstance(): Context {
		return (globalStore[CONTEXT_KEY] ??= new Context());
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
