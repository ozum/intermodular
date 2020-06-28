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
    - [DependencyType](#dependencytype)
    - [PackageManager](#packagemanager)
    - [PredicateFileOperation](#predicatefileoperation)
  - [Variables](#variables)
    - [`Const` ALL_DEPENDENCIES](#const-all_dependencies)
- [Classes](#classes)
- [Class: Intermodular](#class-intermodular)
  - [Hierarchy](#hierarchy)
  - [Properties](#properties)
    - [`Readonly` config](#readonly-config)
    - [`Readonly` logger](#readonly-logger)
    - [`Readonly` sourceModule](#readonly-sourcemodule)
    - [`Readonly` targetModule](#readonly-targetmodule)
  - [Methods](#methods)
    - [command](#command)
    - [copy](#copy)
    - [execute](#execute)
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
    - [cloneWithSharedManager](#clonewithsharedmanager)
    - [command](#command-1)
    - [createDirectory](#createdirectory)
    - [execute](#execute-1)
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
- [Interface: ExecuteOptions ‹**EncodingType**›](#interface-executeoptions-%E2%80%B9encodingtype%E2%80%BA)
  - [Type parameters](#type-parameters)
  - [Hierarchy](#hierarchy-3)
  - [Properties](#properties-3)
    - [`Optional` `Readonly` all](#optional-readonly-all)
    - [`Optional` `Readonly` argv0](#optional-readonly-argv0)
    - [`Optional` `Readonly` buffer](#optional-readonly-buffer)
    - [`Optional` `Readonly` cleanup](#optional-readonly-cleanup)
    - [`Optional` `Readonly` cwd](#optional-readonly-cwd)
    - [`Optional` `Readonly` detached](#optional-readonly-detached)
    - [`Optional` `Readonly` encoding](#optional-readonly-encoding)
    - [`Optional` `Readonly` env](#optional-readonly-env)
    - [`Optional` `Readonly` execPath](#optional-readonly-execpath)
    - [`Optional` exitOnProcessFailure](#optional-exitonprocessfailure)
    - [`Optional` `Readonly` extendEnv](#optional-readonly-extendenv)
    - [`Optional` `Readonly` gid](#optional-readonly-gid)
    - [`Optional` `Readonly` input](#optional-readonly-input)
    - [`Optional` `Readonly` killSignal](#optional-readonly-killsignal)
    - [`Optional` `Readonly` localDir](#optional-readonly-localdir)
    - [`Optional` `Readonly` maxBuffer](#optional-readonly-maxbuffer)
    - [`Optional` `Readonly` preferLocal](#optional-readonly-preferlocal)
    - [`Optional` `Readonly` reject](#optional-readonly-reject)
    - [`Optional` `Readonly` serialization](#optional-readonly-serialization)
    - [`Optional` `Readonly` shell](#optional-readonly-shell)
    - [`Optional` `Readonly` stderr](#optional-readonly-stderr)
    - [`Optional` `Readonly` stdin](#optional-readonly-stdin)
    - [`Optional` `Readonly` stdio](#optional-readonly-stdio)
    - [`Optional` `Readonly` stdout](#optional-readonly-stdout)
    - [`Optional` `Readonly` stripFinalNewline](#optional-readonly-stripfinalnewline)
    - [`Optional` `Readonly` timeout](#optional-readonly-timeout)
    - [`Optional` `Readonly` uid](#optional-readonly-uid)
    - [`Optional` `Readonly` windowsHide](#optional-readonly-windowshide)
    - [`Optional` `Readonly` windowsVerbatimArguments](#optional-readonly-windowsverbatimarguments)

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

_Defined in [src/util/types.ts:21](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L21)_

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

### DependencyType

Ƭ **DependencyType**: _"dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies"_

_Defined in [src/util/types.ts:8](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L8)_

Dependency types for Node.js modules.

---

### PackageManager

Ƭ **PackageManager**: _"npm" | "yarn"_

_Defined in [src/util/types.ts:5](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L5)_

Package manager

---

### PredicateFileOperation

Ƭ **PredicateFileOperation**: _function_

_Defined in [src/util/types.ts:11](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L11)_

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

• **ALL_DEPENDENCIES**: _string[]_ = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]

_Defined in [src/module.ts:11](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L11)_

# Classes

<a name="classesintermodularmd"></a>

# Class: Intermodular

## Hierarchy

- **Intermodular**

## Properties

### `Readonly` config

• **config**: _DataFile_

_Defined in [src/intermodular.ts:20](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L20)_

Configuration for source module in target module as a [DataFile](https://www.npmjs.com/package/edit-config#class-datafile) instance.

---

### `Readonly` logger

• **logger**: _Logger_

_Defined in [src/intermodular.ts:23](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L23)_

Winston compatible logger.

---

### `Readonly` sourceModule

• **sourceModule**: _[Module](#classesmodulemd)_

_Defined in [src/intermodular.ts:14](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L14)_

[Module](#classesmodulemd) instance of node module which is used as source for modification operations such as copy, update.

---

### `Readonly` targetModule

• **targetModule**: _[Module](#classesmodulemd)_

_Defined in [src/intermodular.ts:17](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L17)_

[Module](#classesmodulemd) instance of node module which is used as target for modification operations such as copy, update.

## Methods

### command

▸ **command**(`cmd`: string, `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)): _Promise‹ExecaReturnValue›_

_Defined in [src/intermodular.ts:175](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L175)_

Executes given command using `execa.command` with cwd as target module's root. Additionally adds source module's `node_modules/.bin` to path.

#### Example

```typescript
intermodular.command("ls"); // Run `ls`.
intermodular.command("ls -al", { stdio: "inherit" }); // Run `ls -al`.
```

**Parameters:**

| Name       | Type                                          | Description                                                 |
| ---------- | --------------------------------------------- | ----------------------------------------------------------- |
| `cmd`      | string                                        | is command to execute.                                      |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd) | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _Promise‹ExecaReturnValue›_

[[ExecaReturnValue]] instance.

▸ **command**(`cmd`: string, `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)‹null›): _Promise‹ExecaReturnValue‹Buffer››_

_Defined in [src/intermodular.ts:176](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L176)_

**Parameters:**

| Name       | Type                                                |
| ---------- | --------------------------------------------------- |
| `cmd`      | string                                              |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd)‹null› |

**Returns:** _Promise‹ExecaReturnValue‹Buffer››_

---

### copy

▸ **copy**(`sourcePath`: string, `targetPath`: string, `copyOptions`: [CopyOptions](#interfacescopyoptionsmd)): _Promise‹void›_

_Defined in [src/intermodular.ts:110](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L110)_

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

### execute

▸ **execute**(`bin`: string, `args?`: string[], `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)): _Promise‹ExecaReturnValue›_

_Defined in [src/intermodular.ts:139](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L139)_

Executes given command using `execa` with given arguments and options with cwd as target module's root. Applies sensible default options.
Additionally adds source module's `node_modules/.bin` to path.

#### Example

```typescript
intermodular.execute("ls"); // Run `ls`.
intermodular.execute("ls", ["-al"], { stdio: "inherit" }); // Run `ls -al`.
```

**Parameters:**

| Name       | Type                                          | Description                                                 |
| ---------- | --------------------------------------------- | ----------------------------------------------------------- |
| `bin`      | string                                        | is binary file to execute.                                  |
| `args?`    | string[]                                      | are arguments to pass to executable.                        |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd) | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _Promise‹ExecaReturnValue›_

[[ExecaReturnValue]] instance.

▸ **execute**(`bin`: string, `args?`: string[], `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)‹null›): _Promise‹ExecaReturnValue‹Buffer››_

_Defined in [src/intermodular.ts:140](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L140)_

**Parameters:**

| Name       | Type                                                |
| ---------- | --------------------------------------------------- |
| `bin`      | string                                              |
| `args?`    | string[]                                            |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd)‹null› |

**Returns:** _Promise‹ExecaReturnValue‹Buffer››_

▸ **execute**(`bin`: string, `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)): _Promise‹ExecaReturnValue›_

_Defined in [src/intermodular.ts:153](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L153)_

Executes given command using `execa` with given arguments and options with cwd as target module's root. Applies sensible default options.
Additionally adds source module's `node_modules/.bin` to path.

#### Example

```typescript
intermodular.execute("ls"); // Run `ls`.
intermodular.execute("ls", { stdio: "inherit" }); // Run `ls`.
```

**Parameters:**

| Name       | Type                                          | Description                                                 |
| ---------- | --------------------------------------------- | ----------------------------------------------------------- |
| `bin`      | string                                        | is binary file to execute.                                  |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd) | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _Promise‹ExecaReturnValue›_

[[ExecaReturnValue]] instance.

▸ **execute**(`bin`: string, `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)‹null›): _Promise‹ExecaReturnValue‹Buffer››_

_Defined in [src/intermodular.ts:154](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L154)_

**Parameters:**

| Name       | Type                                                |
| ---------- | --------------------------------------------------- |
| `bin`      | string                                              |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd)‹null› |

**Returns:** _Promise‹ExecaReturnValue‹Buffer››_

---

### log

▸ **log**(`logLevel`: LogLevel, `message`: string): _void_

_Defined in [src/intermodular.ts:38](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L38)_

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

_Defined in [src/intermodular.ts:240](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L240)_

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

_Defined in [src/intermodular.ts:197](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L197)_

Creates and returns [Intermodular](#classesintermodularmd) instance.

**Parameters:**

▪`Default value` **\_\_namedParameters**: _object_= {}

are options

| Name           | Type                                                                                                | Description                                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `commandStdio` | undefined &#124; number &#124; "pipe" &#124; "ipc" &#124; "ignore" &#124; "inherit" &#124; Stream‹› | -                                                                                                                                                      |
| `logger`       | undefined &#124; Logger                                                                             | is Winston compatible logger or `console`.                                                                                                             |
| `overwrite`    | undefined &#124; false &#124; true                                                                  | is whether to overwrite files by default.                                                                                                              |
| `source`       | undefined &#124; string &#124; [Module](#classesmodulemd)‹›                                         | is the source module or a path in source module. By default immediate parent's root dir is used. Immediate parent is the file which calls this method. |
| `target`       | undefined &#124; string &#124; [Module](#classesmodulemd)‹›                                         | is the target module or a path in target module. By default `process.env.INIT_CWD` or `process.env.CWD` is used whichever is first available.          |

**Returns:** _Promise‹[Intermodular](#classesintermodularmd)›_

[Intermodular](#classesintermodularmd) instance.

---

### `Static` parseEnv

▸ **parseEnv**‹**T**›(`variable`: string, `defaultValue?`: T): _string | number | Record‹string, any› | T | undefined_

_Defined in [src/intermodular.ts:254](https://github.com/ozum/intermodular/blob/d2a145c/src/intermodular.ts#L254)_

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

_Defined in [src/module.ts:32](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L32)_

Whether module is a TypeScript project.

---

### `Readonly` package

• **package**: _DataFile_

_Defined in [src/module.ts:29](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L29)_

[DataFile](https://www.npmjs.com/package/edit-config#class-datafile) instance of `package.json`.

---

### `Readonly` packageManager

• **packageManager**: _[PackageManager](#packagemanager)_

_Defined in [src/module.ts:26](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L26)_

Package manager of the module.

---

### `Readonly` root

• **root**: _string_

_Defined in [src/module.ts:23](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L23)_

Absolute path of the module's root directory, where `package.json` is located.

## Accessors

### name

• **get name**(): _string_

_Defined in [src/module.ts:77](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L77)_

Name of the module as defined in `package.json`.

**Returns:** _string_

---

### nameWithoutUser

• **get nameWithoutUser**(): _string_

_Defined in [src/module.ts:82](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L82)_

Name of the module without user name. For example: `typescript` for `@microsoft/typescript`.

**Returns:** _string_

## Methods

### cloneWithSharedManager

▸ **cloneWithSharedManager**(`__namedParameters`: object): _[Module](#classesmodulemd)_

_Defined in [src/module.ts:66](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L66)_

Creates a new [Module](#classesmodulemd) instance from current instance, which shares
[Data File Manager](https://www.npmjs.com/package/edit-config#manager) with current [Module](#classesmodulemd).
Multiple instance work over same files efficiently and without collision.

**Parameters:**

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name        | Type                               |
| ----------- | ---------------------------------- |
| `logger`    | undefined &#124; Logger            |
| `overwrite` | undefined &#124; false &#124; true |

**Returns:** _[Module](#classesmodulemd)_

[Module](#classesmodulemd) instance.

---

### command

▸ **command**(`cmd`: string, `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)): _Promise‹ExecaReturnValue›_

_Defined in [src/module.ts:408](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L408)_

Executes given command using `execa.command` with given options. Applies sensible default options.

#### Example

```typescript
module.command("ls"); // Run `ls`.
module.command("ls -al", { stdio: "inherit" }); // Run `ls -al`.
```

**Parameters:**

| Name       | Type                                          | Description                                                 |
| ---------- | --------------------------------------------- | ----------------------------------------------------------- |
| `cmd`      | string                                        | is command to execute.                                      |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd) | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _Promise‹ExecaReturnValue›_

[[ExecaReturnValue]] instance.

▸ **command**(`cmd`: string, `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)‹null›): _Promise‹ExecaReturnValue‹Buffer››_

_Defined in [src/module.ts:409](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L409)_

**Parameters:**

| Name       | Type                                                |
| ---------- | --------------------------------------------------- |
| `cmd`      | string                                              |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd)‹null› |

**Returns:** _Promise‹ExecaReturnValue‹Buffer››_

---

### createDirectory

▸ **createDirectory**(`path`: string): _Promise‹void›_

_Defined in [src/module.ts:308](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L308)_

Ensures that the directory exists. If the directory structure does not exist, it is created similar to `mkdir -p`.

**Parameters:**

| Name   | Type   | Description                                              |
| ------ | ------ | -------------------------------------------------------- |
| `path` | string | is the path relative to module root or an absolute path. |

**Returns:** _Promise‹void›_

---

### execute

▸ **execute**(`bin`: string, `args?`: string[], `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)): _Promise‹ExecaReturnValue›_

_Defined in [src/module.ts:364](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L364)_

Executes given command using `execa` with given arguments and options. Applies sensible default options.

#### Example

```typescript
module.execute("ls"); // Run `ls`.
module.execute("ls", ["-al"], { stdio: "inherit" }); // Run `ls -al`.
```

**Parameters:**

| Name       | Type                                          | Description                                                 |
| ---------- | --------------------------------------------- | ----------------------------------------------------------- |
| `bin`      | string                                        | is binary file to execute.                                  |
| `args?`    | string[]                                      | are arguments to pass to executable.                        |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd) | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _Promise‹ExecaReturnValue›_

[[ExecaReturnValue]] instance.

▸ **execute**(`bin`: string, `args?`: string[], `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)‹null›): _Promise‹ExecaReturnValue‹Buffer››_

_Defined in [src/module.ts:365](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L365)_

**Parameters:**

| Name       | Type                                                |
| ---------- | --------------------------------------------------- |
| `bin`      | string                                              |
| `args?`    | string[]                                            |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd)‹null› |

**Returns:** _Promise‹ExecaReturnValue‹Buffer››_

▸ **execute**(`bin`: string, `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)): _Promise‹ExecaReturnValue›_

_Defined in [src/module.ts:377](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L377)_

Executes given command using `execa` with given arguments and options. Applies sensible default options.

#### Example

```typescript
module.execute("ls"); // Run `ls`.
module.execute("ls", { stdio: "inherit" }); // Run `ls`.
```

**Parameters:**

| Name       | Type                                          | Description                                                 |
| ---------- | --------------------------------------------- | ----------------------------------------------------------- |
| `bin`      | string                                        | is binary file to execute.                                  |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd) | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _Promise‹ExecaReturnValue›_

[[ExecaReturnValue]] instance.

▸ **execute**(`bin`: string, `options?`: [ExecuteOptions](#interfacesexecuteoptionsmd)‹null›): _Promise‹ExecaReturnValue‹Buffer››_

_Defined in [src/module.ts:378](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L378)_

**Parameters:**

| Name       | Type                                                |
| ---------- | --------------------------------------------------- |
| `bin`      | string                                              |
| `options?` | [ExecuteOptions](#interfacesexecuteoptionsmd)‹null› |

**Returns:** _Promise‹ExecaReturnValue‹Buffer››_

---

### exists

▸ **exists**(`path`: string): _Promise‹boolean›_

_Defined in [src/module.ts:283](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L283)_

Checks whether given path exists.

**Parameters:**

| Name   | Type   | Description                                              |
| ------ | ------ | -------------------------------------------------------- |
| `path` | string | is the path relative to module root or an absolute path. |

**Returns:** _Promise‹boolean›_

whether given path exists.

---

### getDependencyVersion

▸ **getDependencyVersion**(`moduleName`: string, `dependencyTypes`: string[]): _string | undefined_

_Defined in [src/module.ts:93](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L93)_

Fetches a dependent module's version from given [dependency types](#dependencytype).

**Parameters:**

| Name              | Type     | Default          | Description                                        |
| ----------------- | -------- | ---------------- | -------------------------------------------------- |
| `moduleName`      | string   | -                | is the name of the module to get version of.       |
| `dependencyTypes` | string[] | ALL_DEPENDENCIES | are array of dependency types to search module in. |

**Returns:** _string | undefined_

version of the `moduleName` || undefined.

---

### hasAnyDependency

▸ **hasAnyDependency**(`moduleNames`: string | string[], `dependencyTypes`: string[]): _boolean_

_Defined in [src/module.ts:105](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L105)_

Checks whether given module or any of the modules exist in given [dependency types](#dependencytype).

**Parameters:**

| Name              | Type                   | Default          | Description                                        |
| ----------------- | ---------------------- | ---------------- | -------------------------------------------------- |
| `moduleNames`     | string &#124; string[] | -                | are the name of the module to search for.          |
| `dependencyTypes` | string[]               | ALL_DEPENDENCIES | are array of dependency types to search module in. |

**Returns:** _boolean_

whether `moduleName` exists in one of the dependency types.

---

### ifAnyDependency

▸ **ifAnyDependency**‹**T**, **F**›(`moduleNames`: string | string[]): _boolean_

_Defined in [src/module.ts:109](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L109)_

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

_Defined in [src/module.ts:110](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L110)_

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

▸ **ifAnyDependency**‹**T**, **F**›(`moduleNames`: string | string[], `t`: T, `f`: F, `dependencyTypes?`: [DependencyType](#dependencytype)[]): _T | F_

_Defined in [src/module.ts:111](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L111)_

Checks single or multiple module's existence in any of the `package.json` dependencies.

**Type parameters:**

▪ **T**

▪ **F**

**Parameters:**

| Name               | Type                                |
| ------------------ | ----------------------------------- |
| `moduleNames`      | string &#124; string[]              |
| `t`                | T                                   |
| `f`                | F                                   |
| `dependencyTypes?` | [DependencyType](#dependencytype)[] |

**Returns:** _T | F_

`trueValue` if module depends on any of the `moduleNames`. Otherwise returns `falseValue`.

---

### install

▸ **install**(`packageNames`: string | string[], `__namedParameters`: object): _Promise‹void›_

_Defined in [src/module.ts:435](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L435)_

Installs node modules using specified package manager.

**Parameters:**

▪`Default value` **packageNames**: _string | string[]_= []

are package name or array of package names.

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name   | Type                                                                                            | Default                          | Description                                                           |
| ------ | ----------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| `type` | "dependencies" &#124; "devDependencies" &#124; "peerDependencies" &#124; "optionalDependencies" | "dependencies" as DependencyType | is the dependency type of the package. `dev`, `peer`, `optional` etc. |

**Returns:** _Promise‹void›_

---

### isDirectory

▸ **isDirectory**(`path`: string): _Promise‹boolean›_

_Defined in [src/module.ts:293](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L293)_

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

_Defined in [src/module.ts:347](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L347)_

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

_Defined in [src/module.ts:135](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L135)_

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

_Defined in [src/module.ts:185](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L185)_

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

_Defined in [src/module.ts:171](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L171)_

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

_Defined in [src/module.ts:161](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L161)_

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

_Defined in [src/module.ts:150](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L150)_

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

_Defined in [src/module.ts:258](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L258)_

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

_Defined in [src/module.ts:271](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L271)_

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

_Defined in [src/module.ts:320](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L320)_

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

_Defined in [src/module.ts:424](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L424)_

Saves all read [data files](https://www.npmjs.com/package/edit-config#class-datafile).

**Returns:** _Promise‹void›_

---

### uninstall

▸ **uninstall**(`packageNames`: string | string[]): _Promise‹void›_

_Defined in [src/module.ts:455](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L455)_

Uninstalls node modules using specified package manager.

**Parameters:**

| Name           | Type                   | Default | Description                                 |
| -------------- | ---------------------- | ------- | ------------------------------------------- |
| `packageNames` | string &#124; string[] | []      | are package name or array of package names. |

**Returns:** _Promise‹void›_

---

### write

▸ **write**(`path`: string, `content`: object | string, `__namedParameters`: object): _Promise‹string | DataFile | undefined›_

_Defined in [src/module.ts:222](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L222)_

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

_Defined in [src/module.ts:482](https://github.com/ozum/intermodular/blob/d2a145c/src/module.ts#L482)_

Creates and returns a [Module](#classesmodulemd) instance.

**Parameters:**

▪`Default value` **options**: _object_= {}

are options.

| Name              | Type                               | Description                                                                    |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| `commandStdio?`   | StdioOption                        | is the default `stdio` option to be used with `command` and `execute` methods. |
| `cwd?`            | undefined &#124; string            | is starting directory to start search for module root from.                    |
| `logger?`         | Logger                             | is Winston compatible Logger to be used when logging.                          |
| `overwrite?`      | undefined &#124; false &#124; true | is whether to overwrite files by default.                                      |
| `packageManager?` | [PackageManager](#packagemanager)  | is package manager used by module.                                             |

**Returns:** _Promise‹[Module](#classesmodulemd)›_

[Module](#classesmodulemd) instance.

# Interfaces

<a name="interfacescopyoptionsmd"></a>

# Interface: CopyOptions

Copy options based on `fs-extra` [copy](https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/copy.md) options.

## Hierarchy

- **CopyOptions**

## Properties

### `Optional` dereference

• **dereference**? : _undefined | false | true_

_Defined in [src/util/types.ts:45](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L45)_

Dereference symlinks, default is false.

---

### `Optional` errorOnExist

• **errorOnExist**? : _undefined | false | true_

_Defined in [src/util/types.ts:51](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L51)_

When overwrite is false and the destination exists, throw an error. Default is false.

---

### `Optional` filter

• **filter**? : _[CopyFilterFunction](#copyfilterfunction)_

_Defined in [src/util/types.ts:53](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L53)_

Function to filter copied files. Return true to include, false to exclude. Can also return a Promise that resolves to true or false (or pass in an async function)

---

### `Optional` overwrite

• **overwrite**? : _undefined | false | true_

_Defined in [src/util/types.ts:47](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L47)_

Overwrite existing file or directory, default is true. Note that the copy operation will silently fail if you set this to false and the destination exists. Use the errorOnExist option to change this behavior.

---

### `Optional` preserveTimestamps

• **preserveTimestamps**? : _undefined | false | true_

_Defined in [src/util/types.ts:49](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L49)_

When true, will set last modification and access times to the ones of the original source files. When false, timestamp behavior is OS-dependent. Default is false.

---

### `Optional` recursive

• **recursive**? : _undefined | false | true_

_Defined in [src/util/types.ts:55](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L55)_

fs-extra.copy recursive option.

<a name="interfacesexecuteoptionsmd"></a>

# Interface: ExecuteOptions ‹**EncodingType**›

Extended options for `module.execute` and `module.command`

## Type parameters

▪ **EncodingType**

## Hierarchy

- Options‹EncodingType›

  ↳ **ExecuteOptions**

## Properties

### `Optional` `Readonly` all

• **all**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[all](#optional-readonly-all)_

Defined in node_modules/execa/index.d.ts:96

Add an `.all` property on the promise and the resolved value. The property contains the output of the process with `stdout` and `stderr` interleaved.

**`default`** false

---

### `Optional` `Readonly` argv0

• **argv0**? : _undefined | string_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[argv0](#optional-readonly-argv0)_

Defined in node_modules/execa/index.d.ts:129

Explicitly set the value of `argv[0]` sent to the child process. This will be set to `command` or `file` if not specified.

---

### `Optional` `Readonly` buffer

• **buffer**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[buffer](#optional-readonly-buffer)_

Defined in node_modules/execa/index.d.ts:61

Buffer the output from the spawned process. When set to `false`, you must read the output of `stdout` and `stderr` (or `all` if the `all` option is `true`). Otherwise the returned promise will not be resolved/rejected.

If the spawned process fails, `error.stdout`, `error.stderr`, and `error.all` will contain the buffered data.

**`default`** true

---

### `Optional` `Readonly` cleanup

• **cleanup**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[cleanup](#optional-readonly-cleanup)_

Defined in node_modules/execa/index.d.ts:23

Kill the spawned process when the parent process exits unless either:

- the spawned process is [`detached`](https://nodejs.org/api/child_process.html#child_process_options_detached)
- the parent process is terminated abruptly, for example, with `SIGKILL` as opposed to `SIGTERM` or a normal exit

**`default`** true

---

### `Optional` `Readonly` cwd

• **cwd**? : _undefined | string_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[cwd](#optional-readonly-cwd)_

Defined in node_modules/execa/index.d.ts:117

Current working directory of the child process.

**`default`** process.cwd()

---

### `Optional` `Readonly` detached

• **detached**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[detached](#optional-readonly-detached)_

Defined in node_modules/execa/index.d.ts:156

Prepare child to run independently of its parent process. Specific behavior [depends on the platform](https://nodejs.org/api/child_process.html#child_process_options_detached).

**`default`** false

---

### `Optional` `Readonly` encoding

• **encoding**? : _EncodingType_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[encoding](#optional-readonly-encoding)_

Defined in node_modules/execa/index.d.ts:185

Specify the character encoding used to decode the `stdout` and `stderr` output. If set to `null`, then `stdout` and `stderr` will be a `Buffer` instead of a string.

**`default`** 'utf8'

---

### `Optional` `Readonly` env

• **env**? : _NodeJS.ProcessEnv_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[env](#optional-readonly-env)_

Defined in node_modules/execa/index.d.ts:124

Environment key-value pairs. Extends automatically from `process.env`. Set `extendEnv` to `false` if you don't want this.

**`default`** process.env

---

### `Optional` `Readonly` execPath

• **execPath**? : _undefined | string_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[execPath](#optional-readonly-execpath)_

Defined in node_modules/execa/index.d.ts:52

Path to the Node.js executable to use in child processes.

This can be either an absolute path or a path relative to the `cwd` option.

Requires `preferLocal` to be `true`.

For example, this can be used together with [`get-node`](https://github.com/ehmicky/get-node) to run a specific Node.js version in a child process.

**`default`** process.execPath

---

### `Optional` exitOnProcessFailure

• **exitOnProcessFailure**? : _undefined | false | true_

_Defined in [src/util/types.ts:61](https://github.com/ozum/intermodular/blob/d2a145c/src/util/types.ts#L61)_

Exits using `process.exit(errCode)` if error is originated from shell. Otherwise throws as usual. Errors originated from node.js always throw.

---

### `Optional` `Readonly` extendEnv

• **extendEnv**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[extendEnv](#optional-readonly-extendenv)_

Defined in node_modules/execa/index.d.ts:110

Set to `false` if you don't want to extend the environment variables when providing the `env` property.

**`default`** true

---

### `Optional` `Readonly` gid

• **gid**? : _undefined | number_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[gid](#optional-readonly-gid)_

Defined in node_modules/execa/index.d.ts:166

Sets the group identity of the process.

---

### `Optional` `Readonly` input

• **input**? : _string | Buffer | ReadableStream_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[input](#optional-readonly-input)_

Defined in node_modules/execa/index.d.ts:227

Write some input to the `stdin` of your binary.

---

### `Optional` `Readonly` killSignal

• **killSignal**? : _string | number_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[killSignal](#optional-readonly-killsignal)_

Defined in node_modules/execa/index.d.ts:206

Signal value to be used when the spawned process will be killed.

**`default`** 'SIGTERM'

---

### `Optional` `Readonly` localDir

• **localDir**? : _undefined | string_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[localDir](#optional-readonly-localdir)_

Defined in node_modules/execa/index.d.ts:39

Preferred path to find locally installed binaries in (use with `preferLocal`).

**`default`** process.cwd()

---

### `Optional` `Readonly` maxBuffer

• **maxBuffer**? : _undefined | number_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[maxBuffer](#optional-readonly-maxbuffer)_

Defined in node_modules/execa/index.d.ts:199

Largest amount of data in bytes allowed on `stdout` or `stderr`. Default: 100 MB.

**`default`** 100_000_000

---

### `Optional` `Readonly` preferLocal

• **preferLocal**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[preferLocal](#optional-readonly-preferlocal)_

Defined in node_modules/execa/index.d.ts:32

Prefer locally installed binaries when looking for a binary to execute.

If you `$ npm install foo`, you can then `execa('foo')`.

**`default`** false

---

### `Optional` `Readonly` reject

• **reject**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[reject](#optional-readonly-reject)_

Defined in node_modules/execa/index.d.ts:89

Setting this to `false` resolves the promise with the error instead of rejecting it.

**`default`** true

---

### `Optional` `Readonly` serialization

• **serialization**? : _"json" | "advanced"_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[serialization](#optional-readonly-serialization)_

Defined in node_modules/execa/index.d.ts:149

Specify the kind of serialization used for sending messages between processes when using the `stdio: 'ipc'` option or `execa.node()`:

- `json`: Uses `JSON.stringify()` and `JSON.parse()`.
- `advanced`: Uses [`v8.serialize()`](https://nodejs.org/api/v8.html#v8_v8_serialize_value)

Requires Node.js `13.2.0` or later.

[More info.](https://nodejs.org/api/child_process.html#child_process_advanced_serialization)

**`default`** 'json'

---

### `Optional` `Readonly` shell

• **shell**? : _boolean | string_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[shell](#optional-readonly-shell)_

Defined in node_modules/execa/index.d.ts:178

If `true`, runs `command` inside of a shell. Uses `/bin/sh` on UNIX and `cmd.exe` on Windows. A different shell can be specified as a string. The shell should understand the `-c` switch on UNIX or `/d /s /c` on Windows.

We recommend against using this option since it is:

- not cross-platform, encouraging shell-specific syntax.
- slower, because of the additional shell interpretation.
- unsafe, potentially allowing command injection.

**`default`** false

---

### `Optional` `Readonly` stderr

• **stderr**? : _StdioOption_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[stderr](#optional-readonly-stderr)_

Defined in node_modules/execa/index.d.ts:82

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

**`default`** 'pipe'

---

### `Optional` `Readonly` stdin

• **stdin**? : _StdioOption_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[stdin](#optional-readonly-stdin)_

Defined in node_modules/execa/index.d.ts:68

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

**`default`** 'pipe'

---

### `Optional` `Readonly` stdio

• **stdio**? : _"pipe" | "ignore" | "inherit" | keyof StdioOption[]_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[stdio](#optional-readonly-stdio)_

Defined in node_modules/execa/index.d.ts:136

Child's [stdio](https://nodejs.org/api/child_process.html#child_process_options_stdio) configuration.

**`default`** 'pipe'

---

### `Optional` `Readonly` stdout

• **stdout**? : _StdioOption_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[stdout](#optional-readonly-stdout)_

Defined in node_modules/execa/index.d.ts:75

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

**`default`** 'pipe'

---

### `Optional` `Readonly` stripFinalNewline

• **stripFinalNewline**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[stripFinalNewline](#optional-readonly-stripfinalnewline)_

Defined in node_modules/execa/index.d.ts:103

Strip the final [newline character](https://en.wikipedia.org/wiki/Newline) from the output.

**`default`** true

---

### `Optional` `Readonly` timeout

• **timeout**? : _undefined | number_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[timeout](#optional-readonly-timeout)_

Defined in node_modules/execa/index.d.ts:192

If `timeout` is greater than `0`, the parent will send the signal identified by the `killSignal` property (the default is `SIGTERM`) if the child runs longer than `timeout` milliseconds.

**`default`** 0

---

### `Optional` `Readonly` uid

• **uid**? : _undefined | number_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[uid](#optional-readonly-uid)_

Defined in node_modules/execa/index.d.ts:161

Sets the user identity of the process.

---

### `Optional` `Readonly` windowsHide

• **windowsHide**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[windowsHide](#optional-readonly-windowshide)_

Defined in node_modules/execa/index.d.ts:220

On Windows, do not create a new console window. Please note this also prevents `CTRL-C` [from working](https://github.com/nodejs/node/issues/29837) on Windows.

**`default`** true

---

### `Optional` `Readonly` windowsVerbatimArguments

• **windowsVerbatimArguments**? : _undefined | false | true_

_Inherited from [ExecuteOptions](#interfacesexecuteoptionsmd).[windowsVerbatimArguments](#optional-readonly-windowsverbatimarguments)_

Defined in node_modules/execa/index.d.ts:213

If `true`, no quoting or escaping of arguments is done on Windows. Ignored on other platforms. This is set to `true` automatically when the `shell` option is `true`.

**`default`** false
