# Usage

## Import

**JavaScript**

```ts
import Intermodular from "intermodular";
```

**TypeScript**

```ts
import Intermodular, { PackageManager, DependencyType, PredicateFileOperation, CopyFilterFunction, CopyOptions } from "intermodular";
```

## Usage

Your boilerplate module is source module and target module is module installed your boilerplate as a dependency.

```ts
const intermodular = await Intermodular.new();

const targetModule = intermodular.targetModule;
const config = intermodular.config;
```

## Copy, Edit & Save Config Files

Copy all config files from your boilerplate to your `my-project` TypeScript project.

```ts
 // Copy all files from `my-boilerplate/config/` to `my-project/`
await intermodular.copy("config", ".");

// Update project's `package.json`.
targetModule.package.set("description", `My awesome project of ${targetModule.name}`);

// Get some deep data from cosmiconfig compatible config file from `my-project/.my-boilerplaterc` or any cosmiconfig compatible way automatically.
const buildFlags = intermodular.config.get("build.flags");
targetModule.package.set("scripts.build": `tsc ${buildFlags}`);

// Read and update target eslint configuration.
const eslintConfig = await targetModule.read("eslint", { cosmiconfig: true });
eslintConfig.set("rules.lines-between-class-members", ["warn", "always", { exceptAfterSingleLine: true }]);

await targetModule.saveAll();
```

## Install modules

Install modules into `my-project`.

```ts
await targetModule.install("lodash");
```

## Check Module Dependencies

```ts
targetModule.getDependencyVersion("lodash");
targetModule.getDependencyVersion("typescript", [DependencyType.DevDependencies]);
targetModule.hasAnyDependency("babel");
```

## Execute Command

```ts
await targetModule.execute("tsc", ["-b"]);
```

## Operations on Target Module

```ts
const moduleName = targetModule.name;
targetModule.pathOf("config/tsconfig.json"); // Absolute path.
```

## Work with Files

Work with files located in target module's directory.

```ts
await targetModule.read("README.md");
await targetModule.write("README.md", `Hello from ${targetModule.name}`, { overwrite: false });
await targetModule.remove(".myconfig", { if: (data: DataFile) => data.get("version").startsWith("2") });
await targetModule.exist("README.md");
await targetModule.isEqual(".myconfig", { name: "xyz", "0.1.1" });
```

## Operations on Data Files

Work with data files located in target module's directory.

```ts
// Do some individual data level operations:
targetModule.package.set("keywords", ["some-key"]);
targetModule.package.set("description", `My awesome ${moduleName}`);
targetModule.package.merge("scripts", { build: "tsc", test: "jest" });
targetModule.package.merge({ author: { name: "my-name", email: "mymail@mymail.com" } });
targetModule.package.sortKeys("scripts", { start: ["build", "lint"], end: ["release"] }); // Sort scripts, but reserve start and end.
targetModule.package.sortKeys({ start: ["name", "description"], end: ["dependencies", "devDependencies"] }); // Sort root keys, but reserve start and end.
await targetModule.package.save();
```

## Example Logger

```ts
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "debug",
  format: format.combine(format.colorize(), format.splat(), format.simple()),
  transports: [new transports.Console()],
});

const intermodular = await Intermodular.new({ logger });
```

## Reuse Modules between Intermodular Instances

If more than one source module would modify same target module, it is possible to use same module between intermodular instances. It may help to reduce disk operation by reducing redundant code execution and utilizing same cache etc.

```ts
const intermodularA = await Intermodular.new({ source: "path/to/source", target: "path/to/target" });
const intermodularB = await Intermodular.new({ source: "path/to/other", target: intermodularA.targetModule });
```
