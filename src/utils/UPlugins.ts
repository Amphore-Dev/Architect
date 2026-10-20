import fs from "fs";
import { createRequire } from "module";
import path from "path";

import ArchitectPlugin from "../classes/PluginApiClass";
import { CPLUGIN_PREFIX, PLUGIN_LOAD_ERROR } from "../constants";
import { TArchitectPlugin, TLoadedPlugin } from "../types";
import { errorLog, warningLog } from "./ULogs";

/**
 * Resolve a plugin entry point.
 * Look first in the project's node_modules (from the current working directory),
 * then next to Architect itself (global installs).
 */
export const resolvePlugin = (packageName: string): string => {
	const projectRequire = createRequire(path.join(process.cwd(), "noop.js"));

	try {
		return projectRequire.resolve(packageName);
	} catch {
		return require.resolve(packageName);
	}
};

/**
 * Find the root folder of a package (the closest folder containing a package.json)
 */
export const findPackageRoot = (filePath: string): string => {
	let dir = path.dirname(filePath);

	while (!fs.existsSync(path.join(dir, "package.json"))) {
		const parent = path.dirname(dir);
		if (parent === dir) return path.dirname(filePath);
		dir = parent;
	}
	return dir;
};

// "architect-plugin-react-native" -> ["react", "native"]
export const getPluginNamespace = (plugin: TArchitectPlugin): string[] =>
	(plugin.destination ?? plugin.name.replace(CPLUGIN_PREFIX, ""))
		.split(/[-/]/)
		.filter(Boolean);

export function loadNpmPlugins(pluginsList: string[] = []): TLoadedPlugin[] {
	return pluginsList.map((packageName) => {
		let plugin: TArchitectPlugin;
		let root: string;

		try {
			const entryPoint = resolvePlugin(packageName);
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const pluginModule = require(entryPoint);

			plugin = pluginModule.default ?? pluginModule;
			root = findPackageRoot(entryPoint);
		} catch (error) {
			errorLog(
				`Failed to load plugin "${packageName}":`,
				(error as Error).message
			);
			process.exit(PLUGIN_LOAD_ERROR);
		}

		if (!plugin?.name) {
			warningLog(
				`The plugin "${packageName}" does not follow the TArchitectPlugin interface.`
			);
			return { plugin: { name: packageName }, directories: {} };
		}

		const api = new ArchitectPlugin(
			plugin,
			root,
			getPluginNamespace(plugin)
		);
		plugin.register?.(api);

		return { plugin, directories: api.directories };
	});
}
