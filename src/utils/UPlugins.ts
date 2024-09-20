import fs from "fs";
import path from "path";

import ArchitectPlugin from "../classes/PluginApiClass";
import { CPLUGIN_PREFIX } from "../constants";
import { TArchitectPlugin } from "../types/TPlugins";

export async function loadNpmPlugins(): Promise<TArchitectPlugin[]> {
	const plugins: TArchitectPlugin[] = [];
	const packageJsonPath = path.join(process.cwd(), "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

	const allDependencies = Object.keys(packageJson.dependencies || {}).concat(
		Object.keys(packageJson.devDependencies || {})
	);

	// Filter dependencies starting with "architect-plugin-" (CPLUGIN_PREFIX)
	const dependencies =
		allDependencies
			.filter((dep) => dep.startsWith(CPLUGIN_PREFIX))
			.filter((value, index, self) => self.indexOf(value) === index) ||
		[];

	dependencies.forEach(async (dep) => {
		try {
			// Use dynamic import instead of require
			const pluginPath = path.join(process.cwd(), "node_modules", dep);
			const pluginModule = await import(pluginPath);
			const plugin: TArchitectPlugin =
				pluginModule.default || pluginModule;

			// Register the plugin with Architect API
			if (plugin && plugin.register) {
				const pluginAPI = new ArchitectPlugin(plugin.name);
				plugin.register(pluginAPI);
				plugins.push(plugin);
			} else {
				console.warn(
					`The plugin "${dep}" does not follow the TArchitectPlugin interface.`
				);
			}
		} catch (error) {
			throw new Error(`Failed to load plugin "${dep}":` + error);
		}
	});

	return Promise.resolve(plugins);
}
