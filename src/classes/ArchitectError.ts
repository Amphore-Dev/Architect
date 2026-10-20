export type TArchitectErrorLevel = "error" | "info";

/**
 * Error thrown by Architect (and by the builders), with the exit code of the CLI.
 * The CLI entry point is the only place where the process exits.
 */
export class ArchitectError extends Error {
	constructor(
		public code: number,
		message: string,
		public level: TArchitectErrorLevel = "error",
		options?: { cause?: unknown }
	) {
		super(message, options);
		this.name = "ArchitectError";
	}
}

export const isArchitectError = (error: unknown): error is ArchitectError =>
	error instanceof ArchitectError ||
	(error instanceof Error &&
		error.name === "ArchitectError" &&
		typeof (error as ArchitectError).code === "number");
