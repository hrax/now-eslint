const {NowUpdateXML, NowUpdateXMLAction, NowUpdateXMLStatus} = require("../src/NowUpdateXML.js");
const fs = require("fs");

describe("NowUpdateXML", () => {
  it("throws error on incorrect data config.", () => {
    expect(() => new NowUpdateXML(null)).toThrow(new Error("Data must not be null."));
    expect(() => new NowUpdateXML(15)).toThrow(new Error("Data must be an Object."));
    expect(() => new NowUpdateXML({})).toThrowError(/Data object must contain all of the following properties/);
  });

  it("dryRun object with basic configuration", () => {
    const data = {
      "name": "",
      "sys_id": "",
      "action": "",
      "sys_created_by": "",
      "sys_created_on": "",
      "sys_updated_by": "",
      "sys_updated_on": "",
      "type": "",
      "target_name": "",
      "update_set": "",
      "payload": ""
    };

    const updateXML = new NowUpdateXML(data, true);

    expect(updateXML.isInitialized).toBe(false);
    expect(updateXML.status).toBe(NowUpdateXMLStatus.IGNORE);
  });

  it("do not initialize on non-insert-update action", () => {
    const data = {
      "name": "",
      "sys_id": "",
      "action": NowUpdateXMLAction.DELETE,
      "sys_created_by": "",
      "sys_created_on": "",
      "sys_updated_by": "",
      "sys_updated_on": "",
      "type": "",
      "target_name": "",
      "update_set": "",
      "payload": ""
    };

    const updateXML = new NowUpdateXML(data, false);

    expect(updateXML.isInitialized).toBe(true);
    expect(updateXML.payload).not.toBeDefined();
    expect(updateXML.status).toBe(NowUpdateXMLStatus.IGNORE);
  });

  // Must be a XML with root element "record_update" and attribute table containing table name with child element having the same value
  it("properly parses generic XML payload from the JSON", () => {
    // Path expects the test to be executed from project root via npm test
    const payload = fs.readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", {encoding: "utf8"});
    const data = {
      "name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "sys_id": "43ca802f07d610108110f2ae7c1ed05a",
      "action": NowUpdateXMLAction.INSERT_OR_UPDATE,
      "sys_created_by": "admin",
      "sys_created_on": "1970-01-01 00:00:01",
      "sys_updated_by": "admin",
      "sys_updated_on": "1970-01-01 00:00:01",
      "type": "Script Include",
      "target_name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "update_set": "1234",
      "payload": payload
    };

    const updateXML = new NowUpdateXML(data, false);

    expect(updateXML.payload).toBeDefined();
    expect(updateXML.payload["script"]).toBeDefined();
    expect(updateXML.payload["script"]._cdata).toBeDefined();
    expect(updateXML.payload["script"]._cdata).toMatch("TestGlass");
    expect(updateXML.status).toBe(NowUpdateXMLStatus.SCAN);
  });

  it("sets field report", () => {
    const data = {
      "name": "",
      "sys_id": "",
      "action": NowUpdateXMLAction.INSERT_OR_UPDATE,
      "sys_created_by": "",
      "sys_created_on": "",
      "sys_updated_by": "",
      "sys_updated_on": "",
      "type": "",
      "target_name": "",
      "update_set": "",
      "payload": ""
    };

    const report = {
      "warningCount": 1,
      "errorCount": 2
    };

    const updateXML = new NowUpdateXML(data, true);
    updateXML.setReport("field", report);

    expect(updateXML.hasReports).toBe(true);
    expect(updateXML.reports).toEqual([report]);
    expect(updateXML.reportFields).toEqual(["field"]);
    expect(updateXML.warningCount).toBe(1);
    expect(updateXML.errorCount).toBe(2);
  });

  it("serializes to JSON", () => {
    // Path expects the test to be executed from project root via npm test
    const payload = fs.readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", {encoding: "utf8"});
    const data = {
      "name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "sys_id": "43ca802f07d610108110f2ae7c1ed05a",
      "action": NowUpdateXMLAction.INSERT_OR_UPDATE,
      "sys_created_by": "admin",
      "sys_created_on": "1970-01-01 00:00:01",
      "sys_updated_by": "admin",
      "sys_updated_on": "1970-01-01 00:00:01",
      "type": "Script Include",
      "target_name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "update_set": "1234",
      "payload": payload
    };

    const updateXML = new NowUpdateXML(data, false);
    const json = updateXML.toJSON();

    expect(json.name).toBe(data.name);
    expect(json.sys_id).toBe(data.sys_id);
    expect(json.action).toBe(data.action);
    expect(json.sys_created_by).toBe(data.sys_created_by);
    expect(json.sys_created_on).toBe(data.sys_created_on);
    expect(json.sys_updated_by).toBe(data.sys_updated_by);
    expect(json.sys_updated_on).toBe(data.sys_updated_on);
    expect(json.type).toBe(data.type);
    expect(json.target_name).toBe(data.target_name);
    expect(json.update_set).toBe(data.update_set);
    expect(json.payload).toBe(data.payload);
    expect(json.status).toBe(NowUpdateXMLStatus.SCAN);
  });

  it("will restore instance from JSON", () => {
    // Path expects the test to be executed from project root via npm test
    const payload = fs.readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", {encoding: "utf8"});
    const data = {
      "name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "sys_id": "43ca802f07d610108110f2ae7c1ed05a",
      "action": NowUpdateXMLAction.INSERT_OR_UPDATE,
      "sys_created_by": "admin",
      "sys_created_on": "1970-01-01 00:00:01",
      "sys_updated_by": "admin",
      "sys_updated_on": "1970-01-01 00:00:01",
      "type": "Script Include",
      "target_name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "update_set": "1234",
      "payload": payload
    };

    const updateXML = new NowUpdateXML(data, false);
    updateXML.setSkippedReport();
    const json = updateXML.toJSON();

    const fromJSON = NowUpdateXML.fromJSON(json, false);

    expect(updateXML.status).toBe(NowUpdateXMLStatus.SKIPPED);
    expect(fromJSON.status).toBe(updateXML.status);
    expect(fromJSON.table).toBe(updateXML.table);
  });

  xdescribe("Non-standard XML payload parsing", () => {
    /*
      Some of the payload XML is non-standard, such as published workflows,
      that contains workflow activities with possible scripts
     */
  });
});