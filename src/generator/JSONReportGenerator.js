const fs = require("fs");
const npath = require("path");
const Assert = require("../util/Assert");

const AbstractReportGenerator = require("./AbstractReportGenerator");

class JSONReportGenerator extends AbstractReportGenerator {
  constructor() {
    super();

    this.padding = 2;
  }

  build(data) {
    Assert.notNull(data, "Data for the build method needs to be provided!");
    return JSON.stringify(data, null, this.padding);
  }

  extension() {
    return "json";
  }

  save(path, fileName, data) {
    Assert.notEmpty(path, "Path for the save method needs to be provided!");
    const document = this.build(data);
    fs.writeFileSync(npath.resolve(`${path}/${fileName}.${this.extension()}`), document);
  }
}

module.exports = JSONReportGenerator;