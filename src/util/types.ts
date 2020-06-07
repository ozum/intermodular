import { DataFile } from "edit-config";
/** Package manager */
export const enum PackageManager {
  Npm = "npm",
  Yarn = "yarn",
}

/** Dependency types for Node.js modules. */
export const enum DependencyType {
  Dependencies = "dependencies",
  DevDependencies = "devDependencies",
  PeerDependencies = "peerDependencies",
  OptionalDependencies = "optionalDependencies",
}

/** Type of callback function to test whether related file operation should be done. */
export type PredicateFileOperation =
  /**
   * Callback function to test whether related file operation should be done.
   *
   * @param content is string content or {@link DataFile https://www.npmjs.com/package/edit-config} instance if content is parseble object. If file does not exist or is a directory, this is `undefined`.
   * @returns whether file operation should be done.
   */
  (fileContent?: string | DataFile) => Promise<boolean> | boolean;

/** Type for function to filter copied files. */
export type CopyFilterFunction =
  /**
   * Sync callback function to filter copied files.
   *
   * @param fullSourcePath path of source file.
   * @param fullTargetPath path of target file.
   * @param isSourceDirectory is whether source path is a directory.
   * @param isTargetDirectory is whether target path is a directory.
   * @param sourceContent is string content or {@link DataFile https://www.npmjs.com/package/edit-config} instance if content of source file is parseble object. If file does not exist or is a directory, this is `undefined`.
   * @param targetContent is string content or {@link DataFile https://www.npmjs.com/package/edit-config} instance if content of target file is parseble object. If file does not exist or is a directory, this is `undefined`.
   * @returns whether to copy file.
   */
  (
    fullSourcePath: string,
    fullTargetPath: string,
    isSourceDirectory: boolean,
    isTargetDirectory: boolean,
    sourceContent?: string | DataFile,
    targetContent?: string | DataFile
  ) => boolean | Promise<boolean>;

/** Copy options based on `fs-extra` {@link https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/copy.md copy} options. */
export interface CopyOptions {
  /** Dereference symlinks, default is false. */
  dereference?: boolean;
  /** Overwrite existing file or directory, default is true. Note that the copy operation will silently fail if you set this to false and the destination exists. Use the errorOnExist option to change this behavior. */
  overwrite?: boolean;
  /** When true, will set last modification and access times to the ones of the original source files. When false, timestamp behavior is OS-dependent. Default is false. */
  preserveTimestamps?: boolean;
  /** When overwrite is false and the destination exists, throw an error. Default is false. */
  errorOnExist?: boolean;
  /** Function to filter copied files. Return true to include, false to exclude. Can also return a Promise that resolves to true or false (or pass in an async function) */
  filter?: CopyFilterFunction;
  /** fs-extra.copy recursive option. */
  recursive?: boolean;
}
