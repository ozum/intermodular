import { remove, existsSync } from "fs-extra";
import { join } from "path";
import { compare } from "dir-compare";
import Intermodular from "../src/intermodular";
import { LogLevel } from "../src/types";

const sourceRoot = join(__dirname, "supplements/source-module");
const targetRoot = join(__dirname, "supplements/target-module");

const im = new Intermodular({ sourceRoot, targetRoot, logLevel: LogLevel.Debug });

afterAll(async () => {
  await remove(join(targetRoot, "config-files"));
  await remove(join(targetRoot, "config-files-target"));
  await remove(join(targetRoot, "existing-dir/some-file.js"));
  await remove(join(targetRoot, "different-name.json"));
});

describe("Intermodular", () => {
  it("should detect its own root", () => {
    expect(im.myRoot).toBe(join(__dirname, ".."));
  });

  it("should detect its parent module root", () => {
    expect(im.parentModuleRoot).toBe(join(__dirname, ".."));
  });

  it("should use itself as a default source module", () => {
    const imLocal = new Intermodular({ targetRoot: join(__dirname, "supplements/target-module") });
    expect(imLocal.sourceModule.name).toBe("intermodular");
  });

  it("should return set status of false for empty environment variables", () => {
    process.env.intermodularTest = "";
    expect(Intermodular.isEnvSet("intermodularTest")).toBe(false);
  });
  it("should return set status of false for 'undefined' string environment variables", () => {
    process.env.intermodularTest = "undefined";
    expect(Intermodular.isEnvSet("intermodularTest")).toBe(false);
  });
  it("should return set status of true for non-empty environment variables", () => {
    process.env.intermodularTest = "set";
    expect(Intermodular.isEnvSet("intermodularTest")).toBe(true);
  });
  it("should parse environment variable as an object", () => {
    process.env.intermodularTest = '{ "passed": "ok" }';
    expect(Intermodular.parseEnv("intermodularTest")).toEqual({ passed: "ok" });
  });
  it("should parse environment variable as a string", () => {
    process.env.intermodularTest = "passed";
    expect(Intermodular.parseEnv("intermodularTest")).toBe("passed");
  });
  it("should return default environment if it is not set", () => {
    process.env.intermodularTest = "";
    expect(Intermodular.parseEnv("intermodularTest", "default")).toBe("default");
  });
  it("should resolve module root", () => {
    process.env.intermodularTest = "passed";
    expect(Intermodular.resolveModuleRoot("prettier")).toBe(join(__dirname, "../node_modules/prettier"));
  });

  it("should copy with different name", () => {
    im.copySync("config-files/data.json", "different-name.json");
  });

  it("should copy directories", async () => {
    im.copySync("config-files", "config-files-target");
    const comparison = await compare(
      join(__dirname, "supplements/source-module/config-files"),
      join(__dirname, "supplements/target-module/config-files-target")
    );
    expect(comparison.differences).toBe(0);
  });
  it("should copy directories to same path in target module", async () => {
    im.copySync("config-files");
    const comparison = await compare(
      join(__dirname, "supplements/source-module/config-files"),
      join(__dirname, "supplements/target-module/config-files")
    );
    expect(comparison.differences).toBe(0);
  });
  it("should copy file into target directory", () => {
    im.copySync("config-files/some-file.js", "existing-dir");
    const exists = existsSync(join(targetRoot, "existing-dir/some-file.js"));
    expect(exists).toBe(true);
  });
  it("should execute filter function during copy", () => {
    im.copySync("config-files/other-file.js", "existing-dir", { filter: () => false });
    const exists = existsSync(join(targetRoot, "existing-dir/other-file.js"));
    expect(exists).toBe(false);
  });
  it("should log", async () => {
    im.log("Log test");
    expect(true).toBe(true);
  });
  it("should log if defined", async () => {
    im.logIfDefined("a");
    expect(true).toBe(true);
  });
  it("should not log if undefined", async () => {
    im.logIfDefined(undefined);
    expect(true).toBe(true);
  });
});
