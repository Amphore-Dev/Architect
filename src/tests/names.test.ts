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
		__dirname + "/src/.test.blueprintsrc",
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

	afterAll(() => {
		// clean out folder after tests
		fs.rm(`${__dirname}/${OUT_DIR_NAME}`, { recursive: true }, () => {});
	});
});
