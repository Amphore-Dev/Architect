import * as fs from "fs";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { version } from "../../package.json";
import {
	FILE_CONFLICT,
	INVALID_COMPONENT_TYPE,
	INVALID_CONFIG_FILE,
	INVALID_NAME_FORMAT,
	SUCCESS_CODE,
	TEST_OUTPUT_DIR,
} from "../constants";
import {
	CUSTOM_COMPONENT_BLUEPRINT_REPLACED,
	CUSTOM_UTIL_BUILDER_REPLACED,
} from "./src/constants/CTests";
import { runCli } from "./src/utils/UCli";

describe("cli-tests", () => {
	const OUT_DIR = TEST_OUTPUT_DIR + "CLI_TESTS_SRC";

	const DEFAULT_TESTS_ARGS = [
		"-c",
		__dirname + "/src/.test.main.config.json",
		"-o",
		OUT_DIR,
	];

	const clean = () =>
		fs.rmSync(`${process.cwd()}/${OUT_DIR}`, {
			recursive: true,
			force: true,
		});

	beforeAll(clean);
	afterAll(clean);

	const expectFileContent = (filePath: string, content: string) => {
		if (!fs.existsSync(filePath)) {
			throw new Error(`File not created: ${filePath}`);
		}
		expect(fs.readFileSync(filePath, "utf8")).toContain(content);
	};

	it("should print version with -V flag", async () => {
		const { stdout } = await runCli(["-V"]);
		expect(stdout).toContain(version);
	});

	it("should fail on bad config file", async () => {
		const { code } = await runCli([
			"-c",
			__dirname + "/src/.test.invalid.config", // This should be an invalid file
			"customType",
			"Test",
		]);
		expect(code).toBe(INVALID_CONFIG_FILE);
	});

	it("should fail on missing custom config file", async () => {
		const { code } = await runCli([
			"-c",
			__dirname + "/src/.test.missing.config.json",
			"customType",
			"Test",
		]);
		expect(code).toBe(INVALID_CONFIG_FILE);
	});

	it("should use custom config file", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"customType",
			"CUSTOM_CONFIG_TEST",
		]);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("should fail with invalid type", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"UNKOWN", // This should be an invalid type
			"Test",
		]);
		expect(code).toBe(INVALID_COMPONENT_TYPE);
	});

	it("should fail on invalid config values", async () => {
		const { code, stderr } = await runCli([
			"-c",
			__dirname + "/src/.test.invalid.values.config.json",
			"atom",
			"Test",
		]);
		expect(code).toBe(INVALID_CONFIG_FILE);
		expect(stderr).toContain("structure.atoms.caseFormat");
		expect(stderr).toContain("structure.atoms.generateIndx");
	});

	it("should use the first match with --force when a type matches several folders", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"-f",
			"conflic",
			"FORCE_SELECT_TEST",
		]);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("should not run the CLI when imported as a library", () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const lib = require(path.join(__dirname, "../../dist/index.js"));

		expect(typeof lib.prepareBuild).toBe("function");
		expect(typeof lib.formatName).toBe("function");
		expect(typeof lib.ArchitectError).toBe("function");
	});

	it("should reject names containing a path", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"atom",
			"a/../../ESCAPE",
		]);
		expect(code).toBe(INVALID_NAME_FORMAT);
		expect(fs.existsSync("ESCAPE.tsx")).toBe(false);
	});

	it("should create a component", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"atom",
			"COMPONENT_TEST",
		]);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("should not overwrite an existing component without confirmation", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"atom",
			"COMPONENT_TEST",
		]);
		expect(code).toBe(FILE_CONFLICT);
	});

	it("should overwrite existing component", async () => {
		const args = [
			...DEFAULT_TESTS_ARGS,
			"-f",
			"atom",
			"COMPONENT_OVERWRITE_TEST",
		];

		expect((await runCli(args)).code).toBe(SUCCESS_CODE);
		expect((await runCli(args)).code).toBe(SUCCESS_CODE);
	});

	it("should use custom blueprint", async () => {
		const { code } = await runCli([
			"-c",
			__dirname + "/src/.test.cli.config.json",
			"-o",
			OUT_DIR,
			"-f",
			"atom",
			"COMPONENT_CUSTOM_BP_TEST",
		]);

		expectFileContent(
			OUT_DIR + "/atoms/COMPONENT_CUSTOM_BP_TEST.tsx",
			"CUSTOM_REACT_TYPESCRIPT_ATOM"
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("should use custom builder", async () => {
		const { code } = await runCli([
			"-c",
			__dirname + "/src/.test.names.config.json",
			"-o",
			OUT_DIR,
			"-f",
			"util",
			"CUSTOM_UTIL_BUILDER",
		]);

		expectFileContent(
			OUT_DIR + "/utils/CUSTOM_UTIL_BUILDER.ts",
			CUSTOM_UTIL_BUILDER_REPLACED
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("Priority Check - Custom Builder", async () => {
		const { code } = await runCli([
			"-c",
			__dirname + "/src/.test.names.config.json",
			"-o",
			OUT_DIR,
			"-f",
			"util",
			"PRIO_CUSTOM_UTIL_BUILDER",
		]);

		expectFileContent(
			OUT_DIR + "/utils/PRIO_CUSTOM_UTIL_BUILDER.ts",
			CUSTOM_UTIL_BUILDER_REPLACED
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("Priority Check - Custom Blueprint", async () => {
		const { code } = await runCli([
			"-c",
			__dirname + "/src/.test.cli.config.json",
			"-o",
			OUT_DIR,
			"-f",
			"molecule",
			"PRIO_CUSTOM_MOLECULE_BLUEPRINT",
		]);

		expectFileContent(
			OUT_DIR +
				"/components/molecules/PRIO_CUSTOM_MOLECULE_BLUEPRINT.tsx",
			CUSTOM_COMPONENT_BLUEPRINT_REPLACED
		);
		expect(code).toBe(SUCCESS_CODE);
	});
});
