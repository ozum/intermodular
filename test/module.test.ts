import tmp from "tmp-promise";
import { DataFile } from "edit-config";
import { copy, ensureDir } from "fs-extra";
import { join } from "path";
import { Module } from "../src/index";
import { DependencyType } from "../src/util/types";

let myModule: Module;
let dir: tmp.DirectoryResult;

function getFilename(extension = "") {
  const number = Math.floor(Math.random() * Math.floor(1000));
  return join("temp", `${number}${extension ? "." : ""}${extension}`);
}

beforeAll(async () => {
  dir = await tmp.dir({ unsafeCleanup: true });
  await copy(join(__dirname, "test-helper"), dir.path);
  await ensureDir(join(dir.path, "source-module/src/empty-dir"));
  myModule = await Module.new({ cwd: join(dir.path, "source-module") });
});

afterAll(async () => {
  await dir.cleanup();
});

describe("Module", () => {
  it("should create instance with defaults.", async () => {
    const initCwd = process.env.INIT_CWD;
    delete process.env.INIT_CWD;
    const localModule = await Module.new();
    expect(localModule.name).toBe("intermodular");
    expect(localModule.isTypeScript).toBe(true);
    process.env.INIT_CWD = initCwd;
  });

  it("should create instance when given path is in a sub directory of root.", async () => {
    const localModule = await Module.new({ cwd: join(__dirname, "../src/index.ts") });
    expect(localModule.name).toBe("intermodular");
  });

  it("should throw if root cannot be found.", async () => {
    await expect(Module.new({ cwd: join(__dirname, "../..") })).rejects.toThrow("No root path");
  });

  it("should throw if cwd does not exist.", async () => {
    await expect(Module.new({ cwd: join(__dirname, "xyz") })).rejects.toThrow("Cannot find root");
  });

  it("should get module name without user name.", async () => {
    expect(myModule.nameWithoutUser).toBe("source-module");
  });

  it("should have root.", async () => {
    expect(myModule.root).toBe(join(dir.path, "source-module"));
  });

  it("should return path of file.", async () => {
    expect(myModule.pathOf("my-file")).toBe(join(dir.path, "source-module/my-file"));
  });

  it("should return relative path of an absolute path.", async () => {
    expect(myModule.relativePathOf(join(dir.path, "source-module/my-file"))).toBe("my-file");
  });

  it("should return relative path directly.", async () => {
    expect(myModule.relativePathOf("my-file")).toBe("my-file");
  });

  it("should get yarn as package manager.", async () => {
    const localModule = await Module.new({ cwd: join(__dirname, "test-helper/yarn") });
    expect(localModule.packageManager).toBe("yarn");
  });

  it("should use default package manager if none found.", async () => {
    const localModule = await Module.new({ cwd: join(__dirname, "test-helper/no-package-manager") });
    expect(localModule.packageManager).toBe("npm");
  });

  it("should remove file.", async () => {
    const fileName = getFilename();
    await myModule.write(fileName, "a");
    expect(await myModule.exists(fileName)).toBe(true);
    await myModule.remove(fileName);
    expect(await myModule.exists(fileName)).toBe(false);
  });

  it("should not remove file if condition is not met.", async () => {
    expect(await myModule.remove(getFilename(), { if: () => false })).toBeUndefined();
  });

  it("should remove all empty dirs recursively", async () => {
    await copy(join(dir.path, "source-module/src"), join(dir.path, "source-module/temp/src"));
    expect(await myModule.exists("temp/src/empty-dir")).toBe(true);
    await myModule.removeEmptyDirs(join(dir.path, "source-module/temp/src"));
    expect(await myModule.exists("temp/src/empty-dir")).toBe(false);
  });

  it("should save all data files", async () => {
    expect(await myModule.saveAll()).toBeUndefined();
  });

  describe("getDependencyVersion", () => {
    it("should get dependency version from all dependencies.", async () => {
      expect(myModule.getDependencyVersion("lodash.get")).toBe("4.4.2");
    });

    it("should allow to select dependency type.", async () => {
      expect(myModule.getDependencyVersion("lodash.get", ["devDependencies"])).toBeUndefined();
    });
  });

  describe("hasAnyDependency", () => {
    it("should return true for existing dependency.", async () => {
      expect(myModule.hasAnyDependency(["lodash.get", "xyz"])).toBe(true);
    });

    it("should allow to select dependency type.", async () => {
      expect(myModule.hasAnyDependency("lodash.get", ["devDependencies"])).toBe(false);
    });
  });

  describe("ifAnyDependency", () => {
    it("should return default true value if dependency found.", () => {
      expect(myModule.ifAnyDependency("lodash.get")).toBe(true);
    });

    it("should return default true value if dependency not found.", () => {
      expect(myModule.ifAnyDependency("xyz")).toBe(false);
    });

    it("should return required value if dependency found.", () => {
      expect(myModule.ifAnyDependency("lodash.get", 1, 2, ["dependencies"])).toBe(1);
    });

    it("should return required value if dependency not found.", () => {
      expect(myModule.ifAnyDependency("lodash.get", 1, 2, ["devDependencies"])).toBe(2);
    });
  });

  describe("read", () => {
    it("should read raw file content.", async () => {
      expect(await myModule.read("text.txt")).toBe("text content\n");
    });

    it("should read JSON data.", async () => {
      const dataFile = (await myModule.read("data-json.json")) as DataFile;
      expect(dataFile.data).toEqual({ member: { name: "John" } });
    });

    it("should read YAML data.", async () => {
      const dataFile = (await myModule.read("data-yaml.yaml")) as DataFile;
      expect(dataFile.data).toEqual({ city: { id: 12 } });
    });

    it("should read cosmiconfig data.", async () => {
      const dataFile = (await myModule.read("eslint", { cosmiconfig: true })) as DataFile;
      expect(dataFile.data).toEqual({ a: 1 });
    });

    it("should throw when target is a directory", async () => {
      await expect(myModule.read("src")).rejects.toThrow("is a directory");
    });

    it("should return undefined if file does not exist.", async () => {
      expect(await myModule.read("xyz")).toBeUndefined();
    });

    it("should create if file does not exist and default data is provided as an object.", async () => {
      const dataFile = (await myModule.read(getFilename(), { defaultData: { a: 1 } })) as DataFile;
      expect(dataFile.data).toEqual({ a: 1 });
    });

    it("should create if file does not exist and default data is provided as a string.", async () => {
      const dataFile = await myModule.read(getFilename(), { defaultData: "abc" });
      expect(dataFile).toBe("abc");
    });

    it("should read file with number content.", async () => {
      expect(await myModule.read("number-file")).toBe("1\n");
    });

    it("should read file with string content.", async () => {
      expect(await myModule.read("string-file")).toBe("abc\n");
    });

    it("should read empty file.", async () => {
      expect(await myModule.read("empty-file-1")).toBe("");
    });

    it("should read empty file with default content.", async () => {
      expect(await myModule.read("empty-file-2", { defaultData: "xyz" })).toBe("");
    });
  });

  describe("write", () => {
    it("should write raw file content.", async () => {
      expect(await myModule.write(getFilename(), "text")).toBe("text");
    });

    it("should write default empty string.", async () => {
      const fileName = getFilename();
      await myModule.write(fileName);
      expect(await myModule.read(fileName)).toBe("");
    });

    it("should not overwrite file if not requested.", async () => {
      const fileName = getFilename(); // join("temp", "x");
      getFilename();
      await myModule.write(fileName, "1");
      await myModule.write(fileName, "2");
      expect(await myModule.read(fileName)).toBe("1");
    });

    it("should throw if path is empty", async () => {
      await expect(myModule.write("", "", { overwrite: true })).rejects.toThrow("'path' is required.");
    });

    it("should not write if condition is not met", async () => {
      const fileName = getFilename();
      await myModule.write(fileName, "abc", { if: () => false });
      expect(await myModule.exists(fileName)).toBe(false);
    });

    it("should write if condition is met", async () => {
      const fileName = getFilename();
      await myModule.write(fileName, "abc", { if: () => true });
      expect(await myModule.exists(fileName)).toBe(true);
    });
  });

  describe("rename", () => {
    it("should rename.", async () => {
      await myModule.write("old-name", "a");
      expect(await myModule.exists("old-name")).toBe(true);
      await myModule.rename("old-name", "new-name");
      expect(await myModule.exists("old-name")).toBe(false);
      expect(await myModule.exists("new-name")).toBe(true);
    });

    it("should throw if source is a file and target is a directory.", async () => {
      await expect(myModule.rename("package.json", "src")).rejects.toThrow("File cannot be renamed to existing directory");
    });

    it("should not overwrite existing file if overwrite is false.", async () => {
      expect(await myModule.exists("text.txt")).toBe(true);
      expect(await myModule.rename("package.json", "text.txt")).toBe(false);
    });
  });

  describe("isEqual", () => {
    it("should return true if object is equal to data in file.", async () => {
      expect(await myModule.isEqual("data-json.json", { member: { name: "John" } })).toBe(true);
    });

    it("should return true if string is equal to data in file.", async () => {
      expect(await myModule.isEqual("text.txt", "text content\n")).toBe(true);
    });
  });

  describe("execute", () => {
    it("should execute command", async () => {
      expect((await myModule.execute("ls", { stdio: undefined })).exitCode).toBe(0);
      expect((await myModule.execute("ls", ["-al"], { stdio: undefined })).exitCode).toBe(0);
    });
  });

  describe("command", () => {
    it("should execute command", async () => {
      expect((await myModule.command("ls", { stdio: undefined })).exitCode).toBe(0);
    });

    it("should execute command with options", async () => {
      expect((await myModule.command("ls -al", { stdio: undefined })).exitCode).toBe(0);
    });
  });

  describe("isDirectory", () => {
    it("should return false if path does not exist.", async () => {
      expect(await myModule.isDirectory("xyz")).toBe(false);
    });
  });
});
