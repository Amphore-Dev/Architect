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

export type TFormatType = "folder" | "file" | "name";

export type TCaseFormatConfigOption = Partial<Record<TFormatType, TCaseFormat>>;

export type TCaseFormatConfig = TCaseFormat | TCaseFormatConfigOption;

export type TFormatNameOptions = {
	// keep the acronyms (words in uppercase) as they are in camel and pascal case
	preserveAcronyms?: boolean;
};

// A word written in uppercase with at least 2 letters: "API", "HTTP", "V2X"
export const isAcronym = (word: string) =>
	/^[A-Z0-9]+$/.test(word) && /[A-Z].*[A-Z]/.test(word);

const FORMATTERS: Record<
	string,
	(words: string[], options: TFormatNameOptions) => string
> = {
	// Lowercase first word, capitalize subsequent words
	camel: (words, { preserveAcronyms }) =>
		words
			.map((word, index) => {
				if (index === 0) return word.toLowerCase();
				return preserveAcronyms && isAcronym(word)
					? word
					: ucFirst(word);
			})
			.join(""),
	// Capitalize the first letter of each word
	pascal: (words, { preserveAcronyms }) =>
		words
			.map((word) =>
				preserveAcronyms && isAcronym(word) ? word : ucFirst(word)
			)
			.join(""),
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
	type?: TFormatType,
	fallback?: TCaseFormat,
	options: TFormatNameOptions = {}
): string => {
	const formatName = getCaseFormatName(format, type, fallback);
	// "kebab-upper" -> formatter "kebab" + modifier "upper"
	const [base, modifier] = formatName.split("-");
	const formatter = FORMATTERS[base];

	if (!formatter) return name;

	const formattedName = formatter(splitWords(name), options);
	return modifier === "upper" ? formattedName.toUpperCase() : formattedName;
};

export const getCaseFormatName = (
	format?: TCaseFormatConfig,
	type?: TFormatType,
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
