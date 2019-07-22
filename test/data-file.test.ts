import { remove } from "fs-extra";
import { join } from "path";
import get from "lodash.get";
import Intermodular from "../src/intermodular";
import DataFile from "../src/data-file";
import { LogLevel } from "../src/types";

const sourceRoot = join(__dirname, "supplements/source-module");
const targetRoot = join(__dirname, "supplements/target-module");
const im = new Intermodular({ sourceRoot, targetRoot, logLevel: LogLevel.Debug });
const tm = im.targetModule;

let dataFile: DataFile; // = tm.getDataFileSync("data-file.json");
// const originalData = cloneDeep(dataFile);

afterAll(async () => {
  await remove(join(targetRoot, "data-file.json"));
});

beforeEach(() => {
  im.copySync("config-files/data.json", "data-file.json", { overwrite: true });
  dataFile = tm.getDataFileSync("data-file.json", { forceRead: true });
});

describe("DataFile", () => {
  it("should infer format from filename if file would be created.", () => {
    const localDataFile = tm.getDataFileSync("none.yaml", { forceRead: true });
    expect(localDataFile.format).toBe("yaml");
  });

  it("should use default format if file format cannot be inferred.", () => {
    const localDataFile = tm.getDataFileSync("none", { forceRead: true });
    expect(localDataFile.format).toBe("json");
  });

  it("should use optional format if file format cannot be inferred.", () => {
    const localDataFile = tm.getDataFileSync("none", { defaultFormat: "yaml", forceRead: true });
    expect(localDataFile.format).toBe("yaml");
  });

  it("should create file if not exists.", () => {
    const localDataFile = tm.getDataFileSync(".nonerc");
    localDataFile.set("name", "George");
    localDataFile.saveSync();
    expect(tm.parseSync(".nonerc")).toEqual({ name: "George" });
    tm.removeSync(".nonerc");
  });

  describe("saveSync", () => {
    it("should save file.", () => {
      dataFile.set("surname", "Doe");
      dataFile.saveSync();
      const data = tm.parseSync("data-file.json");
      expect(data.surname).toBe("Doe");
    });

    it("should not save unmodified file.", () => {
      dataFile.saveSync();
    });
  });

  describe("has", () => {
    it("should check whether given path exists.", () => {
      expect(dataFile.has("name")).toBe(true);
      expect(dataFile.has("xyz")).toBe(false);
    });
  });

  describe("get", () => {
    it("should get value at given path.", () => {
      expect(dataFile.get("name")).toBe("data json");
    });
  });

  describe("set", () => {
    it("should not set value if it is equal to old value.", () => {
      dataFile.set("name", "data json");
      expect(dataFile.get("name")).toBe("data json");
    });

    it("should not set value if equality condition is not met.", () => {
      dataFile.set("name", "Other", { ifEqual: "XYZ" });
      expect(dataFile.get("name")).toBe("data json");
    });

    it("should not set value if multiple condition is not met.", () => {
      dataFile.set("name", "Other", { ifEqual: "XYZ", ifNotExists: true });
      expect(dataFile.get("name")).toBe("data json");
    });

    it("should not set value if not equality condition is not met.", () => {
      dataFile.set("name", "Other", { ifNotEqual: "data json" });
      expect(dataFile.get("name")).toBe("data json");
    });

    it("should set value if equality condition is met.", () => {
      dataFile.set("name", "Other", { ifEqual: "data json" });
      expect(dataFile.get("name")).toBe("Other");
    });

    it("should not set value if not exists condition is not met.", () => {
      dataFile.set("name", "Other", { ifNotExists: true });
      expect(dataFile.get("name")).toBe("data json");
    });

    it("should not set value if exists condition is not met.", () => {
      dataFile.set("xyz", 123, { ifExists: true });
      expect(dataFile.has("xyz")).toBe(false);
    });
  });

  describe("delete", () => {
    it("should not delete value if conditions are not met.", () => {
      dataFile.delete("name", { ifEqual: "XYZ" });
      expect(dataFile.has("name")).toBe(true);
    });
    it("should delete value.", () => {
      dataFile.delete(["name"]);
      expect(dataFile.has("name")).toBe(false);
    });
  });

  describe("assign", () => {
    it("should merge given data.", () => {
      dataFile.assign("product", { name: "pen", color: "blue" });
      expect(dataFile.get("product")).toEqual({ name: "pen", color: "blue" });
      dataFile.assign("product", { color: "red", size: 3 });
      expect(dataFile.get("product")).toEqual({ name: "pen", color: "red", size: 3 });
    });

    it("should not assign to array.", () => {
      dataFile.set("ids", [1, 2, 3]);
      expect(dataFile.get("ids")).toEqual([1, 2, 3]);
      dataFile.assign("ids", [4]);
      expect(dataFile.get("ids")).toEqual([1, 2, 3]);
    });

    it("should change whole object if path is undefined.", () => {
      dataFile.assign(undefined, { manager: { id: 0, name: "Mike" } });
      expect(dataFile.data).toEqual({
        name: "data json",
        manager: { id: 0, name: "Mike" },
      });
    });

    it("should change whole object if no path is given.", () => {
      dataFile.assign({ manager: { id: 1, name: "George" } });
      expect(dataFile.data).toEqual({
        name: "data json",
        manager: { id: 1, name: "George" },
      });
    });

    it("should accept path as an array.", () => {
      dataFile.assign(["manager"], { id: 2 });
      expect(dataFile.get("manager.id")).toBe(2);
    });

    it("should not set existing values with ifNotExists parameter.", () => {
      dataFile.assign({ rootObject: { id: 1 } });
      expect(dataFile.get("rootObject.id")).toBe(1);
      dataFile.assign({ rootObject: { id: 2 } }, { ifNotExists: true });
      expect(dataFile.get("rootObject.id")).toBe(1);
      dataFile.delete("rootObject");
    });
  });

  describe("modifiedKeys", () => {
    it("should return modified keys", () => {
      dataFile.assign("manager", { id: 0, name: "Mike" });
      dataFile.delete("name");
      expect(dataFile.getModifiedKeys()).toEqual({
        set: ["manager.id", "manager.name"],
        deleted: ["name"],
      });
    });

    it("should return modified keys filtered as requested", () => {
      dataFile.assign("manager", { id: 0, name: "Mike" });
      dataFile.delete("name");
      expect(dataFile.getModifiedKeys({ include: "manager", exclude: "manager.na" })).toEqual({
        set: ["manager.id"],
        deleted: [],
      });
    });
  });

  describe("orderKeys", () => {
    it("should order keys of the data.", () => {
      dataFile.assign({ product: 1, manager: { id: 0, name: "Mike" } });
      dataFile.orderKeys(["name", "manager"]);
      dataFile.saveSync();
      const reReadDataFile = tm.getDataFileSync("data-file.json", { forceRead: true });
      expect(Object.keys(reReadDataFile.data)).toEqual(["name", "manager", "product"]);
    });

    it("should order keys alphabetically if no order is given.", () => {
      dataFile.assign({ product: 1, manager: { id: 0, name: "Mike" } });
      dataFile.orderKeys();
      dataFile.saveSync();
      const reReadDataFile = tm.getDataFileSync("data-file.json", { forceRead: true });
      expect(Object.keys(reReadDataFile.data)).toEqual(["manager", "name", "product"]);
    });

    it("should not order keys if order is equal to old order.", () => {
      dataFile.assign({ product: 1, manager: { id: 0, name: "Mike" } });
      dataFile.orderKeys(["name", "product", "manager"]);
      dataFile.saveSync();
      const reReadDataFile = tm.getDataFileSync("data-file.json", { forceRead: true });
      expect(Object.keys(reReadDataFile.data)).toEqual(["name", "product", "manager"]);
    });
  });

  describe("orderKeysOf", () => {
    it("should order keys of given path in the data.", () => {
      dataFile.assign("subKey", { a: 1, c: 3, b: 2 });
      dataFile.orderKeysOf("subKey", ["c", "a", "b"]);
      dataFile.saveSync();
      const reReadDataFile = tm.getDataFileSync("data-file.json");
      expect(Object.keys(get(reReadDataFile.data, "subKey"))).toEqual(["c", "a", "b"]);
    });

    it("should not throw if path cannot be found.", () => {
      dataFile.orderKeysOf("non-existing", ["a"]);
      expect(1).toBe(1);
    });
  });
});
