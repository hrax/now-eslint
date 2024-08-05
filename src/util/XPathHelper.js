const xpath = require("xpath");
const {DOMParser} = require("@xmldom/xmldom");

class XPathHelper {
  /**
   * No instances
   */
  constructor() {
    throw new Error("Static class, no instances!");
  }

  static parseFieldValue(table, field, payload) {
    const doc = new DOMParser().parseFromString(payload);
    const data = xpath.select1(`//record_update/${table}/${field}/text()`, doc);
    if (data == null) {
      return null;
    }
    return data.nodeValue;
  }
}

module.exports = XPathHelper;