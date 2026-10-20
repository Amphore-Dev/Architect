#!/usr/bin/env node
import select from "@inquirer/select";
import { Command } from "commander";

import { version } from "../package.json";
import { ArchitectError, isArchitectError } from "./classes/ArchitectError";
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
	infoLog,
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
	outdirs: TStructurePathResult[],
	options: TOptions
): Promise<TStructurePathResult> => {
	// --force skips the prompt and uses the first match
	if (outdirs.length === 1 || options.force) {
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
			throw new ArchitectError(
				INVALID_COMPONENT_TYPE,
				`Invalid component type: ${componentType}`
			);
		}
		outdir = await selectOutdir(componentType, outdirs, options);
	}

	const blueprint = getBlueprintPath(config, outdir);
	if (!blueprint) {
		throw new ArchitectError(
			NO_BLUEPRINT_FOUND,
			`No blueprint found for "${componentType}" type`
		);
	}

	const builderPath = getBuilderPath(config, outdir);
	if (!builderPath) {
		throw new ArchitectError(
			NO_BUILDER_FOUND,
			`No builder found for "${componentType}" type`
		);
	}

	let builder: TBuilderImport;
	try {
		builder = await loadBuilder(builderPath);
	} catch (error) {
		throw new ArchitectError(
			BUILDER_LOAD_ERROR,
			`Failed to load builder: ${builderPath.path}`,
			"error",
			{ cause: error }
		);
	}

	const files = await builder.default({
		name: componentName,
		config,
		outdir,
		type: outdir.segments[outdir.segments.length - 1],
		blueprint,
	});

	successEndLog(files);
	return SUCCESS_CODE;
};

// The only place where the process exits
const exitWithError = (error: unknown): never => {
	if (!isArchitectError(error)) {
		errorLog(error);
		process.exit(UNEXPECTED_ERROR);
	}

	const cause = error.cause instanceof Error ? error.cause.message : "";
	if (error.level === "info") {
		infoLog(error.message);
	} else {
		errorLog(error.message, ...(cause ? ["\n\n", cause] : []));
	}
	process.exit(error.code);
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
		generate(componentType, componentName, options).then(
			(code) => process.exit(code),
			exitWithError
		)
	);

program.parse(process.argv);
