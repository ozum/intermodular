/* eslint-disable import/export */
import JSON5 from "json5";
import { readFileSync, existsSync } from "fs";
import { normalize, extname } from "path";
import winston, { Logger } from "winston";
import yaml from "js-yaml";
import pickBy from "lodash.pickby";
import { SyncOptions } from "execa";
import { ConcurrentlyOptions } from "concurrently";
import { JSONObject, LogLevel, FileFormat, ExecaCommandSync, ParallelCommands, ExecuteAllSyncOptions } from "./types";
import TEMPLATES from "./messages";
import Module from "./module";

/**
 * Known extensions for parsing files
 * @ignore
 */
const knownExtensions = new Set(["json", "yaml"]);

/**
 * Deletes "@" signs from `name` and replaces "/" characters with "-" and returns it
 * Useful for npm packages whose names contain user name such as @microsoft/typescript
 *
 * @private
 * @ignore
 */
export function safeName(name: string): string {
  return name.replace("@", "").replace("/", "-");
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
 * Parses given string and returns format and object. If no format given, tries to parse first as json, then yaml.
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
    return { format: "json", data: JSON.parse(content) };
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
 * `execa.sync` parameters are (file, [arguments], [options]). `arguments` is optional, so 2nd parameter may be either `arguments` or `options`.
 * This function rerturns 3 parameters after applying default options to given options.
 *
 * @private
 * @ignore
 * @param command is comand to parse binary and arguments.
 * @param defaultOptions are default options to apply.
 * @returns 3 parameters for execa.sync()
 */
export function applyCommandDefaults<T extends SyncOptions | ConcurrentlyOptions>(
  command: ExecaCommandSync,
  defaultOptions: T
): [string, string[], T?] {
  if (Array.isArray(command)) {
    return command[1] && !Array.isArray(command[1])
      ? [command[0], [], Object.assign({}, defaultOptions, command[1])]
      : [command[0], command[1], Object.assign({}, defaultOptions, command[2])];
  }
  return [command, [], defaultOptions];
}

/**
 * Given an object containing keys as script names, values as commands, returns parameters to feed to concurrently.
 *
 * @private
 * @ignore
 * @param commands is object with script name as key, [[Command]] as value.
 * @param killOthers is whether concurrently args `--kill-others-on-fail` should be added.
 * @returns arguments to use with concurrently.
 */
export function getConcurrentlyArgs(commands: ParallelCommands, options: ExecuteAllSyncOptions): string[] {
  const colors = ["bgBlue", "bgGreen", "bgMagenta", "bgCyan", "bgWhite", "bgRed", "bgBlack", "bgYellow"];

  const definedCommands = pickBy(commands) as { [key: string]: ExecaCommandSync }; // Clear empty keys
  // prettier-ignore
  return [
      options.stopOnError || options.throwOnError ? "--kill-others-on-fail" : "",
      "--prefix", "[{name}]",
      "--names", Object.keys(definedCommands).join(","),
      "--prefix-colors", colors.join(","),
      ...Object.values(definedCommands).map(command => {
        const [cmd, args] = applyCommandDefaults(command, {});
        return JSON.stringify(`${cmd} ${args.join(" ")}`.trim());
        // return JSON.stringify(typeof c === "string" ? c : `${cmd} ${args.join(" ")}`)
      }),
    ].filter(Boolean);
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

  // if (exists && ifEqual && !module.isFileEqual(pathInModule, ifEqual)) {
  //   console.log(ifEqual, module.isFileEqual(pathInModule, ifEqual));
  //   templateKey = "fileNotOpIsEqual";
  // } else if (exists && ifNotEqual && module.isFileEqual(pathInModule, ifNotEqual)) {
  //   templateKey = "fileNotOpIsNotEqual";
  // } else if (exists && !overwrite) {
  //   templateKey = "fileNotOpExists";
  // } else {
  //   return undefined;
  // }
  // console.log(templateKey);
  // return templateKey;
}
