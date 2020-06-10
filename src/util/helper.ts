import { lstat } from "fs-extra";
import { join, basename } from "path";
import { PackageManager, DependencyType } from "./types";

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
