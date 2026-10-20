import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/tests/**/*.test.ts"],
		environment: "node",
		globalSetup: ["./src/tests/global-setup.ts"],
		testTimeout: 30000,
		coverage: {
			include: ["src/**/*.ts"],
			exclude: ["src/blueprints/**/*", "src/tests/**/*"],
		},
	},
});
