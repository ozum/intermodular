# Intermodular

Easy file operations between node.js modules and auto logging to help building zero-config boilerplates, postinstall and other scripts.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Synopsis](#synopsis)
- [API](#api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

```sh
npm install intermodular
```

# Synopsis

See [Homepage](https://intermodular.ozum.net) for full documentation and API.

```ts
const targetModule = intermodular.targetModule;
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance

// Copy all config files from `.../your-module/common-config/` to `.../target-module/` (root).
intermodular.copySync("common-config", ".");
targetModule.install("lodash");
targetModule.executeSync("rm", ["-rf", "dist"]);
packageJson.set("description", `My awesome ${targetModule.name}`, { ifNotExists: true });

if (intermodular.targetModule.isTypeScript) {
  intermodular.copySync("config/tsconfig.json", ".");
}
```

# API
