/* eslint-disable no-magic-numbers */
const fs = require("fs");
const RESTHelper = require("../../modules/util/RestHelper.js");

describe("RESTHelper", () => {
  it("#transformUpdateXMLToData", () => {
    const payload = fs.readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", {encoding: "utf8"});
    const data = {
      "name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "sys_id": "50ba882f07d610108110f2ae7c1ed00d",
      "action": "INSERT_OR_UPDATE",
      "sys_created_by": "admin",
      "sys_created_on": "1970-01-01 00:00:01",
      "sys_updated_by": "admin",
      "sys_updated_on": "1970-01-01 00:00:01",
      "type": "Script Include",
      "target_name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "update_set": "1234",
      "payload": payload
    };

    const transformed = RESTHelper.transformUpdateXMLToData(data);

    expect(transformed.targetTable).toBe("sys_script_include");
    expect(transformed.targetId).toBe("50ba882f07d610108110f2ae7c1ed00d");
  });
});