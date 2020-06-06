import tmp from "tmp-promise";
import { DataFile } from "edit-config";
import { copy, ensureDir } from "fs-extra";
import { join } from "path";
import Intermodular from "../src/index";

let intermodular: Intermodular;
let selfIntermodular: Intermodular;
let dir: tmp.DirectoryResult;

function getFilename(extension = "") {
  const number = Math.floor(Math.random() * Math.floor(1000));
  return join("temp", `${number}${extension ? "." : ""}${extension}`);
}

beforeAll(async () => {
  dir = await tmp.dir({ unsafeCleanup: true });
  await copy(join(__dirname, "test-helper"), dir.path);
  await ensureDir(join(dir.path, "source-module/src/empty-dir"));
  intermodular = await Intermodular.new({ sourceRoot: join(dir.path, "source-module"), targetRoot: join(dir.path, "target-module") });
  selfIntermodular = await Intermodular.new();
});

afterAll(async () => {
  await dir.cleanup();
});

describe("intermodular", () => {
  it("should create with default values", async () => {
    expect(selfIntermodular.sourceModule.name).toBe("intermodular");
    expect(selfIntermodular.targetModule.name).toBe("intermodular");
  });

  it("should have conifg if configuration is present.", async () => {
    expect(intermodular.config.data).toEqual({ x: 1 });
  });

  it("should not have conifg if configuration is not present.", async () => {
    expect(selfIntermodular.config.data).toEqual({});
  });

  describe("isEnvSet", () => {
    it("should return true if env is set.", async () => {
      expect(Intermodular.isEnvSet("NODE_ENV")).toBe(true);
    });

    it("should return false if env is not set.", async () => {
      expect(Intermodular.isEnvSet("xyz")).toBe(false);
    });
  });

  describe("parseEnv", () => {
    it("should return environment variable.", async () => {
      process.env.EXAMPLE_STRING = "a";
      expect(Intermodular.parseEnv("EXAMPLE_STRING")).toBe("a");
    });

    it("should return parsed environment variable, if value looks like JSON.", async () => {
      process.env.EXAMPLE_DATA = JSON.stringify({ name: "John" });
      expect(Intermodular.parseEnv("EXAMPLE_DATA")).toEqual({ name: "John" });
    });

    it("should return default value if environment variable is not set.", async () => {
      expect(Intermodular.parseEnv("XYZ", "a")).toBe("a");
    });
  });

  describe("copy", () => {
    it("should copy directory.", async () => {
      expect(await intermodular.targetModule.exists("src")).toBe(false);
      await intermodular.copy("src");
      expect(await intermodular.targetModule.exists("src")).toBe(true);
    });

    it("should not copy if filter is false.", async () => {
      expect(await intermodular.targetModule.exists("copy-source")).toBe(false);
      await intermodular.targetModule.createDirectory("copy-source/");
      await intermodular.copy("copy-source", "copy-source", {
        filter: (sourcePath, targetPath, isSourceDirectory, isTargetDirectory, sourceContent) =>
          isSourceDirectory || (sourceContent instanceof DataFile && sourceContent.data.x === 1),
      });
      expect(await intermodular.targetModule.exists(join("copy-source/a"))).toBe(false);
      expect(await intermodular.targetModule.exists(join("copy-source/b"))).toBe(true);
    });

    it("should return if source and target are same.", async () => {
      expect(await selfIntermodular.copy("src")).toBeUndefined();
    });

    it("should copy file into directory", async () => {
      const fileName = getFilename();
      await intermodular.targetModule.createDirectory(fileName);
      expect(await intermodular.targetModule.exists(join(fileName, "a"))).toBe(false);
      await intermodular.copy("copy-source/a", fileName);
      expect(await intermodular.targetModule.exists(join(fileName, "a"))).toBe(true);
    });
  });
});
