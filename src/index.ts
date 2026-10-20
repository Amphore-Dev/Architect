#!/usr/bin/env node
import select from "@inquirer/select";
import { Command } from "commander";

import { version } from "../package.json";
import Context from "./classes/ContextClass";
import {
	BUILDER_LOAD_ERROR,
	INVALID_COMPONENT_TYPE,
	NO_BLUEPRINT_FOUND,
	NO_BUILDER_FOUND,
	SUCCESS_CODE,
	UNEXPECTED_ERROR,
} from "./constants";
import { TBuilderImport, TOptions, TStructurePathResult } from "./types";
import {
	errorLog,
	getBlueprintPath,
	getBuilderPath,
	loadBuilder,
	resolveStructurePath,
	successEndLog,
} from "./utils";

// Used when there is no structure in the config: the file is generated in the output directory
const DEFAULT_OUTDIR: TStructurePathResult = {
	type: "default",
	segments: ["default"],
	path: "/",
};

const selectOutdir = async (
	componentType: string,
	outdirs: TStructurePathResult[]
): Promise<TStructurePathResult> => {
	if (outdirs.length === 1) {
		return outdirs[0];
	}

	return select({
		message: `Multiple matches found for '${componentType}' type. Please select a directory.`,
		choices: outdirs.map((outdir) => ({
			name: outdir.segments.join("/"),
			value: outdir,
		})),
	});
};

const generate = async (
	componentType: string,
	componentName: string,
	options: TOptions
) => {
	const config = Context.init(options);

	let outdir = DEFAULT_OUTDIR;
	if (config.structure) {
		const outdirs = resolveStructurePath(
			config.structure,
			componentType,
			config.defaultStructureItem
		);

		if (outdirs.length === 0) {
			errorLog(`Invalid component type: ${componentType}`);
			process.exit(INVALID_COMPONENT_TYPE);
		}
		outdir = await selectOutdir(componentType, outdirs);
	}

	const blueprint = getBlueprintPath(config, outdir);
	if (!blueprint) {
		errorLog(`No blueprint found for "${componentType}" type`);
		process.exit(NO_BLUEPRINT_FOUND);
	}

	const builderPath = getBuilderPath(config, outdir);
	if (!builderPath) {
		errorLog(`No builder found for "${componentType}" type`);
		process.exit(NO_BUILDER_FOUND);
	}

	let builder: TBuilderImport;
	try {
		builder = await loadBuilder(builderPath);
	} catch (error) {
		errorLog("Failed to load builder", error);
		process.exit(BUILDER_LOAD_ERROR);
	}

	const files = await builder.default({
		name: componentName,
		config,
		outdir,
		type: outdir.segments[outdir.segments.length - 1],
		blueprint,
	});

	successEndLog(files);
	process.exit(SUCCESS_CODE);
};

const program = new Command();

program
	.name("architect")
	.description(
		"CLI to generate files and folders based on blueprints and builders"
	)
	.version(version)
	.arguments("<componentType> <componentName>")
	.description("Create a new component")
	.option("-c, --config <path>", "Specify a custom configuration file")
	.option(
		"-f, --force",
		"Skip prompts, overwrite existing files and use default values"
	)
	.option("-o, --output <path>", "Specify the output directory")
	.action((componentType: string, componentName: string, options: TOptions) =>
		generate(componentType, componentName, options).catch((error) => {
			errorLog(error);
			process.exit(UNEXPECTED_ERROR);
		})
	);

program.parse(process.argv);
