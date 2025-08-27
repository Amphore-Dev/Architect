export const ucFirst = (str: string): string =>
	str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export type TCaseFormat =
	| "camel"
	| "pascal"
	| "kebab"
	| "snake"
	| "kebab-upper"
	| "snake-upper";

export type TFomatType = "folder" | "file" | "name";

export type TCaseFormatConfigOption = Record<TFomatType, TCaseFormat>;

export type TCaseFormatConfig = TCaseFormat | TCaseFormatConfigOption;

type TFormat = {
	name: TCaseFormat;
	formatter: (name: string) => string;
};

export const formatName = (
	name: string,
	format?: TCaseFormatConfig,
	type?: TFomatType,
	fallback?: TCaseFormat
): string => {
	if (!format && !fallback) return name;

	const split = name // 1. sépare avant une majuscule (sauf au tout début)
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		// 2. remplace tout non-alpha par un espace
		.replace(/[^a-zA-Z]+/g, " ")
		// 3. coupe en morceaux
		.trim()
		.split(/\s+/);

	const formats: TFormat[] = [
		{
			name: "camel",
			formatter: () =>
				split
					.map(
						(word, index) =>
							index === 0 ? word.toLowerCase() : ucFirst(word) // Lowercase first word, capitalize subsequent words
					)
					.join(""),
		},
		{
			name: "pascal",
			formatter: () =>
				split
					.map(ucFirst) // Capitalize the first letter of each group
					.join(""), // Join all parts together
		},
		{
			name: "kebab",
			formatter: () => split.join("-").toLowerCase(), // Join with hyphens
		},
		{
			name: "snake",
			formatter: () => split.join("_").toLowerCase(),
		},
	];

	const formatName = getCaseFormatName(format, type, fallback);

	const formatter = formats.find(
		(f) => f.name === formatName || formatName.indexOf(f.name + "-") > -1
	)?.formatter;
	const formattedName = formatter ? formatter(name) : name;

	if (formatName.indexOf("-upper") > -1) {
		return formattedName.toUpperCase();
	}
	return formattedName;
};

export const getCaseFormatName = (
	format?: TCaseFormatConfig,
	type?: TFomatType,
	fallback?: TCaseFormat
) => {
	if (!format) {
		return "";
	}
	if (typeof format === "string") {
		return format;
	}

	return type && format[type]
		? format[type]
		: format.file || format.folder || fallback || "";
};
