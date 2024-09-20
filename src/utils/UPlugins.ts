import path from "path";

import ArchitectPlugin from "../classes/PluginApiClass";
import { PLUGIN_LOAD_ERROR } from "../constants";
import { TArchitectPlugin } from "../types/TPlugins";
import { errorLog, warningLog } from "./ULogs";

export async function loadNpmPlugins(
	pluginsList: string[] = []
): Promise<TArchitectPlugin[]> {
	const plugins: TArchitectPlugin[] = [];

	pluginsList.forEach(async (dep) => {
		try {
			// Use dynamic import instead of require
			const pluginPath = path.join(process.cwd(), "node_modules", dep);
			const pluginModule = await import(pluginPath);
			const plugin: TArchitectPlugin =
				pluginModule.default || pluginModule;

			// Register the plugin with Architect API
			if (plugin && plugin.register) {
				const pluginAPIObject = new ArchitectPlugin(dep, plugin);
				plugin.register(pluginAPIObject);
				plugins.push(plugin);
			} else {
				warningLog(
					`The plugin "${dep}" does not follow the TArchitectPlugin interface.`
				);
			}
		} catch (error) {
			errorLog(`Failed to load plugin "${dep}":` + error);
			process.exit(PLUGIN_LOAD_ERROR);
		}
	});

	return Promise.resolve(plugins);
}
