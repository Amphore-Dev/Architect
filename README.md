# Architect

## Introduction

This project is an npm CLI package designed to generate folders and files based on predefined blueprints and builders.
It supports multiple file formats and configurations for different environments such as React, Vue, Angular, PHP,
and more.

## Installation

To install this package, use the following command:

```bash
npm install @amphore-dev/architect --global
```

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

-   `--config`: Path to a configuration file. (override `architect.config.json` config file if one is provided)
-   `--output`: Specify the output directory where files should be generated.
-   `--force`: Overwrite existing files if they already exist in the output directory.

## Configuration

The CLI requires a configuration file that defines the structure and blueprint for file generation.
The configuration file should be named `architect.config.json` and placed in the root directory of the project.

### Configuration File

| Key                  | Type     | Description                                                            |
| -------------------- | -------- | ---------------------------------------------------------------------- |
| outputDir            | string   | The root directory where files should be generated.                    |
| language             | string   | The language of the project. (e.g., TypeScript, JavaScript, PHP, etc.) |
| structure            | object   | The structure of the project.                                          |
| blueprints           | string[] | Paths of blueprints for generating files.                              |
| builders             | string[] | Paths of builders for constructing the file and folder structure.      |
| options              | object   | Additional options for the CLI.                                        |
| defaultStructureItem | object   | Default options for each structure item.                               |

Here is an example configuration file in JSON format:

```json
// architect.config.json
{
	"outputDir": "src",
	"language": "react-typescript",
	"structure": {
		"components": {
			"type": "component",
			"subdirs": {
				"atoms": "atom",
				"molecules": "molecule",
				"organisms": "organism",
				"templates": "template",
				"pages": "page"
			},
			"generateSubdirs": true,
			"generateSubIndex": true
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
			}
		},
		"types": {
			"type": "type",
			"prefix": "T"
		},
		"hooks": {
			"type": "hook",
			"prefix": "use"
		}
	},
	"defaultStructureItem": {
		"caseFormat": "pascal"
	}
}
```

### Structure object

The structure defines the folder and file structure of the project.

| Key              | Type             | Description                                                        |
| ---------------- | ---------------- | ------------------------------------------------------------------ |
| type             | string           | The type of the structure. (e.g., component, page, etc.)           |
| subdirs          | object           | Subdirectories of the structure.                                   |
| generateDir      | boolean          | Generate a directory for the structure item                        |
| generateIndex    | boolean          | Generate an index file for the structure item                      |
| generateSubdirs  | boolean          | Generate subdirectories for the structure item                     |
| generateSubIndex | boolean          | Generate an index file for the structure item                      |
| prefix           | string           | Prefix for the name of the generated files.                        |
| caseFormat       | string or object | Case format for the name of the generated folders/files/components |
| language         | string           | The language of the project. (e.g., TypeScript, JavaScript, PHP)   |

### Case Format

The case format can be a string or an object. If it is a string, it should be one of the following:

-   `camel`
-   `pascal`
-   `kebab`
-   `kebab-upper`
-   `snake`
-   `snake-upper`.

If it is an object, it should have the following properties: (each property is optional)
| Key | Type | Description |
| ---- | ------ | ---------------------------------- |
| name | string | The name of the case format to use. |
| file | string | The case format for file names. |
| folder | string | The case format for folder names. |

### Language

The language key specifies the language of the project. It is used to determine the files used to generate items.

#### Default Available Languages

| Language                  | Description                  |
| ------------------------- | ---------------------------- |
| `javascript`              | JavaScript                   |
| `react`                   | React                        |
| `react-typescript`        | React with TypeScript        |
| `react-native`            | React Native                 |
| `react-native-typescript` | React Native with TypeScript |
| `vue`                     | Vue                          |
| `vue-typescript`          | Vue with TypeScript          |

### Default Structure Item

The default structure item defines the default options for each structure item.
If a structure item does not have a specific option, it will use the default option.

## Blueprints and Builders

### Blueprints

Blueprints are templates for generating files and folders. They are organized into different categories
based on the framework or language (e.g., React, Vue, PHP, etc.).

```bash
# Example Blueprint Directory Structure
blueprints/
│
├── react/
│   ├── utils.bp.js
│   ├── page.bp.js
│   │
│   ├-─ typescript/
│   │    ├── atoms.bp.tsx
│   │    └── components.bp.tsx
│	│
│	└-- native/
│	     ├── components.bp.js
│	     │
│	     └-─ typescript/
│	     	  ├── atoms.bp.tsx
│	     	  └── components.bp.tsx
│
└── vue/
	├── components.bp.vue
	└── page.bp.vue
```

The name of the blueprint file should be in the following format: `<type>.bp.<ext>`, where `<type>` is the type of the blueprint
(e.g., component, page, etc.), and `<ext>` is the file extension (e.g., tsx, php, etc.).

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

export function defaultComponentBuilder(args: TBuilderArgs) {
	// args are passed from the CLI and contain the necessary information for generating files
	const { blueprint, fileOutputPath, outName, indexes } = args;

	const replacedBlueprint = blueprint.content.replace(
		/__COMPONENT_NAME__/g,
		outName
	);

	fs.writeFileSync(fileOutputPath, replacedBlueprint);

	// Return paths of generated/modified files so it can be displayed at the end
	return [fileOutputPath, ...indexes].filter((b) => b);
}
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
      (regex: `^(feat|fix|test|docs)\/ARC-\d+\/[a-zA-Z0-9-_]+$`)
4. Link your branch to the issue on GitHub

5. Commit your Changes (`git commit -m 'feat(ARC-123): Add some AmazingFeature'`)

    - commit name should be in the format<br>
      `<type>(<issue-key>): <commit-message>`
      <br><br>
      ex: `feat(ARC-123): Add some AmazingFeature`

6. Push to the Branch (`git push origin feat/ARC-123/AmazingFeature`)

7. Open a Pull Request

## Contact

Siméon F. - [@shimon42](https://github.com/Shimon42) - [contact@amphore.dev](mailto:contact@amphore.dev)
