import { lstat } from "fs-extra";
import { join, basename } from "path";
import { Options as ExecaOptions } from "execa";
import { PackageManager, DependencyType } from "./types";
import type Module from "../module";

/**
 * Returns `input` if it is an array, otherwise an array containing `input` as only element.
 * @ignore
 */
export function arrify<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input];
}

/** @ignore */
export const packageManagerFlags: Record<DependencyType, Record<PackageManager, string>> = {
  dependencies: { npm: "", yarn: "" },
  devDependencies: { npm: "--save-dev", yarn: "--dev" },
  peerDependencies: { npm: "--save-peer", yarn: "--peer" },
  optionalDependencies: { npm: "--save-optional", yarn: "--optional" },
};

/**
 * Returns whether given source is not a direcory and target is a directory.
 * May be used to check file operation is from a file to a directory, such as copy file to directory.
 *
 * @ignore
 * @param source is the full path of the source.
 * @param target is the full path of the target.
 */
export async function isFromFileToDirectory(source: string, target: string): Promise<boolean> {
  if ((await lstat(source)).isDirectory()) return false;
  try {
    return (await lstat(target)).isDirectory();
  } catch (error) {
    // istanbul ignore next
    if (error.code !== "ENOENT") throw error;
  }
  return false;
}

/**
 * If source is a file and target is an existing directory, get target file path to copy into it.
 * This function is used, because `fs-extra` `copy` function does not copy file into directory.
 *
 * @ignore
 * @param source is source path to copy from.
 * @param target is target path to copy to.
 * @returns target path.
 *
 * @example
 * getCopyTarget("/source/src/a.js", "/target/src"); // "/target/src/a.js"
 */
export async function getCopyTarget(source: string, target: string): Promise<string> {
  return join(target, (await isFromFileToDirectory(source, target)) ? basename(source) : "");
}

/**
 * Returns execa args and options from optional args and options.
 *
 * @ignore
 */
export function getExecaArgs(
  arg1?: string[] | ExecaOptions | ExecaOptions<null>,
  arg2?: ExecaOptions | ExecaOptions<null>
): [string[], ExecaOptions | ExecaOptions<null> | undefined] {
  const [args, options] = Array.isArray(arg1) ? [arg1, arg2] : [[], arg1];
  return [args, options];
}

/**
 * Adds source module's `node_modules/.bin` to env.PATH of execa options.
 *
 * @ignore
 * @example
 * // Returns { a: 1, env: { PATH: `my_module/node_modules/.bin:xyz:${process.env.PATH}` } }
 * getModifiedExecaOptions(myModule, { a: 1, env: { PATH: `xyz:${process.env.PATH}` } });
 */
export function getModifiedExecaOptions(
  sourceModule: Module,
  options?: ExecaOptions | ExecaOptions<null>
): ExecaOptions | ExecaOptions<null> {
  const sourcePath = sourceModule.pathOf("node_modules/.bin"); // `${this.sourceModule.pathOf("node_modules/.bin")}:${process.env.PATH}`;
  const PATH = `${sourcePath}:${options?.env?.PATH ?? process.env.PATH}`; // If env.PATH is given in options, it should have added existing `process.env.PATH` if necessary. So no need to add again.
  const env = { ...options?.env, PATH };
  return { ...options, env };
}
