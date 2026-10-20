import { TBuilderArgs } from "@amphore-dev/architect";
import * as fs from "fs";

import { prepareBuild } from "@amphore-dev/architect/dist/utils";

// Custom builder, used by the "service" structure item ("builder" key in architect.config.json)
// It replaces a custom __DATE__ placeholder in addition to __NAME__
export default function ServiceBuilder(args: TBuilderArgs) {
	const { blueprint } = args;

	return prepareBuild(args).then(({ fileOutputPath, outName, indexes }) => {
		const content = blueprint.content
			.replace(/__NAME__/g, outName)
			.replace(/__DATE__/g, new Date().toISOString());

		fs.writeFileSync(fileOutputPath, content);

		return [fileOutputPath, ...indexes];
	});
}
