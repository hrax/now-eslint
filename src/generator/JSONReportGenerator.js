/* eslint-disable no-magic-numbers */
const fs = require("fs");

const AbstractReportGenerator = require("./AbstractReportGenerator");

class JSONReportGenerator extends AbstractReportGenerator {
  constructor() {
    super();
  }

  build(data) {
    const padding = 2;
    return JSON.stringify(data, null, padding);
  }

  save(path, data) {
    const document = this.build(data);
    fs.writeFileSync(path, document);
  }
}

module.exports = JSONReportGenerator;