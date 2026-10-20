import * as fs from "fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { SUCCESS_CODE, TEST_OUTPUT_DIR } from "../constants";
import { runCli } from "./src/utils/UCli";

describe("Name formatting & prefixes", () => {
	const OUT_DIR_NAME = "NAMES_TESTS_SRC";
	const OUT_DIR = TEST_OUTPUT_DIR + OUT_DIR_NAME;
	const OUT_PATH = OUT_DIR + "/constants/Ctest-with-case/Ctest_with_case.ts";

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

	const expectFiles = (...filePaths: string[]) =>
		filePaths.forEach((filePath) => {
			if (!fs.existsSync(filePath)) {
				throw new Error(`File not created: ${filePath}`);
			}
		});

	/**
	 * /!\ This first test generate the files and folders used in the following tests
	 * It is important to run this test first
	 */
	it("Files and folders generation", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"constant",
			"testWithCase",
		]);

		expectFiles(OUT_PATH);
		expect(code).toBe(SUCCESS_CODE);
	});

	/**
	 * This test checks if the prefix is added to the generated file/folder
	 * Prefix is defined in the config file
	 * Constant "testWithCase" -> Prefix: 'C' -> CTEST_WITH_CASE
	 **/
	it("Prefix check", () => {
		expect(fs.readFileSync(OUT_PATH, "utf-8")).toContain("CTEST_WITH_CASE");
	});

	it("Suffix check", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"service",
			"testWithCase",
		]);
		const servicePath =
			OUT_DIR + "/service/test-with-caseService/test_with_caseService.ts";

		expectFiles(servicePath);
		expect(fs.readFileSync(servicePath, "utf-8")).toContain(
			"TEST_WITH_CASEService"
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	/**
	 * each type (name/file/folder) can have a different case format
	 * when caseFormat is an object in the config
	 **/
	it("Case Format check - object", () => {
		expectFiles(OUT_PATH);
		expect(fs.readFileSync(OUT_PATH, "utf-8")).toContain("CTEST_WITH_CASE");
	});

	/**
	 * when caseFormat is a string in the config
	 * all types will have the same case format
	 **/
	it("Case Format check - string", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"util",
			"testWithCase",
		]);

		expectFiles(OUT_DIR + "/utils/UTEST-WITH-CASE.ts");
		expect(
			fs.readFileSync(OUT_DIR + "/utils/UTEST-WITH-CASE.ts", "utf-8")
		).toContain("UTEST-WITH-CASE");
		expect(code).toBe(SUCCESS_CODE);
	});

	/**
	 * Issue #20: digits must be kept in the generated names
	 **/
	it("Case Format check - digits", async () => {
		const { code } = await runCli([
			...DEFAULT_TESTS_ARGS,
			"constant",
			"CommandsV2",
		]);
		const filePath = OUT_DIR + "/constants/Ccommands-v2/Ccommands_v2.ts";

		expectFiles(filePath);
		expect(fs.readFileSync(filePath, "utf-8")).toContain("CCOMMANDS_V2");
		expect(code).toBe(SUCCESS_CODE);
	});

	it("Extensions check - string", async () => {
		const { code } = await runCli([
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.extensions.config.json",
			"component",
			"extensionTest",
		]);

		expectFiles(OUT_DIR + "/components/extensionTest.component");
		expect(code).toBe(SUCCESS_CODE);
	});

	it("Extensions check - object", async () => {
		const { code } = await runCli([
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.extensions.config.json",
			"hook",
			"extensionTest",
		]);

		expectFiles(
			OUT_DIR + "/hooks/extensionTest.hookDefault",
			OUT_DIR + "/hooks/index.hookIndex"
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("Extensions check - DefaultStructureItem object", async () => {
		const { code } = await runCli([
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.extensions.config.json",
			"util",
			"extensionTest",
		]);

		expectFiles(
			OUT_DIR + "/utils/extensionTest.default",
			OUT_DIR + "/utils/index.index"
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("Extensions check - DefaultStructureItem string", async () => {
		const { code } = await runCli([
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.extensions.default.config.json",
			"util",
			"extensionTest",
		]);

		expectFiles(
			OUT_DIR + "/utils/extensionTest.defaultStructureItem",
			OUT_DIR + "/utils/index.defaultStructureItem"
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("Language check", async () => {
		const { code } = await runCli([
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.main.config.json",
			"language",
			"languageTest",
		]);

		expectFiles(
			OUT_DIR + "/languages/languageTest.js",
			OUT_DIR + "/languages/index.js"
		);
		expect(code).toBe(SUCCESS_CODE);
	});
});
