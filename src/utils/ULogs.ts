/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from "node-color-log";
import path from "path";

// Path relative to the current directory when it is inside it (works with any path separator)
export const displayPath = (filePath: string) => {
	const relativePath = path.relative(process.cwd(), filePath);
	return relativePath &&
		!relativePath.startsWith("..") &&
		!path.isAbsolute(relativePath)
		? relativePath
		: filePath;
};

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

	paths.forEach((filePath) => {
		log.reset()
			.color("blue")
			.append("\n• ")
			.color("cyan")
			.append(displayPath(filePath));
	});

	log.log();
};
