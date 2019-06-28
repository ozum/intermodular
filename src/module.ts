/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { readFileSync, outputFileSync, removeSync, existsSync, renameSync } from "fs-extra";
import { join, normalize, relative, sep, extname } from "path";
import cosmiconfig from "cosmiconfig";
import prettier from "prettier";
import isEqual from "lodash.isequal";
import { Logger } from "winston";
import execa, { SyncOptions, ExecaSyncReturnValue } from "execa";
import {
  arrify,
  readJSONSync,
  serialize,
  parseString,
  logTemplate,
  getNotModifyReasonTemplateKey,
  getConcurrentlyArgs,
  applyCommandDefaults,
} from "./util";
import {
  JSONObject,
  FileFormat,
  DependencyType,
  ExecaCommandSync,
  SerialCommands,
  ParallelCommands,
  ExecuteAllSyncOptions,
  LogLevel,
} from "./types";
import DataFile from "./data-file";
import TEMPLATES from "./messages";
import CommandResults from "./command-results";

/**
 * Asserts given command has a type of `ParallelCommands`.
 * @ignore
 * @param command is variable to assert.
 */
function isParallelCommands(command: ExecaCommandSync | ParallelCommands | SerialCommands): command is ParallelCommands {
  return !Array.isArray(command) && typeof command === "object";
}

/**
 * Easy file operations in node.js modules and auto logging to help building zero-config boilerplates, postinstall and other scripts.
 */
export default class Module {
  private readonly _logger: Logger;
  private readonly _overwrite: boolean;
  private readonly _packageManager: "npm" | "yarn" = "npm";
  private readonly _configName?: string;

  /**
   * Absolute path of the module's root directory, where `package.json` is located.
   */
  public readonly root: string;

  /**
   * JavaScript object created from the module's `package.json`.
   */
  public readonly package: JSONObject;

  /**
   * JavaScript object created from the module's `tsconfig.json` if exists.
   */
  public readonly tsConfig?: JSONObject;

  /**
   * Config of the module. Configuration system uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig).
   * Config name is determined using `configName` constructor parameter. For target module this is the name of source module.
   *
   * For example your module (source module) is named `my-boilerplate` and `my-project` uses by installing `my-boilerplate`,
   * then `my-project/.my-boilerplate.rc.json` (or any cosmiconfig supported file name) configuration file located in root of `my-project` is used.
   */
  public config: cosmiconfig.Config = {};

  /**
   * @ignore
   */
  public constructor(root: string, logger: Logger, overwrite: boolean, packageManager: "npm" | "yarn", configName?: string) {
    if (!root) {
      throw new Error("root is required.");
    }

    if (packageManager !== "npm" && packageManager !== "yarn") {
      throw new Error(`Unknown package manager: ${packageManager}`);
    }

    this.root = normalize(root);
    this.package = readJSONSync(`${root}/package.json`);

    if (!this.package) {
      throw new Error(`Cannot find ${root}/package.json. Given path is not a module.`);
    }

    this.tsConfig = readJSONSync(`${root}/tsconfig.json`, { surviveNonExist: true });
    this._logger = logger;
    this._overwrite = overwrite;
    this._packageManager = packageManager;
    this._configName = configName;
    this.reloadConfig();
  }

  /**
   * Logs precompiled template message with `key` using `args`.
   */
  private _logTemplate(key: keyof typeof TEMPLATES, args: Record<string, any>): void {
    this._logger.log(...logTemplate(key, args));
  }

  /**
   * Logs given `message` if it is not undefined.
   * @param level is log level.
   * @param message is text to log.
   */
  private _logIfDefined(level: LogLevel, message?: string): void {
    if (message !== undefined) {
      this._logger.log(level, message);
    }
  }

  /**
   * Name of the module as defined in `package.json`.
   */
  public get name(): string {
    return this.package.name as string;
  }

  /**
   * Name of the module without user name.
   *
   * @example
   * const name = module.name(); // @microsoft/typescript
   * const safeName = module.nameWithoutUser(); // typescript
   */
  public get nameWithoutUser(): string {
    return this.name.replace(/^@.+?\//, "");
  }

  /**
   * Safe project name, generated by deleting "@" signs from module name and replacing "/" characters with `-`.
   * Useful for npm packages whose names contain user name such as `@microsoft/typescript`.
   *
   * @example
   * const name = module.name(); // @microsoft/typescript
   * const safeName = module.safeName(); // microsoft-typescript
   */
  public get safeName(): string {
    return this.name.replace("@", "").replace("/", "-");
  }

  /**
   * Whether project is a compiled project via TypeScript or Babel.
   * **Note that, currently this method simply checks whether module is a TypeScript project or `babel-cli`, `babel-preset-env` is a dependency in `package.json`.**
   */
  public get isCompiled(): boolean {
    return this.isTypeScript || this.hasAnyDependency(["babel-cli", "babel-preset-env"]);
  }

  /**
   * Whether module is a TypeScript project.
   */
  public get isTypeScript(): boolean {
    return this.tsConfig !== undefined || this.package.types !== undefined;
  }

  /**
   * Reloads configuration. This may be useful if you create or update your configuration file.
   */
  public reloadConfig(): void {
    this.config = this._configName ? (cosmiconfig(this._configName).searchSync(this.root) || { config: {} }).config : {};
  }

  /**
   * Fetches a dependent module's version.
   *
   * @param moduleName is the name of the module to get version of.
   * @param dependencyTypes are array of dependency types to search module in.
   * @returns version of the `moduleName`.
   */
  public getDependencyVersion(
    moduleName: string,
    dependencyTypes: DependencyType[] = [
      DependencyType.Dependencies,
      DependencyType.DevDependencies,
      DependencyType.PeerDependencies,
      DependencyType.OptionalDependencies,
    ]
  ): string | undefined {
    let version;

    dependencyTypes
      .filter(dependencyType => this.package[dependencyType] !== undefined)
      .find(dependencyType => {
        const dependencies = this.package[dependencyType] as Record<string, string | undefined>;
        version = dependencies[moduleName];
        return version !== undefined;
      });

    return version;
  }

  /**
   * Checks whether `moduleName` module exists in given [[DependencyType dependency types]] of `package.json`.
   *
   * @param moduleName is the name of the module to search for.
   * @param dependencyTypes are array of dependency types to search module in.
   * @returns whether `moduleName` exists in one of the dependency types.
   */
  public hasAnyDependency(
    moduleNames: string | string[],
    dependencyTypes: DependencyType[] = [
      DependencyType.Dependencies,
      DependencyType.DevDependencies,
      DependencyType.PeerDependencies,
      DependencyType.OptionalDependencies,
    ]
  ): boolean {
    return arrify(moduleNames).some(moduleName => this.getDependencyVersion(moduleName, dependencyTypes) !== undefined);
  }

  /**
   * Checks single or multiple module's existence in any of the `package.json` dependencies.
   *
   * @param moduleNames are Module or modules to check whether this module has any dependency.
   * @param trueValue is the Value to return if any of the moduleNames exist in any dependency.
   * @param falseValue is the Value to return if none of the moduleNames exist in any dependency.
   * @returns `trueValue` if module depends on any of the `moduleNames`. Otherwise returns `falseValue`.
   */
  public ifAnyDependency<T, F>(moduleNames: string | string[]): boolean;
  public ifAnyDependency<T, F>(moduleNames: string | string[], t: T): T | false;
  public ifAnyDependency<T, F>(moduleNames: string | string[], t: T, f: F): T | F;
  public ifAnyDependency<T, F>(moduleNames: string | string[], t: T | true = true, f: F | false = false): T | F | boolean {
    const hasIt = arrify(moduleNames).some(
      moduleName =>
        this.getDependencyVersion(moduleName, [
          DependencyType.Dependencies,
          DependencyType.DevDependencies,
          DependencyType.PeerDependencies,
          DependencyType.OptionalDependencies,
        ]) !== undefined
    );

    return hasIt ? t : f;
  }

  /**
   *
   * Returns absolute path of given path parts relative to module root.
   *
   * @param parts are path or array of path parts relative to module root.
   * @returns absolute path to given destination.
   * @example
   * // In /path/to/project/node_modules/module-a/src/index.js
   * module.pathOf("images", "photo.jpg"); // /path/to/project/node_modules/module-a/images/photo.jpg
   */
  public pathOf(...parts: string[]): string {
    return join(this.root, ...parts);
  }

  /**
   * Reads content of file from `pathInModule` path relative to module's root.
   *
   * @param pathInModule is file path relative to module root.
   * @returns file contents.
   */
  public readSync(pathInModule: string): string {
    return readFileSync(join(this.root, pathInModule), "utf8");
  }

  /**
   * Reads, parses and returns content of file from `pathInTargetModule` path relative to module's root.
   *
   * @param pathInModule is file path relative to module root.
   * @returns parsed file content as a JavaScript object.
   */
  public parseSync(pathInModule: string): Record<string, any> {
    return this.parseWithFormatSync(pathInModule).data;
  }

  /**
   * Reads and parses content of file from `pathInTargetModule` path relative to module's root
   * and retunrs format and parsed object.
   *
   * @param pathInModule is file path relative to module root.
   * @returns file format and data.
   */
  public parseWithFormatSync(pathInModule: string): { format: FileFormat; data: Record<string, any> } {
    return parseString(this.readSync(pathInModule));
  }

  /**
   * Serializes, formats and writes `data` to file `pathInTargetModule` path relative to module's root.
   *
   * @param pathInModule is file path relative to module root.
   * @param data is content to write to file.
   * @param format is file format to be used for serializing.
   * @param overwrite allows overwrite.
   * @param ifEqual allows modification if only value stored at `path` equals/deeply equals to it's value.
   * @param ifNotEqual allows modification if only value stored at `path` not equals/deeply equals to it's value.
   * @param prettier is whether to use prettier to format file.
   */
  public writeSync(
    pathInModule: string,
    data: string | Record<string, any>,
    {
      format = "json",
      overwrite = this._overwrite,
      prettier: usePrettier = true,
      ifEqual,
      ifNotEqual,
    }: { format?: FileFormat; overwrite?: boolean; prettier?: boolean; ifEqual?: string | object; ifNotEqual?: string | object } = {} as any
  ): void {
    let templateKey = getNotModifyReasonTemplateKey(this, pathInModule, { overwrite, ifEqual, ifNotEqual });

    if (!templateKey) {
      const path = this.pathOf(pathInModule);
      const prettierConfig = usePrettier ? this.getPrettierConfigSync(pathInModule) || {} : undefined;
      const serialized = serialize(data, format);
      const content = prettierConfig && prettierConfig.parser ? prettier.format(serialized, prettierConfig) : serialized;

      outputFileSync(path, content, "utf8");
      templateKey = "fileOp";
    }

    this._logTemplate(templateKey, { file: pathInModule, op: "written" });
  }

  /**
   * Removes file `pathInTargetModule` path relative to module's root.
   *
   * @param pathInModule is file path relative to module root.
   * @param ifEqual allows modification if only value stored at `path` equals/deeply equals to it's value.
   * @param ifNotEqual allows modification if only value stored at `path` equals/deeply equals to it's value.
   */
  public removeSync(pathInModule: string, { ifEqual, ifNotEqual }: { ifEqual?: string | object; ifNotEqual?: string | object } = {}): void {
    let templateKey = getNotModifyReasonTemplateKey(this, pathInModule, { overwrite: true, ifEqual, ifNotEqual });

    if (!templateKey) {
      removeSync(this.pathOf(pathInModule));
      templateKey = "fileOp";
    }

    this._logTemplate(templateKey, { file: pathInModule, op: "deleted" });
  }

  /**
   * Checks whether given path exists.
   *
   * @param pathInModule is file/directory path relative to module root.
   * @returns whether given path exists.
   */
  public existsSync(pathInModule: string): boolean {
    return existsSync(this.pathOf(pathInModule));
  }

  /**
   * Renames given path.
   *
   * @param oldPathInModule is old path to rename relative to module root.
   * @param newPathInModule is new path to rename relative to module root.
   * @param overwrite is whether to allow rename operation if target path already exists. Silently ignores operation if overwrite is not allowed and target path exists.
   */
  public renameSync(oldPathInModule: string, newPathInModule: string, { overwrite = this._overwrite } = {}): void {
    const [oldPath, newPath] = [this.pathOf(oldPathInModule), this.pathOf(newPathInModule)];
    if (this.existsSync(newPathInModule) && !overwrite) {
      this._logTemplate("fileNotRenamedExists", { source: oldPathInModule, target: newPathInModule });
    } else {
      renameSync(oldPath, newPath);
      this._logTemplate("fileRenamed", { source: oldPathInModule, target: newPathInModule });
    }
  }

  /**
   * Gets [[DataFile]] for `pathInModule` file. [[DataFile]] provide useful utilities to work with data files.
   *
   * @param pathInModule is file path relative to module root.
   * @param defaultFormat is default file format to be used during file creation if file is not found and format cannot be inferred from file extension.
   * @returns [[DataFile]] instance for `pathInModule`.
   */
  public getDataFileSync(pathInModule: string, { defaultFormat = "json" }: { defaultFormat: FileFormat } = {} as any): DataFile {
    const absolutePath = this.pathOf(pathInModule);
    const extension = extname(this.pathOf(pathInModule)).slice(1) as FileFormat;
    const format = extension || defaultFormat;
    const prettierConfig = this.getPrettierConfigSync(extension ? absolutePath : `${absolutePath}.${format}`) || {};
    return new DataFile(absolutePath, pathInModule, this._logger, prettierConfig, format);
  }

  /**
   * Checks whether content of `pathInModule` file is equal to `data` by making string comparison (for strings)
   * or deep comparison (for objects).
   *
   * @param pathInModule is file path relative to module root.
   * @param data is string or JavaScript object to compare to file's content.
   * @returns whether `pathInModule` file content is equal to `data`.
   * @example
   * const isConfigEqual = module.isFileEqual("config.json", { size: 4 });
   * const textEqual = module.isFileEqual("some.txt", "content");
   */
  public isEqual(pathInModule: string, data: string | Record<string, any>): boolean {
    return typeof data === "object" ? isEqual(data, this.parseSync(pathInModule)) : this.readSync(pathInModule) === data;
  }

  /**
   * Fetches prettier configuration for `pathInModule` file. Prettier uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)
   * which may be cascaded. If no file path is given returns configuration located in module root.
   *
   * Also adds necessary parser to configuration if not exists.
   *
   * @param pathInModule is file path relative to module root.
   * @returns prettier configuration for given file.
   */
  public getPrettierConfigSync(pathInModule: string = this.root): prettier.Options | null {
    const path = this.pathOf(pathInModule);
    const prettierConfig = prettier.resolveConfig.sync(path);
    if (prettierConfig && !prettierConfig.parser) {
      prettierConfig.parser = prettier.getFileInfo.sync(path).inferredParser as typeof prettierConfig.parser;
    }
    return prettierConfig;
  }

  /**
   * Searches path of the `executable` located in `node_modules/.bin` relative to current working directory (`cwd`).
   *
   * @param bin is the name or path of the bin relative to `node_modules/.bin`;
   * @returns path relative to cwd().
   * @example
   * module.bin("my/command"); // ./from/CWD//to/module/node_modules/.bin/my/command
   */
  public bin(bin: string): string {
    const relativePath = relative(process.cwd(), this.pathOf(`node_modules/.bin/${bin}`));
    return `.${sep}${relativePath}`;
  }

  /**
   * Executes given command using `spawn.sync` with given arguments and options.
   *
   * @param bin is binary file to execute.
   * @param args are arguments to pass to executable.
   * @param options are passed to [Execa](https://www.npmjs.com/package/execa).
   * @returns [[ExecaSyncReturnValue]] instance.
   * @example
   * module.executeSync("ls"); // Run `ls`.
   * module.executeSync("ls", ["-al"]); // Run `ls -al`.
   */
  public executeSync(bin: string, args?: string[], options?: SyncOptions): ExecaSyncReturnValue;
  public executeSync(bin: string, args?: string[], options?: SyncOptions<null>): ExecaSyncReturnValue<Buffer>;
  public executeSync(bin: string, options?: SyncOptions): ExecaSyncReturnValue;
  public executeSync(bin: string, options?: SyncOptions<null>): ExecaSyncReturnValue<Buffer>;
  public executeSync(
    bin: string,
    args?: string[] | SyncOptions | SyncOptions<null>,
    options?: SyncOptions | SyncOptions<null>
  ): ExecaSyncReturnValue | ExecaSyncReturnValue<Buffer> {
    const execaArgs = applyCommandDefaults([bin, args, options] as ExecaCommandSync, { stdio: "inherit", cwd: this.root });
    return execa.sync(...execaArgs);
  }

  /**
   * Executes multiple commands serially using [Execa](https://www.npmjs.com/package/execa) or parallel using [concurrently](https://www.npmjs.com/package/concurrently).
   * By default commands are executed serially. If commands are provided in an object they are executed concurrently. (keys are names, values are commands).
   * To provide execa options to concurrently commands use [[executeAllWithOptionsSync]]. If command is `undefined` or `null`, it will be skipped. This is useful for
   * conditional commands.
   *
   * @param commands are list of commands to execute.
   * @returns [[CommandResults]] instance, which contains results of the executed commands.
   * @example
   * module.executeAllSync("ls", ["ls", ["-al"]]); // Run: `ls` then `ls -al`.
   * module.executeAllSync({ "ls1": "ls", "ls2": ["ls", ["-al"]] }); // Run `ls` and `ls -al` concurrently.
   * module.executeAllSync("ls", { "ls2": ["ls", ["-a"]], "ls3": ["ls", ["-al"]] }); // Run `ls` then `ls -a` and `ls -al` concurrently.
   * const result = module.executeAllSync(
   *   [
   *     "serialCommand1", ["arg"]],
   *     "serialCommand2",
   *     someCondition ? "serialCommand3" : null,
   *     {
   *       myParallelJob1: ["someCommant4", ["arg"],
   *       myParallelJob2": "someCommand4"
   *       builder: ["tsc", ["arg"]],
   *     },
   *     [
   *       "other-serial-command", ["arg"]
   *     ],
   *   ]
   * );
   */
  public executeAllSync(...commands: SerialCommands): CommandResults {
    return this.executeAllWithOptionsSync({}, ...commands);
  }

  /**
   * Executes multiple commands with given options. See [[executeAllSync]] fro details.
   *
   * @param options are options to pass to [Execa](https://www.npmjs.com/package/execa) executing [concurrently](https://www.npmjs.com/package/concurrently).
   * @param commands are list of commands to execute.
   * @returns [[CommandResults]] instance, which contains results of the executed commands.
   */
  public executeAllWithOptionsSync(options: ExecuteAllSyncOptions, ...commands: SerialCommands): CommandResults {
    const results = new CommandResults();
    const defaultOptions: ExecuteAllSyncOptions = { stdio: "inherit", cwd: this.root, stopOnError: true, throwOnError: true, ...options };

    commands.filter(Boolean).every(command => {
      const execaArgs: [string, string[], SyncOptions?] = isParallelCommands(command)
        ? [this.bin("concurrently"), getConcurrentlyArgs(command, defaultOptions), defaultOptions]
        : applyCommandDefaults(command, defaultOptions);

      try {
        const result = execa.sync(...execaArgs);
        results.add(result);
        this._logIfDefined(LogLevel.Info, result.stdout);
        this._logIfDefined(LogLevel.Error, result.stderr);
      } catch (err) {
        results.add(err);
        if (defaultOptions.throwOnError) {
          throw err;
        }
      }

      return !defaultOptions.stopOnError || results.status === 0;
    });

    return results;
  }

  /**
   * Installs `packageName` node module using specified package manager.
   *
   * @param packageName is the name of the package to install.
   * @param type is the dependency type of the package. `dev`, `peer`, `optional`.
   */
  public install(packageName: string, { type = DependencyType.Dependencies }: { type?: DependencyType } = {} as any): void {
    const types: Record<DependencyType, string> = {
      dependencies: "",
      devDependencies: "dev",
      peerDependencies: "peer",
      optionalDependencies: "optional",
    };

    let args;

    if (this._packageManager === "npm") {
      const typeFlag = types[type] ? [`--save-${types[type]}`] : [];
      args = ["install", packageName, ...typeFlag];
    } else {
      const typeFlag = types[type] ? [`--${types[type]}`] : [];
      args = ["add", packageName, ...typeFlag];
    }
    execa.sync(this._packageManager, args, { cwd: this.root });
  }

  /**
   * Uninstalls `packageName` node module using specified package manager.
   *
   * @param packageName is the name of the package to uninstall.
   * @param type is the dependency type of the package. `dev`, `peer`, `optional`.
   */
  public uninstall(packageName: string): void {
    if (this._packageManager === "npm") {
      execa.sync("npm", ["uninstall", packageName], { cwd: this.root });
    } else if (this._packageManager === "yarn") {
      execa.sync("yarn", ["remove", packageName], { cwd: this.root });
    }
  }
}
