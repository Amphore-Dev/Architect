export const ucFirst = (str: string): string =>
	str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export type TCaseFormat =
	| "camel"
	| "pascal"
	| "kebab"
	| "snake"
	| "kebab-upper"
	| "snake-upper";

export type TCaseFormatConfigOption = {
	folder?: TCaseFormat;
	file?: TCaseFormat;
	name?: TCaseFormat;
};

export type TCaseFormatConfig = TCaseFormat | TCaseFormatConfigOption;

type TFormat = {
	name: TCaseFormat;
	formatter: (name: string) => string;
};

type TFomatType = "folder" | "file" | "name";

export const formatName = (
	name: string,
	format?: TCaseFormatConfig,
	type?: TFomatType,
	fallback?: TCaseFormat
): string => {
	if (!format && !fallback) return name;

	const split = name
		.split(/([a-zA-Z]+|\d+|[^a-zA-Z0-9]+)/)
		.filter((s) => s.match(/[a-zA-Z0-9]/));

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
			formatter: (name: string) =>
				name
					.replace(/([a-z])([A-Z])/g, "$1-$2") // Insert hyphen between camelCase boundaries
					.split(/[^a-zA-Z0-9]+/) // Split by any non-letter characters
					.filter(Boolean) // Remove empty strings from the array
					.map((word) => word.toLowerCase()) // Convert all words to lowercase
					.join("-"), // Join with hyphens
		},
		{
			name: "snake",
			formatter: (name: string) =>
				name
					.replace(/([a-z])([A-Z])/g, "$1_$2") // Insert underscore between camelCase transitions
					.replace(/[^a-zA-Z0-9]+/g, "_") // Replace non-letter characters with underscores
					.toLowerCase(),
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
