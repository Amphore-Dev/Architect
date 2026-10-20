# Architect example

Local sandbox to test the CLI built from the parent folder (linked with `link:..`).

```bash
yarn install
yarn build:cli          # build Architect (../dist)
yarn architect atom Button
yarn demo               # generate one item of each type in src/
yarn clean              # remove src/
```

Rebuild with `yarn build:cli` after each change in `../src`.

`architect.config.json` shows:

-   the React plugin (`@amphore-dev/architect-plugin-react`) installed in this project
-   custom blueprints in `architect/blueprints` (by language: `react/typescript/`)
-   `containers` using the blueprint of another item (`"blueprint": "component"`)
-   `services` using a specific builder (`"builder": "architect/builders/service.builder.ts"`)
-   prefixes / suffixes / case formats (`constant ApiV2` -> `CApiV2.ts` exporting `CAPI_V2`)
