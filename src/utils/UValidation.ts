import schema from "../../schema.json";

/**
 * Minimal JSON schema validator, for the subset used by schema.json
 * (type, enum, properties, additionalProperties, items, oneOf, $ref).
 * The same schema is used for the IDE autocompletion and for the CLI validation.
 */

type TSchema = {
	type?: "string" | "boolean" | "object" | "array";
	enum?: string[];
	properties?: Record<string, TSchema>;
	additionalProperties?: boolean | TSchema;
	items?: TSchema;
	oneOf?: TSchema[];
	$ref?: string;
};

export type TConfigIssue = {
	path: string;
	message: string;
	level: "error" | "warning";
};

const ROOT_SCHEMA = schema as TSchema & {
	definitions: Record<string, TSchema>;
};

const resolveRef = (node: TSchema): TSchema =>
	node.$ref
		? resolveRef(
				ROOT_SCHEMA.definitions[node.$ref.replace("#/definitions/", "")]
			)
		: node;

const getType = (value: unknown) =>
	Array.isArray(value) ? "array" : value === null ? "null" : typeof value;

const describe = (node: TSchema): string => {
	const resolved = resolveRef(node);
	if (resolved.oneOf) return resolved.oneOf.map(describe).join(" or ");
	if (resolved.enum) return `one of ${resolved.enum.join(", ")}`;
	return /^[aeiou]/.test(resolved.type ?? "")
		? `an ${resolved.type}`
		: `a ${resolved.type}`;
};

const validateNode = (
	value: unknown,
	node: TSchema,
	path: string,
	issues: TConfigIssue[]
) => {
	const resolved = resolveRef(node);

	if (resolved.oneOf) {
		// pick the branch matching the type of the value
		const branch = resolved.oneOf.find(
			(option) => resolveRef(option).type === getType(value)
		);
		if (!branch) {
			issues.push({
				path,
				message: `should be ${describe(resolved)}`,
				level: "error",
			});
			return;
		}
		return validateNode(value, branch, path, issues);
	}

	if (resolved.type && resolved.type !== getType(value)) {
		issues.push({
			path,
			message: `should be ${describe(resolved)}`,
			level: "error",
		});
		return;
	}

	if (resolved.enum && !resolved.enum.includes(value as string)) {
		issues.push({
			path,
			message: `should be ${describe(resolved)}`,
			level: "error",
		});
		return;
	}

	if (resolved.type === "array" && resolved.items) {
		(value as unknown[]).forEach((item, i) =>
			validateNode(item, resolved.items!, `${path}[${i}]`, issues)
		);
	}

	if (resolved.type === "object") {
		Object.entries(value as Record<string, unknown>).forEach(
			([key, child]) => {
				const childPath = path ? `${path}.${key}` : key;
				const property = resolved.properties?.[key];

				if (property) {
					validateNode(child, property, childPath, issues);
				} else if (typeof resolved.additionalProperties === "object") {
					validateNode(
						child,
						resolved.additionalProperties,
						childPath,
						issues
					);
				} else if (resolved.additionalProperties === false) {
					// unknown options are ignored by Architect, it's probably a typo
					issues.push({
						path: childPath,
						message: "unknown option (ignored)",
						level: "warning",
					});
				}
			}
		);
	}
};

// Validate a config against schema.json
export const validateConfig = (config: unknown): TConfigIssue[] => {
	const issues: TConfigIssue[] = [];
	validateNode(config, ROOT_SCHEMA, "", issues);
	return issues;
};
