const NowUpdate = require("../src/NowUpdateXML.js");

describe("NowUpdateXML", () => {
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
  })
});