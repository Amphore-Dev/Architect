import { TConfig, TOptions } from "../types";
import { TArchitectPlugin } from "../types/TPlugins";
import { loadConfig } from "../utils";
import { loadNpmPlugins } from "../utils/UPlugins";

class Context {
	private static instance: Context;
	private plugins?: TArchitectPlugin[] = undefined;
	private config: TConfig = {};
	private options: TOptions = {};

	private constructor() {} // Private constructor to prevent instantiation

	public static getInstance(): Context {
		if (!Context.instance) {
			Context.instance = new Context();
		}
		return Context.instance;
	}

	/**
	 * Initialize
	 */

	public async init(options: TOptions = {}): Promise<TConfig> {
		this.loadConfig(options.config, options);
		await this.loadPlugins();
		this.loadConfig(options.config, options); // Reload config to include plugin configs
		return this.getConfig();
	}

	/**
	 * Config
	 **/

	public loadConfig(configPath?: string, options: TOptions = {}): TConfig {
		this.config = loadConfig(configPath, options);
		return this.config;
	}

	public getConfig(): TConfig {
		return this.config;
	}

	public clearConfig() {
		this.config = {};
	}

	/**
	 * Options
	 */

	public setOptions(options: TOptions): void {
		this.options = options;
	}

	public getOptions(): TOptions {
		return this.options;
	}

	public clearOptions() {
		this.options = {};
	}

	/**
	 * Plugins
	 **/

	public async loadPlugins(
		pluginsList?: string[]
	): Promise<TArchitectPlugin[]> {
		if (!this.plugins) {
			// Load plugins only once and cache them
			this.plugins = await loadNpmPlugins(
				pluginsList || this.config.plugins
			);
		}
		return this.plugins;
	}

	public getPlugins(): TArchitectPlugin[] {
		return this.plugins || [];
	}

	public clearPlugins() {
		this.plugins = []; // Reset the plugin cache if needed
	}
}

export default Context.getInstance();
