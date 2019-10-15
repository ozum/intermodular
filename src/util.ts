/* eslint-disable import/export */
import JSON5 from "json5";
import { readFileSync, existsSync } from "fs";
import { normalize, join } from "path";
import winston, { Logger } from "winston";
import yaml from "js-yaml";
import pkgDir from "pkg-dir";
import { JSONObject, LogLevel, FileFormat } from "./types";
import TEMPLATES from "./messages";
import Module from "./module";

/**
 * Known extensions for parsing files
 * @ignore
 */
const knownExtensions = new Set(["json", "yaml"]);

/**
 * Finds and returns top most `package.json` directory.
 *
 * @private
 * @ignore
 * @param startDir is directory to start search from.
 * @returns top most `package.json`s directory.
 */
export function findTopPackageDir(startDir: string, level = 0): string | undefined {
  const currentPkgDir = pkgDir.sync(join(startDir, level === 0 ? "." : ".."));
  return currentPkgDir ? findTopPackageDir(currentPkgDir, level + 1) || currentPkgDir : undefined;
}

/**
 * Returns `input` if it is an array, otherwise an array containing `input` as only element.
 *
 * @private
 * @ignore
 */
export function arrify<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input];
}

/**
 * Reads JSON file from `path` and parses it using [JSON5 parser](https://json5.org).
 * If file does not exists throws error. Throw behaviour may be changed by setting `surviveNonExist` to true,
 * which returns `undefined` for non-existing files.
 *
 * @private
 * @ignore
 */
export function readJSONSync(path: string, args?: { surviveNonExist: true }): JSONObject;
export function readJSONSync(path: string, args: { surviveNonExist: false }): JSONObject | undefined;
export function readJSONSync(path: string, { surviveNonExist = true }: { surviveNonExist: boolean } = {} as any): JSONObject | undefined {
  if (surviveNonExist && !existsSync(normalize(path))) {
    return undefined;
  }

  return JSON5.parse(readFileSync(normalize(path), { encoding: "utf8" }));
}

/**
 * Creates and returns a new Winston logger with log level of `logLevel`.
 *
 * @private
 * @ignore
 */
export function createLogger(logLevel: LogLevel): Logger {
  return winston.createLogger({
    transports: [
      new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        stderrLevels: ["error"],
        silent: process.env.NODE_ENV === "test",
      }),
    ],
  });
}

/**
 * Parses given string and returns format and object. If no format given, tries to parse first as json using JSON5, then yaml.
 *
 * @private
 * @ignore
 * @param content is string to parse
 * @returns parsed object or input string.
 * @throws `Error` if data cannot be parsed.
 */
export function parseString(content: string): { format: FileFormat; data: Record<string, any> } {
  const errors: Error[] = [];

  try {
    return { format: "json", data: JSON5.parse(content) };
  } catch (e) {
    errors.push(e);
  }

  try {
    return { format: "yaml", data: yaml.safeLoad(content) };
  } catch (e) {
    errors.push(e);
  }

  const errorMessage = errors.reduce((previous, e) => `${previous}${e.name}: ${e.message}. `, "").trim();
  throw new Error(`Cannot parse data as one of the supported formats of ${Array.from(knownExtensions).join(", ")}. ${errorMessage}`);
}

/**
 * Serializes and returns `data` in desired `format`.
 *
 * @private
 * @ignore
 */
export function serialize(data: string | Record<string, any>, format: FileFormat): string {
  if (typeof data !== "object") {
    return data;
  }

  return format === "json" ? JSON.stringify(data) : yaml.safeDump(data);
}

/**
 * Returns [LogLevel] and template stored in `key` rendered using `args`.
 *
 * @private
 * @ignore
 * @param key is template key to get template for.
 * @param args are object to replace template variables.
 * @example
 * logTemplate("someTemplate", { name: "Geroge" }); // Gets `someTemplate` and replaces name with "George".
 */
export function logTemplate(key: keyof typeof TEMPLATES, args: Record<string, any>): [LogLevel, string] {
  const template = TEMPLATES[key];
  return [template[0], template[1](args)];
}

/**
 * Returns given string after making it's first letter uppercase.
 *
 * @private
 * @ignore
 * @param string is input to make first letter uppercase.
 */
export function ucFirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * If modification is not possible based on given conditions, returns reason of it as log template keys, `undefined` otherwise.
 *
 * @private
 * @ignore
 * @param module is module object to operate on.
 * @param pathInModule is file path relative to module root.
 * @param overwrite allows overwrite.
 * @param ifEqual allows modification if only value stored at `path` equals/deeply equals to it's value.
 * @param ifNotEqual allows modification if only value stored at `path` equals/deeply equals to it's value.
 * @returns template key to be used to describe not modify reason.
 */
export function getNotModifyReasonTemplateKey(
  module: Module,
  pathInModule: string,
  { overwrite, ifEqual, ifNotEqual }: { overwrite?: boolean; ifEqual?: string | object; ifNotEqual?: string | object }
): keyof typeof TEMPLATES | undefined {
  const path = module.pathOf(pathInModule);
  const exists = existsSync(path);
  // let templateKey: keyof typeof TEMPLATES;

  if (ifEqual) {
    return exists && !module.isEqual(pathInModule, ifEqual) ? "fileNotOpIsEqual" : undefined;
  }

  if (ifNotEqual) {
    return exists && module.isEqual(pathInModule, ifNotEqual) ? "fileNotOpIsNotEqual" : undefined;
  }

  if (!overwrite && exists) {
    return "fileNotOpExists";
  }

  return undefined;
}

/**
 * Filters an array based on starting strings of its elements and returns filtered array as a new array.
 * @param array is array to be filtered.
 * @param include is string or array of strings, of which elements starting with is included.
 * @param exclude is string or array of strings, of which elements starting with is excluded.
 * @returns filtered array.
 */
export function getFilteredArray(
  array: string[],
  { include = [], exclude = [] }: { include?: string | string[]; exclude?: string | string[] }
): string[] {
  const includeArray = arrify(include);
  const excludeArray = arrify(exclude);
  let result = array;

  if (includeArray.length > 0) {
    result = result.filter(key => includeArray.some(included => key.startsWith(included)));
  }
  if (excludeArray.length > 0) {
    result = result.filter(key => !excludeArray.some(excluded => key.startsWith(excluded)));
  }
  return result;
}

// export function formatIfAvailable(content: string, prettierConfig: prettier.Options | null): string {
//   const config = prettierConfig || (force ? {} : undefined);
//   return config ? prettier.format(content, config) : content;
// }
