import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

import prettier from "eslint-config-prettier";

export default [
	{ files: ["**/*.{js,mjs,cjs,ts}"] },
	{
		ignores: [
			"**/blueprints/**",
			"**/dist/**",
			"**/node_modules/**",
			"example/**",
			"testsDist/**",
			"**/tests/src/builders/**",
		],
	},
	{ languageOptions: { globals: globals.node } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
];
