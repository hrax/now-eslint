const NowUpdate = require("../src/NowUpdateXML.js");

describe("NowUpdateXML", () => {
  it("throws error on incorrect data config.", () => {
    expect(() => new NowUpdate.NowUpdateXML(null)).toThrow(new Error("Data must not be null."));
    expect(() => new NowUpdate.NowUpdateXML(15)).toThrow(new Error("Data must be an Object."));
    expect(() => new NowUpdate.NowUpdateXML({})).toThrowError(/Data object must contain all of the following properties/);
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
    }

    const updateXML = new NowUpdate.NowUpdateXML(data, true);
    expect(updateXML.isInitialized).toBe(false);
  });

  it("do not initialize on non-insert-update action", () => {
    const data = {
      "name": "",
      "sys_id": "",
      "action": NowUpdate.NowUpdateXMLAction.DELETE,
      "sys_created_by": "",
      "sys_created_on": "",
      "sys_updated_by": "",
      "sys_updated_on": "",
      "type": "",
      "target_name": "",
      "update_set": "",
      "payload": ""
    }

    const updateXML = new NowUpdate.NowUpdateXML(data, false);
    expect(updateXML.isInitialized).toBe(true);
    expect(updateXML.payload).not.toBeDefined();
    expect(updateXML.status).toBe(NowUpdate.NowUpdateXMLStatus.IGNORE);
  });

  xit("properly parses generic XML payload from the JSON", () => {

  });

  xit("sets field report", () => {

  });

  xdescribe("Non-standard XML payload parsing", () => {
    /*
      Some of the payload XML is non-standard, such as published workflows, 
      that contains workflow activities with possible scripts
     */
  });
});