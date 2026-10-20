import fs from "fs";
import path from "path";

import { PLUGIN_REGISTER_ERROR } from "../constants";
import {
	TArchitectPlugin,
	TArchitectPluginAPI,
	TPluginDirectories,
	TPluginDirectoryType,
} from "../types";
import { errorLog, infoLog } from "../utils/ULogs";

class ArchitectPlugin implements TArchitectPluginAPI {
	config = {};
	directories: TPluginDirectories = {};

	constructor(
		private plugin: TArchitectPlugin,
		private root: string, // the plugin's package root
		private namespace: string[]
	) {}

	public registerBlueprints(sourcePath = "blueprints") {
		this.registerDirectory("blueprints", sourcePath);
	}

	public registerBuilders(sourcePath = "builders") {
		this.registerDirectory("builders", sourcePath);
	}

	/* eslint-disable @typescript-eslint/no-unused-vars */
	public registerCommand(
		commandName: string,
		handler: (args: object) => void
	) {
		infoLog("Registering a command is not yet supported");
	}
	/* eslint-enable @typescript-eslint/no-unused-vars */

	// The files are used in place (no copy), so it works when Architect is installed globally
	private registerDirectory(type: TPluginDirectoryType, sourcePath: string) {
		const absolutePath = path.resolve(this.root, sourcePath);

		if (!fs.existsSync(absolutePath)) {
			errorLog(
				`Error registering ${type} for "${this.plugin.name}" plugin\n\n`,
				`Directory not found: ${absolutePath}`
			);
			process.exit(PLUGIN_REGISTER_ERROR);
		}

		this.directories[type] = {
			namespace: this.namespace,
			path: absolutePath,
		};
	}
}

export default ArchitectPlugin;
