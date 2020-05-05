# Intermodular

Easy file operations between node.js modules and auto logging to help building zero-config boilerplates, postinstall and other scripts.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Synopsis](#synopsis)
- [API](#api)
- [intermodular](#intermodular)
  - [Type aliases](#type-aliases)
    - [Command](#command)
    - [ExecaCommandSync](#execacommandsync)
    - [FileFormat](#fileformat)
    - [JSONData](#jsondata)
    - [ParallelCommands](#parallelcommands)
    - [SerialCommands](#serialcommands)
  - [Functions](#functions)
    - [getFilteredArray](#getfilteredarray)
- [Classes](#classes)
- [Class: CommandResults](#class-commandresults)
  - [Hierarchy](#hierarchy)
  - [Properties](#properties)
    - [exit](#exit)
    - [`Readonly` results](#readonly-results)
  - [Accessors](#accessors)
    - [status](#status)
  - [Methods](#methods)
    - [add](#add)
- [Class: DataFile <**T**>](#class-datafile-t)
  - [Type parameters](#type-parameters)
  - [Hierarchy](#hierarchy-1)
  - [Properties](#properties-1)
    - [data](#data)
    - [`Readonly` format](#readonly-format)
  - [Methods](#methods-1)
    - [assign](#assign)
    - [delete](#delete)
    - [get](#get)
    - [getModifiedKeys](#getmodifiedkeys)
    - [has](#has)
    - [orderKeys](#orderkeys)
    - [orderKeysOf](#orderkeysof)
    - [saveSync](#savesync)
    - [set](#set)
- [Class: Intermodular](#class-intermodular)
  - [Hierarchy](#hierarchy-2)
  - [Constructors](#constructors)
    - [constructor](#constructor)
  - [Properties](#properties-2)
    - [`Optional` `Readonly` myRoot](#optional-readonly-myroot)
    - [`Optional` `Readonly` parentModuleRoot](#optional-readonly-parentmoduleroot)
    - [`Readonly` sourceModule](#readonly-sourcemodule)
    - [`Readonly` targetModule](#readonly-targetmodule)
  - [Methods](#methods-2)
    - [copySync](#copysync)
    - [log](#log)
    - [logIfDefined](#logifdefined)
    - [`Static` isEnvSet](#static-isenvset)
    - [`Static` parseEnv](#static-parseenv)
    - [`Static` resolveModuleRoot](#static-resolvemoduleroot)
- [Class: Module](#class-module)
  - [Hierarchy](#hierarchy-3)
  - [Properties](#properties-3)
    - [config](#config)
    - [package](#package)
    - [`Readonly` root](#readonly-root)
    - [`Optional` tsConfig](#optional-tsconfig)
  - [Accessors](#accessors-1)
    - [isCompiled](#iscompiled)
    - [isTypeScript](#istypescript)
    - [name](#name)
    - [nameWithoutUser](#namewithoutuser)
    - [safeName](#safename)
  - [Methods](#methods-3)
    - [bin](#bin)
    - [executeAllSync](#executeallsync)
    - [executeAllWithOptionsSync](#executeallwithoptionssync)
    - [executeSync](#executesync)
    - [existsSync](#existssync)
    - [getDataFileSync](#getdatafilesync)
    - [getDependencyVersion](#getdependencyversion)
    - [getPrettierConfigSync](#getprettierconfigsync)
    - [hasAnyDependency](#hasanydependency)
    - [ifAnyDependency](#ifanydependency)
    - [install](#install)
    - [isEqual](#isequal)
    - [parseSync](#parsesync)
    - [parseWithFormatSync](#parsewithformatsync)
    - [pathOf](#pathof)
    - [readSync](#readsync)
    - [reload](#reload)
    - [removeEmptyDirsSync](#removeemptydirssync)
    - [removeSync](#removesync)
    - [renameSync](#renamesync)
    - [resolveBin](#resolvebin)
    - [uninstall](#uninstall)
    - [writeSync](#writesync)
- [Enums](#enums)
- [Enumeration: DependencyType](#enumeration-dependencytype)
  - [Enumeration members](#enumeration-members)
    - [Dependencies](#dependencies)
    - [DevDependencies](#devdependencies)
    - [OptionalDependencies](#optionaldependencies)
    - [PeerDependencies](#peerdependencies)
- [Enumeration: LogLevel](#enumeration-loglevel)
  - [Enumeration members](#enumeration-members-1)
    - [Debug](#debug)
    - [Error](#error)
    - [Info](#info)
    - [Silly](#silly)
    - [Verbose](#verbose)
    - [Warn](#warn)
- [Interfaces](#interfaces)
- [Interface: ExecuteAllSyncOptions <**EncodingType**>](#interface-executeallsyncoptions-encodingtype)
  - [Type parameters](#type-parameters-1)
  - [Hierarchy](#hierarchy-4)
  - [Properties](#properties-4)
    - [`Optional` `Readonly` all](#optional-readonly-all)
    - [`Optional` `Readonly` argv0](#optional-readonly-argv0)
    - [`Optional` `Readonly` buffer](#optional-readonly-buffer)
    - [`Optional` `Readonly` cleanup](#optional-readonly-cleanup)
    - [`Optional` `Readonly` cwd](#optional-readonly-cwd)
    - [`Optional` `Readonly` detached](#optional-readonly-detached)
    - [`Optional` `Readonly` encoding](#optional-readonly-encoding)
    - [`Optional` `Readonly` env](#optional-readonly-env)
    - [`Optional` `Readonly` execPath](#optional-readonly-execpath)
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
    - [`Optional` stopOnError](#optional-stoponerror)
    - [`Optional` `Readonly` stripFinalNewline](#optional-readonly-stripfinalnewline)
    - [`Optional` throwOnError](#optional-throwonerror)
    - [`Optional` `Readonly` timeout](#optional-readonly-timeout)
    - [`Optional` `Readonly` uid](#optional-readonly-uid)
    - [`Optional` `Readonly` windowsHide](#optional-readonly-windowshide)
    - [`Optional` `Readonly` windowsVerbatimArguments](#optional-readonly-windowsverbatimarguments)
- [Interface: ExtendedCopyOptionsSync](#interface-extendedcopyoptionssync)
  - [Hierarchy](#hierarchy-5)
  - [Properties](#properties-5)
    - [`Optional` dereference](#optional-dereference)
    - [`Optional` errorOnExist](#optional-erroronexist)
    - [`Optional` filter](#optional-filter)
    - [`Optional` ifEqual](#optional-ifequal)
    - [`Optional` ifNotEqual](#optional-ifnotequal)
    - [`Optional` overwrite](#optional-overwrite)
    - [`Optional` preserveTimestamps](#optional-preservetimestamps)
    - [`Optional` recursive](#optional-recursive)
- [Interface: ModifyCondition](#interface-modifycondition)
  - [Hierarchy](#hierarchy-6)
  - [Properties](#properties-6)
    - [`Optional` ifEqual](#optional-ifequal-1)
    - [`Optional` ifExists](#optional-ifexists)
    - [`Optional` ifNotEqual](#optional-ifnotequal-1)
    - [`Optional` ifNotExists](#optional-ifnotexists)

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

<a name="readmemd"></a>

# intermodular

## Type aliases

### Command

Ƭ **Command**: _string | [string, string[]]_

_Defined in [src/types/index.ts:60](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L60)_

Type for providing CLI command. It may either

- a string to store executable name without arguments.
- an array with two elements, whose first element is executable name, and second element is array of arguments to pass to executable.

#### Example

```typescript
const bin = "tsc";
const binWithArgs = ["tsc", ["--strict", "--target", "ESNext"]];
```

---

### ExecaCommandSync

Ƭ **ExecaCommandSync**: _[Command](#command) | [string, string[], SyncOptions] | [string, string[], SyncOptions‹null›] | [string, SyncOptions] | [string, SyncOptions‹null›]_

_Defined in [src/types/index.ts:44](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L44)_

Type for providing CLI command to pass to execa. It may either

- a string to store executable name without arguments.
- an array with two elements, whose first element is executable name, and second element is either array of arguments to pass to executable or options to pass to execa.
- an array with three elements, whose first element is executable name, second element is array of arguments to pass to executable and third element is options to pass to execa.

#### Example

```typescript
const bin = "tsc";
const binWithArgs = ["tsc", ["--strict", "--target", "ESNext"]];
const binWithOptions = ["tsc", { encoding: "utf-8" }];
const binWithAll = ["tsc", ["--strict", "--target", "ESNext"], { encoding: "utf-8" }];
```

---

### FileFormat

Ƭ **FileFormat**: _"json" | "yaml"_

_Defined in [src/types/index.ts:89](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L89)_

Supported file formats for parsing and data files.

---

### JSONData

Ƭ **JSONData**: _Primitive | JSONObject | JSONArray_

_Defined in [src/types/index.ts:26](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L26)_

Data type which represents JSON Data.

---

### ParallelCommands

Ƭ **ParallelCommands**: _Record‹string, [Command](#command) | null | undefined›_

_Defined in [src/types/index.ts:70](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L70)_

Array of CLI commands to execute concurrently in parallel.

---

### SerialCommands

Ƭ **SerialCommands**: _string | [string, string[]] | [string, string[], SyncOptions‹string›] | [string, string[], SyncOptions‹null›] | [string, SyncOptions‹string›] | [string, SyncOptions‹null›] | object[]_

_Defined in [src/types/index.ts:65](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L65)_

Array of CLI commands to execute serially.

## Functions

### getFilteredArray

▸ **getFilteredArray**(`array`: string[], `__namedParameters`: object): _string[]_

_Defined in [src/util.ts:189](https://github.com/ozum/intermodular/blob/9259634/src/util.ts#L189)_

Filters an array based on starting strings of its elements and returns filtered array as a new array.

**Parameters:**

▪ **array**: _string[]_

is array to be filtered.

▪ **\_\_namedParameters**: _object_

| Name      | Type                   | Default | Description                                                                 |
| --------- | ---------------------- | ------- | --------------------------------------------------------------------------- |
| `exclude` | string &#124; string[] | []      | is string or array of strings, of which elements starting with is excluded. |
| `include` | string &#124; string[] | []      | is string or array of strings, of which elements starting with is included. |

**Returns:** _string[]_

filtered array.

# Classes

<a name="classescommandresultsmd"></a>

# Class: CommandResults

Class to access status and error objects of executed CLI commands.

## Hierarchy

- **CommandResults**

## Properties

### exit

• **exit**: _boolean_ = true

_Defined in [src/command-results.ts:18](https://github.com/ozum/intermodular/blob/9259634/src/command-results.ts#L18)_

Whether to exit from command.

---

### `Readonly` results

• **results**: _ExecaSyncReturnValue[]_ = []

_Defined in [src/command-results.ts:13](https://github.com/ozum/intermodular/blob/9259634/src/command-results.ts#L13)_

Results of the executed commands. May be used to access `status` and `error`.

## Accessors

### status

• **get status**(): _number | null_

_Defined in [src/command-results.ts:42](https://github.com/ozum/intermodular/blob/9259634/src/command-results.ts#L42)_

Overall status of the commands. If multiple commands are executed, contains first non-zero exit status code.
If all commands are completed without error, this is `0`.

**Returns:** _number | null_

## Methods

### add

▸ **add**(`execaReturns`: ExecaSyncReturnValue | ExecaSyncError): _void_

_Defined in [src/command-results.ts:26](https://github.com/ozum/intermodular/blob/9259634/src/command-results.ts#L26)_

Add `result` to the command results.

**Parameters:**

| Name           | Type                                       |
| -------------- | ------------------------------------------ |
| `execaReturns` | ExecaSyncReturnValue &#124; ExecaSyncError |

**Returns:** _void_

<a name="classesdatafilemd"></a>

# Class: DataFile <**T**>

Makes easier to work with data files by providing data level attributes and methods.

## Type parameters

▪ **T**: _Record‹string, any›_

## Hierarchy

- **DataFile**

## Properties

### data

• **data**: _T_

_Defined in [src/data-file.ts:57](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L57)_

Data contained in file as a JavaScript object. This data is serialized and written to disk when [saveSync](#savesync) method is executed.

---

### `Readonly` format

• **format**: _[FileFormat](#fileformat)_

_Defined in [src/data-file.ts:52](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L52)_

Data format of the file

## Methods

### assign

▸ **assign**(`data`: Record‹string, any›, `conditions?`: [ModifyCondition](#interfacesmodifyconditionmd)): _this_

_Defined in [src/data-file.ts:225](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L225)_

Merges all keys and values of `data` shallowly into root of file data.
Different to object assign, keys may be merged conditionally such as `ifExists` or `ifNotExists`.

#### Example

```typescript
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.assign({ name: "some-module", version: "1.0.0" }, { ifNotExists: true });
```

**Parameters:**

| Name          | Type                                            | Description                                                             |
| ------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| `data`        | Record‹string, any›                             | is the object to merge given path.                                      |
| `conditions?` | [ModifyCondition](#interfacesmodifyconditionmd) | should be met to apply a modifications for each key/value individually. |

**Returns:** _this_

▸ **assign**(`path`: string | string[] | undefined, `data`: string | Record‹string, any›, `conditions?`: [ModifyCondition](#interfacesmodifyconditionmd)): _this_

_Defined in [src/data-file.ts:237](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L237)_

Merges all keys and values of `data` shallowly into `path` of file data. If a portion of path doesn't exist, it's created.
Different to object assign, keys may be merged conditionally such as `ifExists` or `ifNotExists`.

#### Example

```typescript
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.assign("scripts", { build: "tsc", test: "jest" }, { ifNotExists: true });
```

**Parameters:**

| Name          | Type                                            | Description                                                             |
| ------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| `path`        | string &#124; string[] &#124; undefined         | is data path of the property to delete.                                 |
| `data`        | string &#124; Record‹string, any›               | is the object to merge given path.                                      |
| `conditions?` | [ModifyCondition](#interfacesmodifyconditionmd) | should be met to apply a modifications for each key/value individually. |

**Returns:** _this_

---

### delete

▸ **delete**(`path`: string | string[], `conditions?`: [ModifyCondition](#interfacesmodifyconditionmd)): _this_

_Defined in [src/data-file.ts:207](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L207)_

Deletes the property at `path` of file data.

#### Example

```typescript
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.delete("script.build").delete(["scripts", "test"]);
```

**Parameters:**

| Name          | Type                                            | Description                                           |
| ------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `path`        | string &#124; string[]                          | is data path of the property to delete.               |
| `conditions?` | [ModifyCondition](#interfacesmodifyconditionmd) | should be met to apply a modification to a key/value. |

**Returns:** _this_

---

### get

▸ **get**(`path`: string | string[], `defaultValue?`: any): _any_

_Defined in [src/data-file.ts:165](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L165)_

Gets the value at `path` of file data. If the resolved value is undefined, the `defaultValue` is returned in its place.

#### Example

```typescript
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.get("script.build");
packageJson.get(["script", "build"]);
```

**Parameters:**

| Name            | Type                   | Description                                      |
| --------------- | ---------------------- | ------------------------------------------------ |
| `path`          | string &#124; string[] | is data path of the property to get.             |
| `defaultValue?` | any                    | is value to get if path does not exists on data. |

**Returns:** _any_

data stored in given object path or default value.

---

### getModifiedKeys

▸ **getModifiedKeys**(`__namedParameters`: object): _object_

_Defined in [src/data-file.ts:281](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L281)_

Returns deleted and modified keys (paths) in data file. Keys may be filtered by required condition.

#### Example

```typescript
dataFile.getModifiedKeys({ include: "scripts", exclude: ["scripts.validate", "scripts.docs"] });
```

**Parameters:**

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name      | Type                                    | Description                                                             |
| --------- | --------------------------------------- | ----------------------------------------------------------------------- |
| `exclude` | undefined &#124; string &#124; string[] | is string or array of strings, of which keys starting with is excluded. |
| `include` | undefined &#124; string &#124; string[] | is string or array of strings, of which keys starting with is included. |

**Returns:** _object_

modified keys

- **deleted**: _string[]_

- **set**: _string[]_

---

### has

▸ **has**(`path`: string | string[]): _boolean_

_Defined in [src/data-file.ts:150](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L150)_

Returns whether given `path` exists in file data.

#### Example

```typescript
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.has("script.build");
packageJson.has(["script", "build"]);
```

**Parameters:**

| Name   | Type                   | Description                            |
| ------ | ---------------------- | -------------------------------------- |
| `path` | string &#124; string[] | is data path of the property to check. |

**Returns:** _boolean_

whether path exists.

---

### orderKeys

▸ **orderKeys**(`keys?`: keyof T[]): _this_

_Defined in [src/data-file.ts:300](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L300)_

When keys/values added which are previously does not exist, they are added to the end of the file during file write.
This method allows reordering of the keys. `keys` are placed at the beginning in given order whereas remaining keys
of the object comes in their order of position.

#### Example

```typescript
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.orderKeys(["name", "version", "description", "keywords", "scripts"]); // Other keys come after.
```

**Parameters:**

| Name    | Type      | Description                                                     |
| ------- | --------- | --------------------------------------------------------------- |
| `keys?` | keyof T[] | are ordered keys to appear at the beginning of file when saved. |

**Returns:** _this_

---

### orderKeysOf

▸ **orderKeysOf**(`path`: string | string[], `keys?`: string[]): _this_

_Defined in [src/data-file.ts:316](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L316)_

When keys/values added which are previously does not exist, they are added to the end of the file during file write.
This method allows reordering of the keys in given path. `keys` are placed at the beginning in given order whereas remaining keys
of the object comes in their order of position.

#### Example

```typescript
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.orderKeysOf("scripts", ["build", "lint"]); // Other keys come after.
```

**Parameters:**

| Name    | Type                   | Description                                                           |
| ------- | ---------------------- | --------------------------------------------------------------------- |
| `path`  | string &#124; string[] | is data path of the property to order keys of.                        |
| `keys?` | string[]               | are ordered keys to appear at the beginning of given path when saved. |

**Returns:** _this_

---

### saveSync

▸ **saveSync**(`__namedParameters`: object): _this_

_Defined in [src/data-file.ts:126](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L126)_

Saves file if it is modified. Use `force` options to save unmodified files.

**Parameters:**

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name    | Type    | Default | Description                                         |
| ------- | ------- | ------- | --------------------------------------------------- |
| `force` | boolean | false   | forces file to be saved even when it is unmodified. |

**Returns:** _this_

---

### set

▸ **set**(`path`: string | string[], `value`: any, `conditions?`: [ModifyCondition](#interfacesmodifyconditionmd)): _this_

_Defined in [src/data-file.ts:182](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L182)_

Sets the value at `path` of file data. If a portion of path doesn't exist, it's created.
Arrays are created for missing index properties while objects are created for all other missing properties.

#### Example

```typescript
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.set("script.build", "tsc").set(["scripts", "test"], "jest");
```

**Parameters:**

| Name          | Type                                            | Description                                           |
| ------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `path`        | string &#124; string[]                          | is data path of the property to set.                  |
| `value`       | any                                             | is value to set.                                      |
| `conditions?` | [ModifyCondition](#interfacesmodifyconditionmd) | should be met to apply a modification to a key/value. |

**Returns:** _this_

<a name="classesintermodularmd"></a>

# Class: Intermodular

Easy file operations between node.js modules and auto logging to help building zero-config boilerplates, postinstall and other scripts.

#### Example

```typescript
import Intermodular from "intermodular";

const intermodular = new Intermodular(); // (Defaults) Source: Your module, Target: Module installed your module as a dependency.
intermodular.copySync("common-config", "."); // Copy all files from your modules `common-config` to target module's root.

if (targetModule.isTypeScript) {
  intermodular.copySync("config/tsconfig.json", ".");
}

const targetModule = intermodular.targetModule;
const moduleName = targetModule.name;
targetModule.install("lodash"); // Install lodash.
targetModule.getDependencyVersion("lodash"); // Get version info from package.json
targetModule.executeSync("rm", ["-rf", "some-directory"]); // Execute shell command.
targetModule.pathOf("config/tsconfig.json"); // Absolute path.

// Do some individual data level operations:
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
packageJson.set("keywords", ["some-key"], { ifNotExists: true });
packageJson.set("description", `My awesome ${moduleName}`, { ifNotExists: true });
packageJson.assign("scripts", { build: "tsc", test: "jest" }, { ifNotExists: true });
packageJson.orderKeys(["name", "version", "description", "keywords", "scripts"]); // Other keys come after.
packageJson.saveSync();
```

## Hierarchy

- **Intermodular**

## Constructors

### constructor

\+ **new Intermodular**(`__namedParameters`: object): _[Intermodular](#classesintermodularmd)_

_Defined in [src/intermodular.ts:77](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L77)_

Creates an instance.

**Parameters:**

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name             | Type                         | Default       | Description                                                                                                                                                   |
| ---------------- | ---------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `logLevel`       | [LogLevel](#enumsloglevelmd) | LogLevel.Info | is default log level to show. ("error", "warn", "info", "verbose", "debug" or "silly")                                                                        |
| `overwrite`      | boolean                      | false         | is default overwrite option for operations. Changes all write operation's default behavior. Also wverwrite option can be set for each operation individually. |
| `packageManager` | "npm" &#124; "yarn"          | "npm"         | is package manager to use in modules.                                                                                                                         |
| `sourceRoot`     | undefined &#124; string      | -             | is absolute path of source root, which is used as source for copying files etc.                                                                               |
| `targetRoot`     | undefined &#124; string      | -             | is absolute path of target root, which is used as target for copying files etc.                                                                               |

**Returns:** _[Intermodular](#classesintermodularmd)_

## Properties

### `Optional` `Readonly` myRoot

• **myRoot**? : _undefined | string_ = this.\_parentModule && pkgDir.sync(dirname(this.\_parentModule))

_Defined in [src/intermodular.ts:71](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L71)_

Root directory of the parent module, which installs your module.
This is the directory which contains `package.json` file of the parent module.

---

### `Optional` `Readonly` parentModuleRoot

• **parentModuleRoot**? : _undefined | string_ = this.myRoot && findTopPackageDir(this.myRoot)

_Defined in [src/intermodular.ts:77](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L77)_

Root directory of your module which requires this module.
This is the directory which contains `package.json` file of your module.

---

### `Readonly` sourceModule

• **sourceModule**: _[Module](#classesmodulemd)_

_Defined in [src/intermodular.ts:60](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L60)_

[Module](#classesmodulemd) instance of node module which is used as source for modification operations such as copy, update.

---

### `Readonly` targetModule

• **targetModule**: _[Module](#classesmodulemd)_

_Defined in [src/intermodular.ts:65](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L65)_

[Module](#classesmodulemd) instance of node module which is used as target for modification operations such as copy, update.

## Methods

### copySync

▸ **copySync**(`pathInSourceModule`: string, `pathInTargetModule`: string, `__namedParameters`: object): _string[]_

_Defined in [src/intermodular.ts:234](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L234)_

Copies a file or directory from `pathInSourceModule` relative to source module root to `pathInTargetModule`relative to
target module root. The directory can have contents. Like cp -r.
Note that if src is a directory it will copy everything inside of this directory, not the entire directory itself.

#### Example

```typescript
// Copy everything in `/path/to/project/node_modules/module-a/src/config/` to `/path/to/project/`
util.copySync("src/config", ".");
```

**Parameters:**

▪ **pathInSourceModule**: _string_

is source to copy from.

▪`Default value` **pathInTargetModule**: _string_= pathInSourceModule

is destination to copy to. Cannot be a directory.

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name                 | Type                                  | Default          | Description                                                                                                                                                                                                |
| -------------------- | ------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dereference`        | boolean                               | false            | whether to dereference symlinks.                                                                                                                                                                           |
| `errorOnExist`       | boolean                               | false            | if true, when overwrite is false and the destination exists, throws an error.                                                                                                                              |
| `filter`             | undefined &#124; function             | -                | is `(src, dest) => boolean` function to filter copied files. Return true to include, false to exclude.                                                                                                     |
| `ifEqual`            | undefined &#124; string &#124; object | -                | allows modification if only value stored at `path` equals/deeply equals to it's value.                                                                                                                     |
| `ifNotEqual`         | undefined &#124; string &#124; object | -                | allows modification if only value stored at `path` not equals/deeply equals to it's value.                                                                                                                 |
| `overwrite`          | boolean                               | this.\_overwrite | whether to overwrite existing file or directory. Note that the copy operation will silently fail if you set this to false and the destination exists. Use the errorOnExist option to change this behavior. |
| `preserveTimestamps` | boolean                               | false            | whether to set last modification and access times to the ones of the original source files. When false, timestamp behavior is OS-dependent.                                                                |

**Returns:** _string[]_

array of file paths copied to target. File paths are relative to target module root.

---

### log

▸ **log**(`message`: string, `level`: [LogLevel](#enumsloglevelmd)): _void_

_Defined in [src/intermodular.ts:154](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L154)_

Logs `message` with `level`.

**Parameters:**

| Name      | Type                         | Default       | Description                                                            |
| --------- | ---------------------------- | ------------- | ---------------------------------------------------------------------- |
| `message` | string                       | -             | is message text to log.                                                |
| `level`   | [LogLevel](#enumsloglevelmd) | LogLevel.Info | is log level. ("error", "warn", "info", "verbose", "debug" or "silly") |

**Returns:** _void_

---

### logIfDefined

▸ **logIfDefined**(`message`: string | undefined, `level`: [LogLevel](#enumsloglevelmd)): _void_

_Defined in [src/intermodular.ts:164](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L164)_

Logs `message` with `level` if it is defined.

**Parameters:**

| Name      | Type                         | Default       | Description                                                            |
| --------- | ---------------------------- | ------------- | ---------------------------------------------------------------------- |
| `message` | string &#124; undefined      | -             | is message text to log.                                                |
| `level`   | [LogLevel](#enumsloglevelmd) | LogLevel.Info | is log level. ("error", "warn", "info", "verbose", "debug" or "silly") |

**Returns:** _void_

---

### `Static` isEnvSet

▸ **isEnvSet**(`variable`: string): _boolean_

_Defined in [src/intermodular.ts:189](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L189)_

Returns whether `variable` is set in environment variables and not empty.

**Parameters:**

| Name       | Type   | Description                                   |
| ---------- | ------ | --------------------------------------------- |
| `variable` | string | is name of the environment variable to check. |

**Returns:** _boolean_

whether given environment variable is set and not empty.

---

### `Static` parseEnv

▸ **parseEnv**<**T**>(`variable`: string, `defaultValue?`: T): _string | number | Record‹string, any› | T | undefined_

_Defined in [src/intermodular.ts:203](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L203)_

Parses and returns `variable` environment variable. If possible, parses (JSON5) and returns it as a JavaScript object.
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

---

### `Static` resolveModuleRoot

▸ **resolveModuleRoot**(`name`: string): _string | undefined_

_Defined in [src/intermodular.ts:178](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L178)_

Returns path of the root of module with given `name`.

#### Example

```typescript
project.resolveModule("fs-extra"); // /path/to/project/node_modules/fs-extra
```

**Parameters:**

| Name   | Type   | Description                        |
| ------ | ------ | ---------------------------------- |
| `name` | string | of the module to get root path of. |

**Returns:** _string | undefined_

root path of given module.

<a name="classesmodulemd"></a>

# Class: Module

Easy file operations in node.js modules and auto logging to help building zero-config boilerplates, postinstall and other scripts.

## Hierarchy

- **Module**

## Properties

### config

• **config**: _Record‹string, any›_

_Defined in [src/module.ts:74](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L74)_

Config of the module. Configuration system uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) with
[JSON5](https://json5.org) [support](https://github.com/davidtheclark/cosmiconfig#loaders).
Config name is determined using `configName` constructor parameter. For target module this is the name of source module.

For example your module (source module) is named `my-boilerplate` and `my-project` uses by installing `my-boilerplate`,
then `my-project/.my-boilerplate.rc.json` (or any cosmiconfig supported file name) configuration file located in root of `my-project` is used.

---

### package

• **package**: _JSONObject_

_Defined in [src/module.ts:59](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L59)_

JavaScript object created from the module's `package.json`.

---

### `Readonly` root

• **root**: _string_

_Defined in [src/module.ts:54](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L54)_

Absolute path of the module's root directory, where `package.json` is located.

---

### `Optional` tsConfig

• **tsConfig**? : _JSONObject_

_Defined in [src/module.ts:64](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L64)_

JavaScript object created from the module's `tsconfig.json` if exists.

## Accessors

### isCompiled

• **get isCompiled**(): _boolean_

_Defined in [src/module.ts:216](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L216)_

Whether project is a compiled project via TypeScript or Babel.
**Note that, currently this method simply checks whether module is a TypeScript project or `babel-cli`, `babel-preset-env` is a dependency in `package.json`.**

**Returns:** _boolean_

---

### isTypeScript

• **get isTypeScript**(): _boolean_

_Defined in [src/module.ts:223](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L223)_

Whether module is a TypeScript project.

**Returns:** _boolean_

---

### name

• **get name**(): _string_

_Defined in [src/module.ts:185](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L185)_

Name of the module as defined in `package.json`.

**Returns:** _string_

---

### nameWithoutUser

• **get nameWithoutUser**(): _string_

_Defined in [src/module.ts:196](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L196)_

Name of the module without user name.

#### Example

```typescript
const name = module.name(); // @microsoft/typescript
const safeName = module.nameWithoutUser(); // typescript
```

**Returns:** _string_

---

### safeName

• **get safeName**(): _string_

_Defined in [src/module.ts:208](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L208)_

Safe project name, generated by deleting "@" signs from module name and replacing "/" characters with `-`.
Useful for npm packages whose names contain user name such as `@microsoft/typescript`.

#### Example

```typescript
const name = module.name(); // @microsoft/typescript
const safeName = module.safeName(); // microsoft-typescript
```

**Returns:** _string_

## Methods

### bin

▸ **bin**(`bin`: string): _string_

_Defined in [src/module.ts:540](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L540)_

Searches path of the `executable` located in `node_modules/.bin` relative to current working directory (`cwd`).

#### Example

```typescript
module.bin("my/command"); // ./from/CWD//to/module/node_modules/.bin/my/command
```

**Parameters:**

| Name  | Type   | Description                                                     |
| ----- | ------ | --------------------------------------------------------------- |
| `bin` | string | is the name or path of the bin relative to `node_modules/.bin`; |

**Returns:** _string_

path relative to cwd().

---

### executeAllSync

▸ **executeAllSync**(...`commands`: [SerialCommands](#serialcommands)): _[CommandResults](#classescommandresultsmd)_

_Defined in [src/module.ts:659](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L659)_

Executes multiple commands serially using [Execa](https://www.npmjs.com/package/execa) or parallel using [concurrently](https://www.npmjs.com/package/concurrently).
By default commands are executed serially. If commands are provided in an object they are executed concurrently. (keys are names, values are commands).
To provide execa options to concurrently commands use [executeAllWithOptionsSync](#executeallwithoptionssync). If command is `undefined` or `null`, it will be skipped. This is useful for
conditional commands.

#### Example

```typescript
module.executeAllSync("ls", ["ls", ["-al"]]); // Run: `ls` then `ls -al`.
module.executeAllSync({ "ls1": "ls", "ls2": ["ls", ["-al"]] }); // Run `ls` and `ls -al` concurrently.
module.executeAllSync("ls", { "ls2": ["ls", ["-a"]], "ls3": ["ls", ["-al"]] }); // Run `ls` then `ls -a` and `ls -al` concurrently.
const result = module.executeAllSync(
  [
    "serialCommand1", ["arg"]],
    "serialCommand2",
    someCondition ? "serialCommand3" : null,
    {
      myParallelJob1: ["someCommant4", ["arg"],
      myParallelJob2": "someCommand4"
      builder: ["tsc", ["arg"]],
    },
    [
      "other-serial-command", ["arg"]
    ],
  ]
);
```

**Parameters:**

| Name          | Type                              | Description                      |
| ------------- | --------------------------------- | -------------------------------- |
| `...commands` | [SerialCommands](#serialcommands) | are list of commands to execute. |

**Returns:** _[CommandResults](#classescommandresultsmd)_

[CommandResults](#classescommandresultsmd) instance, which contains results of the executed commands.

---

### executeAllWithOptionsSync

▸ **executeAllWithOptionsSync**(`options`: [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd), ...`commands`: [SerialCommands](#serialcommands)): _[CommandResults](#classescommandresultsmd)_

_Defined in [src/module.ts:670](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L670)_

Executes multiple commands with given options. See [executeAllSync](#executeallsync) fro details.

**Parameters:**

| Name          | Type                                                        | Description                                                                                                                               |
| ------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `options`     | [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd) | are options to pass to [Execa](https://www.npmjs.com/package/execa) executing [concurrently](https://www.npmjs.com/package/concurrently). |
| `...commands` | [SerialCommands](#serialcommands)                           | are list of commands to execute.                                                                                                          |

**Returns:** _[CommandResults](#classescommandresultsmd)_

[CommandResults](#classescommandresultsmd) instance, which contains results of the executed commands.

---

### executeSync

▸ **executeSync**(`bin`: string, `args?`: string[], `options?`: SyncOptions): _ExecaSyncReturnValue_

_Defined in [src/module.ts:618](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L618)_

Executes given command using `spawn.sync` with given arguments and options.

#### Example

```typescript
module.executeSync("ls"); // Run `ls`.
module.executeSync("ls", ["-al"]); // Run `ls -al`.
```

**Parameters:**

| Name       | Type        | Description                                                 |
| ---------- | ----------- | ----------------------------------------------------------- |
| `bin`      | string      | is binary file to execute.                                  |
| `args?`    | string[]    | are arguments to pass to executable.                        |
| `options?` | SyncOptions | are passed to [Execa](https://www.npmjs.com/package/execa). |

**Returns:** _ExecaSyncReturnValue_

[[ExecaSyncReturnValue]] instance.

▸ **executeSync**(`bin`: string, `args?`: string[], `options?`: SyncOptions‹null›): _ExecaSyncReturnValue‹Buffer›_

_Defined in [src/module.ts:619](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L619)_

**Parameters:**

| Name       | Type              |
| ---------- | ----------------- |
| `bin`      | string            |
| `args?`    | string[]          |
| `options?` | SyncOptions‹null› |

**Returns:** _ExecaSyncReturnValue‹Buffer›_

▸ **executeSync**(`bin`: string, `options?`: SyncOptions): _ExecaSyncReturnValue_

_Defined in [src/module.ts:620](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L620)_

**Parameters:**

| Name       | Type        |
| ---------- | ----------- |
| `bin`      | string      |
| `options?` | SyncOptions |

**Returns:** _ExecaSyncReturnValue_

▸ **executeSync**(`bin`: string, `options?`: SyncOptions‹null›): _ExecaSyncReturnValue‹Buffer›_

_Defined in [src/module.ts:621](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L621)_

**Parameters:**

| Name       | Type              |
| ---------- | ----------------- |
| `bin`      | string            |
| `options?` | SyncOptions‹null› |

**Returns:** _ExecaSyncReturnValue‹Buffer›_

---

### existsSync

▸ **existsSync**(`pathInModule`: string): _boolean_

_Defined in [src/module.ts:441](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L441)_

Checks whether given path exists.

**Parameters:**

| Name           | Type   | Description                                     |
| -------------- | ------ | ----------------------------------------------- |
| `pathInModule` | string | is file/directory path relative to module root. |

**Returns:** _boolean_

whether given path exists.

---

### getDataFileSync

▸ **getDataFileSync**(`pathInModule`: string, `__namedParameters`: object): _[DataFile](#classesdatafilemd)_

_Defined in [src/module.ts:472](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L472)_

Gets [DataFile](#classesdatafilemd) for `pathInModule` file. [DataFile](#classesdatafilemd) provide useful utilities to work with data files. Also caches instance and returns
same instance for same file path for concecutive calls. Optionally it could be forced to re-read file.

**Parameters:**

▪ **pathInModule**: _string_

is file path relative to module root.

▪`Default value` **\_\_namedParameters**: _object_= {} as any

| Name            | Type                               | Default | Description                                                                                                                    |
| --------------- | ---------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `defaultFormat` | "json" &#124; "yaml"               | "json"  | is default file format to be used during file creation if file is not found and format cannot be inferred from file extension. |
| `forceRead`     | undefined &#124; false &#124; true | -       | -                                                                                                                              |

**Returns:** _[DataFile](#classesdatafilemd)_

[DataFile](#classesdatafilemd) instance for `pathInModule`.

---

### getDependencyVersion

▸ **getDependencyVersion**(`moduleName`: string, `dependencyTypes`: [DependencyType](#enumsdependencytypemd)[]): _string | undefined_

_Defined in [src/module.ts:251](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L251)_

Fetches a dependent module's version.

**Parameters:**

| Name              | Type                                       | Default | Description                                  |
| ----------------- | ------------------------------------------ | ------- | -------------------------------------------- |
| `moduleName`      | string                                     | -       | is the name of the module to get version of. |
| `dependencyTypes` | [DependencyType](#enumsdependencytypemd)[] | [       |

      DependencyType.Dependencies,
      DependencyType.DevDependencies,
      DependencyType.PeerDependencies,
      DependencyType.OptionalDependencies,
    ] | are array of dependency types to search module in. |

**Returns:** _string | undefined_

version of the `moduleName`.

---

### getPrettierConfigSync

▸ **getPrettierConfigSync**(`pathInModule`: string, `__namedParameters`: object): _Options_

_Defined in [src/module.ts:513](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L513)_

Fetches prettier configuration for `pathInModule` file. Prettier uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)
which may be cascaded. If no file path is given returns configuration located in module root.

Also adds necessary parser to configuration if not exists.

**Parameters:**

▪ **pathInModule**: _string_

is file path relative to module root.

▪ **\_\_namedParameters**: _object_

| Name    | Type | Description                                                    |
| ------- | ---- | -------------------------------------------------------------- |
| `force` | true | If true, returns an empty configuration if no config is found. |

**Returns:** _Options_

prettier configuration for given file.

▸ **getPrettierConfigSync**(`pathInModule`: string, `__namedParameters`: object): _Options | null_

_Defined in [src/module.ts:514](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L514)_

**Parameters:**

▪ **pathInModule**: _string_

▪ **\_\_namedParameters**: _object_

| Name    | Type  |
| ------- | ----- |
| `force` | false |

**Returns:** _Options | null_

▸ **getPrettierConfigSync**(`pathInModule?`: undefined | string): _Options | null_

_Defined in [src/module.ts:515](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L515)_

**Parameters:**

| Name            | Type                    |
| --------------- | ----------------------- |
| `pathInModule?` | undefined &#124; string |

**Returns:** _Options | null_

---

### hasAnyDependency

▸ **hasAnyDependency**(`moduleNames`: string | string[], `dependencyTypes`: [DependencyType](#enumsdependencytypemd)[]): _boolean_

_Defined in [src/module.ts:280](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L280)_

Checks whether `moduleName` module exists in given [dependency types](#enumsdependencytypemd) of `package.json`.

**Parameters:**

| Name              | Type                                       | Default | Description |
| ----------------- | ------------------------------------------ | ------- | ----------- |
| `moduleNames`     | string &#124; string[]                     | -       | -           |
| `dependencyTypes` | [DependencyType](#enumsdependencytypemd)[] | [       |

      DependencyType.Dependencies,
      DependencyType.DevDependencies,
      DependencyType.PeerDependencies,
      DependencyType.OptionalDependencies,
    ] | are array of dependency types to search module in. |

**Returns:** _boolean_

whether `moduleName` exists in one of the dependency types.

---

### ifAnyDependency

▸ **ifAnyDependency**<**T**, **F**>(`moduleNames`: string | string[]): _boolean_

_Defined in [src/module.ts:300](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L300)_

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

▸ **ifAnyDependency**<**T**, **F**>(`moduleNames`: string | string[], `t`: T): _T | false_

_Defined in [src/module.ts:301](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L301)_

**Type parameters:**

▪ **T**

▪ **F**

**Parameters:**

| Name          | Type                   |
| ------------- | ---------------------- |
| `moduleNames` | string &#124; string[] |
| `t`           | T                      |

**Returns:** _T | false_

▸ **ifAnyDependency**<**T**, **F**>(`moduleNames`: string | string[], `t`: T, `f`: F): _T | F_

_Defined in [src/module.ts:302](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L302)_

**Type parameters:**

▪ **T**

▪ **F**

**Parameters:**

| Name          | Type                   |
| ------------- | ---------------------- |
| `moduleNames` | string &#124; string[] |
| `t`           | T                      |
| `f`           | F                      |

**Returns:** _T | F_

---

### install

▸ **install**(`packageNames?`: string | string[], `__namedParameters`: object): _void_

_Defined in [src/module.ts:703](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L703)_

Installs `packageName` node module using specified package manager. If no `packageName` is undefined, installs all dependencies i.e `npm install`.

**Parameters:**

▪`Optional` **packageNames**: _string | string[]_

are name or array of names of the package(s) to install.

▪`Default value` **\_\_namedParameters**: _object_= {} as any

| Name   | Type                                     | Default                     | Description                                                       |
| ------ | ---------------------------------------- | --------------------------- | ----------------------------------------------------------------- |
| `type` | [DependencyType](#enumsdependencytypemd) | DependencyType.Dependencies | is the dependency type of the package. `dev`, `peer`, `optional`. |

**Returns:** _void_

---

### isEqual

▸ **isEqual**(`pathInModule`: string, `data`: string | Record‹string, any›): _boolean_

_Defined in [src/module.ts:499](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L499)_

Checks whether content of `pathInModule` file is equal to `data` by making string comparison (for strings)
or deep comparison (for objects).

#### Example

```typescript
const isConfigEqual = module.isFileEqual("config.json", { size: 4 });
const textEqual = module.isFileEqual("some.txt", "content");
```

**Parameters:**

| Name           | Type                              | Description                                                  |
| -------------- | --------------------------------- | ------------------------------------------------------------ |
| `pathInModule` | string                            | is file path relative to module root.                        |
| `data`         | string &#124; Record‹string, any› | is string or JavaScript object to compare to file's content. |

**Returns:** _boolean_

whether `pathInModule` file content is equal to `data`.

---

### parseSync

▸ **parseSync**(`pathInModule`: string): _Record‹string, any›_

_Defined in [src/module.ts:347](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L347)_

Reads, parses and returns content of file from `pathInTargetModule` path relative to module's root.

**Parameters:**

| Name           | Type   | Description                           |
| -------------- | ------ | ------------------------------------- |
| `pathInModule` | string | is file path relative to module root. |

**Returns:** _Record‹string, any›_

parsed file content as a JavaScript object.

---

### parseWithFormatSync

▸ **parseWithFormatSync**(`pathInModule`: string): _object_

_Defined in [src/module.ts:358](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L358)_

Reads and parses content of file from `pathInTargetModule` path relative to module's root
and retunrs format and parsed object.

**Parameters:**

| Name           | Type   | Description                           |
| -------------- | ------ | ------------------------------------- |
| `pathInModule` | string | is file path relative to module root. |

**Returns:** _object_

file format and data.

- **data**: _Record‹string, any›_

- **format**: _[FileFormat](#fileformat)_

---

### pathOf

▸ **pathOf**(...`parts`: string[]): _string_

_Defined in [src/module.ts:327](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L327)_

Returns absolute path of given path parts relative to module root.

#### Example

```typescript
// In /path/to/project/node_modules/module-a/src/index.js
module.pathOf("images", "photo.jpg"); // /path/to/project/node_modules/module-a/images/photo.jpg
```

**Parameters:**

| Name       | Type     | Description                                              |
| ---------- | -------- | -------------------------------------------------------- |
| `...parts` | string[] | are path or array of path parts relative to module root. |

**Returns:** _string_

absolute path to given destination.

---

### readSync

▸ **readSync**(`pathInModule`: string): _string_

_Defined in [src/module.ts:337](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L337)_

Reads content of file from `pathInModule` path relative to module's root.

**Parameters:**

| Name           | Type   | Description                           |
| -------------- | ------ | ------------------------------------- |
| `pathInModule` | string | is file path relative to module root. |

**Returns:** _string_

file contents.

---

### reload

▸ **reload**(): _void_

_Defined in [src/module.ts:230](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L230)_

Reloads configuration. This may be useful if you create or update your configuration file.

**Returns:** _void_

---

### removeEmptyDirsSync

▸ **removeEmptyDirsSync**(`pathInModule`: string): _void_

_Defined in [src/module.ts:431](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L431)_

Removes empty directories recursively for given path relative to module root.

**Parameters:**

| Name           | Type   | Description                           |
| -------------- | ------ | ------------------------------------- |
| `pathInModule` | string | is file path relative to module root. |

**Returns:** _void_

---

### removeSync

▸ **removeSync**(`pathInModule`: string, `__namedParameters`: object): _string | undefined_

_Defined in [src/module.ts:409](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L409)_

Removes file `pathInTargetModule` path relative to module's root.

**Parameters:**

▪ **pathInModule**: _string_

is file path relative to module root.

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name         | Type                                  | Description                                                                            |
| ------------ | ------------------------------------- | -------------------------------------------------------------------------------------- |
| `ifEqual`    | undefined &#124; string &#124; object | allows modification if only value stored at `path` equals/deeply equals to it's value. |
| `ifNotEqual` | undefined &#124; string &#124; object | allows modification if only value stored at `path` equals/deeply equals to it's value. |

**Returns:** _string | undefined_

file path relative to module root if file is removed.

---

### renameSync

▸ **renameSync**(`oldPathInModule`: string, `newPathInModule`: string, `__namedParameters`: object): _boolean_

_Defined in [src/module.ts:453](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L453)_

Renames given path.

**Parameters:**

▪ **oldPathInModule**: _string_

is old path to rename relative to module root.

▪ **newPathInModule**: _string_

is new path to rename relative to module root.

▪`Default value` **\_\_namedParameters**: _object_= {}

| Name        | Type    | Default          | Description                                                                                                                                        |
| ----------- | ------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `overwrite` | boolean | this.\_overwrite | is whether to allow rename operation if target path already exists. Silently ignores operation if overwrite is not allowed and target path exists. |

**Returns:** _boolean_

whether file is renamed.

---

### resolveBin

▸ **resolveBin**(`modName`: string, `__namedParameters`: object): _string_

_Defined in [src/module.ts:566](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L566)_

Finds and returns path of given command, trying to following steps:

1. If it is a command defined in env.PATH, returns it's path. (PATH includes `node_modules/.bin`)
2. Searches if given node module is installed.
   2.a. If executable is given, looks `bin[executable]` in module's package.json.
   2.b. If no executable is given, looks `bin[module name]` in module's package.json.
   2.c. If found returns it's path.
3. Throws error.
   module name is used by default.

#### Example

```typescript
project.resolveBin("typescript", { executable: "tsc" }); // Searches typescript module, looks `bin.tsc` in package.json and returns it's path.
project.resolveBin("tsc"); // If `tsc` is defined in PATH, returns `tsc`s path, otherwise searches "tsc" module, which returns no result and throws error.
project.resolveBin("some-cmd"); // Searches "some-cmd" module and
```

**`throws`** Error if no binary cannot be found.

**Parameters:**

▪ **modName**: _string_

is module name to find executable from.

▪`Default value` **\_\_namedParameters**: _object_= {} as any

| Name         | Type   | Default       | Description                                  |
| ------------ | ------ | ------------- | -------------------------------------------- |
| `cwd`        | string | process.cwd() | is current working directory.                |
| `executable` | string | ""            | is xecutable name. (Defaults to module name) |

**Returns:** _string_

path to binary.

---

### uninstall

▸ **uninstall**(`packageNames?`: string | string[]): _void_

_Defined in [src/module.ts:733](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L733)_

Uninstalls `packageName` node module using specified package manager.

**Parameters:**

| Name            | Type                   | Description                                                |
| --------------- | ---------------------- | ---------------------------------------------------------- |
| `packageNames?` | string &#124; string[] | are name or array of names of the package(s) to uninstall. |

**Returns:** _void_

---

### writeSync

▸ **writeSync**(`pathInModule`: string, `data`: string | Record‹string, any›, `__namedParameters`: object): _string | undefined_

_Defined in [src/module.ts:374](https://github.com/ozum/intermodular/blob/9259634/src/module.ts#L374)_

Serializes, formats and writes `data` to file `pathInTargetModule` path relative to module's root.

**Parameters:**

▪ **pathInModule**: _string_

is file path relative to module root.

▪ **data**: _string | Record‹string, any›_

is content to write to file.

▪`Default value` **\_\_namedParameters**: _object_= {} as any

| Name          | Type                                  | Default          | Description                                                                                |
| ------------- | ------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------ |
| `format`      | "json" &#124; "yaml"                  | "json"           | is file format to be used for serializing.                                                 |
| `ifEqual`     | undefined &#124; string &#124; object | -                | allows modification if only value stored at `path` equals/deeply equals to it's value.     |
| `ifNotEqual`  | undefined &#124; string &#124; object | -                | allows modification if only value stored at `path` not equals/deeply equals to it's value. |
| `overwrite`   | boolean                               | this.\_overwrite | allows overwrite.                                                                          |
| `usePrettier` | boolean                               | true             | -                                                                                          |

**Returns:** _string | undefined_

file path relative to module root if file is written.

# Enums

<a name="enumsdependencytypemd"></a>

# Enumeration: DependencyType

Dependency types for Node.js modules.

## Enumeration members

### Dependencies

• **Dependencies**: = "dependencies"

_Defined in [src/types/index.ts:110](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L110)_

Production dependencies

---

### DevDependencies

• **DevDependencies**: = "devDependencies"

_Defined in [src/types/index.ts:114](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L114)_

Dependencies for development only.

---

### OptionalDependencies

• **OptionalDependencies**: = "optionalDependencies"

_Defined in [src/types/index.ts:123](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L123)_

Dependencies which can be used, but not stop installation if not found or failed to install.

---

### PeerDependencies

• **PeerDependencies**: = "peerDependencies"

_Defined in [src/types/index.ts:118](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L118)_

Dependencies which are not installed by default.

<a name="enumsloglevelmd"></a>

# Enumeration: LogLevel

Levels to be used when logging.

## Enumeration members

### Debug

• **Debug**: = "debug"

_Defined in [src/types/index.ts:99](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L99)_

---

### Error

• **Error**: = "error"

_Defined in [src/types/index.ts:95](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L95)_

---

### Info

• **Info**: = "info"

_Defined in [src/types/index.ts:97](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L97)_

---

### Silly

• **Silly**: = "silly"

_Defined in [src/types/index.ts:100](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L100)_

---

### Verbose

• **Verbose**: = "verbose"

_Defined in [src/types/index.ts:98](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L98)_

---

### Warn

• **Warn**: = "warn"

_Defined in [src/types/index.ts:96](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L96)_

# Interfaces

<a name="interfacesexecuteallsyncoptionsmd"></a>

# Interface: ExecuteAllSyncOptions <**EncodingType**>

## Type parameters

▪ **EncodingType**

## Hierarchy

- SyncOptions

  ↳ **ExecuteAllSyncOptions**

## Properties

### `Optional` `Readonly` all

• **all**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[all](#optional-readonly-all)_

Defined in node_modules/execa/index.d.ts:96

Add an `.all` property on the promise and the resolved value. The property contains the output of the process with `stdout` and `stderr` interleaved.

**`default`** false

---

### `Optional` `Readonly` argv0

• **argv0**? : _undefined | string_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[argv0](#optional-readonly-argv0)_

Defined in node_modules/execa/index.d.ts:129

Explicitly set the value of `argv[0]` sent to the child process. This will be set to `command` or `file` if not specified.

---

### `Optional` `Readonly` buffer

• **buffer**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[buffer](#optional-readonly-buffer)_

Defined in node_modules/execa/index.d.ts:61

Buffer the output from the spawned process. When set to `false`, you must read the output of `stdout` and `stderr` (or `all` if the `all` option is `true`). Otherwise the returned promise will not be resolved/rejected.

If the spawned process fails, `error.stdout`, `error.stderr`, and `error.all` will contain the buffered data.

**`default`** true

---

### `Optional` `Readonly` cleanup

• **cleanup**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[cleanup](#optional-readonly-cleanup)_

Defined in node_modules/execa/index.d.ts:23

Kill the spawned process when the parent process exits unless either:

- the spawned process is [`detached`](https://nodejs.org/api/child_process.html#child_process_options_detached)
- the parent process is terminated abruptly, for example, with `SIGKILL` as opposed to `SIGTERM` or a normal exit

**`default`** true

---

### `Optional` `Readonly` cwd

• **cwd**? : _undefined | string_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[cwd](#optional-readonly-cwd)_

Defined in node_modules/execa/index.d.ts:117

Current working directory of the child process.

**`default`** process.cwd()

---

### `Optional` `Readonly` detached

• **detached**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[detached](#optional-readonly-detached)_

Defined in node_modules/execa/index.d.ts:156

Prepare child to run independently of its parent process. Specific behavior [depends on the platform](https://nodejs.org/api/child_process.html#child_process_options_detached).

**`default`** false

---

### `Optional` `Readonly` encoding

• **encoding**? : _EncodingType_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[encoding](#optional-readonly-encoding)_

Defined in node_modules/execa/index.d.ts:185

Specify the character encoding used to decode the `stdout` and `stderr` output. If set to `null`, then `stdout` and `stderr` will be a `Buffer` instead of a string.

**`default`** 'utf8'

---

### `Optional` `Readonly` env

• **env**? : _NodeJS.ProcessEnv_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[env](#optional-readonly-env)_

Defined in node_modules/execa/index.d.ts:124

Environment key-value pairs. Extends automatically from `process.env`. Set `extendEnv` to `false` if you don't want this.

**`default`** process.env

---

### `Optional` `Readonly` execPath

• **execPath**? : _undefined | string_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[execPath](#optional-readonly-execpath)_

Defined in node_modules/execa/index.d.ts:52

Path to the Node.js executable to use in child processes.

This can be either an absolute path or a path relative to the `cwd` option.

Requires `preferLocal` to be `true`.

For example, this can be used together with [`get-node`](https://github.com/ehmicky/get-node) to run a specific Node.js version in a child process.

**`default`** process.execPath

---

### `Optional` `Readonly` extendEnv

• **extendEnv**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[extendEnv](#optional-readonly-extendenv)_

Defined in node_modules/execa/index.d.ts:110

Set to `false` if you don't want to extend the environment variables when providing the `env` property.

**`default`** true

---

### `Optional` `Readonly` gid

• **gid**? : _undefined | number_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[gid](#optional-readonly-gid)_

Defined in node_modules/execa/index.d.ts:166

Sets the group identity of the process.

---

### `Optional` `Readonly` input

• **input**? : _string | Buffer_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[input](#optional-readonly-input)_

Defined in node_modules/execa/index.d.ts:234

Write some input to the `stdin` of your binary.

---

### `Optional` `Readonly` killSignal

• **killSignal**? : _string | number_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[killSignal](#optional-readonly-killsignal)_

Defined in node_modules/execa/index.d.ts:206

Signal value to be used when the spawned process will be killed.

**`default`** 'SIGTERM'

---

### `Optional` `Readonly` localDir

• **localDir**? : _undefined | string_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[localDir](#optional-readonly-localdir)_

Defined in node_modules/execa/index.d.ts:39

Preferred path to find locally installed binaries in (use with `preferLocal`).

**`default`** process.cwd()

---

### `Optional` `Readonly` maxBuffer

• **maxBuffer**? : _undefined | number_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[maxBuffer](#optional-readonly-maxbuffer)_

Defined in node_modules/execa/index.d.ts:199

Largest amount of data in bytes allowed on `stdout` or `stderr`. Default: 100 MB.

**`default`** 100_000_000

---

### `Optional` `Readonly` preferLocal

• **preferLocal**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[preferLocal](#optional-readonly-preferlocal)_

Defined in node_modules/execa/index.d.ts:32

Prefer locally installed binaries when looking for a binary to execute.

If you `$ npm install foo`, you can then `execa('foo')`.

**`default`** false

---

### `Optional` `Readonly` reject

• **reject**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[reject](#optional-readonly-reject)_

Defined in node_modules/execa/index.d.ts:89

Setting this to `false` resolves the promise with the error instead of rejecting it.

**`default`** true

---

### `Optional` `Readonly` serialization

• **serialization**? : _"json" | "advanced"_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[serialization](#optional-readonly-serialization)_

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

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[shell](#optional-readonly-shell)_

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

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[stderr](#optional-readonly-stderr)_

Defined in node_modules/execa/index.d.ts:82

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

**`default`** 'pipe'

---

### `Optional` `Readonly` stdin

• **stdin**? : _StdioOption_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[stdin](#optional-readonly-stdin)_

Defined in node_modules/execa/index.d.ts:68

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

**`default`** 'pipe'

---

### `Optional` `Readonly` stdio

• **stdio**? : _"pipe" | "ignore" | "inherit" | keyof StdioOption[]_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[stdio](#optional-readonly-stdio)_

Defined in node_modules/execa/index.d.ts:136

Child's [stdio](https://nodejs.org/api/child_process.html#child_process_options_stdio) configuration.

**`default`** 'pipe'

---

### `Optional` `Readonly` stdout

• **stdout**? : _StdioOption_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[stdout](#optional-readonly-stdout)_

Defined in node_modules/execa/index.d.ts:75

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

**`default`** 'pipe'

---

### `Optional` stopOnError

• **stopOnError**? : _undefined | false | true_

_Defined in [src/types/index.ts:76](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L76)_

Whether to stop executing further commands if an error occurs.

---

### `Optional` `Readonly` stripFinalNewline

• **stripFinalNewline**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[stripFinalNewline](#optional-readonly-stripfinalnewline)_

Defined in node_modules/execa/index.d.ts:103

Strip the final [newline character](https://en.wikipedia.org/wiki/Newline) from the output.

**`default`** true

---

### `Optional` throwOnError

• **throwOnError**? : _undefined | false | true_

_Defined in [src/types/index.ts:80](https://github.com/ozum/intermodular/blob/9259634/src/types/index.ts#L80)_

Whether to throw if an error occurs.

---

### `Optional` `Readonly` timeout

• **timeout**? : _undefined | number_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[timeout](#optional-readonly-timeout)_

Defined in node_modules/execa/index.d.ts:192

If `timeout` is greater than `0`, the parent will send the signal identified by the `killSignal` property (the default is `SIGTERM`) if the child runs longer than `timeout` milliseconds.

**`default`** 0

---

### `Optional` `Readonly` uid

• **uid**? : _undefined | number_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[uid](#optional-readonly-uid)_

Defined in node_modules/execa/index.d.ts:161

Sets the user identity of the process.

---

### `Optional` `Readonly` windowsHide

• **windowsHide**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[windowsHide](#optional-readonly-windowshide)_

Defined in node_modules/execa/index.d.ts:220

On Windows, do not create a new console window. Please note this also prevents `CTRL-C` [from working](https://github.com/nodejs/node/issues/29837) on Windows.

**`default`** true

---

### `Optional` `Readonly` windowsVerbatimArguments

• **windowsVerbatimArguments**? : _undefined | false | true_

_Inherited from [ExecuteAllSyncOptions](#interfacesexecuteallsyncoptionsmd).[windowsVerbatimArguments](#optional-readonly-windowsverbatimarguments)_

Defined in node_modules/execa/index.d.ts:213

If `true`, no quoting or escaping of arguments is done on Windows. Ignored on other platforms. This is set to `true` automatically when the `shell` option is `true`.

**`default`** false

<a name="interfacesextendedcopyoptionssyncmd"></a>

# Interface: ExtendedCopyOptionsSync

Options for file copy operation.

## Hierarchy

- CopyOptionsSync

  ↳ **ExtendedCopyOptionsSync**

## Properties

### `Optional` dereference

• **dereference**? : _undefined | false | true_

_Inherited from [ExtendedCopyOptionsSync](#interfacesextendedcopyoptionssyncmd).[dereference](#optional-dereference)_

Defined in node_modules/@types/fs-extra/index.d.ts:278

---

### `Optional` errorOnExist

• **errorOnExist**? : _undefined | false | true_

_Inherited from [ExtendedCopyOptionsSync](#interfacesextendedcopyoptionssyncmd).[errorOnExist](#optional-erroronexist)_

Defined in node_modules/@types/fs-extra/index.d.ts:281

---

### `Optional` filter

• **filter**? : _CopyFilterSync_

_Inherited from [ExtendedCopyOptionsSync](#interfacesextendedcopyoptionssyncmd).[filter](#optional-filter)_

_Overrides void_

Defined in node_modules/@types/fs-extra/index.d.ts:287

---

### `Optional` ifEqual

• **ifEqual**? : _string | Record‹string, any›_

_Defined in [src/intermodular.ts:19](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L19)_

allows modification if only value stored at `path` equals/deeply equals to it's value.

---

### `Optional` ifNotEqual

• **ifNotEqual**? : _string | Record‹string, any›_

_Defined in [src/intermodular.ts:21](https://github.com/ozum/intermodular/blob/9259634/src/intermodular.ts#L21)_

allows modification if only value stored at `path` not equals/deeply equals to it's value.

---

### `Optional` overwrite

• **overwrite**? : _undefined | false | true_

_Inherited from [ExtendedCopyOptionsSync](#interfacesextendedcopyoptionssyncmd).[overwrite](#optional-overwrite)_

Defined in node_modules/@types/fs-extra/index.d.ts:279

---

### `Optional` preserveTimestamps

• **preserveTimestamps**? : _undefined | false | true_

_Inherited from [ExtendedCopyOptionsSync](#interfacesextendedcopyoptionssyncmd).[preserveTimestamps](#optional-preservetimestamps)_

Defined in node_modules/@types/fs-extra/index.d.ts:280

---

### `Optional` recursive

• **recursive**? : _undefined | false | true_

_Inherited from [ExtendedCopyOptionsSync](#interfacesextendedcopyoptionssyncmd).[recursive](#optional-recursive)_

Defined in node_modules/@types/fs-extra/index.d.ts:283

<a name="interfacesmodifyconditionmd"></a>

# Interface: ModifyCondition

Conditions which should be met to apply a modification to a key/value.

## Hierarchy

- **ModifyCondition**

## Properties

### `Optional` ifEqual

• **ifEqual**? : _any_

_Defined in [src/data-file.ts:31](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L31)_

Allows modification if only value stored at `path` equals/deeply equals to it's value.

---

### `Optional` ifExists

• **ifExists**? : _undefined | false | true_

_Defined in [src/data-file.ts:27](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L27)_

Allows modification if only `path` does not exists.

---

### `Optional` ifNotEqual

• **ifNotEqual**? : _any_

_Defined in [src/data-file.ts:35](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L35)_

Allows modification if only value stored at `path` equals/deeply equals to it's value.

---

### `Optional` ifNotExists

• **ifNotExists**? : _undefined | false | true_

_Defined in [src/data-file.ts:23](https://github.com/ozum/intermodular/blob/9259634/src/data-file.ts#L23)_

Allows modification if only `path` exists.
