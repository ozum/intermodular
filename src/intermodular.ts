/* eslint-disable @typescript-eslint/no-empty-function */
import { DataFile, Logger, LogLevel } from "edit-config";
import { dirname } from "path";
import pkgDir from "pkg-dir";
import parentModule from "parent-module";
import { copy, CopyFilterAsync } from "fs-extra";
import { CopyFilterFunction, CopyOptions } from "./util/types";
import Module from "./module";
import { getCopyTarget } from "./util/helper";

export default class Intermodular {
  /** [[Module]] instance of node module which is used as source for modification operations such as copy, update. */
  public readonly sourceModule: Module;

  /** [[Module]] instance of node module which is used as target for modification operations such as copy, update. */
  public readonly targetModule: Module;

  /** Configuration for source module in target module as a [DataFile](https://www.npmjs.com/package/edit-config#class-datafile) instance. */
  public readonly config: DataFile;

  #overwrite: boolean;
  #logger: Logger;

  private constructor(sourceModule: Module, targetModule: Module, config: DataFile, logger: Logger = { log: () => {} }, overwrite = false) {
    this.sourceModule = sourceModule;
    this.targetModule = targetModule;
    this.#logger = logger;
    this.#overwrite = overwrite;
    this.config = config;
  }

  /**
   * Logs given message with required level using logger provided during object construction.
   *
   * @param logLevel is the level to log message.
   * @param message is the message to log.
   */
  public log(logLevel: LogLevel, message: string): void {
    this.#logger.log(logLevel, message);
  }

  /**
   * Takes `intermodular` copy filter function and returns `fs-extra` `copy` compatible filter function.
   *
   * @param filter `intermodular` copy filter function.
   * @returns `fs-extra` `copy` compatible filter function.
   */
  private getCopyFilter(filter?: CopyFilterFunction): CopyFilterAsync {
    return async (fullSourcePath: string, fullTargetPath: string) => {
      let result = true;
      const relativeSource = this.sourceModule.relativePathOf(fullSourcePath);
      const relativeTarget = this.targetModule.relativePathOf(fullTargetPath);

      if (filter) {
        const [isSourceDir, isTargetDir] = await Promise.all([
          this.sourceModule.isDirectory(relativeSource),
          this.targetModule.isDirectory(relativeTarget),
        ]);

        const sourceContent = isSourceDir ? undefined : await this.sourceModule.read(relativeSource);
        const targetContent = isTargetDir ? undefined : await this.targetModule.read(relativeTarget);
        result = await filter(fullSourcePath, fullTargetPath, isSourceDir, isTargetDir, sourceContent, targetContent);
      }

      const logLevel = result ? LogLevel.Info : LogLevel.Warn;
      this.log(logLevel, `File ${result ? "" : "not "}copied: '${relativeSource}' → '${relativeTarget}'`);
      return result;
    };
  }

  /**
   * Copies a file or directory from `pathInSourceModule` relative to source module root to `pathInTargetModule`relative to
   * target module root. The directory can have contents. Like cp -r.
   * Note that if src is a directory it will copy everything inside of this directory, not the entire directory itself.
   *
   * @param sourcePath is source to copy from.
   * @param targetPath is destination to copy to. Cannot be a directory.
   * @param options are options.
   *
   * @example
   * // Copy everything in `/path/to/project/node_modules/module-a/src/config/` to `/path/to/project/`
   * copySync("src/config", ".");
   */
  public async copy(sourcePath: string, targetPath: string = sourcePath, copyOptions: CopyOptions = {}): Promise<void> {
    const source = this.sourceModule.pathOf(sourcePath);
    const target = await getCopyTarget(source, this.targetModule.pathOf(targetPath));
    if (source === target) return;
    await copy(source, target, { ...copyOptions, filter: this.getCopyFilter(copyOptions.filter) });
  }

  //
  // ──────────────────────────────────────────────────────────────────── I ──────────
  //   :::::: S T A T I C   M E T H O D S : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────
  //

  /**
   * Creates and returns [[Intermodula ]]
   * @param param0
   */
  public static async new({
    sourceRoot,
    targetRoot,
    logger,
    overwrite,
  }: { sourceRoot?: string; targetRoot?: string; logger?: Logger; overwrite?: boolean } = {}): Promise<Intermodular> {
    const [sourceModule, targetModule] = await Promise.all([
      Module.new({ cwd: sourceRoot || (await this.getDefaultSourceRoot()), logger }),
      Module.new({ cwd: targetRoot || (await this.getDefaultTargetRoot()), logger }),
    ]);

    const config = await targetModule.readData(sourceModule.nameWithoutUser, { cosmiconfig: true });
    return new Intermodular(sourceModule, targetModule, config, logger, overwrite);
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

  // istanbul ignore next
  /** Returns default source root */
  private static async getDefaultSourceRoot(): Promise<string> {
    const parent = parentModule();
    if (!parent) throw new Error("Cannot find source root.");
    const root = await pkgDir(dirname(parent));
    if (!root) throw new Error("Cannot find source root.");
    return root;
  }

  // istanbul ignore next
  /** Returns default target root */
  private static async getDefaultTargetRoot(): Promise<string> {
    const root = await pkgDir(process.env.INIT_CWD || process.env.CWD);
    if (!root) throw new Error(`Cannot find target root.`);
    return root;
  }
}
