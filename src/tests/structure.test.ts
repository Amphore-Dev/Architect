import * as fs from "fs";
import path from "path";
import { afterAll, beforeAll, expect, it, describe } from "vitest";

import { SUCCESS_CODE, TEST_OUTPUT_DIR } from "../constants";
import { runCli } from "./src/utils/UCli";
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

	const clean = () =>
		fs.rmSync(`${process.cwd()}/${OUT_DIR}`, {
			recursive: true,
			force: true,
		});

	beforeAll(clean);
	afterAll(clean);

	/**
	 * MOST IMPORTANTS TESTS
	 * Check if the files are created with the correct content, location, name, indexes, etc.
	 */
	const componentTypes = getTestTypes(OUT_DIR);
	componentTypes.forEach(({ type, files }) => {
		it(`genCheck-${type}`, async () => {
			const { code } = await runCli([
				...DEFAULT_TESTS_ARGS,
				type,
				"Le_Fichier",
			]);

			files.forEach(({ path: filePath, contain }) => {
				const dir = path.dirname(filePath);
				const base = path.basename(filePath);

				// Check that the name matches exactly (case-sensitive)
				if (!fs.readdirSync(dir).includes(base)) {
					throw new Error(
						`File "${base}" not found (wrong casing ?) in directory: ${dir}`
					);
				}

				if (contain) {
					expect(fs.readFileSync(filePath, "utf-8")).toContain(
						contain
					);
				}
			});

			expect(code).toBe(SUCCESS_CODE);
		});
	});
});
