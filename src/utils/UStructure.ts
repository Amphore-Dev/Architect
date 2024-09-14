import { TStructure, TStructureItem, TStructurePathResult } from "../types";

export function resolveStructurePath(
	structure: TStructure,
	type: string,
	currentPath: string = "",
	folderConfig: TStructureItem = {} as TStructureItem
): TStructurePathResult[] {
	const returns: TStructurePathResult[] = [];

	Object.keys(structure).forEach((key) => {
		const entry = structure[key];

		if (typeof entry === "string") {
			if (entry === type) {
				returns.push({
					...folderConfig,
					type: entry,
					segments: [...currentPath.split("/").filter((s) => s), key],
					path: `${currentPath}/${key}`,
				});
			}
		} else if (typeof entry === "object" && "type" in entry) {
			if (entry.type === type) {
				returns.push({
					...folderConfig,
					...entry,
					type: (entry as TStructureItem).type,
					segments: [...currentPath.split("/").filter((s) => s), key],
					path: `${currentPath}/${key}`,
				});
			}
		}

		if (typeof entry === "object" && "subdirs" in entry && entry.subdirs) {
			const cleanedConfig = { ...folderConfig, ...entry };
			delete cleanedConfig.subdirs;
			const result = resolveStructurePath(
				entry.subdirs as TStructure,
				type,
				`${currentPath}/${key}`,
				{
					...cleanedConfig,
				}
			);
			if (result) returns.push(...result);
		}
	});

	return returns;
}
