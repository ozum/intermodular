import { parseString } from "../src/util";

describe("util", () => {
  describe("parseString", () => {
    it("should throw if yaml data is not parseable", () => {
      expect(() => parseString("a:3:\n4")).toThrow("Cannot parse data ");
    });
  });
});
