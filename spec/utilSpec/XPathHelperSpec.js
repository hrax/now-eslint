const fs = require("fs");
const XPathHelper = require("../../modules/util/XPathHelper.js");

describe("XPathHelper", () => {
  it("parses field value from table", () => {
    const payload = fs.readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", {encoding: "utf8"});
    const data = XPathHelper.parseFieldValue("sys_script_include", "script", payload);

    expect(data).not.toBeNull();
    expect(data).toContain("TestGlass.prototype");
  });
});