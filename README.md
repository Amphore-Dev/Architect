# Architect

## Introduction

This project is an npm CLI package designed to generate folders and files based on predefined blueprints and builders.
It supports multiple file formats and configurations for different environments such as React, Vue, Angular, PHP,
and more.

## Installation

Architect requires Node.js `>= 22.12`.

To install this package, use the following command:

```bash
npm install @amphore-dev/architect --global
```

Plugins are resolved from the project where the command is run (its `node_modules`), so they can be installed locally even if Architect is installed globally.

## Usage

To generate something, run the following command:

```bash
architect <type> <name>
```

### Example

```bash
architect molecule MyComponent
```

### CLI Options

- `--config`: Path to a configuration file. (override `architect.config.json` config file if one is provided, the command fails if the file does not exist)
- `--output`: Specify the output directory where files should be generated.
- `--force`: Overwrite existing files if they already exist in the output directory, and use the first folder when a type matches several folders (no prompt).

## Configuration

The CLI requires a configuration file that defines the structure and blueprint for file generation.
The configuration file should be named `architect.config.json` and placed in the root directory of the project.

### Configuration File

| Key                  | Type     | Description                                                                |
| -------------------- | -------- | -------------------------------------------------------------------------- |
| outputDir            | string   | The root directory where files should be generated.                        |
| language             | string   | The language of the project. (e.g., TypeScript, JavaScript, PHP, etc.)     |
| structure            | object   | The structure of the project.                                              |
| blueprints           | string[] | Relative paths of blueprints for generating files.                         |
| builders             | string[] | Relative paths of builders for constructing the file and folder structure. |
| defaultStructureItem | object   | Default options for each structure item.                                   |
| plugins              | array    | Additional plugins for the CLI.                                            |

The configuration is validated when the CLI runs: unknown options are reported as warnings, invalid values stop the generation.
A JSON schema is provided for the autocompletion and the validation in your IDE:

```json
{
	"$schema": "./node_modules/@amphore-dev/architect/schema.json"
}
```

(or `"https://unpkg.com/@amphore-dev/architect/schema.json"` when Architect is installed globally)

Here is an example configuration file in JSON format:

```json
{
	"$schema": "./node_modules/@amphore-dev/architect/schema.json",
	"outputDir": "src",
	"blueprints": ["architect/blueprints"],
	"builders": ["architect/builders"],
	"defaultStructureItem": {
		"caseFormat": "pascal"
	},
	"plugins": ["@amphore-dev/architect-plugin-react"],
	"language": "react-typescript",
	"structure": {
		"components": {
			"type": "component",
			"subdirs": {
				"atoms": "atom",
				"molecules": "molecule",
				"organisms": "organism",
				"templates": "template"
			},
			"generateSubdirs": true,
			"generateSubIndex": true
		},
		"pages": {
			"type": "page",
			"generateIndex": true,
			"generateSubdirs": true
		},
		"utils": {
			"type": "util",
			"prefix": "U",
			"generateIndex": true
		},
		"constants": {
			"type": "constant",
			"prefix": "C",
			"caseFormat": {
				"name": "snake-upper"
			},
			"generateIndex": true
		},
		"services": {
			"type": "service",
			"suffix": "Service"
		},
		"types": {
			"type": "type",
			"prefix": "T"
		},
		"hooks": {
			"type": "hook",
			"prefix": "use"
		}
	}
}
```

this configuration file will generate files and folders in the following structure:

```bash
src/
│
├── components/
│   ├── Atoms/
│   │   ├── index.ts
│   │   └── MyAtom/
│   │       └── MyAtom.tsx
│   │
│   ├── Molecules/
│   │   ├── index.ts
│   │   └── MyMolecule/
│   │       └── MyMolecule.tsx
│   │
│   ├── Organisms/
│   │   ├── index.ts
│   │   └── MyOrganism/
│   │       └── MyOrganism.tsx
│   │
│   ├── Templates/
│   ├── index.ts
│   └── MyTemplate/
│       └── MyTemplate.tsx
│
├── pages/
│   ├── index.ts
│   └── MyPage/
│       └── MyPage.tsx
│
├── utils/
│   ├── index.ts
│   └── UMyUtil.ts
│
├── constants/
│   ├── index.ts
│   └── CMyConstant.ts # file content will be: CMY_CONSTANT = 'my_constant';
│
├── services/
│   ├── index.ts
│   └── MyServiceService.ts
│
├── types/
│   ├── index.ts
│   └── TMyType.ts
│
└── hooks/
	└── useMyHook.ts
```

### Structure object

The structure defines the folder and file structure of the project.

| Key              | Type             | Description                                                         |
| ---------------- | ---------------- | ------------------------------------------------------------------- |
| type             | string           | The type of the structure. (e.g., component, page, etc.)            |
| subdirs          | object           | Subdirectories of the structure.                                    |
| generateIndex    | boolean          | Generate an index file for the structure item                       |
| generateSubdirs  | boolean          | Generate subdirectories for the structure item                      |
| generateSubIndex | boolean          | Generate an index file for the structure item                       |
| prefix           | string           | Prefix for the name of the generated files.                         |
| suffix           | string           | Suffix for the name of the generated files.                         |
| caseFormat       | string or object | Case format for the name of the generated folders/files/components  |
| preserveAcronyms | boolean          | Keep the acronyms (`API`, `HTTP`) in uppercase in camel/pascal case |
| language         | string           | The language of the item. (e.g., TypeScript, JavaScript, PHP)       |
| extensions       | string or object | The extensions of the generated files.                              |
| blueprint        | string           | The type of another structure item, or a path to a blueprint file   |
| builder          | string           | The type of another structure item, or a path to a builder file     |

### Specific blueprint / builder

By default, the blueprint and the builder of a structure item are found with its folder names and its type (see [Blueprints and Builders](#blueprints-and-builders)).
The `blueprint` and `builder` keys can be used to override them, with the type of another structure item or a path to a file (relative to the project):

```json
{
	"structure": {
		"components": "component",
		"containers": {
			"type": "container",
			"blueprint": "component",
			"builder": "architect/builders/container.builder.ts"
		}
	}
}
```

### Case Format

The case format can be a string or an object. If it is a string, it should be one of the following:

- `camel`
- `camel-upper`
- `pascal`
- `pascal-upper`
- `kebab`
- `kebab-upper`
- `snake`
- `snake-upper`.

Words are split on case changes and non-alphanumeric characters, digits are kept (e.g. `CommandsV2` -> `commands-v2` in `kebab`, `COMMANDS_V2` in `snake-upper`).

By default, each word is capitalized in camel and pascal case: `APIClient` -> `ApiClient`.
With `"preserveAcronyms": true`, the words written in uppercase with at least 2 letters are kept as they are: `APIClient` -> `APIClient`, `myHTTPServer` -> `myHTTPServer` (camel).
As acronyms are detected from the uppercase letters, a name fully written in uppercase (`MY_CONSTANT`) is also kept in uppercase.

If it is an object, it should have the following properties: (each property is optional)

| Key    | Type   | Description                         |
| ------ | ------ | ----------------------------------- |
| name   | string | The name of the case format to use. |
| file   | string | The case format for file names.     |
| folder | string | The case format for folder names.   |

### Extensions

The extensions key specifies the file extensions for the generated files. It can be a string or an object.
If it is a string, it should be the file extension (e.g., `tsx`, `js`, `php`, etc.).

If it is an object, it should have the following properties: (each property is optional)

| Key     | Type   | Description                         |
| ------- | ------ | ----------------------------------- |
| default | string | The default file extension.         |
| index   | string | The file extension for index files. |

When no extension is set, the extension of the blueprint is used (`atoms.bp.tsx` -> `tsx`).
For a language-agnostic blueprint (Architect's `default.bp`), the extension of the language is used:
from the plugins (e.g. `react-typescript` -> `ts`), or from the end of the language (`*-typescript` -> `ts`, otherwise `js`).

### Language

The language key specifies the language of the project. It is used to determine the files used to generate items.

Language support are provided by plugins. The default language is `javascript`.

### Default Structure Item

The default structure item defines the default options for each structure item.
If a structure item does not have a specific option, it will use the default option.

## Blueprints and Builders

Blueprints and builders are the core components of the CLI. They define the templates and logic for generating files and folders.

```bash
# Example Directory Structure

├── src/
└── architect/
	├──blueprints/
	│	│
	│	├─ react/
	│	│   ├── utils.bp.js
	│	│   ├── page.bp.js
	│	│   │
	│	│   ├-─ typescript/
	│	│   │    ├── atoms.bp.tsx
	│	│   │    └── components.bp.tsx
	│	│	│
	│	│	└-- native/
	│	│	     ├── components.bp.js
	│	│	     │
	│	│	     └-─ typescript/
	│	│	    	  ├── atoms.bp.tsx
	│	│	    	  └── components.bp.tsx
	│	│
	│	└── vue/
	│		├── components.bp.vue
	│		└── page.bp.vue
	│
	└──builders/
		├─ default.builder.ts
		│
		└─ react/
		     ├── default.builder.ts
		     ├── atom.builder.ts
			 │
		     └── typescript/
		     	└── default.builder.ts
```

The name of the blueprint file should be in the following format: `<name>.bp.<ext>`, where `<ext>` is the file extension (e.g., tsx, php, etc.)
and `<name>` is one of the folder names of the structure item (the deepest first, e.g., `atoms`, then `components`) or its type (e.g., `atom`).
If no file matches, a `default.bp.<ext>` file is used.

The folders of the language are searched first (e.g., `react/typescript/`, then `react/`, for the `react-typescript` language),
in the user directories, then in the plugins, then in Architect's default blueprints and builders.

### Blueprints

Blueprints are templates for generating files and folders. They are organized into different categories
based on the framework or language (e.g., React, Vue, PHP, etc.).

Blueprints can contain placeholders that will be replaced with the actual values during the generation process.

#### Available Placeholders

| Placeholder | Description                        |
| ----------- | ---------------------------------- |
| `__NAME__`  | The name of the component or file. |

#### Example Blueprint

#### _React Blueprint (TypeScript)_

```tsx
// components.bp.tsx
import React from "react";

interface I__NAME__Props {}

export const My__NAME__: React.FC<I__NAME__Props> = () => {
	return <div>Hello, React!</div>;
};
```

### Builders

Builders are responsible for constructing the file and folder structure based on the blueprints and configuration.
They ensure that the correct templates are applied during the generation process.

#### Example Builders

#### _Default Builder_

```ts
// default.builder.ts
import { prepareBuild, TBuilderArgs } from "@amphore-dev/architect";
import * as fs from "fs";

export default function defaultComponentBuilder(args: TBuilderArgs) {
	// args are passed from the CLI and contain the necessary information for generating files
	const { blueprint } = args;

	// prepareBuild resolves the output paths, checks conflicts and generates the folders and indexes
	return prepareBuild(args).then(({ fileOutputPath, outName, indexes }) => {
		const replacedBlueprint = blueprint.content.replace(
			/__NAME__/g,
			outName
		);

		fs.writeFileSync(fileOutputPath, replacedBlueprint);

		// Return paths of generated/modified files so it can be displayed at the end
		return [fileOutputPath, ...indexes];
	});
}
```

The imports of `@amphore-dev/architect` in a builder are resolved to the running CLI (they are not bundled):
the builder uses the same version, config and plugins as the CLI, even if Architect is only installed globally.

To stop the generation, a builder can throw an `ArchitectError` with an exit code:

```ts
import { ArchitectError, FILE_WRITE_ERROR } from "@amphore-dev/architect";

throw new ArchitectError(FILE_WRITE_ERROR, "Something went wrong");
```

## Plugins

The plugins key specifies additional plugins for the CLI. Plugins can be used to extend the functionality of the CLI. For now, plugin can be used to provide support for different languages and frameworks by adding blueprints and builders.

### Currently Available Plugins

- [@amphore-dev/architect-plugin-react](https://www.npmjs.com/package/@amphore-dev/architect-plugin-react)

    | Supported Language        | Extensions (index / default) | Description                              |
    | ------------------------- | ---------------------------- | ---------------------------------------- |
    | `react`                   | `.js`/ `.jsx`                | React components.                        |
    | `react-typescript`        | `.ts`/ `.tsx`                | React components with TypeScript.        |
    | `react-native`            | `.js`/ `.jsx`                | React Native components.                 |
    | `react-native-typescript` | `.ts`/ `.tsx`                | React Native components with TypeScript. |

### Creating a Plugin

To create a plugin, you can use the following [template on github](https://github.com/Amphore-Dev/Architect-plugin)

The plugin should have the following structure:

```bash
├── src/
│   ├── blueprints/
│   │   ├── default.bp.<extension>
│   │   ├── myCustomBlueprint.bp.<extension>
│   │   └── ...
│   │
│   └── builders/
│       ├── default.builder.<extension>
│       ├── myCustomBuilder.builder.<extension>
│       └── ...
│
├── package.json
└── README.md
```

`<extension>` is the file extension for the output generated files (e.g., `js`, `ts`, `php`, etc.).

The plugin registers its directories in its `register` function. The paths are relative to the plugin's package root:

```ts
import { TArchitectPlugin } from "@amphore-dev/architect";

const plugin: TArchitectPlugin = {
	name: "architect-plugin-vue", // the directories are used for the languages starting with "vue"
	register(architect) {
		architect.registerBlueprints(); // defaults to "blueprints"
		architect.registerBuilders("dist/builders"); // defaults to "builders"
	},
};

export default plugin;
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project from the [GitHub repo](https://github.com/Amphore-Dev/Architect)

2. Create an Issue to discuss the changes you would like to make

3. Create your Feature Branch
    - branch name should be in the format<br>
      `<feat | fix | test | docs>/ARC-<issue-number>/<feature-name>`
      <br><br>
      ex: `feat/ARC-123/AmazingFeature`
4. Link your branch to the issue on GitHub

5. Commit your Changes (`git commit -m 'feat(ARC-123): Add some AmazingFeature'`)

    - commit name should be in the format<br>
      `<type>(<issue-key>): <commit-message>`
      <br><br>
      ex: `feat(ARC-123): Add some AmazingFeature`

6. Push to the Branch (`git push origin feat/ARC-123/AmazingFeature`)

7. Open a Pull Request

    - PR name should be in the format<br>
      `<type>(<issue-key>): <PR-title>`
      <br><br>
      ex: `feat(ARC-123): Add some AmazingFeature`

8. Link the PR to the issue on GitHub

9. Review the changes

10. Merge the Pull Request

## Contact

Siméon F. - [@shimon42](https://github.com/Shimon42) - [contact@amphore.dev](mailto:contact@amphore.dev)
