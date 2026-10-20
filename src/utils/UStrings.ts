export const ucFirst = (str: string): string =>
	str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export type TCaseFormat =
	| "camel"
	| "pascal"
	| "kebab"
	| "snake"
	| "camel-upper"
	| "pascal-upper"
	| "kebab-upper"
	| "snake-upper";

export type TFomatType = "folder" | "file" | "name";

export type TCaseFormatConfigOption = Partial<Record<TFomatType, TCaseFormat>>;

export type TCaseFormatConfig = TCaseFormat | TCaseFormatConfigOption;

const FORMATTERS: Record<string, (words: string[]) => string> = {
	// Lowercase first word, capitalize subsequent words
	camel: (words) =>
		words
			.map((word, index) =>
				index === 0 ? word.toLowerCase() : ucFirst(word)
			)
			.join(""),
	// Capitalize the first letter of each word
	pascal: (words) => words.map(ucFirst).join(""),
	kebab: (words) => words.join("-").toLowerCase(),
	snake: (words) => words.join("_").toLowerCase(),
};

/**
 * Split a name into words:
 * "testWithCase" -> ["test", "With", "Case"]
 * "CommandsV2" -> ["Commands", "V2"]
 * "HTTPServer" -> ["HTTP", "Server"]
 * "le_fichier-name" -> ["le", "fichier", "name"]
 */
export const splitWords = (name: string): string[] =>
	name
		// split before an uppercase letter preceded by a lowercase letter or a digit
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		// split acronyms followed by a word (HTTPServer -> HTTP Server)
		.replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
		// replace every non-alphanumeric character with a space
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean);

export const formatName = (
	name: string,
	format?: TCaseFormatConfig,
	type?: TFomatType,
	fallback?: TCaseFormat
): string => {
	const formatName = getCaseFormatName(format, type, fallback);
	// "kebab-upper" -> formatter "kebab" + modifier "upper"
	const [base, modifier] = formatName.split("-");
	const formatter = FORMATTERS[base];

	if (!formatter) return name;

	const formattedName = formatter(splitWords(name));
	return modifier === "upper" ? formattedName.toUpperCase() : formattedName;
};

export const getCaseFormatName = (
	format?: TCaseFormatConfig,
	type?: TFomatType,
	fallback?: TCaseFormat
): string => {
	if (!format) {
		return fallback ?? "";
	}
	if (typeof format === "string") {
		return format;
	}

	return (
		(type && format[type]) || format.file || format.folder || fallback || ""
	);
};
