import tmp from "tmp-promise";
import { copy, ensureDir } from "fs-extra";
import { join } from "path";
import Intermodular, { DataFile } from "../src/index";

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
  await ensureDir(join(dir.path, "source-module/src/empty-dir")); // Git does not have empty dirs. So create one.
  intermodular = await Intermodular.new({ source: join(dir.path, "source-module"), target: join(dir.path, "target-module") });
  selfIntermodular = await Intermodular.new();
});

afterAll(async () => {
  await dir.cleanup();
});

describe("intermodular", () => {
  it("should create with default values.", async () => {
    expect(selfIntermodular.sourceModule.name).toBe("intermodular");
    expect(selfIntermodular.targetModule.name).toBe("intermodular");
  });

  it("should create with default values 2.", async () => {
    expect(intermodular.sourceModule.name).toBe("source-module");
    expect(intermodular.targetModule.name).toBe("target-module");
  });

  it("should create with default values when INIT_CWD environment variable is not defined.", async () => {
    const initCwd = process.env.INIT_CWD;
    delete process.env.INIT_CWD;
    const localIntermodular = await Intermodular.new();
    expect(localIntermodular.sourceModule.name).toBe("intermodular");
    expect(localIntermodular.targetModule.name).toBe("intermodular");
    process.env.INIT_CWD = initCwd;
  });

  it("should create with source and root moudule's provided.", async () => {
    const localIntermodular = await Intermodular.new({ source: intermodular.sourceModule, target: intermodular.targetModule });
    expect(localIntermodular.sourceModule.name).toBe("source-module");
  });

  it("should have config if configuration is present.", async () => {
    expect(intermodular.config.data).toEqual({ x: 1 });
  });

  it("should not have config if configuration is not present.", async () => {
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
    it("should copy directory into same directory.", async () => {
      expect(await intermodular.targetModule.exists("src")).toBe(false);
      const copiedFiles = await intermodular.copy("src");
      expect(await intermodular.targetModule.exists("src")).toBe(true);
      expect(copiedFiles).toEqual(["src", "src/index.json", "src/empty-dir"]);
    });

    it("should not copy if filter is false.", async () => {
      expect(await intermodular.targetModule.exists("copy-source")).toBe(false);
      await intermodular.targetModule.createDirectory("copy-source/");
      const copiedFiles = await intermodular.copy("copy-source", "copy-source", {
        excludeDirFromReturn: true,
        filter: (sourcePath, targetPath, isSourceDirectory, isTargetDirectory, sourceContent) =>
          isSourceDirectory || (sourceContent instanceof DataFile && sourceContent.data.x === 1),
      });
      expect(await intermodular.targetModule.exists(join("copy-source/a"))).toBe(false);
      expect(await intermodular.targetModule.exists(join("copy-source/b"))).toBe(true);
      expect(copiedFiles).toEqual(["copy-source/b"]);
    });

    it("should return if source and target are same.", async () => {
      expect(await selfIntermodular.copy("src")).toEqual([]);
    });

    it("should copy file into directory.", async () => {
      const fileName = getFilename();
      await intermodular.targetModule.createDirectory(fileName);
      expect(await intermodular.targetModule.exists(join(fileName, "a"))).toBe(false);
      const copiedFiles = await intermodular.copy("copy-source/a", fileName);
      expect(await intermodular.targetModule.exists(join(fileName, "a"))).toBe(true);
      expect(copiedFiles).toEqual([join(fileName, "a")]);
    });

    it("should copy to target root.", async () => {
      expect(await intermodular.targetModule.exists("a")).toBe(false);
      await intermodular.copy("copy-source", ".");
      expect(await intermodular.targetModule.exists("a")).toBe(true);
    });

    it("should copy from source root.", async () => {
      expect(await intermodular.targetModule.exists("root-copy/package.json")).toBe(false);
      await intermodular.copy(".", "root-copy");
      expect(await intermodular.targetModule.exists("root-copy/package.json")).toBe(true);
    });

    it("should not overwrite if not requested.", async () => {
      expect(await intermodular.targetModule.package.get("name")).toBe("target-module");
      await intermodular.copy("package.json", "package.json", { overwrite: false });
      await intermodular.targetModule.package.reload();
      expect(await intermodular.targetModule.package.get("name")).toBe("target-module");
    });

    it("should tolarate when a directory tried to be copied into a file path when overwrite is false.", async () => {
      const copiedFiles = await intermodular.copy("src", "package.json");
      expect(copiedFiles).toEqual([]);
    });

    it("should throw when a directory tried to be copied into a file path with overwrite.", async () => {
      await expect(intermodular.copy("src", "package.json", { overwrite: true })).rejects.toThrow("Cannot overwrite non-directory");
    });
  });

  describe("execute", () => {
    it("should execute command", async () => {
      expect((await intermodular.execute("ls", ["-al"], { stdio: "pipe" })).exitCode).toBe(0);
    });

    it("should execute command with `env.PATH` option.", async () => {
      expect((await intermodular.execute("ls", ["-al"], { stdio: "pipe", env: { PATH: `xyz:${process.env.PATH}` } })).exitCode).toBe(0);
    });

    it("should execute command with `env.PATH` option 2.", async () => {
      expect((await intermodular.execute("echo")).exitCode).toBe(0);
    });
  });

  describe("command", () => {
    it("should execute command", async () => {
      expect((await intermodular.command("ls", { stdio: "pipe" })).exitCode).toBe(0);
    });

    it("should execute command with `env.PATH` option.", async () => {
      expect((await intermodular.command("ls", { stdio: "pipe", env: { PATH: `xyz:${process.env.PATH}` } })).exitCode).toBe(0);
    });

    it("should execute command with `env.PATH` option 2.", async () => {
      expect((await intermodular.command("echo")).exitCode).toBe(0);
    });
  });

  describe("areEquivalentFiles", () => {
    it("should return true if both TypeScript files are equivalent.", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/address.ts")).toBe(true);
    });

    it("should return true if both JavaScript files are equivalent.", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/address.js", "equivalent/address.js")).toBe(true);
    });

    it("should return true if both JavaScript files are equivalent (2).", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/a.js", "equivalent/a.js")).toBe(true);
    });

    it("should return false if both JavaScript files are equivalent (2).", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/a.js", "equivalent/a.js")).toBe(true);
    });

    it("should return false if both TypeScript files are not equivalent.", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/a.js", "equivalent/b.js")).toBe(false);
    });

    it("should return true if both text files are equivalent.", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/text.abcd")).toBe(true);
    });

    it("should return false if one of the files does not exists.", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/xxx.xxx")).toBe(false);
    });

    it("should return true if both data files are equivalent in different order.", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/data.json")).toBe(true);
    });

    it("should return true if both data files are equivalent in same order.", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/data-array.json")).toBe(true);
    });

    it("should return false if data files are not equivalent.", async () => {
      expect(await intermodular.areEquivalentFiles("equivalent/data.json", "equivalent/data-array.json")).toBe(false);
    });
  });
});
