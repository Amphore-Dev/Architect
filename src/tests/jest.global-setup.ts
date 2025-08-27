import fs from "fs";
import path from "path";

import { TEST_OUTPUT_DIR } from "../constants";

export default async function globalTeardown() {
	const OUT_DIR = path.join(process.cwd(), TEST_OUTPUT_DIR);

	await fs.promises.rm(OUT_DIR, { recursive: true, force: true });
}
