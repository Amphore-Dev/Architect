import { spawn } from "child_process";
import * as fs from "fs";
import path from "path";

import { SUCCESS_CODE, TEST_OUTPUT_DIR } from "../constants";
import { getTestTypes } from "./src/utils/UTestsFoldersAndIndexes";

describe("structure", () => {
	const OUT_DIR_NAME = "STRUCTURE_TESTS_SRC";
	const OUT_DIR = TEST_OUTPUT_DIR + OUT_DIR_NAME;

	const DEFAULT_TESTS_ARGS = [
		"-c",
		__dirname + "/src/.test.main.config.json",
		"-o",
		OUT_DIR,
	];

	beforeAll(() => {
		// clean out folder before tests
		fs.rm(`${process.cwd()}/${OUT_DIR}`, { recursive: true }, () => {});
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
					files.forEach(({ path: filePath, contain }) => {
						const dir = path.dirname(filePath);
						const base = path.basename(filePath);

						// Récupère tous les fichiers dans le dossier
						const files = fs.readdirSync(dir);

						// Vérifie si le nom correspond exactement (case-sensitive)
						if (!files.includes(base)) {
							throw new Error(
								`File "${base}" not found (wrong casing ?) in directory: ${dir}`
							);
						}
						if (!fs.existsSync(filePath)) {
							throw new Error(`File not created: ${filePath}`);
						}

						if (!contain) {
							return;
						}
						const content = fs.readFileSync(filePath, "utf-8");
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
		fs.rm(`${process.cwd()}/${OUT_DIR}`, { recursive: true }, () => {});
	});
});
