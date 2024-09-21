import * as fs from "fs";

import { BUILD_PREPRAION_ERROR, FILE_WRITE_ERROR } from "../constants";
import { TBuilderArgs } from "../types";
import { errorLog, prepareBuild } from "../utils";

// DEFAULT BUILDER
// args should contain all the paths and the blueprint
function DefaultBuilder(args: TBuilderArgs) {
	const { blueprint } = args;

	return prepareBuild(args).then(
		(paths) => {
			const { fileOutputPath, outName, indexes } = paths;

			const replacedBlueprint = blueprint.content.replace(
				/__NAME__/g,
				outName
			);

			try {
				fs.writeFileSync(fileOutputPath, replacedBlueprint);
			} catch (error) {
				errorLog("Error writing file", error);
				process.exit(FILE_WRITE_ERROR);
			}
			return [fileOutputPath, ...indexes].filter((b) => b);
		},
		(error) => {
			errorLog("Error preparing build", error);
			process.exit(BUILD_PREPRAION_ERROR);
		}
	);
}

export default DefaultBuilder;
