import { spawn } from "child_process";
import * as fs from "fs";
import path from "path";

import { SUCCESS_CODE } from "../constants";

describe("Name formatting & prefixes", () => {
	const OUT_DIR_BASE = "src/tests/";
	const OUT_DIR_NAME = "NAMES_TESTS_SRC";
	const OUT_DIR = OUT_DIR_BASE + OUT_DIR_NAME;
	const OUT_PATH = OUT_DIR + "/constants/Ctest-with-case/Ctest_with_case.ts";

	const DEFAULT_TESTS_ARGS = [
		"-c",
		__dirname + "/src/.test.main.config.json",
		"-o",
		OUT_DIR,
	];

	beforeAll(() => {
		// clean out folder before tests
		fs.rm(`${__dirname}/${OUT_DIR_NAME}`, { recursive: true }, () => {});
	});

	const cliPath = path.join(__dirname, "../../dist/index.js"); // Adjust path to your built CLI

	/**
	 * /!\ This first test generate the files and folders used in the following tests
	 * It is important to run this test first
	 */
	it("Files and folders generation", (done) => {
		spawn("node", [
			cliPath,
			...DEFAULT_TESTS_ARGS,
			"constant",
			"testWithCase",
		]).on("exit", (code) => {
			try {
				if (!fs.existsSync(OUT_PATH)) {
					throw new Error("Files not created");
				}
				expect(code).toBe(SUCCESS_CODE); // Ensure this matches your process.exit code
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	/**
	 * @description This test checks if the version is printed when the -v flag is passed
	 *
	 * This test checks if the prefix is added to the generated file/folder
	 * Prefix is defined in the config file
	 * Constant "testWithCase" -> Prefix: 'C' -> CTEST_WITH_CASE
	 **/
	it("Prefix check", (done) => {
		try {
			const content = fs.readFileSync(OUT_PATH, "utf-8");

			expect(content).toContain("CTEST_WITH_CASE");

			done();
		} catch (error) {
			done(error);
		}
	});

	it("Suffix check", (done) => {
		spawn("node", [
			cliPath,
			...DEFAULT_TESTS_ARGS,
			"service",
			"testWithCase",
		]).on("exit", () => {
			try {
				if (!fs.existsSync(OUT_PATH)) {
					throw new Error("Component not created");
				}

				const content = fs.readFileSync(OUT_PATH, "utf-8");

				expect(content).toContain("CTEST_WITH_CASE");

				done();
			} catch (error) {
				done(error);
			}
		});
	});

	/**
	 * each type (name/file/folder) can have a different case format
	 * when caseFormat is an object in the config
	 **/
	it("Case Format check - object", (done) => {
		try {
			if (!fs.existsSync(OUT_PATH)) {
				throw new Error("Component not created");
			}

			const content = fs.readFileSync(OUT_PATH, "utf-8");

			expect(content).toContain("CTEST_WITH_CASE");

			done();
		} catch (error) {
			done(error);
		}
	});

	/**
	 * when caseFormat is a string in the config
	 * all types will have the same case format
	 **/
	it("Case Format check - string", (done) => {
		spawn("node", [
			cliPath,
			...DEFAULT_TESTS_ARGS,
			"util",
			"testWithCase",
		]).on("exit", (code) => {
			try {
				if (!fs.existsSync(OUT_DIR + "/utils/UTEST-WITH-CASE.ts")) {
					throw new Error("Component not created");
				}

				const content = fs.readFileSync(
					OUT_DIR + "/utils/UTEST-WITH-CASE.ts",
					"utf-8"
				);
				expect(content).toContain("UTEST-WITH-CASE");
				expect(code).toBe(SUCCESS_CODE); // Ensure this matches your process.exit code
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("Extensions check - string", (done) => {
		spawn("node", [
			cliPath,
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.extensions.config.json",
			"component",
			"extensionTest",
		]).on("exit", (code) => {
			try {
				if (
					!fs.existsSync(
						OUT_DIR + "/components/extensionTest.component"
					)
				) {
					throw new Error("Component not created");
				}

				expect(code).toBe(SUCCESS_CODE); // Ensure this matches your process.exit code
				done();
			} catch (error) {
				done(error);
			}
		});
	});
	it("Extensions check - object", (done) => {
		spawn("node", [
			cliPath,
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.extensions.config.json",
			"hook",
			"extensionTest",
		]).on("exit", (code) => {
			try {
				if (
					!fs.existsSync(OUT_DIR + "/hooks/extensionTest.hookDefault")
				) {
					throw new Error("Component not created");
				}

				if (!fs.existsSync(OUT_DIR + "/hooks/index.hookIndex")) {
					throw new Error("Index not created");
				}

				expect(code).toBe(SUCCESS_CODE); // Ensure this matches your process.exit code
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("Extensions check - DefaultStructureItem object", (done) => {
		spawn("node", [
			cliPath,
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.extensions.config.json",
			"util",
			"extensionTest",
		]).on("exit", (code) => {
			try {
				if (!fs.existsSync(OUT_DIR + "/utils/extensionTest.default")) {
					throw new Error("Component not created");
				}

				if (!fs.existsSync(OUT_DIR + "/utils/index.index")) {
					throw new Error("Index not created");
				}

				expect(code).toBe(SUCCESS_CODE); // Ensure this matches your process.exit code
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("Extensions check - DefaultStructureItem string", (done) => {
		spawn("node", [
			cliPath,
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.extensions.default.config.json",
			"util",
			"extensionTest",
		]).on("exit", (code) => {
			try {
				if (
					!fs.existsSync(
						OUT_DIR + "/utils/extensionTest.defaultStructureItem"
					)
				) {
					throw new Error("Component not created");
				}

				if (
					!fs.existsSync(
						OUT_DIR + "/utils/index.defaultStructureItem"
					)
				) {
					throw new Error("Index not created");
				}

				expect(code).toBe(SUCCESS_CODE); // Ensure this matches your process.exit code
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("Language check", (done) => {
		spawn("node", [
			cliPath,
			"-o",
			OUT_DIR,
			"-c",
			__dirname + "/src/.test.main.config.json",
			"language",
			"languageTest",
		]).on("exit", (code) => {
			try {
				if (!fs.existsSync(OUT_DIR + "/languages/languageTest.js")) {
					throw new Error("Component not created");
				}

				if (!fs.existsSync(OUT_DIR + "/languages/index.js")) {
					throw new Error("Index not created");
				}

				expect(code).toBe(SUCCESS_CODE); // Ensure this matches your process.exit code
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	afterAll(() => {
		// clean out folder after tests
		fs.rm(`${__dirname}/${OUT_DIR_NAME}`, { recursive: true }, () => {});
	});
});
