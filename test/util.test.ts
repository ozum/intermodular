import { join } from "path";
import { parseString, findTopPackageDir } from "../src/util";

describe("util", () => {
  describe("parseString", () => {
    it("should throw if yaml data is not parseable", () => {
      expect(() => parseString("a:3:\n4")).toThrow("Cannot parse data ");
    });
  });

  describe("findTopPackageDir", () => {
    it("should find top package directory from several level deep.", () => {
      expect(findTopPackageDir(join(__dirname, "supplements/source-module/node_modules/some-module/dist"))).toBe(join(__dirname, ".."));
    });

    it("should return package directory if it is already top.", () => {
      expect(findTopPackageDir(join(__dirname))).toBe(join(__dirname, ".."));
      expect(findTopPackageDir(join(__dirname, ".."))).toBe(join(__dirname, ".."));
    });
  });
});
