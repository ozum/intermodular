/* eslint-disable no-return-assign */
import OS from "os";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { Logger } from "winston";
import has from "lodash.has";
import get from "lodash.get";
import set from "lodash.set";
import unset from "lodash.unset";
import isEqual from "lodash.isequal";
import prettier from "prettier";

import { FileFormat } from "./types";
import { parseString, serialize, logTemplate, ucFirst } from "./util";
import TEMPLATES from "./messages";

/**
 * Conditions which should be met to apply a modification to a key/value.
 */
interface ModifyCondition {
  /**
   * Allows modification if only `path` exists.
   */
  ifNotExists?: boolean;
  /**
   * Allows modification if only `path` does not exists.
   */
  ifExists?: boolean;
  /**
   * Allows modification if only value stored at `path` equals/deeply equals to it's value.
   */
  ifEqual?: any;
  /**
   * Allows modification if only value stored at `path` equals/deeply equals to it's value.
   */
  ifNotEqual?: any;
}

/**
 * Makes easier to work with data files by providing data level attributes and methods.
 */
export default class DataFile<T extends Record<string, any> = Record<string, any>> {
  private readonly _logger: Logger;
  private readonly _path: string;
  private readonly _shortPath: string;
  private readonly _prettierConfig: prettier.Options;
  private _skipModificationCheckOnSave: boolean = false;
  private _modifiedKeys: { set: Set<string>; deleted: Set<string> } = { set: new Set(), deleted: new Set() };

  /**
   * Data format of the file
   */
  public readonly format: FileFormat;

  /**
   * Data contained in file as a JavaScript object. This data is serialized and written to disk when [[saveSync]]  method is executed.
   */
  public data: T;

  /**
   * @hidden
   */
  public constructor(filePath: string, shortPath: string, logger: Logger, prettierConfig: prettier.Options, defaultFormat: FileFormat) {
    const { data, format } = existsSync(filePath) ? parseString(readFileSync(filePath, "utf8")) : { data: {}, format: defaultFormat };
    this.data = data as T;
    this.format = format;
    this._logger = logger;
    this._path = filePath;
    this._shortPath = shortPath;
    this._prettierConfig = prettierConfig;
  }

  /**
   * Logs precompiled template message with `key` using `args`.
   */
  private _logTemplate(key: keyof typeof TEMPLATES, args: Record<string, any>): void {
    this._logger.log(...logTemplate(key, args));
  }

  /**
   * Decides whether given path should be updated according to given conditions.
   */
  private _shouldModify(path: string | string[], op: string, conditions: ModifyCondition = {}): boolean {
    const stringPath = Array.isArray(path) ? path.join(".") : path;
    const value = get(this.data, path);
    const hasPath = has(this.data, path);
    const result: ModifyCondition = {
      ifEqual: conditions.ifEqual === undefined || isEqual(value, conditions.ifEqual),
      ifNotEqual: conditions.ifNotEqual === undefined || !isEqual(value, conditions.ifNotEqual),
      ifExists: !conditions.ifExists || hasPath,
      ifNotExists: !conditions.ifNotExists || !hasPath,
    };

    let debugMessage = "  ↳  ";
    const reasons: string[] = [];

    (Object.keys(conditions) as (keyof ModifyCondition)[]).forEach((condition, i, array) => {
      const templateKey = `dataFile${ucFirst(condition)}${result[condition] ? "True" : "False"}` as keyof typeof TEMPLATES;

      debugMessage += TEMPLATES[templateKey][1]({ key: stringPath, val: conditions[condition] });
      debugMessage += i < array.length - 1 ? `${OS.EOL}            ` : "";

      if (!result[condition]) {
        reasons.push(condition);
      }
    });

    this._logTemplate(reasons.length === 0 ? "dataFileUpdated" : "dataFileNotUpdated", {
      op,
      key: stringPath,
      file: this._shortPath,
      reasons: reasons.join(", "),
    });

    if (reasons.length > 0) {
      this._logger.log("debug", debugMessage);
    }

    return reasons.length === 0;
  }

  /**
   * Saves file if it is modified. Use `force` options to save unmodified files.
   *
   * @param force forces file to be saved even when it is unmodified.
   */
  public saveSync({ force = false } = {}): this {
    const exists = existsSync(this._path);
    const sameData = exists && isEqual(parseString(readFileSync(this._path, "utf8")), { data: this.data, format: this.format });

    if (exists && !force && !this._skipModificationCheckOnSave && sameData) {
      this._logTemplate("dataFileNotChanged", { file: this._shortPath });
    } else {
      writeFileSync(this._path, prettier.format(serialize(this.data, this.format), this._prettierConfig), "utf8");
      this._logTemplate("dataFileSaved", { file: this._shortPath });
    }

    return this;
  }

  /**
   * Returns whether given `path` exists in file data.
   *
   * @param path is data path of the property to check.
   * @returns whether path exists.
   * @example
   * const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
   * packageJson.has("script.build");
   * packageJson.has(["script", "build"]);
   */
  public has(path: string | string[]): boolean {
    return has(this.data, path);
  }

  /**
   * Gets the value at `path` of file data. If the resolved value is undefined, the `defaultValue` is returned in its place.
   *
   * @param path is data path of the property to get.
   * @param defaultValue is value to get if path does not exists on data.
   * @returns data stored in given object path or default value.
   * @example
   * const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
   * packageJson.get("script.build");
   * packageJson.get(["script", "build"]);
   */
  public get(path: string | string[], defaultValue?: any): any {
    return get(this.data, path, defaultValue);
  }

  /**
   * Sets the value at `path` of file data. If a portion of path doesn't exist, it's created.
   * Arrays are created for missing index properties while objects are created for all other missing properties.
   *
   * @param path is data path of the property to set.
   * @param value is value to set.
   * @param conditions should be met to apply a modification to a key/value.
   * @example
   * const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
   * packageJson
   *   .set("script.build", "tsc")
   *   .set(["scripts", "test"], "jest");
   */
  public set(path: string | string[], value: any, conditions?: ModifyCondition): this {
    const oldValue = get(this.data, path);
    const stringPath = Array.isArray(path) ? path.join(".") : path;
    if (isEqual(oldValue, value)) {
      this._logTemplate("dataFileUpdated", { op: "set", key: stringPath, file: this._shortPath });
      this._logTemplate("dataFileUpdatedWithValue", { old: oldValue, new: value });
    } else if (this._shouldModify(path, "set", conditions)) {
      set(this.data as Record<string, any>, path, value);
      this._modifiedKeys.set.add(Array.isArray(path) ? path.join(".") : path);
      this._logTemplate("dataFileUpdatedWithValue", { old: oldValue, new: value });
    }
    return this;
  }

  /**
   * Deletes the property at `path` of file data.
   *
   * @param path is data path of the property to delete.
   * @param conditions should be met to apply a modification to a key/value.
   * @example
   * const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
   * packageJson
   *   .delete("script.build")
   *   .delete(["scripts", "test"]);
   */
  public delete(path: string | string[], conditions?: ModifyCondition): this {
    if (this._shouldModify(path, "deleted", conditions)) {
      unset(this.data, path);
      this._modifiedKeys.deleted.add(Array.isArray(path) ? path.join(".") : path);
    }
    return this;
  }

  /**
   * Merges all keys and values of `data` shallowly into root of file data.
   * Different to object assign, keys may be merged conditionally such as `ifExists` or `ifNotExists`.
   *
   * @param data is the object to merge given path.
   * @param conditions should be met to apply a modifications for each key/value individually.
   * @example
   * const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
   * packageJson.assign({ name: "some-module", version: "1.0.0", }, { ifNotExists: true });
   */
  public assign(data: Record<string, any>, conditions?: ModifyCondition): this;
  /**
   * Merges all keys and values of `data` shallowly into `path` of file data. If a portion of path doesn't exist, it's created.
   * Different to object assign, keys may be merged conditionally such as `ifExists` or `ifNotExists`.
   *
   * @param path is data path of the property to delete.
   * @param data is the object to merge given path.
   * @param conditions should be met to apply a modifications for each key/value individually.
   * @example
   * const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
   * packageJson.assign("scripts", { build: "tsc", test: "jest", }, { ifNotExists: true });
   */
  public assign(path: string | string[] | undefined, data: Record<string, any>, conditions?: ModifyCondition): this;
  public assign(
    pathOrData: string | string[] | undefined | Record<string, any>,
    dataOrConditions?: Record<string, any> | ModifyCondition,
    conditionsOrVoid?: ModifyCondition
  ): this {
    const [path, data, conditions] = (Array.isArray(pathOrData) || typeof pathOrData === "string" || pathOrData === undefined
      ? [pathOrData, dataOrConditions, conditionsOrVoid || {}]
      : ["", pathOrData, conditionsOrVoid || {}]) as [string | string[] | undefined, Record<string, any>, ModifyCondition];

    if (path && !has(this.data, path)) {
      set(this.data, path, {});
    }

    const targetObject = path ? get(this.data, path) : this.data;

    if (Array.isArray(targetObject) || typeof targetObject !== "object") {
      this._logTemplate("dataFileAssignFails", { op: "assigned", key: path, file: this._shortPath });
      return this;
    }

    // eslint-disable-next-line no-nested-ternary
    const arrayRootPath = path ? (Array.isArray(path) ? path : path.split(".")) : [];

    Object.keys(data).forEach(key => {
      this.set([...arrayRootPath, key], data[key], conditions);
    });

    return this;
  }

  /**
   * Deleted and modified keys (paths) in data file.
   */
  public get modifiedKeys(): { set: string[]; deleted: string[] } {
    return { set: Array.from(this._modifiedKeys.set), deleted: Array.from(this._modifiedKeys.deleted) };
  }

  /**
   * When keys/values added which are previously does not exist, they are added to the end of the file during file write.
   * This method allows reordering of the keys. `keys` are placed at the beginning in given order whereas remaining keys
   * of the object comes in their order of position.
   *
   * @param keys are ordered keys to appear at the beginning of file when saved.
   * @example
   * const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
   * packageJson.orderKeys(["name", "version", "description", "keywords", "scripts"]); // Other keys come after.
   */
  public orderKeys(keys: (keyof T)[] = Object.keys(this.data).sort()): this {
    this.data = this._orderKeys(this.data, keys);
    return this;
  }

  /**
   * When keys/values added which are previously does not exist, they are added to the end of the file during file write.
   * This method allows reordering of the keys in given path. `keys` are placed at the beginning in given order whereas remaining keys
   * of the object comes in their order of position.
   *
   * @param path is data path of the property to order keys of.
   * @param keys are ordered keys to appear at the beginning of given path when saved.
   * @example
   * const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance
   * packageJson.orderKeysOf("scripts", ["build", "lint"]); // Other keys come after.
   */
  public orderKeysOf(path: string | string[], keys?: string[]): this {
    set(this.data, path, this._orderKeys(this.get(path), keys));
    return this;
  }

  /**
   * Sort keys in given order. Missing keys in `keys` added to the end. If no keys are provided, sorts alphabetically.
   *
   * @param object is object to order keys of.
   * @param keys are ordered keys to appear at the beginning of object.
   * @return object with sorted keys.
   */
  private _orderKeys<K extends Record<string, any>>(object: K, keys: (keyof K)[] = Object.keys(object).sort()): K {
    const orderedKeysSet = new Set(keys.filter(key => has(object, key))); // Filter key which does not exists in object.
    Object.keys(object).forEach(key => orderedKeysSet.add(key)); // Add missing keys from `thid.data` to ordered key set's end.
    const orderedKeys = Array.from(orderedKeysSet.values());

    if (isEqual(orderedKeys, Object.keys(object))) {
      return object;
    }

    const newData: K = {} as K; // eslint-disable-line @typescript-eslint/no-object-literal-type-assertion
    orderedKeys.forEach(key => (newData[key] = object[key]));
    this._skipModificationCheckOnSave = true;
    return newData;
  }
}
