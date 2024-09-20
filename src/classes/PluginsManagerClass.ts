import { TArchitectPlugin } from "../types/TPlugins";
import { loadNpmPlugins } from "../utils/UPlugins";

class PluginsManager {
	private static instance: PluginsManager;
	private plugins?: TArchitectPlugin[] = undefined;

	private constructor() {} // Private constructor to prevent instantiation

	public static getInstance(): PluginsManager {
		if (!PluginsManager.instance) {
			PluginsManager.instance = new PluginsManager();
		}
		return PluginsManager.instance;
	}

	public async loadPlugins(): Promise<TArchitectPlugin[]> {
		if (!this.plugins) {
			// Load plugins only once and cache them
			this.plugins = await loadNpmPlugins();
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

export default PluginsManager.getInstance();
