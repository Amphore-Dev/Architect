import fs from "fs";
import path from "path";

import { TEST_OUTPUT_DIR } from "../constants";

// Remove the generated files once all the tests are done
export async function teardown() {
	const OUT_DIR = path.join(process.cwd(), TEST_OUTPUT_DIR);

	await fs.promises.rm(OUT_DIR, { recursive: true, force: true });
}
