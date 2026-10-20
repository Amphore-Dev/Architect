# Changelog

## 2.0.0

### ⚠️ Breaking changes

- Node.js `>= 22.12` is required
- The package entry point (`main`) is now the public API, the CLI is `dist/cli.js` (`architect` bin).
  Deep imports (`@amphore-dev/architect/dist/...`) are replaced by `import { ... } from "@amphore-dev/architect"`
- Plugin API: `registerBlueprints(path?)` / `registerBuilders(path?)` take a path relative to the plugin's package root
  (defaults: `blueprints` / `builders`). The directories are used in place instead of being copied
- `-c <file>` fails when the file does not exist (exit code `10`)
- The configuration is validated: invalid values fail with exit code `10`, unknown options are reported as warnings
- Extra positional arguments are rejected (commander 15)
- The overwrite prompt is a yes/no confirm (default: no)
- Architect's default blueprint is language-agnostic (`default.bp`): without a matching blueprint,
  the extension of the language is used (`react-typescript` -> `.ts` instead of `.js`)
- The `generateDir` option is removed (it had no effect)
- `TFomatType` is renamed `TFormatType`, `BUILD_PREPRAION_ERROR` is renamed `BUILD_PREPARATION_ERROR`
- The utilities throw an `ArchitectError` (with the exit code) instead of exiting the process

### Features

- Structure items can use a specific blueprint / builder (`blueprint` / `builder` keys):
  the type of another structure item or a path to a file (#18)
- JSON schema (`schema.json`) for the configuration autocompletion and validation
- `preserveAcronyms` option: keep `API`, `HTTP`... in uppercase in camel/pascal case
- `--force` uses the first folder when a type matches several folders (no prompt)
- Imports of `@amphore-dev/architect` in custom builders are resolved to the running CLI (same instance, config and plugins)
- Public API: `prepareBuild`, `formatName`, `ArchitectError`, `Context`, types and constants

### Fixes

- Plugins are resolved from the project directory, they work when Architect is installed globally (#17)
- Digits are kept in formatted names: `CommandsV2` -> `COMMANDS_V2` (#20)
- `--output` and `--force` were ignored without config file
- Absolute `--output` paths
- Arrays were merged as objects in the configs, plugins configs were shallow merged
- Names containing path separators could write outside of the project
- Custom index files were sorted and their blank lines removed
- The default blueprint ignored the structure item language
- Directories could be matched as blueprints / builders
- Unhandled errors in the CLI

### Security

- All dependencies upgraded, 0 known vulnerabilities (`tmp`, `esbuild`, `braces`, `sprintf-js`...)
- `inquirer` replaced by `@inquirer/select` / `@inquirer/confirm`, `jest` replaced by `vitest`
- Unused dependencies removed (`typescript` at runtime, `import-sync`, `safe-flat`...)
