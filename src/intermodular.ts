/* eslint-disable @typescript-eslint/no-empty-function */
import { DataFile, Logger, LogLevel } from "edit-config";
import { ExecaReturnValue } from "execa";
import { dirname, extname } from "path";
import parentModule from "parent-module";
import { copy, CopyFilterAsync } from "fs-extra";
import isEqual from "lodash.isequal";
import { CopyOptions, ExecuteOptions, StdioOption } from "./util/types";
import Module from "./module";
import { getCopyTarget, getModifiedExecuteOptions, getExecaArgs } from "./util/helper";

import swc = require("@swc/core"); // eslint-disable-line import/order

export default class Intermodular {
  /** [[Module]] instance of node module which is used as source for modification operations such as copy, update. */
  public readonly sourceModule: Module;

  /** [[Module]] instance of node module which is used as target for modification operations such as copy, update. */
  public readonly targetModule: Module;

  /** Configuration for source module in target module as a [DataFile](https://www.npmjs.com/package/edit-config#class-datafile) instance. */
  public readonly config: DataFile;

  /** Winston compatible logger. */
  public readonly logger: Logger;

  private constructor(sourceModule: Module, targetModule: Module, config: DataFile, logger: Logger = { log: () => {} }) {
    this.sourceModule = sourceModule;
    this.targetModule = targetModule;
    this.logger = logger;
    this.config = config;
  }

  /**
   * Logs given message with required level using logger provided during object construction.
   *
   * @param logLevel is the level to log message.
   * @param message is the message to log.
   */
  public log(logLevel: LogLevel, message: string): void {
    this.logger.log(logLevel, message);
  }

  /**
   * Creates;
   * 1. An augmented filter function for given `fs-extra` `copy` filter function.
   * 2. A log function.
   *
   * @param filter `intermodular` copy filter function.
   * @param overwrite is whether overwirte option is passed to `fs-extra` `copy` function.
   * @param excludeDirFromReturn is wether to return copied files only. If this is true, directories are excluded from return value.
   * @returns `fs-extra` `copy` compatible filter function and log function and function to get copied paths.
   */
  private getCopyFilterAndLogFunctions({
    filter,
    overwrite,
    excludeDirFromReturn,
  }: CopyOptions): [CopyFilterAsync, (e?: Error) => void, () => string[]] {
    const pairStatus: Map<string, boolean> = new Map();
    const logs: Array<[LogLevel, string]> = [];
    const copiedPaths: string[] = [];

    /** Delete last log message if thereis an error. execute log() for each log message. */
    const logFunction = (error?: Error): void => {
      if (error) logs.pop(); // If error thrown during copy last log entry would be false, because it is prepared before copy action.
      logs.forEach((log) => this.log(log[0], log[1]));
    };

    const getCopiedPathsFunction = (): string[] => copiedPaths;

    /** filter function to be provided to `fs-extra` `copy`. */
    const filterFunction = async (fullSourcePath: string, fullTargetPath: string): Promise<boolean> => {
      const pair = `'${fullSourcePath}' → '${fullTargetPath}'`;
      if (pairStatus.has(pair)) return pairStatus.get(pair) === true; // Filter called twice see: https://github.com/jprichardson/node-fs-extra/issues/809

      let rejected: string | undefined;

      const relativeSource = this.sourceModule.relativePathOf(fullSourcePath);
      const relativeTarget = this.targetModule.relativePathOf(fullTargetPath);
      const filePair = `'${relativeSource || "."}' → '${relativeTarget || "."}'`;

      const [sourceIsDir, targetIsDir, targetExists] = await Promise.all([
        this.sourceModule.isDirectory(relativeSource),
        this.targetModule.isDirectory(relativeTarget),
        this.targetModule.exists(relativeTarget),
      ]);

      if (targetExists && !targetIsDir && !overwrite) rejected = "(Exists) ";

      if (filter) {
        const sourceContent = sourceIsDir ? undefined : await this.sourceModule.read(relativeSource);
        const targetContent = targetIsDir ? undefined : await this.targetModule.read(relativeTarget);
        const isOk = await filter(fullSourcePath, fullTargetPath, sourceIsDir, targetIsDir, sourceContent, targetContent);
        if (!isOk) rejected = "(Filtered) ";
      }

      const logLevel = rejected ? "warn" : "info";
      if (sourceIsDir && !rejected) logs.push(["info", `Starting to copy files between directories: ${filePair}`]);
      else logs.push([logLevel, `File ${rejected ? "not " : ""}copied: ${rejected ?? ""}${filePair}`]);

      pairStatus.set(pair, !rejected);
      if (!rejected && (!sourceIsDir || !excludeDirFromReturn)) copiedPaths.push(relativeTarget);

      return !rejected;
    };
    return [filterFunction, logFunction, getCopiedPathsFunction];
  }

  /**
   * Copies a file or directory from `pathInSourceModule` relative to source module root to `pathInTargetModule`relative to
   * target module root. The directory can have contents. Like cp -r.
   * **IMPORTANT:** Note that if source is a directory it will copy everything inside of this directory, not the entire directory itself.
   *
   * @param sourcePath is source to copy from.
   * @param targetPath is destination to copy to. Cannot be a directory.
   * @param options are options.
   * @returns copied files and directories. Directories can be optionally excluded.
   *
   * @example
   * // Copy everything in `/path/to/project/node_modules/module-a/src/config/` to `/path/to/project/`
   * const copiedPaths = copySync("src/config", ".");
   * const copiedFiles = copySync("src/config", ".", { excludeDirFromReturn: true });
   */
  public async copy(sourcePath: string, targetPath: string = sourcePath, copyOptions: CopyOptions = {}): Promise<string[]> {
    const source = this.sourceModule.pathOf(sourcePath);
    const target = await getCopyTarget(source, this.targetModule.pathOf(targetPath));
    if (source === target) return [];
    const [augmentedFilter, logCopyOperation, getCopiedPaths] = this.getCopyFilterAndLogFunctions(copyOptions);

    try {
      await copy(source, target, { ...copyOptions, filter: augmentedFilter });
      logCopyOperation();
    } catch (error) {
      logCopyOperation(error);
      throw error;
    }

    return getCopiedPaths();
  }

  /**
   * Executes given command using `execa` with given arguments and options with cwd as target module's root. Applies sensible default options.
   * Additionally adds source module's `node_modules/.bin` to path.
   *
   * @param bin is binary file to execute.
   * @param args are arguments to pass to executable.
   * @param options are passed to {@link https://www.npmjs.com/package/execa Execa}.
   * @returns [[ExecaReturnValue]] instance.
   *
   * @example
   * intermodular.execute("ls"); // Run `ls`.
   * intermodular.execute("ls", ["-al"], { stdio: "inherit" }); // Run `ls -al`.
   */
  public async execute(bin: string, args?: string[], options?: ExecuteOptions): Promise<ExecaReturnValue>;
  public async execute(bin: string, args?: string[], options?: ExecuteOptions<null>): Promise<ExecaReturnValue<Buffer>>;
  /**
   * Executes given command using `execa` with given arguments and options with cwd as target module's root. Applies sensible default options.
   * Additionally adds source module's `node_modules/.bin` to path.
   *
   * @param bin is binary file to execute.
   * @param options are passed to {@link https://www.npmjs.com/package/execa Execa}.
   * @returns [[ExecaReturnValue]] instance.
   *
   * @example
   * intermodular.execute("ls"); // Run `ls`.
   * intermodular.execute("ls", { stdio: "inherit" }); // Run `ls`.
   */
  public async execute(bin: string, options?: ExecuteOptions): Promise<ExecaReturnValue>;
  public async execute(bin: string, options?: ExecuteOptions<null>): Promise<ExecaReturnValue<Buffer>>;
  public async execute(
    bin: string,
    arg2?: string[] | ExecuteOptions | ExecuteOptions<null>,
    arg3?: ExecuteOptions | ExecuteOptions<null>
  ): Promise<ExecaReturnValue | ExecaReturnValue<Buffer>> {
    const [args, options] = getExecaArgs(arg2, arg3);
    return this.targetModule.execute(bin, args, getModifiedExecuteOptions(this.sourceModule, options) as any);
  }

  /**
   * Executes given command using `execa.command` with cwd as target module's root. Additionally adds source module's `node_modules/.bin` to path.
   *
   * @param cmd is command to execute.
   * @param options are passed to {@link https://www.npmjs.com/package/execa Execa}.
   * @returns [[ExecaReturnValue]] instance.
   *
   * @example
   * intermodular.command("ls"); // Run `ls`.
   * intermodular.command("ls -al", { stdio: "inherit" }); // Run `ls -al`.
   */
  public async command(cmd: string, options?: ExecuteOptions): Promise<ExecaReturnValue>;
  public async command(cmd: string, options?: ExecuteOptions<null>): Promise<ExecaReturnValue<Buffer>>;
  public async command(cmd: string, options?: ExecuteOptions | ExecuteOptions<null>): Promise<ExecaReturnValue | ExecaReturnValue<Buffer>> {
    return this.targetModule.command(cmd, getModifiedExecuteOptions(this.sourceModule, options) as any);
  }

  /**
   * Returns whether given files from source module and target module are equal using method described below:
   * - For data files such as `JSON` or `YAML`, returns whether they are deeply equal. (Objects does not have to have same key order.)
   * - For `.js` and `.ts` files, files are transpiled and minified then copmpared. (To overcome comment and simple format changes.)
   * - For other files returns whether their string content are equal.
   *
   * @param sourceModuleFilePath is the file path relative to source module root.
   * @param targetModuleFilePath is the file path relative to target module root. If not provided uses same relative path as `sourceModuleFilePath`.
   * @returns whether given files are equivalent.
   *
   * @example
   * intermodular("module-files/src/address.js", "src/address.js");
   * intermodular("module-files/config/.eslintrc", ".eslintrc");
   * intermodular("module-files/some.txt", "some.txt");
   */
  public async areEquivalentFiles(sourceModuleFilePath: string, targetModuleFilePath: string = sourceModuleFilePath): Promise<boolean> {
    const sourceExtension = [".js", ".ts"];
    const isSource = sourceExtension.includes(extname(sourceModuleFilePath)) && sourceExtension.includes(extname(targetModuleFilePath));
    const readMethod = isSource ? "readRaw" : "read";
    const left = await this.sourceModule[readMethod](sourceModuleFilePath);
    const right = await this.targetModule[readMethod](targetModuleFilePath);
    const parserOptions: swc.Options = { sourceMaps: true, minify: true, jsc: { parser: { syntax: "typescript" } } };

    if (left === undefined || right === undefined) return false;
    if (left instanceof DataFile && right instanceof DataFile) return isEqual(left.data, right.data);
    if (isSource)
      return (await swc.transform(left as string, parserOptions)).code === (await swc.transform(right as string, parserOptions)).code;
    return isEqual(left, right);
  }

  //
  // ──────────────────────────────────────────────────────────────────── I ──────────
  //   :::::: S T A T I C   M E T H O D S : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────
  //

  /**
   * Creates and returns [[Intermodular]] instance.
   * @param __namedParameters are options
   * @param source is the source module or a path in source module. By default immediate parent's root dir is used. Immediate parent is the file which calls this method.
   * @param target is the target module or a path in target module. By default `process.env.INIT_CWD` or `process.env.CWD` is used whichever is first available.
   * @param logger is Winston compatible logger or `console`.
   * @param overwrite is whether to overwrite files by default.
   * @returns [[Intermodular]] instance.
   */

  public static async new({
    source,
    target,
    logger,
    overwrite,
    commandStdio,
  }: {
    source?: string | Module;
    target?: string | Module;
    logger?: Logger;
    overwrite?: boolean;
    commandStdio?: StdioOption;
  } = {}): Promise<Intermodular> {
    const [resolvedSource, resolvedTarget]: Array<string | Module | undefined> = await Promise.all([
      source || dirname(parentModule() as string), // Do not move parentModule() into another method, otherwise it resolves this file, because it's caller would be this method.
      target || process.env.INIT_CWD || process.cwd(),
    ]);

    this.assertSourceAndTarget(resolvedSource, resolvedTarget);

    const [sourceModule, targetModule] = await Promise.all([
      resolvedSource instanceof Module ? resolvedSource : Module.new({ cwd: resolvedSource, logger, commandStdio, overwrite }),
      resolvedTarget instanceof Module ? resolvedTarget : Module.new({ cwd: resolvedTarget, logger, commandStdio, overwrite }),
    ]);

    const config = await DataFile.load(sourceModule.nameWithoutUser, { cosmiconfig: true, rootDir: targetModule.root, logger }); // Exclude from saveAll(), user may prefer not to use it.

    return new Intermodular(sourceModule, targetModule, config, logger);
  }

  // istanbul ignore next
  /** Throws if source or target file are undefined. */
  private static assertSourceAndTarget(source: any, target: any): void {
    if (!source) throw new Error("Source not provided and cannot be found.");
    if (!target) throw new Error("Target not provided and cannot be found.");
  }

  /**
   * Returns whether `variable` is set in environment variables and not empty.
   *
   * @param variable is name of the environment variable to check.
   * @returns whether given environment variable is set and not empty.
   */
  public static isEnvSet(variable: string): boolean {
    return (
      Object.prototype.hasOwnProperty.call(process.env, variable) && process.env[variable] !== "" && process.env[variable] !== "undefined"
    );
  }

  /**
   * Parses and returns `variable` environment variable. If value is JSON object, parses using JSON5 and returns it as a JavaScript object.
   * Otherwise returns `defaultValue`.
   *
   * @param variable is Name of the environment variable
   * @param defaultValue is value to return if no environment variable is set or is empty.
   * @returns environment variable (if possible as an object) or default value.
   */
  public static parseEnv<T>(variable: string, defaultValue?: T): string | number | Record<string, any> | T | undefined {
    if (this.isEnvSet(variable)) {
      const result = process.env[variable] as string;
      try {
        return JSON.parse(result);
      } catch (err) {
        return result;
      }
    }
    return defaultValue;
  }
}
