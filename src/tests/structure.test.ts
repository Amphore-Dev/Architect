import { spawn } from "child_process";
import * as fs from "fs";
import path from "path";

import { SUCCESS_CODE } from "../constants";
import { getTestTypes } from "./src/utils/UTestsFoldersAndIndexes";

describe("structure", () => {
	const OUT_DIR_BASE = "src/tests/";
	const OUT_DIR_NAME = "STRUCTURE_TESTS_SRC";
	const OUT_DIR = OUT_DIR_BASE + OUT_DIR_NAME;

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
	 * MOST IMPORTANTS TESTS
	 * Check if the files are created with the correct content, location, name, indexes, etc.
	 */
	const componentTypes = getTestTypes(OUT_DIR);
	componentTypes.forEach(({ type, files }) => {
		it(`genCheck-${type}`, (done) => {
			spawn("node", [
				cliPath,
				...DEFAULT_TESTS_ARGS,
				type,
				"Le_Fichier",
			]).on("exit", (code) => {
				try {
					files.forEach(({ path, contain }) => {
						if (!fs.existsSync(path)) {
							throw new Error(`File not created: ${path}`);
						}

						if (!contain) {
							return;
						}
						const content = fs.readFileSync(path, "utf-8");
						expect(content).toContain(contain);
					});

					expect(code).toBe(SUCCESS_CODE); // Ensure this matches your process.exit code
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});

	afterAll(() => {
		// clean out folder after tests
		fs.rm(`${__dirname}/${OUT_DIR_NAME}`, { recursive: true }, () => {});
	});
});
