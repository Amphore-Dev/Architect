export function mergeObjects<T extends object>(...sources: Partial<T>[]): T {
	const target = {} as Partial<T>;
	sources.forEach((source) => {
		if (!source || typeof source !== "object") return;

		Object.keys(source).forEach((key) => {
			const sourceValue = source[key as keyof T];
			const targetValue = target[key as keyof T];

			// Recursively merge if both target and source are objects
			if (
				sourceValue instanceof Object &&
				targetValue instanceof Object
			) {
				target[key as keyof T] = mergeObjects(
					targetValue as Partial<T[keyof T]>,
					sourceValue as Partial<T[keyof T]>
				) as T[keyof T];
			} else {
				// Otherwise, assign the source value to the target
				target[key as keyof T] = sourceValue as T[keyof T];
			}
		});
	});

	return target as T;
}
