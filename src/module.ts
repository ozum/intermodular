import deleteEmpty from "delete-empty";
import { DataFile, Manager, ManagerLoadOptions, WritableFileFormat, Logger, LogLevel } from "edit-config";
import { outputFile, pathExists, readFile, remove, rename, lstat, ensureDir } from "fs-extra";
import isEqual from "lodash.isequal";
import { join, relative, isAbsolute } from "path";
import pkgDir from "pkg-dir";
import execa, { command, Options as ExecaOptions, ExecaReturnValue } from "execa";
import { arrify, packageManagerFlags, isFromFileToDirectory } from "./util/helper";
import { DependencyType, PackageManager, PredicateFileOperation } from "./util/types";

const ALL_DEPENDENCIES = [
  DependencyType.Dependencies,
  DependencyType.DevDependencies,
  DependencyType.PeerDependencies,
  DependencyType.OptionalDependencies,
];

/**
 * Class which provides information and modification methods for a module.
 */
export default class Module {
  #logger: Logger;
  #overwrite: boolean;
  #manager: Manager;

  /** Absolute path of the module's root directory, where `package.json` is located. */
  public readonly root: string;

  /** Package manager of the module. */
  public readonly packageManager: PackageManager;

  /** [DataFile](https://www.npmjs.com/package/edit-config#class-datafile) instance of `package.json`. */
  public readonly package: DataFile;

  /** Whether module is a TypeScript project. */
  public readonly isTypeScript: boolean;

  private constructor(
    root: string,
    packageData: DataFile,
    {
      logger = { log: () => {} }, // eslint-disable-line @typescript-eslint/no-empty-function
      packageManager = PackageManager.Npm,
      overwrite = false,
      isTypeScript,
    }: { logger?: Logger; packageManager?: PackageManager; overwrite?: boolean; isTypeScript: boolean }
  ) {
    this.root = root;
    this.#logger = logger;
    this.packageManager = packageManager;
    this.package = packageData;
    this.#overwrite = overwrite;
    this.#manager = new Manager({ logger, root });
    this.isTypeScript = isTypeScript;
  }

  /** Name of the module as defined in `package.json`. */
  public get name(): string {
    return this.package.get("name");
  }

  /** Name of the module without user name. For example: `typescript` for `@microsoft/typescript`. */
  public get nameWithoutUser(): string {
    return this.name.replace(/^@.+?\//, "");
  }

  /**
   * Fetches a dependent module's version from given [[DependencyType dependency types]].
   *
   * @param moduleName is the name of the module to get version of.
   * @param dependencyTypes are array of dependency types to search module in.
   * @returns version of the `moduleName` || undefined.
   */
  public getDependencyVersion(moduleName: string, dependencyTypes = ALL_DEPENDENCIES): string | undefined {
    const foundInType = dependencyTypes.find((type) => this.package.has([type, moduleName]));
    return foundInType ? this.package.get([foundInType, moduleName]) : undefined;
  }

  /**
   * Checks whether given module or any of the modules exist in given [[DependencyType dependency types]].
   *
   * @param moduleNames are the name of the module to search for.
   * @param dependencyTypes are array of dependency types to search module in.
   * @returns whether `moduleName` exists in one of the dependency types.
   */
  public hasAnyDependency(moduleNames: string | string[], dependencyTypes = ALL_DEPENDENCIES): boolean {
    return arrify(moduleNames).some((moduleName) => dependencyTypes.find((type) => this.package.has([type, moduleName])));
  }

  public ifAnyDependency<T, F>(moduleNames: string | string[]): boolean;
  public ifAnyDependency<T, F>(moduleNames: string | string[], t: T): T | false;
  public ifAnyDependency<T, F>(moduleNames: string | string[], t: T, f: F, dependencyTypes?: DependencyType[]): T | F;
  /**
   * Checks single or multiple module's existence in any of the `package.json` dependencies.
   *
   * @param moduleNames are Module or modules to check whether this module has any dependency.
   * @param t is the Value to return if any of the moduleNames exist in any dependency.
   * @param f is the Value to return if none of the moduleNames exist in any dependency.
   * @param dependencyTypes are array of dependency types to search module in.
   * @returns `trueValue` if module depends on any of the `moduleNames`. Otherwise returns `falseValue`.
   */
  public ifAnyDependency<T, F>(moduleNames: string | string[], t = true, f = false, dependencyTypes = ALL_DEPENDENCIES): T | F | boolean {
    return this.hasAnyDependency(moduleNames, dependencyTypes) ? t : f;
  }

  /**
   * Returns absolute path for given relative path to module root. If given path is an absolute path, returns it directly.
   *
   * @param parts are path or array of path parts.
   * @returns absolute path to given destination.
   *
   * @example
   * module.pathOf("images", "photo.jpg"); // -> /path/to/root/images/photo.jpg
   * module.pathOf("/usr", "bin"); // -> /usr/bin
   */
  public pathOf(...parts: string[]): string {
    const path = join(...parts);
    return isAbsolute(path) ? path : join(this.root, path);
  }

  /**
   * Returns relative path to module root for given absolute path. If given path is a relative path, returns it directly.
   *
   * @param parts are path or array of path parts.
   * @returns path relative to module's root.
   *
   * @example
   * module.relativePathOf("/path/to/module/src/my-file.js"); // -> src/my-file.js
   * module.relativePathOf("src/my-file.js"); // -> src/my-file.js
   */
  public relativePathOf(...parts: string[]): string {
    const path = join(...parts);
    return isAbsolute(path) ? relative(this.root, path) : path;
  }

  /**
   * Asynchronously reads the entire contents of a file using `utf8` encoding.
   *
   * @param path is the path relative to module root or an absolute path.
   * @returns file contents.
   */
  public async readRaw(path: string): Promise<string> {
    return readFile(this.pathOf(path), "utf8");
  }

  /**
   * Reads file and creates `DataFile` instance using {@link https://www.npmjs.com/package/edit-config#class-manager Manager}.
   *
   * @param path is the path relative to module root or an absolute path.
   * @param options are options passed to `Manager.load` of `edit-config`. See {@link https://www.npmjs.com/package/edit-config#interface-managerloadoptions here}.
   */
  public async readData(path: string, options?: ManagerLoadOptions): Promise<DataFile> {
    return this.#manager.load(path, options);
  }

  /**
   * Reads and if possible returns DataFile otherwise file content. If file does not exist returns `undefined`.
   * If `options.defaultData` is true, file will be created using `options.defaultData` if it does not exist.
   * @see [[Module.readData]], [[Module.readRaw]]
   *
   * @param path is the path relative to module root or an absolute path.
   * @param options are options passed to `Manager.load` of `edit-config`. See {@link https://www.npmjs.com/package/edit-config#interface-managerloadoptions here}.
   * @returns {@link https://www.npmjs.com/package/edit-config#class-datafile DataFile} instance, file content or `undefined`.
   * @throws if given path is a directory.
   */
  public async read(path: string, options?: ManagerLoadOptions): Promise<DataFile | string | undefined> {
    const exists = await this.exists(path);
    if (exists && (await lstat(this.pathOf(path))).isDirectory()) throw new Error(`Cannot read file. '${path}' is a directory.`);

    try {
      const dataFile = await this.readData(path, options);
      if (dataFile.found) return dataFile;
    } catch (error) {
      if (exists) return this.readRaw(path);
    }
    return options?.defaultData === undefined ? undefined : this.write(path, options.defaultData, options);
  }

  private async checkFileModificationCondition(path: string, name: string, condition?: PredicateFileOperation): Promise<boolean> {
    if (path === "" || path === undefined) {
      throw new Error("'path' is required.");
    }
    if (condition) {
      const result = await condition(await this.read(path));
      if (!result) this.#logger.log(LogLevel.Warn, `Cannot ${name} file: '${path}'. Condition function returns false.`);
      return result;
    }

    return true;
  }

  /**
   * Writes given content to file. If content is an object, it is serialized.
   * If `prettier` configuration and module is available and content is formatted using `prettier`.
   *
   * @param path is the path relative to module root or an absolute path.
   * @param content is the content to write to file.
   * @param defaultFormat is the format to be used in serialization if file does not exist and content is object.
   * @param overwrite is whether to overwrite existing file.
   * @param if is condition function to test whether to write file.
   * @returns written content or [[DataFile]] if file is written, `undefined` otherwise.
   */
  public async write(
    path: string,
    content: object | string = "",
    {
      defaultFormat = "json",
      overwrite = this.#overwrite,
      if: condition,
    }: { defaultFormat?: WritableFileFormat; overwrite?: boolean; if?: PredicateFileOperation } = {}
  ): Promise<string | DataFile | undefined> {
    const fullPath = this.pathOf(path);
    let result: DataFile | string = content as string;

    if (!overwrite && (await pathExists(fullPath))) {
      this.#logger.log(LogLevel.Warn, `File not saved: '${path}' already exists.`);
      return undefined;
    }
    if (!(await this.checkFileModificationCondition(path, "write", condition))) return undefined;

    if (typeof content === "string") await outputFile(fullPath, content);
    else {
      result = await this.#manager.fromData(path, content, { defaultFormat });
      result.save();
    }

    this.#logger.log(LogLevel.Info, `File saved: '${path}'`);
    return result;
  }

  /**
   * Removes file or directory relative to module's root. Removes directory even it has files in it.
   * If the path does not exist, silently does nothing.
   *
   * @param path is the path relative to module root or an absolute path.
   * @param if is condition function to test whether to remove file or directory.
   * @returns file path relative to module root if file is removed, `undefined` otherwise.
   */
  public async remove(path: string, { if: condition }: { if?: PredicateFileOperation } = {}): Promise<string | undefined> {
    if (!(await this.checkFileModificationCondition(path, "remove", condition))) return undefined;
    await remove(this.pathOf(path));
    this.#logger.log(LogLevel.Info, `File or dir removed: '${path}'.`);
    return path;
  }

  /**
   * Removes empty directories recursively for given path relative to module root.
   *
   * @param path is the path relative to module root or an absolute path.
   * @returns array of deleted directories.
   */
  public async removeEmptyDirs(path: string): Promise<string[]> {
    const result = deleteEmpty(join(this.pathOf(path)));
    this.#logger.log(LogLevel.Info, `All empty directories in '${path}' deleted recursively.`);
    return result;
  }

  /**
   * Checks whether given path exists.
   *
   * @param path is the path relative to module root or an absolute path.
   * @returns whether given path exists.
   */
  public async exists(path: string): Promise<boolean> {
    return pathExists(this.pathOf(path));
  }

  /**
   * Returns whether given path is a directory.
   *
   * @param path is the path relative to module root or an absolute path.
   * @returns whether given path is a directory.
   */
  public async isDirectory(path: string): Promise<boolean> {
    try {
      return (await lstat(this.pathOf(path))).isDirectory();
    } catch (error) {
      /* istanbul ignore next */
      if (error.code !== "ENOENT") throw error;
      return false;
    }
  }

  /**
   * Ensures that the directory exists. If the directory structure does not exist, it is created similar to `mkdir -p`.
   *
   * @param path is the path relative to module root or an absolute path.
   */
  public async createDirectory(path: string): Promise<void> {
    return ensureDir(this.pathOf(path));
  }

  /**
   * Renames given path.
   *
   * @param oldPath is the old path relative to module root or an absolute path.
   * @param newPath is the new path relative to module root or an absolute path.
   * @param overwrite is whether to allow rename operation if target path already exists. Silently ignores operation if overwrite is not allowed and target path exists.
   * @returns whether file is renamed.
   */
  public async rename(oldPath: string, newPath: string, { overwrite = this.#overwrite } = {}): Promise<boolean> {
    const oldFullPath = this.pathOf(oldPath);
    const newFullPath = this.pathOf(newPath);
    if (await isFromFileToDirectory(oldFullPath, newFullPath))
      throw new Error(`File cannot be renamed to existing directory. '${oldPath}' → '${newPath}'`);

    if ((await this.exists(newPath)) && !overwrite) {
      this.#logger.log(LogLevel.Warn, `Path not renamed: '${oldPath}' → '${newPath}'. Target path exists.`);
      return false;
    }
    await rename(oldFullPath, newFullPath);
    this.#logger.log(LogLevel.Info, `Path renamed: '${oldPath}' → '${newPath}'.`);
    return true;
  }

  /**
   * Checks whether content of `pathInModule` file is equal to `data` by making string comparison (for strings)
   * or deep comparison (for objects).
   *
   * @param path is the path relative to module root or an absolute path.
   * @param content is string or JavaScript object to compare to file's content.
   * @returns whether the file is equal to given `content`.
   *
   * @example
   * const isConfigEqual = module.isEqual("config.json", { someData: 4 });
   * const textEqual = module.isEqual("some.txt", "content");
   */
  public async isEqual(path: string, content: string | Record<string, any>): Promise<boolean> {
    const dataFromFile = await this.read(path);
    return dataFromFile instanceof DataFile ? isEqual(dataFromFile.data, content) : dataFromFile === content;
  }

  /**
   * Executes given command using `execa` with given arguments and options. Applies sensible default options.
   *
   * @param bin is binary file to execute.
   * @param args are arguments to pass to executable.
   * @param options are passed to {@link https://www.npmjs.com/package/execa Execa}.
   * @returns [[ExecaReturnValue]] instance.
   *
   * @example
   * module.execute("ls"); // Run `ls`.
   * module.execute("ls", ["-al"], { stdio: "inherit" }); // Run `ls -al`.
   */
  public async execute(bin: string, args?: string[], options?: ExecaOptions): Promise<ExecaReturnValue>;
  public async execute(bin: string, args?: string[], options?: ExecaOptions<null>): Promise<ExecaReturnValue<Buffer>>;
  /**
   * Executes given command using `execa` with given arguments and options. Applies sensible default options.
   *
   * @param bin is binary file to execute.
   * @param options are passed to {@link https://www.npmjs.com/package/execa Execa}.
   * @returns [[ExecaReturnValue]] instance.
   *
   * @example
   * module.execute("ls"); // Run `ls`.
   * module.execute("ls", { stdio: "inherit" }); // Run `ls`.
   */
  public async execute(bin: string, options?: ExecaOptions): Promise<ExecaReturnValue>;
  public async execute(bin: string, options?: ExecaOptions<null>): Promise<ExecaReturnValue<Buffer>>;
  public async execute(
    bin: string,
    arg2?: string[] | ExecaOptions | ExecaOptions<null>,
    arg3?: ExecaOptions | ExecaOptions<null>
  ): Promise<ExecaReturnValue | ExecaReturnValue<Buffer>> {
    const localDir = join(__dirname, "../node_modules/.bin");
    const defaultOptions: ExecaOptions = { stdio: "inherit", cwd: this.root, preferLocal: true, localDir };
    const [args, options] = Array.isArray(arg2) ? [arg2, arg3] : [[], arg2];
    return execa(bin, args, { ...defaultOptions, ...options } as any);
  }

  /**
   * Executes given command using `execa.command` with given options. Applies sensible default options.
   *
   * @param cmd is command to execute.
   * @param options are passed to {@link https://www.npmjs.com/package/execa Execa}.
   * @returns [[ExecaReturnValue]] instance.
   *
   * @example
   * module.command("ls"); // Run `ls`.
   * module.command("ls -al", { stdio: "inherit" }); // Run `ls -al`.
   */
  public async command(cmd: string, options?: ExecaOptions): Promise<ExecaReturnValue>;
  public async command(cmd: string, options?: ExecaOptions<null>): Promise<ExecaReturnValue<Buffer>>;
  public async command(cmd: string, options?: ExecaOptions | ExecaOptions<null>): Promise<ExecaReturnValue | ExecaReturnValue<Buffer>> {
    const localDir = join(__dirname, "../node_modules/.bin");
    const defaultOptions: ExecaOptions = { stdio: "inherit", cwd: this.root, preferLocal: true, localDir };
    return command(cmd, { ...defaultOptions, ...options } as any);
  }

  /** Saves all read {@link https://www.npmjs.com/package/edit-config#class-datafile data files}. */
  public async saveAll(): Promise<void> {
    this.#manager.saveAll();
  }

  // istanbul ignore next
  /**
   * Installs node modules using specified package manager.
   *
   * @param packageNames are package name or array of package names.
   * @param type  is the dependency type of the package. `dev`, `peer`, `optional` etc.
   */
  public async install(packageNames: string | string[] = [], { type = DependencyType.Dependencies } = {}): Promise<void> {
    const packages = arrify(packageNames);

    if (packages.length === 0) return this.#logger.log(LogLevel.Warn, "No packages installed: No packages are provided.");

    const subCommand = this.packageManager === PackageManager.Yarn ? "install" : "add";
    const flag = packageManagerFlags[type][this.packageManager];
    await execa(this.packageManager, [subCommand, flag, ...packages], { cwd: this.root, stdio: "inherit" });
    return this.#logger.log(LogLevel.Info, `Packages installed: ${packages.join(",")}`);
  }

  // istanbul ignore next
  /**
   * Uninstalls node modules using specified package manager.
   *
   * @param packageNames are package name or array of package names.
   */
  public async uninstall(packageNames: string | string[] = []): Promise<void> {
    const packages = arrify(packageNames);

    if (packages.length === 0) return this.#logger.log(LogLevel.Warn, "No packages uninstalled: No packages are provided.");

    const subCommand = this.packageManager === PackageManager.Yarn ? "uninstall" : "remove";
    await execa(this.packageManager, [subCommand, ...packages], { cwd: this.root, stdio: "inherit" });
    return this.#logger.log(LogLevel.Info, `Packages uninstalled: ${packages.join(",")}`);
  }

  //
  // ──────────────────────────────────────────────────────────────────── I ──────────
  //   :::::: S T A T I C   M E T H O D S : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────────────────────
  //

  /**
   * Creates and returns a [[Module]] instance.
   *
   * @param options are options.
   * @param options.cwd is starting directory to start search for module root from.
   * @param options.logger is Winston compatible Logger to be used when logging.
   * @param options.packageManager is package manager used by module.
   * @returns [[Module]] instance.
   */
  public static async new(
    options: { cwd?: string; logger?: Logger; packageManager?: PackageManager; overwrite?: boolean } = {}
  ): Promise<Module> {
    const root = await this.getRoot(options.cwd);
    const packageManager = options.packageManager || (await this.getPackageManager(root));
    const packageData = await DataFile.load("package.json", { rootDir: root });
    const isTypeScript = (await pathExists(join(root, "tsconfig.json"))) || packageData.get("types") !== undefined;

    return new Module(root, packageData, { ...options, packageManager, isTypeScript });
  }

  /**
   * Returns root directory of the module by searching `package.json` from given `cwd` or environment variables
   * (`INIT_CWD` by `npm install` or `CWD`) up.
   *
   * @param cwd is the path to start search from.
   * @returns path of module root.
   * @throws if root cannot be found.
   */
  private static async getRoot(cwd?: string): Promise<string> {
    if (cwd && !(await pathExists(cwd))) throw new Error(`Cannot find root. Path '${cwd}' does not exist.`);
    const root = await pkgDir(cwd || process.env.INIT_CWD || process.cwd());
    if (!root) throw new Error(`No root path provided and no 'package.json' found up from cwd: '${root}'.`);
    return root;
  }

  /**
   * Returns package manager type.
   *
   * @param dir is the absolute path of directory where `package.json` is located.
   * @returns type of package manager.
   */
  private static async getPackageManager(dir: string): Promise<PackageManager | undefined> {
    const [npm, yarn] = await Promise.all([pathExists(join(dir, "package-lock.json")), pathExists(join(dir, "yarn.lock"))]);
    if (npm) return PackageManager.Npm;
    if (yarn) return PackageManager.Yarn;
    return undefined;
  }
}
