import * as fs from "fs";
import * as path from "path";

import { TBuilderArgs } from "../../../../../types";
import { prepareBuild } from "../../../../../utils";
import { CUSTOM_UTIL_BUILDER_REPLACED } from "../../../constants/CTests";

function UtilBuilder(args: TBuilderArgs) {
	const { blueprint, outdir } = args;

	return prepareBuild(args).then((paths) => {
		const { outdirPath, fileOutputPath, outName } = paths;
		fs.mkdirSync(outdirPath, { recursive: true });

		const replacedBlueprint = blueprint.content.replace(
			/__NAME__/g,
			CUSTOM_UTIL_BUILDER_REPLACED
		);

		fs.writeFileSync(fileOutputPath, replacedBlueprint);

		return [fileOutputPath];
	});
}

export default UtilBuilder;
