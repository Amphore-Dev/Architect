#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import { Answers } from "inquirer/dist/cjs/types/types";

import { version } from "../package.json";
import {
	BUILDER_LOAD_ERROR,
	INVALID_COMPONENT_TYPE,
	NO_BLUEPRINT_FOUND,
	NO_BUILDER_FOUND,
	SUCCESS_CODE,
} from "./constants";
import { TOptions } from "./types";
import {
	errorLog,
	resolveStructurePath,
	successEndLog,
	getBlueprintPath,
	getBuilderPath,
	loadConfig,
	compileAndLoadUserTsFile,
} from "./utils";

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
	.option("-y, --yes", "Skip prompts and use default values")
	.option("-f, --force", "Overwrite existing files")
	.option("-o, --output <path>", "Specify the output directory")
	.action(
		(componentType: string, componentName: string, options: TOptions) => {
			const config = loadConfig(options.config as string, options);
			const outdirs = resolveStructurePath(
				config.structure,
				componentType,
				"",
				config.defaultStructureItem
			);

			let outdirProm = Promise.resolve(outdirs[0]);
			if (outdirs.length === 0) {
				errorLog(`Invalid component type: ${componentType}`);
				process.exit(INVALID_COMPONENT_TYPE);
			}
			if (outdirs.length > 1) {
				outdirProm = inquirer
					.prompt([
						{
							type: "list",
							name: "outdir",
							message: `Multiple matches found for '${componentType}' type. Please select a directory.`,
							choices: outdirs.map((outdir) => ({
								name: outdir.segments.join("/"),
								value: outdir,
							})),
						},
					] as Answers)
					.then((answers) => answers.outdir);
			}

			outdirProm
				.then((outdir) => {
					const paths = [...outdir.segments].reverse();
					const blueprint = getBlueprintPath(paths, {
						...config,
						language: outdir.language ?? config.language,
					});

					if (!blueprint) {
						errorLog(
							`No blueprint found for "${componentType}" type`
						);
						process.exit(NO_BLUEPRINT_FOUND);
					}

					const builderPath = getBuilderPath(paths, config);

					if (!builderPath) {
						errorLog(
							`No builder found for "${componentType}" type`
						);
						process.exit(NO_BUILDER_FOUND);
					}

					const prom = builderPath.isCustom
						? compileAndLoadUserTsFile(builderPath.path)
						: import(builderPath.path);

					return prom.then(
						(builder) =>
							builder.default({
								name: componentName,
								config,
								outdir: outdir,
								type: outdir.segments[
									outdir.segments.length - 1
								],
								blueprint,
							}),
						() => {
							errorLog("Failed to load builder");
							process.exit(BUILDER_LOAD_ERROR);
						}
					);
				})
				.then((files: string[]) => {
					successEndLog(files);
					process.exit(SUCCESS_CODE);
				});
		}
	);

program.parse(process.argv);
