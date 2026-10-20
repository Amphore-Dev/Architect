const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export const isPlainObject = (
	value: unknown
): value is Record<string, unknown> =>
	typeof value === "object" &&
	value !== null &&
	Object.getPrototypeOf(value) === Object.prototype;

/**
 * Deep merge plain objects, from left to right.
 * Arrays and other values are replaced, not merged.
 */
export function mergeObjects<T extends object>(
	...sources: (Partial<T> | undefined)[]
): T {
	const target: Record<string, unknown> = {};

	sources.forEach((source) => {
		if (!isPlainObject(source)) return;

		Object.entries(source).forEach(([key, sourceValue]) => {
			if (UNSAFE_KEYS.has(key)) return;

			const targetValue = target[key];

			// plain objects are cloned so the sources are never mutated through the result
			target[key] = isPlainObject(sourceValue)
				? mergeObjects(
						isPlainObject(targetValue) ? targetValue : {},
						sourceValue
					)
				: sourceValue;
		});
	});

	return target as T;
}
