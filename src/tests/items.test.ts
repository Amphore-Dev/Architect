import * as fs from "fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { SUCCESS_CODE, TEST_OUTPUT_DIR } from "../constants";
import {
	CUSTOM_COMPONENT_BLUEPRINT_REPLACED,
	CUSTOM_UTIL_BUILDER_REPLACED,
} from "./src/constants/CTests";
import { runCli } from "./src/utils/UCli";

/**
 * Issue #18: a structure item can use a specific blueprint/builder,
 * either the type of another structure item or a path to a file
 */
describe("structure item blueprint & builder", () => {
	const OUT_DIR = TEST_OUTPUT_DIR + "ITEMS_TESTS_SRC";
	const ARGS = [
		"-c",
		__dirname + "/src/.test.items.config.json",
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

	it("blueprint - type of another structure item", async () => {
		const { code } = await runCli([...ARGS, "container", "Main"]);

		expectFileContent(
			OUT_DIR + "/containers/Main.tsx",
			"CUSTOM_REACT_TYPESCRIPT_ATOM"
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("blueprint - path to a file", async () => {
		const { code } = await runCli([...ARGS, "screen", "Home"]);

		expectFileContent(
			OUT_DIR + "/screens/Home.tsx",
			CUSTOM_COMPONENT_BLUEPRINT_REPLACED
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("builder - type of another structure item", async () => {
		const { code } = await runCli([...ARGS, "helper", "Format"]);

		expectFileContent(
			OUT_DIR + "/helpers/Format.ts",
			CUSTOM_UTIL_BUILDER_REPLACED
		);
		expect(code).toBe(SUCCESS_CODE);
	});

	it("builder - path to a file", async () => {
		const { code } = await runCli([...ARGS, "tool", "Hammer"]);

		expectFileContent(
			OUT_DIR + "/tools/Hammer.ts",
			CUSTOM_UTIL_BUILDER_REPLACED
		);
		expect(code).toBe(SUCCESS_CODE);
	});
});
