import { readFileSync } from "fs";
import { parsePayloadTableFieldValue, parsePayloadTableName } from "../../src/util/xmlhelpers.js";
import { DOMParser } from "@xmldom/xmldom";

describe("xmlhelpersSpec", () => {
  const payload = readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", "utf-8");
  const document = new DOMParser().parseFromString(payload);
  it("should return table name from payload", () => {
    const tableName = parsePayloadTableName(document);
    expect(tableName).toBe("sys_script_include");
  });

  it("should return field value from payload", () => {
    const sysID = parsePayloadTableFieldValue("sys_script_include", "sys_id", document);
    expect(sysID).toBe("50ba882f07d610108110f2ae7c1ed00d");
  });
});