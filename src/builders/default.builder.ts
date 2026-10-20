import * as fs from "fs";

import { ArchitectError } from "../classes/ArchitectError";
import { FILE_WRITE_ERROR } from "../constants";
import { TBuilderArgs } from "../types";
import { prepareBuild } from "../utils";

// DEFAULT BUILDER
// args should contain all the paths and the blueprint
function DefaultBuilder(args: TBuilderArgs) {
	const { blueprint } = args;

	return prepareBuild(args).then(({ fileOutputPath, outName, indexes }) => {
		const replacedBlueprint = blueprint.content.replace(
			/__NAME__/g,
			outName
		);

		try {
			fs.writeFileSync(fileOutputPath, replacedBlueprint);
		} catch (error) {
			throw new ArchitectError(
				FILE_WRITE_ERROR,
				`Error writing file: ${fileOutputPath}`,
				"error",
				{ cause: error }
			);
		}
		return [fileOutputPath, ...indexes];
	});
}

export default DefaultBuilder;
