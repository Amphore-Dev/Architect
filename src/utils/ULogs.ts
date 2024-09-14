import * as fs from "fs";

/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from "node-color-log";

const genArgs = (args: any) => {
	return [args?.length ? "-" : "", ...args];
};

export const errorLog = (...args: any) =>
	logger.color("red").log("[Error]", ...genArgs(args));

export const infoLog = (...args: any) =>
	logger.color("blue").log("[Info]", ...genArgs(args));

export const warningLog = (...args: any) =>
	logger.color("yellow").log("[Warning]", ...genArgs(args));

export const successLog = (...args: any) =>
	logger.color("green").log("[Success]", ...genArgs(args));

export const successEndLog = (paths: string[]) => {
	const log = logger
		.color("green")
		.log("\n[Success]")
		.color("yellow")
		.append(`Updated ${paths.length} file${paths.length > 1 ? "s" : ""}:`);

	paths.forEach((path) => {
		log.reset()
			.color("blue")
			.append("\n• ")
			.color("cyan")
			.append(path.replace(process.cwd() + "/", ""));
	});

	log.log();
};

/**
 * Log to a file (used for debugging)
 */

const logPath = __dirname + "/../../logs.txt";

export const fsLog = (...message: any) => {
	// get the current content of the log file
	let content = "";
	if (fs.existsSync(logPath)) {
		content = fs.readFileSync(logPath, "utf8");
	}

	// append the new message
	content +=
		message.map((a: any) => JSON.stringify(a, null, 2)).join(" ") + "\n";

	// write the new content to the log file
	fs.writeFileSync(logPath, content);
};

export const clearFsLog = () => {
	fs.writeFileSync(logPath, "");
};
