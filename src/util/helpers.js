const xpath = require("xpath");
const dom = require("xmldom").DOMParser;

class RESTHelper {
  static transformUpdateXMLToData(record) {
    // type,target_name,update_set,payload
    const toReturn = {
      name: record.name || null,
      sysId: record.sys_id || null,
      action: record.action || null,
      type: record.type || null,
      targetName: record.target_name || null,
      updateSet: record.update_set || null,
      payload: record.payload || null,

      createdBy: record.sys_created_by || null,
      createdOn: record.sys_created_on || null,
      updatedBy: record.sys_updated_by || null,
      updatedOn: record.sys_updated_on || null
    };

    if (toReturn.payload != null) {
      const doc = new dom().parseFromString(toReturn.payload);
      const tableElm = xpath.select1("//*/*[1]", doc);
      const idElm = xpath.select1("./sys_id/text()", tableElm);

      toReturn.targetTable = tableElm ? tableElm.localName : null;
      toReturn.targetId = idElm ? idElm.nodeValue : null;
    }

    return toReturn;
  }
}

class XPathHelper {
  static parseFieldValue(table, field, payload) {
    const doc = new dom().parseFromString(payload);
    const data = xpath.select1(`//record_update/${table}/${field}/text()`, doc);
    if (data == null) {
      return null;
    }
    return data.nodeValue;
  }
}

module.exports = {
  RESTHelper,
  XPathHelper
};