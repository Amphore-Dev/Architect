import { spawn, spawnSync } from "child_process";
import * as fs from "fs";
import path from "path";

import { version } from "../../package.json";
import {
	INVALID_COMPONENT_TYPE,
	INVALID_CONFIG_FILE,
	SUCCESS_CODE,
} from "../constants";
import {
	CUSTOM_COMPONENT_BLUEPRINT_REPLACED,
	CUSTOM_UTIL_BUILDER_REPLACED,
} from "./src/constants/CTests";

describe("Command: blueprint", () => {
	const OUT_DIR = "src/tests/TESTS_SRC";

	const DEFAULT_TESTS_ARGS = [
		"-c",
		__dirname + "/src/.test.blueprintsrc",
		"-o",
		OUT_DIR,
	];

	beforeAll(() => {
		// clean out folder before tests
		fs.rm(__dirname + "/TESTS_SRC", { recursive: true }, () => {});
	});

	const cliPath = path.join(__dirname, "../../dist/index.js"); // Adjust path to your built CLI

	it("should print version with -v flag", () => {
		const result = spawnSync("node", [cliPath, "-V"]);
		expect(result.stdout.toString()).toContain(version);
	});

	it("should fail on bad config file", (done) => {
		spawn("node", [
			cliPath,
			"-c",
			__dirname + "/src/.invalid.blueprintsrc", // This should be an invalid file
			"customType",
			"Test",
		]).on("exit", (code) => {
			try {
				expect(code).toBe(INVALID_CONFIG_FILE); // Ensure this matches your process.exit code
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("should use custom config file", (done) => {
		spawn("node", [
			cliPath,
			...DEFAULT_TESTS_ARGS,
			"customType",
			"CUSTOM_CONFIG_TEST",
		]).on("exit", (code) => {
			try {
				expect(code).toBe(SUCCESS_CODE);
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("should fail with invalid type", (done) => {
		spawn("node", [
			cliPath,
			...DEFAULT_TESTS_ARGS,
			"blueprint",
			"UNKOWN", // This should be an invalid type
			"Test",
		]).on("exit", (code) => {
			try {
				expect(code).toBe(INVALID_COMPONENT_TYPE); // Ensure this matches your process.exit code
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("should create a component", (done) => {
		spawn("node", [
			cliPath,
			...DEFAULT_TESTS_ARGS,
			"atom",
			"COMPONENT_TEST",
		]).on("exit", (code) => {
			try {
				expect(code).toBe(SUCCESS_CODE);
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("should overwrite existing component", (done) => {
		spawn("node", [
			cliPath,
			...DEFAULT_TESTS_ARGS,
			"-f",
			"atom",
			"COMPONENT_TEST",
		]).on("exit", (code) => {
			expect(code).toBe(SUCCESS_CODE);
			spawn("node", [
				cliPath,
				...DEFAULT_TESTS_ARGS,
				"-f",
				"atom",
				"COMPONENT_TEST",
			]).on("exit", (code) => {
				try {
					expect(code).toBe(SUCCESS_CODE);
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});

	it("should use custom blueprint", (done) => {
		spawn("node", [
			cliPath,
			"-c",
			__dirname + "/src/.test.blueprints.blueprintsrc",
			"-o",
			OUT_DIR,
			"-f",
			"atom",
			"COMPONENT_TEST",
		]).on("exit", (code) => {
			try {
				if (!fs.existsSync(OUT_DIR + "/atoms/COMPONENT_TEST.tsx")) {
					throw new Error("Component not created");
				}

				const content = fs.readFileSync(
					OUT_DIR + "/atoms/COMPONENT_TEST.tsx",
					"utf8"
				);
				expect(content).toContain("CUSTOM_REACT_TYPESCRIPT_ATOM");
				expect(code).toBe(SUCCESS_CODE);
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("should use custom builder", (done) => {
		spawn("node", [
			cliPath,
			"-c",
			__dirname + "/src/.test.builders.blueprintsrc",
			"-o",
			OUT_DIR,
			"-f",
			"util",
			"CUSTOM_UTIL_BUILDER",
		]).on("exit", (code) => {
			try {
				if (!fs.existsSync(OUT_DIR + "/utils/CUSTOM_UTIL_BUILDER.ts")) {
					throw new Error("Component not created");
				}

				const content = fs.readFileSync(
					OUT_DIR + "/utils/CUSTOM_UTIL_BUILDER.ts",
					"utf8"
				);
				expect(content).toContain(CUSTOM_UTIL_BUILDER_REPLACED);
				expect(code).toBe(SUCCESS_CODE);
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("Priority Check - Custom Builder", (done) => {
		spawn("node", [
			cliPath,
			"-c",
			__dirname + "/src/.test.builders.blueprintsrc",
			"-o",
			OUT_DIR,
			"-f",
			"util",
			"CUSTOM_UTIL_BUILDER",
		]).on("exit", (code) => {
			try {
				if (!fs.existsSync(OUT_DIR + "/utils/CUSTOM_UTIL_BUILDER.ts")) {
					throw new Error("Component not created");
				}

				const content = fs.readFileSync(
					OUT_DIR + "/utils/CUSTOM_UTIL_BUILDER.ts",
					"utf8"
				);
				expect(content).toContain(CUSTOM_UTIL_BUILDER_REPLACED);
				expect(code).toBe(SUCCESS_CODE);
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("Priority Check - Custom Blueprint", (done) => {
		spawn("node", [
			cliPath,
			"-c",
			__dirname + "/src/.test.blueprints.blueprintsrc",
			"-o",
			OUT_DIR,
			"-f",
			"molecule",
			"CUSTOM_MOLECULE_BLUEPRINT",
		]).on("exit", (code) => {
			try {
				if (
					!fs.existsSync(
						OUT_DIR +
							"/components/molecules/CUSTOM_MOLECULE_BLUEPRINT.tsx"
					)
				) {
					throw new Error("Component not created");
				}

				const content = fs.readFileSync(
					OUT_DIR +
						"/components/molecules/CUSTOM_MOLECULE_BLUEPRINT.tsx",
					"utf8"
				);
				expect(content).toContain(CUSTOM_COMPONENT_BLUEPRINT_REPLACED);
				expect(code).toBe(SUCCESS_CODE);
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	// clean out folder after tests
	afterAll(() => {
		fs.rm(__dirname + "/TESTS_SRC", { recursive: true }, () => {});
	});
});
