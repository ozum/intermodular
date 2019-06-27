import { remove } from "fs-extra";
import { join } from "path";
import Intermodular from "../src/intermodular";

const sourceRoot = join(__dirname, "supplements/source-module");
const targetRoot = join(__dirname, "supplements/target-module");
const im = new Intermodular({ sourceRoot, targetRoot });
const tm = im.targetModule;
im.copySync("config-files/data.json", "data-file.json");
const dataFile = tm.getDataFileSync("data-file.json");

afterAll(async () => {
  await remove(join(targetRoot, "data-file.json"));
});

describe("DataFile", () => {
  it("should infer format from filename if file would be created.", () => {
    const localDataFile = tm.getDataFileSync("none.yaml");
    expect(localDataFile.format).toBe("yaml");
  });

  it("should use default format if file format cannot be inferred.", () => {
    const localDataFile = tm.getDataFileSync("none");
    expect(localDataFile.format).toBe("json");
  });

  it("should use optional format if file format cannot be inferred.", () => {
    const localDataFile = tm.getDataFileSync("none", { defaultFormat: "yaml" });
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
      expect(dataFile.has("surname")).toBe(true);
      expect(dataFile.has("xyz")).toBe(false);
    });
  });

  describe("get", () => {
    it("should get value at given path.", () => {
      expect(dataFile.get("surname")).toBe("Doe");
    });
  });

  describe("set", () => {
    it("should not set value if it is equal to old value.", () => {
      dataFile.set("surname", "Doe");
      expect(dataFile.get("surname")).toBe("Doe");
    });

    it("should not set value if equality condition is not met.", () => {
      dataFile.set("surname", "Other", { ifEqual: "XYZ" });
      expect(dataFile.get("surname")).toBe("Doe");
    });

    it("should not set value if not equality condition is not met.", () => {
      dataFile.set("surname", "Other", { ifNotEqual: "Doe" });
      expect(dataFile.get("surname")).toBe("Doe");
    });

    it("should not set value if not exists condition is not met.", () => {
      dataFile.set("surname", "Other", { ifNotExists: true });
      expect(dataFile.get("surname")).toBe("Doe");
    });

    it("should not set value if exists condition is not met.", () => {
      dataFile.set("xyz", 123, { ifExists: true });
      expect(dataFile.has("xyz")).toBe(false);
    });
  });

  describe("delete", () => {
    it("should not delete value if conditions are not met.", () => {
      dataFile.delete("surname", { ifEqual: "XYZ" });
      expect(dataFile.has("surname")).toBe(true);
    });
    it("should delete value.", () => {
      dataFile.delete("surname");
      expect(dataFile.has("surname")).toBe(false);
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

    it("should change whole object if no path is given.", () => {
      dataFile.assign(undefined, { manager: { id: 1, name: "George" } });
      expect(dataFile.data).toEqual({
        ids: [1, 2, 3],
        manager: { id: 1, name: "George" },
        name: "data json",
        product: { color: "red", name: "pen", size: 3 },
      });
    });
    it("should accept path as an array.", () => {
      dataFile.assign(["manager"], { id: 2 });
      expect(dataFile.get("manager.id")).toBe(2);
    });
  });

  describe("orderKeys", () => {
    it("should order keys of the data.", () => {
      dataFile.orderKeys(["name", "manager"]);
      dataFile.saveSync();
      const reReadDataFile = tm.getDataFileSync("data-file.json");
      expect(Object.keys(reReadDataFile.data)).toEqual(["name", "manager", "product", "ids"]);
    });

    it("should order keys alphabetically if no order is given.", () => {
      dataFile.orderKeys();
      dataFile.saveSync();
      const reReadDataFile = tm.getDataFileSync("data-file.json");
      expect(Object.keys(reReadDataFile.data)).toEqual(["ids", "manager", "name", "product"]);
    });

    it("should not order keys if order is equal to old order.", () => {
      dataFile.orderKeys();
      dataFile.saveSync();
      const reReadDataFile = tm.getDataFileSync("data-file.json");
      expect(Object.keys(reReadDataFile.data)).toEqual(["ids", "manager", "name", "product"]);
    });
  });
});
