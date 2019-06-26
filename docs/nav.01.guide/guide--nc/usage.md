# Usage

```ts
import Intermodular, { FileFormat, LogLevel, DependencyType } from "intermodular";

// Default Source: Your module, Target: Module installed your module as a dependency.
const intermodular = new Intermodular();
const targetModule = intermodular.targetModule;
const config = intermodular.targetModule.config;
```

## Copy Files

Copy files from your boilerplate module to module that uses your boilerplate.

```ts
// Copy all files from your module's `common-config` to target module's root.
intermodular.copySync("common-config", ".");

if (targetModule.isTypeScript) {
  intermodular.copySync("config/tsconfig.json", ".");
}
```

## Install Modules

```ts
targetModule.install("lodash");
```

## Check Module Dependencies

```ts
targetModule.getDependencyVersion("lodash");
targetModule.getDependencyVersion("typescript", [DependencyType.DevDependencies]);
targetModule.hasAnyDependency("babel");
```

## Execute Command

### Single Command

```ts
 // Execute shell command.
targetModule.executeSync("rm", ["-rf", "dist"]);
```

### Serial and Parallel (Concurrent) Commands

```ts
// Run: `rm -rf dist`, then `tsc`
targetModule.executeAllSync(["rm", ["-rf", "dist"]], "tsc");

// Run `rm -rf dist` and `rm -rf build` concurrently, then execute `tsc`
targetModule.executeAllSync({
    "Delete 1": ["rm", ["-rf", "dist"]],
    "Delete 2": ["rm", ["-rf", "build"]]
  },
  "tsc"
); 
```

## Work with Prettier

```ts
targetModule.getPrettierConfigSync("src/main.ts");
```

## Operations on Target Module

```ts
const moduleName = targetModule.name;
targetModule.pathOf("config/tsconfig.json"); // Absolute path.
```

## Work with Files

Work with files located in target module's directory.

```ts
targetModule.readSync("README.md");
targetModule.parseSync("package.json");
targetModule.parseWithFormatSync(".configrc"); // { format: "yaml", data: {...} }
targetModule.writeSync("README.md", `Hello from ${targetModule.name}`, { overwrite: false });
targetModule.removeSync(".myconfig", { ifEqual: { name: "xyz", "0.1.1" } });
targetModule.existSync("README.md");
targetModule.isEqual(".myconfig", { name: "xyz", "0.1.1" });
```

## Work with Data Files

Work with data files located in target module's directory.

```ts
// Do some individual data level operations:
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.set("keywords", ["some-key"], { ifNotExists: true });
packageJson.set("description", `My awesome ${moduleName}`, { ifNotExists: true });
packageJson.assign("scripts", { build: "tsc", test: "jest" }, { ifNotExists: true });
packageJson.orderKeys(["name", "version", "description", "keywords", "scripts"]); // Other keys come after.
packageJson.saveSync();
```
