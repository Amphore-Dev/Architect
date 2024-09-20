import fs from "fs";
import path from "path";

import { CPLUGIN_PREFIX, PLUGIN_REGISTER_ERROR } from "../constants";
import { TArchitectPlugin, TArchitectPluginAPI } from "../types/TPlugins";
import { errorLog, infoLog } from "../utils";

class ArchitectPlugin implements TArchitectPluginAPI {
	config = {};
	name = "";
	packageName = "";

	private outdir: string;

	constructor(packageName: string, plugin: TArchitectPlugin) {
		this.packageName = packageName;
		this.name = plugin.name;
		this.outdir =
			plugin.destination ??
			plugin.name.replace(CPLUGIN_PREFIX, "").split("-")?.join("/");
	}

	// Registers blueprints by copying from the plugin's source path to the Architect's destination path
	public registerBlueprints() {
		try {
			// Use require.resolve to resolve the plugin's path inside node_modules
			const absoluteSourcePath =
				path.dirname(require.resolve(this.packageName)) +
				"/../blueprints";

			// Resolve the destination path relative to the current working directory (Architect's project)
			const absoluteDestinationPath = this.genOutdirPath("blueprints");

			// Copy the blueprints from the plugin to the project
			this.copyFiles(absoluteSourcePath, absoluteDestinationPath);
		} catch (error) {
			errorLog(
				`Error registering blueprints for "${this.name}" plugin\n\n`,
				(error as Error).message
			);
			process.exit(PLUGIN_REGISTER_ERROR);
		}
	}

	public registerBuilders() {
		try {
			const absoluteSourcePath =
				path.dirname(require.resolve(this.name)) + "/../builders";
			const absoluteDestinationPath = this.genOutdirPath("builders");

			this.copyFiles(absoluteSourcePath, absoluteDestinationPath);
		} catch (error) {
			errorLog(
				`Error registering builders for "${this.name}" plugin\n\n`,
				(error as Error).message
			);
			process.exit(PLUGIN_REGISTER_ERROR);
		}
	}

	/* eslint-disable @typescript-eslint/no-unused-vars */
	public registerCommand(
		commandName: string,
		handler: (args: object) => void
	) {
		infoLog("Registering a command is not yet supported");
	}
	/* eslint-enable @typescript-eslint/no-unused-vars */

	private copyFiles(sourcePath: string, destinationPath: string) {
		// Ensure the destination directory exists
		if (!fs.existsSync(destinationPath)) {
			fs.mkdirSync(destinationPath, { recursive: true });
		}

		// Copy files from source to destination
		fs.readdirSync(sourcePath).forEach((file) => {
			const sourceFilePath = path.join(sourcePath, file);
			const destFilePath = path.join(destinationPath, file);

			// If the file is a directory, recursively copy its contents
			if (fs.lstatSync(sourceFilePath).isDirectory()) {
				this.copyFiles(sourceFilePath, destFilePath);
			} else {
				fs.copyFileSync(sourceFilePath, destFilePath);
			}
		});
	}

	private genOutdirPath(type: string) {
		return path.resolve(__dirname, "..", "plugins", type, this.outdir);
	}
}

export default ArchitectPlugin;
