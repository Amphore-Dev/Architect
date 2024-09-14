import { flatten as safeFlat } from "safe-flat";

type TFlatObj = Record<string, object>;

export const flatAndKeepLastChild = <T>(obj: T, delimiter = ".") => {
	const flatObj = safeFlat(obj as object, delimiter) as TFlatObj;

	const result: TFlatObj = {};

	Object.keys(flatObj).forEach((key) => {
		const value = flatObj[key];
		const lastDotIndex = key.lastIndexOf(delimiter);
		const parentKey = key.slice(0, lastDotIndex);
		const childKey = key.slice(lastDotIndex + 1);

		if (result[parentKey]) {
			result[parentKey] = {
				...result[parentKey],
				[childKey]: value,
			};
		} else {
			result[parentKey] = {
				[childKey]: value,
			};
		}
	});

	return result;
};
