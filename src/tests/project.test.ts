import * as fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FILE_CONFLICT, PLUGIN_LOAD_ERROR, SUCCESS_CODE } from "../constants";
import { runCli } from "./src/utils/UCli";

const PLUGIN_NAME = "@amphore-dev/architect-plugin-react";

/**
 * The CLI is run from a separate project directory, like a global install (issue #17):
 * plugins must be resolved from the project, not from Architect's own node_modules
 */
describe("project", () => {
	let projectDir = "";

	beforeEach(() => {
		projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "architect-test-"));
	});

	afterEach(() => {
		fs.rmSync(projectDir, { recursive: true, force: true });
	});

	const writeConfig = (config: object) =>
		fs.writeFileSync(
			path.join(projectDir, "architect.config.json"),
			JSON.stringify(config)
		);

	const installPlugin = () => {
		const pluginDir = path.join(projectDir, "node_modules", PLUGIN_NAME);

		fs.mkdirSync(path.dirname(pluginDir), { recursive: true });
		fs.symlinkSync(
			path.join(process.cwd(), "node_modules", PLUGIN_NAME),
			pluginDir,
			"junction" // works on Windows without admin rights
		);
	};

	it("should load plugins from the project's node_modules", async () => {
		installPlugin();
		writeConfig({
			language: "react-typescript",
			plugins: [PLUGIN_NAME],
			structure: { components: "component" },
		});

		const { code } = await runCli(["component", "Button"], projectDir);
		const filePath = path.join(projectDir, "components/Button.tsx");

		expect(code).toBe(SUCCESS_CODE);
		expect(fs.readFileSync(filePath, "utf-8")).toContain(
			"export const Button: React.FC"
		);
	});

	it("should fail when a plugin is not installed", async () => {
		writeConfig({ plugins: ["architect-plugin-not-installed"] });

		const { code } = await runCli(["component", "Button"], projectDir);
		expect(code).toBe(PLUGIN_LOAD_ERROR);
	});

	it("should use --output and --force without config file", async () => {
		const args = ["-o", "out", "util", "Foo"];
		const filePath = path.join(projectDir, "out/Foo.js");

		expect((await runCli(args, projectDir)).code).toBe(SUCCESS_CODE);
		expect(fs.existsSync(filePath)).toBe(true);

		expect((await runCli(args, projectDir)).code).toBe(FILE_CONFLICT);
		expect((await runCli([...args, "-f"], projectDir)).code).toBe(
			SUCCESS_CODE
		);
	});

	it("should support an absolute output directory", async () => {
		const outDir = path.join(projectDir, "absolute");
		const { code } = await runCli(
			["-o", outDir, "util", "Foo"],
			projectDir
		);

		expect(code).toBe(SUCCESS_CODE);
		expect(fs.existsSync(path.join(outDir, "Foo.js"))).toBe(true);
	});
});
