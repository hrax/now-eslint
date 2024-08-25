/* eslint-disable camelcase, no-magic-numbers */
import { ESLint } from "eslint";
import { SNUpdateXMLData } from "../../src/core/sn.js";
import { UpdateXMLScan } from "../../src/linter/UpdateXMLScan.js";

describe("UpdateXMLScan", () => {
  const data: SNUpdateXMLData = {
    name: "name",
    sys_id: "sysId",
    action: "INSERT_OR_UPDATE",
    type: "sysId",
    target_name: "sysId",
    update_set: "sysId",
    payload: "sysId",
    sys_created_by: "sysId",
    sys_created_on: "sysId",
    sys_updated_by: "sysId",
    sys_updated_on: "sysId",
    application: "global",
    payloadHash: -1234,
    sys_mod_count: 0
  };

  it("should return correct error count and status for all reports", () => {
    const scan = new UpdateXMLScan(data);
    scan.setReport("script", {
      warningCount: 1,
      errorCount: 2
    } as ESLint.LintResult);
    scan.setReport("condition", {
      warningCount: 1,
      errorCount: 0
    } as ESLint.LintResult);

    expect(scan.getReportsErrorCount()).toBe(2);
    expect(scan.hasReportsErrors()).toBe(true);
    expect(scan.getStatus()).toBe("ERROR");
  });
  
  it("should return correct warning count and status for all reports", () => {
    const scan = new UpdateXMLScan(data);
    scan.setReport("script", {
      warningCount: 1,
      errorCount: 0
    } as ESLint.LintResult);
    scan.setReport("condition", {
      warningCount: 3,
      errorCount: 0
    } as ESLint.LintResult);

    expect(scan.getReportsWarningCount()).toBe(4);
    expect(scan.hasReportsWarnings()).toBe(true);
    expect(scan.getStatus()).toBe("WARNING");
  });
});