/** dwdwd @preferred */
/* eslint-disable no-nested-ternary, @typescript-eslint/no-explicit-any */
import parentModule from "parent-module";
import pkgDir from "pkg-dir";
import { Logger } from "winston";
import { dirname, relative, resolve, basename } from "path";
import { copySync, CopyOptionsSync, lstatSync, existsSync } from "fs-extra";
import chalk from "chalk";
import Module from "./module";
import { createLogger, logTemplate, getNotModifyReasonTemplateKey, findTopPackageDir } from "./util";
import { LogLevel } from "./types";
import TEMPLATES from "./messages";

/**
 * Options for file copy operation.
 */
interface ExtendedCopyOptionsSync extends CopyOptionsSync {
  /** allows modification if only value stored at `path` equals/deeply equals to it's value. */
  ifEqual?: string | Record<string, any>;
  /** allows modification if only value stored at `path` not equals/deeply equals to it's value. */
  ifNotEqual?: string | Record<string, any>;
}

/**
 * Easy file operations between node.js modules and auto logging to help building zero-config boilerplates, postinstall and other scripts.
 *
 * @example
 * import Intermodular from "intermodular";
 *
 * const intermodular = new Intermodular(); // (Defaults) Source: Your module, Target: Module installed your module as a dependency.
 * intermodular.copySync("common-config", "."); // Copy all files from your modules `common-config` to target module's root.
 *
 * if (targetModule.isTypeScript) {
 *   intermodular.copySync("config/tsconfig.json", ".");
 * }
 *
 * const targetModule = intermodular.targetModule;
 * const moduleName = targetModule.name;
 * targetModule.install("lodash"); // Install lodash.
 * targetModule.getDependencyVersion("lodash"); // Get version info from package.json
 * targetModule.executeSync("rm", ["-rf", "some-directory"]); // Execute shell command.
 * targetModule.pathOf("config/tsconfig.json"); // Absolute path.
 *
 * // Do some individual data level operations:
 * const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
 * packageJson.set("keywords", ["some-key"], { ifNotExists: true });
 * packageJson.set("description", `My awesome ${moduleName}`, { ifNotExists: true });
 * packageJson.assign("scripts", { build: "tsc", test: "jest", }, { ifNotExists: true });
 * packageJson.orderKeys(["name", "version", "description", "keywords", "scripts"]); // Other keys come after.
 * packageJson.saveSync();
 */
export default class Intermodular {
  private readonly _logger: Logger;
  private readonly _overwrite: boolean;

  /**
   * [[Module]] instance of node module which is used as source for modification operations such as copy, update.
   */
  public readonly sourceModule: Module;

  /**
   * [[Module]] instance of node module which is used as target for modification operations such as copy, update.
   */
  public readonly targetModule: Module;

  /**
   * Root directory of the parent module, which installs your module.
   * This is the directory which contains `package.json` file of the parent module.
   */
  public readonly myRoot: string = pkgDir.sync(dirname(parentModule() || "")) || "";

  /**
   * Root directory of your module which requires this module.
   * This is the directory which contains `package.json` file of your module.
   */
  public readonly parentModuleRoot: string = findTopPackageDir(this.myRoot) || "";

  /**
   * Creates an instance.
   *
   * @param sourceRoot is absolute path of source root, which is used as source for copying files etc.
   * @param targetRoot is absolute path of target root, which is used as target for copying files etc.
   * @param logLevel is default log level to show. ("error", "warn", "info", "verbose", "debug" or "silly")
   * @param overwrite is default overwrite option for operations. Changes all write operation's default behavior. Also wverwrite option can be set for each operation individually.
   * @param packageManager is package manager to use in modules.
   */
  public constructor({
    sourceRoot,
    targetRoot,
    logLevel = LogLevel.Info,
    overwrite = false,
    packageManager = "npm",
  }: {
    sourceRoot?: string;
    targetRoot?: string;
    logLevel?: LogLevel;
    overwrite?: boolean;
    packageManager?: "npm" | "yarn";
  } = {}) {
    this._logger = createLogger(logLevel);
    this._overwrite = overwrite;
    this.sourceModule = new Module(sourceRoot ? resolve(sourceRoot) : this.myRoot, this._logger, this._overwrite, packageManager);
    this.targetModule = new Module(
      targetRoot ? resolve(targetRoot) : this.parentModuleRoot,
      this._logger,
      this._overwrite,
      packageManager,
      this.sourceModule.name
    );
    this._logTemplate("construction", { source: this.sourceModule.name, target: this.targetModule.name });
  }

  /**
   * Logs precompiled template message with `key` using `args`.
   */
  private _logTemplate(key: keyof typeof TEMPLATES, args: Record<string, any>): void {
    this._logger.log(...logTemplate(key, args));
  }

  /**
   * Logs `message` with `level`.
   *
   * @param message is message text to log.
   * @param level is log level. ("error", "warn", "info", "verbose", "debug" or "silly")
   */
  public log(message: string, level: LogLevel = LogLevel.Info): void {
    this._logger.log(level, message);
  }

  /**
   * Logs `message` with `level` if it is defined.
   *
   * @param message is message text to log.
   * @param level is log level. ("error", "warn", "info", "verbose", "debug" or "silly")
   */
  public logIfDefined(message: string | undefined, level: LogLevel = LogLevel.Info): void {
    if (message !== undefined) {
      this._logger.log(level, message);
    }
  }

  /**
   * Returns path of the root of module with given `name`.
   *
   * @param name of the module to get root path of.
   * @returns root path of given module.
   * @example
   * project.resolveModule("fs-extra"); // /path/to/project/node_modules/fs-extra
   */
  public static resolveModuleRoot(name: string): string | undefined {
    const moduleMainFile = require.resolve(name); // File specified in `package.json` `main` key.
    return pkgDir.sync(moduleMainFile);
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
   * Parses and returns `variable` environment variable. If possible, parses and returns it as a JavaScript object.
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

  /**
   * Copies a file or directory from `pathInSourceModule` relative to source module root to `pathInTargetModule`relative to
   * target module root. The directory can have contents. Like cp -r.
   * Note that if src is a directory it will copy everything inside of this directory, not the entire directory itself.
   *
   * @param pathInSourceModule is source to copy from.
   * @param pathInTargetModule is destination to copy to. Cannot be a directory.
   * @param ifEqual allows modification if only value stored at `path` equals/deeply equals to it's value.
   * @param ifNotEqual allows modification if only value stored at `path` not equals/deeply equals to it's value.
   * @param overwrite whether to overwrite existing file or directory. Note that the copy operation will silently fail if you set this to false and the destination exists. Use the errorOnExist option to change this behavior.
   * @param errorOnExist if true, when overwrite is false and the destination exists, throws an error.
   * @param dereference whether to dereference symlinks.
   * @param preserveTimestamps whether to set last modification and access times to the ones of the original source files. When false, timestamp behavior is OS-dependent.
   * @param filter is `(src, dest) => boolean` function to filter copied files. Return true to include, false to exclude.
   * @example
   * // Copy everything in `/path/to/project/node_modules/module-a/src/config/` to `/path/to/project/`
   * util.copySync("src/config", ".");
   */
  public copySync(
    pathInSourceModule: string,
    pathInTargetModule: string = pathInSourceModule,
    {
      ifEqual,
      ifNotEqual,
      overwrite = this._overwrite,
      errorOnExist = false,
      dereference = false,
      preserveTimestamps = false,
      filter,
    }: ExtendedCopyOptionsSync = {}
  ): void {
    const source = this.sourceModule.pathOf(pathInSourceModule);
    let target = this.targetModule.pathOf(pathInTargetModule);

    const shouldCopy: Record<string, boolean> = {}; // Filter function called more than once for same pair. Store result not to calculate again.

    // If source is file and target is an existing directory copy into it with same file name.
    target =
      !lstatSync(source).isDirectory() && existsSync(target) && lstatSync(target).isDirectory()
        ? `${target}/${basename(pathInSourceModule)}`
        : target;

    if (source === target) {
      return;
    }

    // For logging purposes, create a filter function wrapper around original filter function.
    const filterFunction = (src: string, dest: string): boolean => {
      let notModifyReason: keyof typeof TEMPLATES | undefined;
      const relativeSource = relative(this.sourceModule.root, src); // Even source is a directory, this is the individual real destinantion file.
      const relativeDestination = relative(this.targetModule.root, dest); // Even source is a directory, this is the individual real destinantion file.
      const id = `${relativeSource}→${relativeDestination}`;

      if (Object.prototype.hasOwnProperty.call(shouldCopy, id)) {
        return shouldCopy[id];
      }

      if (!lstatSync(src).isDirectory()) {
        notModifyReason = getNotModifyReasonTemplateKey(this.targetModule, relativeDestination, { overwrite, ifEqual, ifNotEqual });

        this._logTemplate(notModifyReason || "fileOp", {
          op: "copied",
          file: `${relativeSource} ${chalk.white("→")} ${relativeDestination}`,
        });
      }

      this._logTemplate("fileCopy", { source: src, target: dest });

      // Return original filter functions result if it exists.
      shouldCopy[id] = notModifyReason === undefined && (filter ? filter(src, dest) : true);
      return shouldCopy[id];
    };

    return copySync(source, target, { overwrite, errorOnExist, dereference, preserveTimestamps, filter: filterFunction });
  }
}
