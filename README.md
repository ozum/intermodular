See [documentation](https://intermodular.ozum.net) at https://intermodular.ozum.net.

# Intermodular

Easy file operations between node.js modules and auto logging to help building zero-config boilerplates, postinstall and other scripts.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Synopsis](#synopsis)
- [API](#api)
- [intermodular](#intermodular)
  - [Type aliases](#type-aliases)
    - [CopyFilterFunction](#copyfilterfunction)
    - [PredicateFileOperation](#predicatefileoperation)
  - [Variables](#variables)
    - [`Const` ALL_DEPENDENCIES](#const-all_dependencies)
- [Classes](#classes)
- [Class: Intermodular](#class-intermodular)
  - [Hierarchy](#hierarchy)
  - [Properties](#properties)
    - [`Readonly` config](#readonly-config)
    - [`Readonly` sourceModule](#readonly-sourcemodule)
    - [`Readonly` targetModule](#readonly-targetmodule)
  - [Methods](#methods)
    - [copy](#copy)
    - [log](#log)
    - [`Static` isEnvSet](#static-isenvset)
    - [`Static` new](#static-new)
    - [`Static` parseEnv](#static-parseenv)
- [Class: Module](#class-module)
  - [Hierarchy](#hierarchy-1)
  - [Properties](#properties-1)
    - [`Readonly` isTypeScript](#readonly-istypescript)
    - [`Readonly` package](#readonly-package)
    - [`Readonly` packageManager](#readonly-packagemanager)
    - [`Readonly` root](#readonly-root)
  - [Accessors](#accessors)
    - [name](#name)
    - [nameWithoutUser](#namewithoutuser)
  - [Methods](#methods-1)
    - [command](#command)
    - [createDirectory](#createdirectory)
    - [execute](#execute)
    - [exists](#exists)
    - [getDependencyVersion](#getdependencyversion)
    - [hasAnyDependency](#hasanydependency)
    - [ifAnyDependency](#ifanydependency)
    - [install](#install)
    - [isDirectory](#isdirectory)
    - [isEqual](#isequal)
    - [pathOf](#pathof)
    - [read](#read)
    - [readData](#readdata)
    - [readRaw](#readraw)
    - [relativePathOf](#relativepathof)
    - [remove](#remove)
    - [removeEmptyDirs](#removeemptydirs)
    - [rename](#rename)
    - [saveAll](#saveall)
    - [uninstall](#uninstall)
    - [write](#write)
    - [`Static` new](#static-new-1)
- [Enums](#enums)
- [Enumeration: DependencyType](#enumeration-dependencytype)
  - [Enumeration members](#enumeration-members)
    - [Dependencies](#dependencies)
    - [DevDependencies](#devdependencies)
    - [OptionalDependencies](#optionaldependencies)
    - [PeerDependencies](#peerdependencies)
- [Enumeration: PackageManager](#enumeration-packagemanager)
  - [Enumeration members](#enumeration-members-1)
    - [Npm](#npm)
    - [Yarn](#yarn)
- [Interfaces](#interfaces)
- [Interface: CopyOptions](#interface-copyoptions)
  - [Hierarchy](#hierarchy-2)
  - [Properties](#properties-2)
    - [`Optional` dereference](#optional-dereference)
    - [`Optional` errorOnExist](#optional-erroronexist)
    - [`Optional` filter](#optional-filter)
    - [`Optional` overwrite](#optional-overwrite)
    - [`Optional` preserveTimestamps](#optional-preservetimestamps)
    - [`Optional` recursive](#optional-recursive)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

```sh
npm install intermodular
```

# Synopsis

```ts
import Intermodular from "intermodular";

const intermodular = await Intermodular.new();
const targetModule = intermodular.targetModule;

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

await targetModule.install("lodash");
await targetModule.execute("tsc", ["-b"]);
```

# API

<a name="readmemd"></a>

# intermodular

## Type aliases

### CopyFilterFunction

Ƭ **CopyFilterFunction**: _function_

_Defined in [util/types.ts:27](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L27)_

Type for function to filter copied files.

#### Type declaration:

▸ (`fullSourcePath`: string, `fullTargetPath`: string, `isSourceDirectory`: boolean, `isTargetDirectory`: boolean, `sourceContent?`: string | DataFile, `targetContent?`: string | DataFile): _boolean | Promise‹boolean›_

Sync callback function to filter copied files.

**Parameters:**

| Name                | Type                   | Description                                                                                                                                                                                           |
| ------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fullSourcePath`    | string                 | path of source file.                                                                                                                                                                                  |
| `fullTargetPath`    | string                 | path of target file.                                                                                                                                                                                  |
| `isSourceDirectory` | boolean                | is whether source path is a directory.                                                                                                                                                                |
| `isTargetDirectory` | boolean                | is whether target path is a directory.                                                                                                                                                                |
| `sourceContent?`    | string &#124; DataFile | is string content or {@link DataFile https://www.npmjs.com/package/edit-config} instance if content of source file is parseble object. If file does not exist or is a directory, this is `undefined`. |
| `targetContent?`    | string &#124; DataFile | is string content or {@link DataFile https://www.npmjs.com/package/edit-config} instance if content of target file is parseble object. If file does not exist or is a directory, this is `undefined`. |

---

### PredicateFileOperation

Ƭ **PredicateFileOperation**: _function_

_Defined in [util/types.ts:17](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L17)_

Type of callback function to test whether related file operation should be done.

#### Type declaration:

▸ (`fileContent?`: string | DataFile): _Promise‹boolean› | boolean_

Callback function to test whether related file operation should be done.

**Parameters:**

| Name           | Type                   |
| -------------- | ---------------------- |
| `fileContent?` | string &#124; DataFile |

## Variables

### `Const` ALL_DEPENDENCIES

• **ALL_DEPENDENCIES**: _[DependencyType](#enumsdependencytypemd)[]_ = [
DependencyType.Dependencies,
DependencyType.DevDependencies,
DependencyType.PeerDependencies,
DependencyType.OptionalDependencies,
]

_Defined in [module.ts:11](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L11)_

# Classes

<a name="classesintermodularmd"></a>

# Class: Intermodular

## Hierarchy

- **Intermodular**

## Properties

### `Readonly` config

• **config**: _DataFile_

_Defined in [intermodular.ts:18](https://github.com/ozum/intermodular/blob/0dfffd0/src/intermodular.ts#L18)_

Configuration for source module in target module as a [DataFile](https://www.npmjs.com/package/edit-config#class-datafile) instance.

---

### `Readonly` sourceModule

• **sourceModule**: _[Module](#classesmodulemd)_

_Defined in [intermodular.ts:12](https://github.com/ozum/intermodular/blob/0dfffd0/src/intermodular.ts#L12)_

[Module](#classesmodulemd) instance of node module which is used as source for modification operations such as copy, update.

---

### `Readonly` targetModule

• **targetModule**: _[Module](#classesmodulemd)_

_Defined in [intermodular.ts:15](https://github.com/ozum/intermodular/blob/0dfffd0/src/intermodular.ts#L15)_

[Module](#classesmodulemd) instance of node module which is used as target for modification operations such as copy, update.

## Methods

### copy

▸ **copy**(`sourcePath`: string, `targetPath`: string, `copyOptions`: [CopyOptions](#interfacescopyoptionsmd)): _Promise‹void›_

_Defined in [intermodular.ts:109](https://github.com/ozum/intermodular/blob/0dfffd0/src/intermodular.ts#L109)_

Copies a file or directory from `pathInSourceModule` relative to source module root to `pathInTargetModule`relative to
target module root. The directory can have contents. Like cp -r.
**IMPORTANT:** Note that if source is a directory it will copy everything inside of this directory, not the entire directory itself.

#### Example

```typescript
// Copy everything in `/path/to/project/node_modules/module-a/src/config/` to `/path/to/project/`
copySync("src/config", ".");
```

**Parameters:**

| Name          | Type                                    | Default    | Description                                       |
| ------------- | --------------------------------------- | ---------- | ------------------------------------------------- |
| `sourcePath`  | string                                  | -          | is source to copy from.                           |
| `targetPath`  | string                                  | sourcePath | is destination to copy to. Cannot be a directory. |
| `copyOptions` | [CopyOptions](#interfacescopyoptionsmd) | {}         | -                                                 |

**Returns:** _Promise‹void›_

---

### log

▸ **log**(`logLevel`: LogLevel, `message`: string): _void_

_Defined in [intermodular.ts:37](https://github.com/ozum/intermodular/blob/0dfffd0/src/intermodular.ts#L37)_

Logs given message with required level using logger provided during object construction.

**Parameters:**

| Name       | Type     | Description                  |
| ---------- | -------- | ---------------------------- |
| `logLevel` | LogLevel | is the level to log message. |
| `message`  | string   | is the message to log.       |

**Returns:** _void_

---

### `Static` isEnvSet

▸ **isEnvSet**(`variable`: string): _boolean_

_Defined in [intermodular.ts:177](https://github.com/ozum/intermodular/blob/0dfffd0/src/intermodular.ts#L177)_

Returns whether `variable` is set in environment variables and not empty.

**Parameters:**

| Name       | Type   | Description                                   |
| ---------- | ------ | --------------------------------------------- |
| `variable` | string | is name of the environment variable to check. |

**Returns:** _boolean_

whether given environment variable is set and not empty.

---

### `Static` new

▸ **new**(`__namedParameters`: object): _Promise‹[Intermodular](#classesintermodularmd)›_

_Defined in [intermodular.ts:141](https://github.com/ozum/intermodular/blob/0dfffd0/src/intermodular.ts#L141)_

Creates and returns [Intermodular](#classesintermodularmd) instance.

**Parameters:**

▪`Default value` **\_\_namedParameters**: _object_= {}

are options

| Name        | Type                                                        | Description                                                                                                                                            |
| ----------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `logger`    | undefined &#124; Logger                                     | is Winston compatible logger or `console`.                                                                                                             |
| `overwrite` | undefined &#124; false &#124; true                          | is whether to overwrite files by default.                                                                                                              |
| `source`    | undefined &#124; string &#124; [Module](#classesmodulemd)‹› | is the source module or a path in source module. By default immediate parent's root dir is used. Immediate parent is the file which calls this method. |
| `target`    | undefined &#124; string &#124; [Module](#classesmodulemd)‹› | is the target module or a path in target module. By default `process.env.INIT_CWD` or `process.env.CWD` is used whichever is first available.          |

**Returns:** _Promise‹[Intermodular](#classesintermodularmd)›_

[Intermodular](#classesintermodularmd) instance.

---

### `Static` parseEnv

▸ **parseEnv**‹**T**›(`variable`: string, `defaultValue?`: T): _string | number | Record‹string, any› | T | undefined_

_Defined in [intermodular.ts:191](https://github.com/ozum/intermodular/blob/0dfffd0/src/intermodular.ts#L191)_

Parses and returns `variable` environment variable. If value is JSON object, parses using JSON5 and returns it as a JavaScript object.
Otherwise returns `defaultValue`.

**Type parameters:**

▪ **T**

**Parameters:**

| Name            | Type   | Description                                                       |
| --------------- | ------ | ----------------------------------------------------------------- |
| `variable`      | string | is Name of the environment variable                               |
| `defaultValue?` | T      | is value to return if no environment variable is set or is empty. |

**Returns:** _string | number | Record‹string, any› | T | undefined_

environment variable (if possible as an object) or default value.

<a name="classesmodulemd"></a>

# Class: Module

Class which provides information and modification methods for a module.

## Hierarchy

- **Module**

## Properties

### `Readonly` isTypeScript

• **isTypeScript**: _boolean_

_Defined in [module.ts:36](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L36)_

Whether module is a TypeScript project.

---

### `Readonly` package

• **package**: _DataFile_

_Defined in [module.ts:33](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L33)_

[DataFile](https://www.npmjs.com/package/edit-config#class-datafile) instance of `package.json`.

---

### `Readonly` packageManager

• **packageManager**: _[PackageManager](#enumspackagemanagermd)_

_Defined in [module.ts:30](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L30)_

Package manager of the module.

---

### `Readonly` root

• **root**: _string_

_Defined in [module.ts:27](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L27)_

Absolute path of the module's root directory, where `package.json` is located.

## Accessors

### name

• **get name**(): _string_

_Defined in [module.ts:59](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L59)_

Name of the module as defined in `package.json`.

**Returns:** _string_

---

### nameWithoutUser

• **get nameWithoutUser**(): _string_

_Defined in [module.ts:64](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L64)_

Name of the module without user name. For example: `typescript` for `@microsoft/typescript`.

**Returns:** _string_

## Methods

### command

▸ **command**(`cmd`: string, `options?`: ExecaOptions): _Promise‹ExecaReturnValue›_

_Defined in [module.ts:383](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L383)_

Executes given command using `execa.command` with given options. Applies sensible default options.

#### Example

```typescript
module.command("ls"); // Run `ls`.
module.command("ls -al", { stdio: "inherit" }); // Run `ls -al`.
```

**Parameters:**

| Name       | Type         | Description                                                 |
| ---------- | ------------ | ----------------------------------------------------------- |
| `cmd`      | string       | is command to execute.                                      |
| `options?` | ExecaOptions | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _Promise‹ExecaReturnValue›_

[[ExecaReturnValue]] instance.

▸ **command**(`cmd`: string, `options?`: ExecaOptions‹null›): _Promise‹ExecaReturnValue‹Buffer››_

_Defined in [module.ts:384](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L384)_

**Parameters:**

| Name       | Type               |
| ---------- | ------------------ |
| `cmd`      | string             |
| `options?` | ExecaOptions‹null› |

**Returns:** _Promise‹ExecaReturnValue‹Buffer››_

---

### createDirectory

▸ **createDirectory**(`path`: string): _Promise‹void›_

_Defined in [module.ts:290](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L290)_

Ensures that the directory exists. If the directory structure does not exist, it is created similar to `mkdir -p`.

**Parameters:**

| Name   | Type   | Description                                              |
| ------ | ------ | -------------------------------------------------------- |
| `path` | string | is the path relative to module root or an absolute path. |

**Returns:** _Promise‹void›_

---

### execute

▸ **execute**(`bin`: string, `args?`: string[], `options?`: ExecaOptions): _Promise‹ExecaReturnValue›_

_Defined in [module.ts:346](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L346)_

Executes given command using `execa` with given arguments and options. Applies sensible default options.

#### Example

```typescript
module.execute("ls"); // Run `ls`.
module.execute("ls", ["-al"], { stdio: "inherit" }); // Run `ls -al`.
```

**Parameters:**

| Name       | Type         | Description                                                 |
| ---------- | ------------ | ----------------------------------------------------------- |
| `bin`      | string       | is binary file to execute.                                  |
| `args?`    | string[]     | are arguments to pass to executable.                        |
| `options?` | ExecaOptions | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _Promise‹ExecaReturnValue›_

[[ExecaReturnValue]] instance.

▸ **execute**(`bin`: string, `args?`: string[], `options?`: ExecaOptions‹null›): _Promise‹ExecaReturnValue‹Buffer››_

_Defined in [module.ts:347](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L347)_

**Parameters:**

| Name       | Type               |
| ---------- | ------------------ |
| `bin`      | string             |
| `args?`    | string[]           |
| `options?` | ExecaOptions‹null› |

**Returns:** _Promise‹ExecaReturnValue‹Buffer››_

▸ **execute**(`bin`: string, `options?`: ExecaOptions): _Promise‹ExecaReturnValue›_

_Defined in [module.ts:359](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L359)_

Executes given command using `execa` with given arguments and options. Applies sensible default options.

#### Example

```typescript
module.execute("ls"); // Run `ls`.
module.execute("ls", { stdio: "inherit" }); // Run `ls`.
```

**Parameters:**

| Name       | Type         | Description                                                 |
| ---------- | ------------ | ----------------------------------------------------------- |
| `bin`      | string       | is binary file to execute.                                  |
| `options?` | ExecaOptions | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _Promise‹ExecaReturnValue›_

[[ExecaReturnValue]] instance.

▸ **execute**(`bin`: string, `options?`: ExecaOptions‹null›): _Promise‹ExecaReturnValue‹Buffer››_

_Defined in [module.ts:360](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L360)_

**Parameters:**

| Name       | Type               |
| ---------- | ------------------ |
| `bin`      | string             |
| `options?` | ExecaOptions‹null› |

**Returns:** _Promise‹ExecaReturnValue‹Buffer››_

---

### exists

▸ **exists**(`path`: string): _Promise‹boolean›_

_Defined in [module.ts:265](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L265)_

Checks whether given path exists.

**Parameters:**

| Name   | Type   | Description                                              |
| ------ | ------ | -------------------------------------------------------- |
| `path` | string | is the path relative to module root or an absolute path. |

**Returns:** _Promise‹boolean›_

whether given path exists.

---

### getDependencyVersion

▸ **getDependencyVersion**(`moduleName`: string, `dependencyTypes`: [DependencyType](#enumsdependencytypemd)[]): _string | undefined_

_Defined in [module.ts:75](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L75)_

Fetches a dependent module's version from given [dependency types](#enumsdependencytypemd).

**Parameters:**

| Name              | Type                                       | Default          | Description                                        |
| ----------------- | ------------------------------------------ | ---------------- | -------------------------------------------------- |
| `moduleName`      | string                                     | -                | is the name of the module to get version of.       |
| `dependencyTypes` | [DependencyType](#enumsdependencytypemd)[] | ALL_DEPENDENCIES | are array of dependency types to search module in. |

**Returns:** _string | undefined_

version of the `moduleName` || undefined.

---

### hasAnyDependency

▸ **hasAnyDependency**(`moduleNames`: string | string[], `dependencyTypes`: [DependencyType](#enumsdependencytypemd)[]): _boolean_

_Defined in [module.ts:87](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L87)_

Checks whether given module or any of the modules exist in given [dependency types](#enumsdependencytypemd).

**Parameters:**

| Name              | Type                                       | Default          | Description                                        |
| ----------------- | ------------------------------------------ | ---------------- | -------------------------------------------------- |
| `moduleNames`     | string &#124; string[]                     | -                | are the name of the module to search for.          |
| `dependencyTypes` | [DependencyType](#enumsdependencytypemd)[] | ALL_DEPENDENCIES | are array of dependency types to search module in. |

**Returns:** _boolean_

whether `moduleName` exists in one of the dependency types.

---

### ifAnyDependency

▸ **ifAnyDependency**‹**T**, **F**›(`moduleNames`: string | string[]): _boolean_

_Defined in [module.ts:91](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L91)_

Checks single or multiple module's existence in any of the `package.json` dependencies.

**Type parameters:**

▪ **T**

▪ **F**

**Parameters:**

| Name          | Type                   | Description                                                            |
| ------------- | ---------------------- | ---------------------------------------------------------------------- |
| `moduleNames` | string &#124; string[] | are Module or modules to check whether this module has any dependency. |

**Returns:** _boolean_

`trueValue` if module depends on any of the `moduleNames`. Otherwise returns `falseValue`.

▸ **ifAnyDependency**‹**T**, **F**›(`moduleNames`: string | string[], `t`: T): _T | false_

_Defined in [module.ts:92](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L92)_

Checks single or multiple module's existence in any of the `package.json` dependencies.

**Type parameters:**

▪ **T**

▪ **F**

**Parameters:**

| Name          | Type                   |
| ------------- | ---------------------- |
| `moduleNames` | string &#124; string[] |
| `t`           | T                      |

**Returns:** _T | false_

`trueValue` if module depends on any of the `moduleNames`. Otherwise returns `falseValue`.

▸ **ifAnyDependency**‹**T**, **F**›(`moduleNames`: string | string[], `t`: T, `f`: F, `dependencyTypes?`: [DependencyType](#enumsdependencytypemd)[]): _T | F_

_Defined in [module.ts:93](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L93)_

Checks single or multiple module's existence in any of the `package.json` dependencies.

**Type parameters:**

▪ **T**

▪ **F**

**Parameters:**

| Name               | Type                                       |
| ------------------ | ------------------------------------------ |
| `moduleNames`      | string &#124; string[]                     |
| `t`                | T                                          |
| `f`                | F                                          |
| `dependencyTypes?` | [DependencyType](#enumsdependencytypemd)[] |

**Returns:** _T | F_

`trueValue` if module depends on any of the `moduleNames`. Otherwise returns `falseValue`.

---

### install

▸ **install**(`packageNames`: string | string[], `__namedParameters`: object): _Promise‹void›_

_Defined in [module.ts:403](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L403)_

Installs node modules using specified package manager.

**Parameters:**

▪`Default value` **packageNames**: _string | string[]_= []

are package name or array of package names.

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name   | Type                                     | Default                     | Description                                                           |
| ------ | ---------------------------------------- | --------------------------- | --------------------------------------------------------------------- |
| `type` | [DependencyType](#enumsdependencytypemd) | DependencyType.Dependencies | is the dependency type of the package. `dev`, `peer`, `optional` etc. |

**Returns:** _Promise‹void›_

---

### isDirectory

▸ **isDirectory**(`path`: string): _Promise‹boolean›_

_Defined in [module.ts:275](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L275)_

Returns whether given path is a directory.

**Parameters:**

| Name   | Type   | Description                                              |
| ------ | ------ | -------------------------------------------------------- |
| `path` | string | is the path relative to module root or an absolute path. |

**Returns:** _Promise‹boolean›_

whether given path is a directory.

---

### isEqual

▸ **isEqual**(`path`: string, `content`: string | Record‹string, any›): _Promise‹boolean›_

_Defined in [module.ts:329](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L329)_

Checks whether content of `pathInModule` file is equal to `data` by making string comparison (for strings)
or deep comparison (for objects).

#### Example

```typescript
const isConfigEqual = module.isEqual("config.json", { someData: 4 });
const textEqual = module.isEqual("some.txt", "content");
```

**Parameters:**

| Name      | Type                              | Description                                                  |
| --------- | --------------------------------- | ------------------------------------------------------------ |
| `path`    | string                            | is the path relative to module root or an absolute path.     |
| `content` | string &#124; Record‹string, any› | is string or JavaScript object to compare to file's content. |

**Returns:** _Promise‹boolean›_

whether the file is equal to given `content`.

---

### pathOf

▸ **pathOf**(...`parts`: string[]): _string_

_Defined in [module.ts:117](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L117)_

Returns absolute path for given relative path to module root. If given path is an absolute path, returns it directly.

#### Example

```typescript
module.pathOf("images", "photo.jpg"); // -> /path/to/root/images/photo.jpg
module.pathOf("/usr", "bin"); // -> /usr/bin
```

**Parameters:**

| Name       | Type     | Description                      |
| ---------- | -------- | -------------------------------- |
| `...parts` | string[] | are path or array of path parts. |

**Returns:** _string_

absolute path to given destination.

---

### read

▸ **read**(`path`: string, `options?`: ManagerLoadOptions): _Promise‹DataFile | string | undefined›_

_Defined in [module.ts:167](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L167)_

Reads and if possible returns DataFile otherwise file content. If file does not exist returns `undefined`.
If `options.defaultData` is true, file will be created using `options.defaultData` if it does not exist.

**`see`** [Module.readData](#readdata), [Module.readRaw](#readraw)

**`throws`** if given path is a directory.

**Parameters:**

| Name       | Type               | Description                                                                                                                                |
| ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `path`     | string             | is the path relative to module root or an absolute path.                                                                                   |
| `options?` | ManagerLoadOptions | are options passed to `Manager.load` of `edit-config`. See [here](https://www.npmjs.com/package/edit-config#interface-managerloadoptions). |

**Returns:** _Promise‹DataFile | string | undefined›_

[DataFile](https://www.npmjs.com/package/edit-config#class-datafile) instance, file content or `undefined`.

---

### readData

▸ **readData**(`path`: string, `options?`: ManagerLoadOptions): _Promise‹DataFile›_

_Defined in [module.ts:153](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L153)_

Reads file and creates `DataFile` instance using [Manager](https://www.npmjs.com/package/edit-config#class-manager).

**Parameters:**

| Name       | Type               | Description                                                                                                                                |
| ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `path`     | string             | is the path relative to module root or an absolute path.                                                                                   |
| `options?` | ManagerLoadOptions | are options passed to `Manager.load` of `edit-config`. See [here](https://www.npmjs.com/package/edit-config#interface-managerloadoptions). |

**Returns:** _Promise‹DataFile›_

---

### readRaw

▸ **readRaw**(`path`: string): _Promise‹string›_

_Defined in [module.ts:143](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L143)_

Asynchronously reads the entire contents of a file using `utf8` encoding.

**Parameters:**

| Name   | Type   | Description                                              |
| ------ | ------ | -------------------------------------------------------- |
| `path` | string | is the path relative to module root or an absolute path. |

**Returns:** _Promise‹string›_

file contents.

---

### relativePathOf

▸ **relativePathOf**(...`parts`: string[]): _string_

_Defined in [module.ts:132](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L132)_

Returns relative path to module root for given absolute path. If given path is a relative path, returns it directly.

#### Example

```typescript
module.relativePathOf("/path/to/module/src/my-file.js"); // -> src/my-file.js
module.relativePathOf("src/my-file.js"); // -> src/my-file.js
```

**Parameters:**

| Name       | Type     | Description                      |
| ---------- | -------- | -------------------------------- |
| `...parts` | string[] | are path or array of path parts. |

**Returns:** _string_

path relative to module's root.

---

### remove

▸ **remove**(`path`: string, `__namedParameters`: object): _Promise‹string | undefined›_

_Defined in [module.ts:240](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L240)_

Removes file or directory relative to module's root. Removes directory even it has files in it.
If the path does not exist, silently does nothing.

**Parameters:**

▪ **path**: _string_

is the path relative to module root or an absolute path.

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name        | Type                      |
| ----------- | ------------------------- |
| `condition` | undefined &#124; function |

**Returns:** _Promise‹string | undefined›_

file path relative to module root if file is removed, `undefined` otherwise.

---

### removeEmptyDirs

▸ **removeEmptyDirs**(`path`: string): _Promise‹string[]›_

_Defined in [module.ts:253](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L253)_

Removes empty directories recursively for given path relative to module root.

**Parameters:**

| Name   | Type   | Description                                              |
| ------ | ------ | -------------------------------------------------------- |
| `path` | string | is the path relative to module root or an absolute path. |

**Returns:** _Promise‹string[]›_

array of deleted directories.

---

### rename

▸ **rename**(`oldPath`: string, `newPath`: string, `__namedParameters`: object): _Promise‹boolean›_

_Defined in [module.ts:302](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L302)_

Renames given path.

**Parameters:**

▪ **oldPath**: _string_

is the old path relative to module root or an absolute path.

▪ **newPath**: _string_

is the new path relative to module root or an absolute path.

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name        | Type    | Default         | Description                                                                                                                                        |
| ----------- | ------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `overwrite` | boolean | this.#overwrite | is whether to allow rename operation if target path already exists. Silently ignores operation if overwrite is not allowed and target path exists. |

**Returns:** _Promise‹boolean›_

whether file is renamed.

---

### saveAll

▸ **saveAll**(): _Promise‹void›_

_Defined in [module.ts:392](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L392)_

Saves all read [data files](https://www.npmjs.com/package/edit-config#class-datafile).

**Returns:** _Promise‹void›_

---

### uninstall

▸ **uninstall**(`packageNames`: string | string[]): _Promise‹void›_

_Defined in [module.ts:420](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L420)_

Uninstalls node modules using specified package manager.

**Parameters:**

| Name           | Type                   | Default | Description                                 |
| -------------- | ---------------------- | ------- | ------------------------------------------- |
| `packageNames` | string &#124; string[] | []      | are package name or array of package names. |

**Returns:** _Promise‹void›_

---

### write

▸ **write**(`path`: string, `content`: object | string, `__namedParameters`: object): _Promise‹string | DataFile | undefined›_

_Defined in [module.ts:204](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L204)_

Writes given content to file. If content is an object, it is serialized.
If `prettier` configuration and module is available and content is formatted using `prettier`.

**Parameters:**

▪ **path**: _string_

is the path relative to module root or an absolute path.

▪`Default value` **content**: _object | string_= ""

is the content to write to file.

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name            | Type                      | Default         | Description                                                                             |
| --------------- | ------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| `condition`     | undefined &#124; function | -               | -                                                                                       |
| `defaultFormat` | "json" &#124; "yaml"      | "json"          | is the format to be used in serialization if file does not exist and content is object. |
| `overwrite`     | boolean                   | this.#overwrite | is whether to overwrite existing file.                                                  |

**Returns:** _Promise‹string | DataFile | undefined›_

written content or [[DataFile]] if file is written, `undefined` otherwise.

---

### `Static` new

▸ **new**(`options`: object): _Promise‹[Module](#classesmodulemd)›_

_Defined in [module.ts:445](https://github.com/ozum/intermodular/blob/0dfffd0/src/module.ts#L445)_

Creates and returns a [Module](#classesmodulemd) instance.

**Parameters:**

▪`Default value` **options**: _object_= {}

are options.

| Name              | Type                                     | Description                                                 |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `cwd?`            | undefined &#124; string                  | is starting directory to start search for module root from. |
| `logger?`         | Logger                                   | is Winston compatible Logger to be used when logging.       |
| `overwrite?`      | undefined &#124; false &#124; true       | -                                                           |
| `packageManager?` | [PackageManager](#enumspackagemanagermd) | is package manager used by module.                          |

**Returns:** _Promise‹[Module](#classesmodulemd)›_

[Module](#classesmodulemd) instance.

# Enums

<a name="enumsdependencytypemd"></a>

# Enumeration: DependencyType

Dependency types for Node.js modules.

## Enumeration members

### Dependencies

• **Dependencies**: = "dependencies"

_Defined in [util/types.ts:10](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L10)_

---

### DevDependencies

• **DevDependencies**: = "devDependencies"

_Defined in [util/types.ts:11](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L11)_

---

### OptionalDependencies

• **OptionalDependencies**: = "optionalDependencies"

_Defined in [util/types.ts:13](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L13)_

---

### PeerDependencies

• **PeerDependencies**: = "peerDependencies"

_Defined in [util/types.ts:12](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L12)_

<a name="enumspackagemanagermd"></a>

# Enumeration: PackageManager

Package manager

## Enumeration members

### Npm

• **Npm**: = "npm"

_Defined in [util/types.ts:4](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L4)_

---

### Yarn

• **Yarn**: = "yarn"

_Defined in [util/types.ts:5](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L5)_

# Interfaces

<a name="interfacescopyoptionsmd"></a>

# Interface: CopyOptions

Copy options based on `fs-extra` [copy](https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/copy.md) options.

## Hierarchy

- **CopyOptions**

## Properties

### `Optional` dereference

• **dereference**? : _undefined | false | true_

_Defined in [util/types.ts:51](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L51)_

Dereference symlinks, default is false.

---

### `Optional` errorOnExist

• **errorOnExist**? : _undefined | false | true_

_Defined in [util/types.ts:57](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L57)_

When overwrite is false and the destination exists, throw an error. Default is false.

---

### `Optional` filter

• **filter**? : _[CopyFilterFunction](#copyfilterfunction)_

_Defined in [util/types.ts:59](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L59)_

Function to filter copied files. Return true to include, false to exclude. Can also return a Promise that resolves to true or false (or pass in an async function)

---

### `Optional` overwrite

• **overwrite**? : _undefined | false | true_

_Defined in [util/types.ts:53](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L53)_

Overwrite existing file or directory, default is true. Note that the copy operation will silently fail if you set this to false and the destination exists. Use the errorOnExist option to change this behavior.

---

### `Optional` preserveTimestamps

• **preserveTimestamps**? : _undefined | false | true_

_Defined in [util/types.ts:55](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L55)_

When true, will set last modification and access times to the ones of the original source files. When false, timestamp behavior is OS-dependent. Default is false.

---

### `Optional` recursive

• **recursive**? : _undefined | false | true_

_Defined in [util/types.ts:61](https://github.com/ozum/intermodular/blob/0dfffd0/src/util/types.ts#L61)_

fs-extra.copy recursive option.
