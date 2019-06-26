import { SyncOptions } from "execa";

//
// ─── JSON ───────────────────────────────────────────────────────────────────────
//
/**
 * @ignore
 */
export type Primitive = string | number | boolean | null;

/**
 * @ignore
 */
export interface JSONObject {
  [member: string]: JSONData | undefined;
}

/**
 * @ignore
 */
export interface JSONArray extends Array<JSON> {} // eslint-disable-line @typescript-eslint/no-empty-interface

/**
 * Data type which represents JSON Data.
 */
export type JSONData = Primitive | JSONObject | JSONArray;

//
// ─── SPAWN AND EXECUTABLE ───────────────────────────────────────────────────────
//

/**
 * Type for providing CLI command to pass to execa. It may either
 * - a string to store executable name without arguments.
 * - an array with two elements, whose first element is executable name, and second element is either array of arguments to pass to executable or options to pass to execa.
 * - an array with three elements, whose first element is executable name, second element is array of arguments to pass to executable and third element is options to pass to execa.
 *
 * @example
 * const bin = "tsc";
 * const binWithArgs = ["tsc", ["--strict", "--target", "ESNext"]];
 * const binWithOptions = ["tsc", { encoding: "utf-8" }];
 * const binWithAll = ["tsc", ["--strict", "--target", "ESNext"], { encoding: "utf-8" }];
 */
export type ExecaCommandSync =
  | Command
  | [string, string[], SyncOptions]
  | [string, string[], SyncOptions<null>]
  | [string, SyncOptions]
  | [string, SyncOptions<null>];

/**
 * Type for providing CLI command. It may either
 * - a string to store executable name without arguments.
 * - an array with two elements, whose first element is executable name, and second element is array of arguments to pass to executable.
 *
 * @example
 * const bin = "tsc";
 * const binWithArgs = ["tsc", ["--strict", "--target", "ESNext"]];
 */
export type Command = string | [string, string[]];

/**
 * Array of CLI commands to execute serially.
 */
export type SerialCommands = (ExecaCommandSync | ParallelCommands)[];

/**
 * Array of CLI commands to execute concurrently in parallel.
 */
export type ParallelCommands = Record<string, Command | null | undefined>;

export interface ExecuteAllSyncOptions extends SyncOptions {
  /**
   * Whether to stop executing further commands if an error occurs.
   */
  stopOnError?: boolean;
  /**
   * Whether to throw if an error occurs.
   */
  throwOnError?: boolean;
}

//
// ─── OTHER ──────────────────────────────────────────────────────────────────────
//
/**
 * Supported file formats for parsing and data files.
 */
export type FileFormat = "json" | "yaml";

/**
 * Levels to be used when logging.
 */
export enum LogLevel {
  Error = "error",
  Warn = "warn",
  Info = "info",
  Verbose = "verbose",
  Debug = "debug",
  Silly = "silly",
}

/**
 * Dependency types for Node.js modules.
 */
export enum DependencyType {
  /**
   * Production dependencies
   */
  Dependencies = "dependencies",
  /**
   * Dependencies for development only.
   */
  DevDependencies = "devDependencies",
  /**
   * Dependencies which are not installed by default.
   */
  PeerDependencies = "peerDependencies",
  /**
   *
   * Dependencies which can be used, but not stop installation if not found or failed to install.
   */
  OptionalDependencies = "optionalDependencies",
}
