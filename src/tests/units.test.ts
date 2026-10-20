import { describe, expect, it } from "vitest";

import { buildConfig, formatName, mergeObjects } from "../utils";
import { isValidName } from "../utils/UBuilders";
import { generatePluginPaths } from "../utils/UImports";

describe("formatName", () => {
	it.each([
		["CommandsV2", "snake-upper", "COMMANDS_V2"],
		["CommandsV2", "pascal", "CommandsV2"],
		["commandsV2", "camel", "commandsV2"],
		["CommandsV2", "kebab", "commands-v2"],
		["HTTPServer", "kebab", "http-server"],
		["testWithCase", "snake", "test_with_case"],
		["Le_Fichier", "camel-upper", "LEFICHIER"],
		["Le_Fichier", undefined, "Le_Fichier"],
	] as const)("%s (%s) -> %s", (name, format, expected) => {
		expect(formatName(name, format)).toBe(expected);
	});

	it("uses the format of the given type", () => {
		const format = { name: "snake-upper", file: "kebab" } as const;

		expect(formatName("myName", format, "name")).toBe("MY_NAME");
		expect(formatName("myName", format, "file")).toBe("my-name");
		expect(formatName("myName", format, "folder")).toBe("my-name");
	});

	it("uses the fallback when there is no format", () => {
		expect(formatName("myName", undefined, "file", "pascal")).toBe(
			"MyName"
		);
	});
});

describe("mergeObjects", () => {
	it("replaces arrays instead of merging them", () => {
		expect(mergeObjects({ list: ["a"] }, { list: ["b", "c"] })).toEqual({
			list: ["b", "c"],
		});
	});

	it("deep merges objects without mutating the sources", () => {
		const source = { a: { b: 1 } };
		const result = mergeObjects<Record<string, object>>(source, {
			a: { c: 2 },
		});

		expect(result).toEqual({ a: { b: 1, c: 2 } });
		expect(source).toEqual({ a: { b: 1 } });
	});

	it("ignores prototype keys", () => {
		const result = mergeObjects(JSON.parse('{"__proto__": {"x": 1}}'));

		expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
		expect(({} as Record<string, unknown>).x).toBeUndefined();
	});
});

describe("buildConfig", () => {
	it("deep merges the plugins configs", () => {
		const config = buildConfig({}, {}, [
			{ structure: { atoms: "atom" } },
			{ structure: { utils: "util" } },
		]);

		expect(config.structure).toEqual({ atoms: "atom", utils: "util" });
	});

	it("gives priority to the user config and the options", () => {
		const config = buildConfig(
			{ outputDir: "user", language: "react" },
			{ output: "cli" },
			[{ outputDir: "plugin", language: "vue" }]
		);

		expect(config.outputDir).toBe("cli");
		expect(config.language).toBe("react");
	});
});

describe("isValidName", () => {
	it.each(["Button", "_private", "my-name", "Le_Fichier", "v2.styles"])(
		"accepts %s",
		(name) => expect(isValidName(name)).toBe(true)
	);

	it.each(["2fast", "a/../../escape", "a\\b", "..", "-name"])(
		"rejects %s",
		(name) => expect(isValidName(name)).toBe(false)
	);
});

describe("generatePluginPaths", () => {
	const dir = "/plugin";

	it("is used when the language starts with the plugin namespace", () => {
		expect(
			generatePluginPaths("react-native-typescript", {
				namespace: ["react"],
				path: dir,
			})
		).toEqual(["/plugin/native/typescript", "/plugin/native", "/plugin"]);
	});

	it("is ignored for other languages", () => {
		expect(
			generatePluginPaths("vue", { namespace: ["react"], path: dir })
		).toEqual([]);
	});
});
