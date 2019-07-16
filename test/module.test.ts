import { remove, mkdirpSync, removeSync } from "fs-extra";
import { join } from "path";
import get from "lodash.get";
import Intermodular from "../src/intermodular";
import { DependencyType } from "../src/types";
import Module from "../src/module";
import DataFile from "../src/data-file";

const sourceRoot = join(__dirname, "supplements/source-module");
const targetRoot = join(__dirname, "supplements/target-module");
const installTestModuleRoot = join(__dirname, "supplements/install-test-module");
const im = new Intermodular({ sourceRoot, targetRoot });

const sm = im.sourceModule;
const tm = im.targetModule;

afterAll(async () => {
  await remove(join(targetRoot, "created"));
  await remove(join(installTestModuleRoot, "package-lock.json"));
  await remove(join(installTestModuleRoot, "yarn.lock"));
  await remove(join(installTestModuleRoot, "node_modules"));
});

describe("Module", () => {
  it("should throw if root is missing", () => {
    expect(() => new Module(undefined as any, "" as any, false, "npm")).toThrow("root is required.");
  });

  it("should throw if package is missing", () => {
    expect(() => new Module(__dirname, "" as any, false, "npm")).toThrow("Given path is not a module.");
  });

  it("should return empty config if file cannot be found", () => {
    const localModule = new Module(sourceRoot, "" as any, false, "npm", "xyz");
    expect(localModule.config).toEqual({});
  });

  it("should reload config", () => {
    const localModule = new Module(targetRoot, { log: () => 1 } as any, false, "npm", "boilerplate");
    expect(localModule.config).toEqual({});
    localModule.writeSync(".boilerplaterc.json", { reloaded: true });
    localModule.reloadConfig();
    expect(localModule.config).toEqual({ reloaded: true });
    localModule.removeSync(".boilerplaterc.json");
  });

  it("should have root", () => {
    expect(tm.root).toBe(targetRoot);
  });

  it("should have package", () => {
    expect(tm.package.name).toBe("test-target-module");
  });

  it("should have tsconfig", () => {
    expect(get(tm.tsConfig, "compilerOptions.outDir")).toBe("dist");
  });

  it("should have config", () => {
    expect(tm.config.configExists).toBe("yes");
  });

  it("should have name", () => {
    expect(tm.name).toBe("test-target-module");
  });

  it("should have safe name", () => {
    const localModule = new Module(join(__dirname, "supplements/module-with-username"), "" as any, false, "npm", "xyz");
    expect(localModule.safeName).toBe("user-module-with-username");
  });

  it("should have name without user", () => {
    const localModule = new Module(join(__dirname, "supplements/module-with-username"), "" as any, false, "npm", "xyz");
    expect(localModule.nameWithoutUser).toBe("module-with-username");
  });

  describe("isCompiled", () => {
    it("should return false if module is not compiled", () => {
      expect(sm.isCompiled).toBe(false);
    });

    it("should return true if module is compiled", () => {
      expect(tm.isCompiled).toBe(true);
    });
  });

  describe("isTypeScript", () => {
    it("should return false if module is not TypeScript", () => {
      expect(sm.isTypeScript).toBe(false);
    });

    it("should return true if module is TypeScript", () => {
      expect(tm.isTypeScript).toBe(true);
    });
  });

  describe("getDependencyVersion", () => {
    it("should return dependency version from dependencies", () => {
      expect(tm.getDependencyVersion("lodash.get")).toBe("^4.4.2");
    });

    it("should not return dependency version from only dependencies if not found", () => {
      expect(tm.getDependencyVersion("lodash.sortBy", [DependencyType.Dependencies])).toBeUndefined();
    });

    it("should return dependency version from devDependencies", () => {
      expect(tm.getDependencyVersion("lodash.sortby")).toBe("^4.7.0");
    });

    it("should not return dependency version from only devDependencies if not found", () => {
      expect(tm.getDependencyVersion("lodash.get", [DependencyType.DevDependencies])).toBeUndefined();
    });

    it("should return dependency version from peerDependencies", () => {
      expect(tm.getDependencyVersion("lodash.has")).toBe("^4.5.2");
    });

    it("should not return dependency version from only peerDependencies if not found", () => {
      expect(tm.getDependencyVersion("lodash.get", [DependencyType.PeerDependencies])).toBeUndefined();
    });

    it("should return dependency version from optionalDependencies", () => {
      expect(tm.getDependencyVersion("lodash.unset")).toBe("^4.5.2");
    });

    it("should not return dependency version from only optionalDependencies if not found", () => {
      expect(tm.getDependencyVersion("lodash.get", [DependencyType.OptionalDependencies])).toBeUndefined();
    });
  });

  describe("ifAnyDependency", () => {
    it("should return true if module exists in dependencies", () => {
      expect(tm.ifAnyDependency("lodash.get")).toBe(true);
    });

    it("should return false if module exists in dependencies", () => {
      expect(tm.ifAnyDependency("xyz")).toBe(false);
    });
  });

  describe("pathOf", () => {
    it("should return absolute path of given path", () => {
      expect(tm.pathOf("tsconfig.json")).toBe(join(targetRoot, "tsconfig.json"));
    });
  });

  describe("readFileSync", () => {
    it("should return content of given file", () => {
      expect(sm.readSync("config-files/data.json")).toBe('{\n  "name": "data json"\n}\n');
    });
  });

  describe("parseFileSync", () => {
    it("should return parsed json content of given file as an object", () => {
      expect(sm.parseSync("config-files/data.json")).toEqual({ name: "data json" });
    });
  });

  describe("parseFileWithFormatSync", () => {
    it("should return parsed content and file format of given file as an object", () => {
      expect(sm.parseWithFormatSync("config-files/data.json")).toEqual({ data: { name: "data json" }, format: "json" });
    });
  });

  describe("writeFileSync", () => {
    it("should write prettified content to file", () => {
      tm.writeSync("created/a.js", "function a() { return 1 }");
      expect(tm.readSync("created/a.js")).toBe("function a() {\n  return 1;\n}\n");
    });

    it("should write non-prettified content to file", () => {
      tm.writeSync("created/a-non-pretty.js", "function a() { return 1 }", { prettier: false });
      expect(tm.readSync("created/a-non-pretty.js")).toBe("function a() { return 1 }");
    });

    it("should write parsed content to file", () => {
      tm.writeSync("created/a.json", { a: 1 });
      expect(tm.readSync("created/a.json")).toBe('{ "a": 1 }\n');
    });

    it("should write parsed content to file using requested format", () => {
      tm.writeSync("created/a.yaml", { a: 1 }, { format: "yaml" });
      expect(tm.readSync("created/a.yaml")).toBe("a: 1\n");
    });

    it("should not overwrite by default", () => {
      tm.writeSync("created/b.yaml", { a: 1 }, { format: "yaml" });
      tm.writeSync("created/b.yaml", { x: 1 }, { format: "yaml" });

      expect(tm.readSync("created/b.yaml")).toBe("a: 1\n");
    });

    it("should overwrite optionally", () => {
      tm.writeSync("created/c.yaml", { a: 1 }, { format: "yaml" });
      tm.writeSync("created/c.yaml", { x: 1 }, { format: "yaml", overwrite: true });

      expect(tm.readSync("created/c.yaml")).toBe("x: 1\n");
    });

    it("should overwrite if only file is equal given content", () => {
      tm.writeSync("created/d.yaml", { a: 1 }, { format: "yaml" });
      tm.writeSync("created/d.yaml", { x: 1 }, { format: "yaml", ifEqual: "a: 1\n" });

      expect(tm.readSync("created/d.yaml")).toBe("x: 1\n");
    });

    it("should not overwrite if file is not equal given content", () => {
      tm.writeSync("created/d-not-equal.yaml", { a: 1 }, { format: "yaml" });
      tm.writeSync("created/d-not-equal.yaml", { x: 1 }, { format: "yaml", ifEqual: "b: 1\n" });

      expect(tm.readSync("created/d-not-equal.yaml")).toBe("a: 1\n");
    });

    it("should overwrite if only file is not equal given content", () => {
      tm.writeSync("created/e.yaml", { a: 1 }, { format: "yaml" });
      tm.writeSync("created/e.yaml", { x: 1 }, { format: "yaml", ifNotEqual: "b: 1\n" });

      expect(tm.readSync("created/e.yaml")).toBe("x: 1\n");
    });

    it("should not overwrite if file is equal given content", () => {
      tm.writeSync("created/e-equal.yaml", { a: 1 }, { format: "yaml" });
      tm.writeSync("created/e-equal.yaml", { x: 1 }, { format: "yaml", ifNotEqual: "a: 1\n" });

      expect(tm.readSync("created/e-equal.yaml")).toBe("a: 1\n");
    });
  });

  describe("removeSync", () => {
    it("should remove file", () => {
      tm.writeSync("created/f.json", "a");
      tm.removeSync("created/f.json");
      expect(tm.existsSync("created/x.json")).toBe(false);
    });

    it("should not remove file if equality check fails", () => {
      tm.writeSync("created/g.json", "a");
      tm.removeSync("created/g.json", { ifEqual: "a" });
      expect(tm.existsSync("created/g.json")).toBe(true);
    });
  });

  describe("removeEmptyDirsSync", () => {
    it("should remove empty directories", () => {
      mkdirpSync(tm.pathOf("empty-dir-test/a/a1/a11"));
      mkdirpSync(tm.pathOf("empty-dir-test/a/a2/a21"));
      tm.writeSync("empty-dir-test/a/a2/a21/x.txt", "a");
      tm.removeEmptyDirsSync("empty-dir-test");
      const shouldExist = tm.existsSync("empty-dir-test/a/a2");
      const shouldNotExist = !tm.existsSync("empty-dir-test/a/a1");
      removeSync(tm.pathOf("empty-dir-test"));
      expect(shouldExist && shouldNotExist).toBe(true);
    });
  });

  describe("renameSync", () => {
    it("should rename file", () => {
      tm.renameSync("to-rename.txt", "to-rename-new.txt");
      expect(tm.readSync("to-rename-new.txt")).toBe("source\n");
      tm.renameSync("to-rename-new.txt", "to-rename.txt");
    });

    it("should not overwrite file", () => {
      tm.renameSync("to-rename.txt", "to-rename-existing.txt");
      expect(tm.readSync("to-rename-existing.txt")).toBe("existing\n");
    });

    it("should overwrite file optionally", () => {
      tm.renameSync("to-rename.txt", "to-rename-existing.txt", { overwrite: true });
      expect(tm.readSync("to-rename-existing.txt")).toBe("source\n");
      tm.renameSync("to-rename-existing.txt", "to-rename.txt");
      tm.writeSync("to-rename-existing.txt", "existing\n", { overwrite: true });
    });
  });

  describe("getDataFileSync", () => {
    it("should return DataFile instance for a json file.", () => {
      const dataFile = tm.getDataFileSync("data.json");
      expect(dataFile instanceof DataFile).toBe(true);
    });

    it("should return DataFile instance for a yaml file.", () => {
      const dataFile = tm.getDataFileSync("data.yaml");
      expect(dataFile instanceof DataFile).toBe(true);
    });
  });

  describe("isEqual", () => {
    it("should return true if parsed data is equal to given object.", () => {
      expect(tm.isEqual("data.json", { name: "data" })).toBe(true);
    });

    it("should return false if parsed data is equal to given object.", () => {
      expect(tm.isEqual("data.json", { name: "xyz" })).toBe(false);
    });
  });

  describe("getPrettierConfigSync", () => {
    it("should return root prettier config if no file is given.", () => {
      expect(tm.getPrettierConfigSync()).toEqual({ parser: null, printWidth: 140, trailingComma: "es5" });
    });
  });

  describe("bin", () => {
    it("should return path of the given executable.", () => {
      expect(tm.bin("prettier")).toBe("./test/supplements/target-module/node_modules/.bin/prettier");
    });
  });

  describe("resolveBin", () => {
    it("should find local executable in node_modules/.bin", () => {
      expect(tm.resolveBin("local-executable")).toBe("local-executable");
    });

    it("should find global executable", () => {
      expect(tm.resolveBin("ls")).toBe("ls");
    });

    it("should find local executable of given module", () => {
      expect(tm.resolveBin("typescript", { executable: "tsc" })).toBe("tsc");
    });
  });

  describe("install/uninstall", () => {
    it("should install module with npm.", async () => {
      const localModule = new Module(installTestModuleRoot, "" as any, false, "npm", "xyz");
      localModule.install(join(__dirname, "supplements/example-module-1.0.0.tgz"));
      expect(localModule.existsSync("node_modules/example-module")).toBe(true);
    });

    it("should uninstall module with npm.", () => {
      const localModule = new Module(installTestModuleRoot, "" as any, false, "npm", "xyz");
      localModule.uninstall("example-module");
      expect(localModule.existsSync("node_modules/example-module")).toBe(false);
    });

    it("should install module with yarn.", () => {
      const localModule = new Module(installTestModuleRoot, "" as any, false, "yarn", "xyz");
      localModule.install(join(__dirname, "supplements/example-module-1.0.0.tgz"));
      expect(localModule.existsSync("node_modules/example-module")).toBe(true);
    });

    it("should uninstall module with yarn.", () => {
      const localModule = new Module(installTestModuleRoot, "" as any, false, "yarn", "xyz");
      localModule.uninstall("example-module");
      expect(localModule.existsSync("node_modules/example-module")).toBe(false);
    });

    it("should install dev module with npm.", async () => {
      const localModule = new Module(installTestModuleRoot, "" as any, false, "npm", "xyz");
      localModule.install(join(__dirname, "supplements/example-module-1.0.0.tgz"), { type: DependencyType.DevDependencies });
      expect(localModule.existsSync("node_modules/example-module")).toBe(true);
    });

    it("should uninstall dev module with npm.", () => {
      const localModule = new Module(installTestModuleRoot, "" as any, false, "npm", "xyz");
      localModule.uninstall("example-module");
      expect(localModule.existsSync("node_modules/example-module")).toBe(false);
    });

    it("should install dev module with yarn.", () => {
      const localModule = new Module(installTestModuleRoot, "" as any, false, "yarn", "xyz");
      localModule.install(join(__dirname, "supplements/example-module-1.0.0.tgz"), { type: DependencyType.DevDependencies });
      expect(localModule.existsSync("node_modules/example-module")).toBe(true);
    });

    it("should uninstall dev module with yarn.", () => {
      const localModule = new Module(installTestModuleRoot, "" as any, false, "yarn", "xyz");
      localModule.uninstall("example-module");
      expect(localModule.existsSync("node_modules/example-module")).toBe(false);
    });

    it("should throw if unsupported package manager found", () => {
      expect(() => new Module(installTestModuleRoot, "" as any, false, "abc" as any, "xyz")).toThrow("Unknown package manager");
    });
  });

  describe("executeSync", () => {
    it("execute command", () => {
      tm.executeSync("echo");
    });
  });

  describe("executeAllSync", () => {
    const localModule = new Intermodular({ targetRoot: join(__dirname, "..") }).targetModule;

    it("should execute serially", () => {
      const result = localModule.executeAllSync("echo", ["echo", [""]]);
      expect(result.results.length).toBe(2);
    });

    it("should accet options without args", () => {
      const result = localModule.executeAllSync(["echo", { stdio: "inherit" }]);
      expect(result.results.length).toBe(1);
    });

    it("should throw on error during serial", () => {
      expect(() => localModule.executeAllSync("should-not-found")).toThrow("Command failed");
    });
  });

  describe("executeAllWithOptionsSync", () => {
    const localModule = new Intermodular({ targetRoot: join(__dirname, "..") }).targetModule;

    it("should not throw on error during serial optionally", () => {
      const result = localModule.executeAllWithOptionsSync({ throwOnError: false, stopOnError: false }, "should-not-found", "echo");
      expect(result.status).toBeGreaterThan(0);
      expect(result.results.length).toBe(2);
    });

    it("should not throw on error during parallel optionally", () => {
      const result = localModule.executeAllWithOptionsSync({ throwOnError: false, stdio: "ignore" }, { a: "should-not-found", b: "echo" });
      expect(result.status).toBeGreaterThan(0);
    });

    it("should throw on error during parallel when throwOnError is true", () => {
      expect(() =>
        localModule.executeAllWithOptionsSync(
          { stopOnError: false, throwOnError: true, stdio: "ignore" },
          { a: "should-not-found", b: "echo" }
        )
      ).toThrow("Command failed");
    });

    it("should continue during parallel when throwOnError is false and stopOnError is false", () => {
      const result = localModule.executeAllWithOptionsSync(
        { throwOnError: false, stopOnError: false, stdio: "ignore" },
        { a: "should-not-found", b: "echo" }
      );
      expect(result.status).toBeGreaterThan(0);
    });

    it("should not stop on error during serial optionally", () => {
      const result = localModule.executeAllWithOptionsSync(
        { throwOnError: false, stopOnError: true, stdio: "ignore" },
        "should-not-found",
        "echo"
      );
      expect(result.results.length).toBe(1);
    });

    it("should log stdout", () => {
      const result = localModule.executeAllWithOptionsSync({ stdio: undefined }, { a: "echo", b: "echo" });
      expect(result.results.length).toBe(1);
    });
  });
});
