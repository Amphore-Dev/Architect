import * as fs from "fs";

import { TBuilderArgs } from "../types";
import { prepareBuild } from "../utils";

// DEFAULT BUILDER
// args should contain all the paths and the blueprint
function DefaultBuilder(args: TBuilderArgs) {
	const { blueprint } = args;

	return prepareBuild(args).then((paths) => {
		const { fileOutputPath, outName, indexes } = paths;

		const replacedBlueprint = blueprint.content.replace(
			/__NAME__/g,
			outName
		);

		fs.writeFileSync(fileOutputPath, replacedBlueprint);

		return [fileOutputPath, ...indexes].filter((b) => b);
	});
}

export default DefaultBuilder;
