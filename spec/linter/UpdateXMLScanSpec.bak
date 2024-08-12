const UpdateXMLScan = require("../../modules/linter/UpdateXMLScan.js");

describe("NowUpdateXMLScan", () => {
  it("returns correct count for errors and warnings", () => {
    const data = {
      name: "name",
      sysId: "sysId",
      action: "INSERT_OR_UPDATE",
      type: "sysId",
      targetName: "sysId",
      updateSet: "sysId",
      payload: "sysId",
      createdBy: "sysId",
      createdOn: "sysId",
      updatedBy: "sysId",
      updatedOn: "sysId"
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


    expect(scan.warningCount).toBe(2);
    expect(scan.errorCount).toBe(2);
    expect(scan.hasWarning).toBeTrue();
    expect(scan.hasError).toBeTrue();
    expect(scan.status).toBe(UpdateXMLScan.STATUS.ERROR);
  });
});