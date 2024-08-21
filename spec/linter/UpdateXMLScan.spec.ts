/* eslint-disable camelcase */
import { SNUpdateXMLData } from "../../src/core/sn.js";
import { UpdateXMLScan } from "../../src/linter/UpdateXMLScan.js";

describe("NowUpdateXMLScan", () => {
  it("should return correct error/warning count for all reports", () => {
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
    
    const scan = new UpdateXMLScan(data);
    scan.reports.set("script", {
      warningCount: 1,
      errorCount: 2
    });
    scan.reports.set("condition", {
      warningCount: 1,
      errorCount: 0
    });


    expect(scan.getReportsWarningCount()).toBe(2);
    expect(scan.getReportsErrorCount()).toBe(2);
    expect(scan.hasReportsWarnings()).toBe(true);
    expect(scan.hasReportsErrors()).toBe(true);
    expect(scan.getStatus()).toBe("ERROR");
  });
});