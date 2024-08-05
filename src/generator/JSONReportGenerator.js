// eslint-disable-next-line id-length
const fs = require("fs");
const path = require("path");

const Assert = require("../util/Assert.js");
const AbstractReportGenerator = require("./AbstractReportGenerator.js");

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

  save(folder, fileName, data) {
    Assert.notEmpty(folder, "Path for report needs to be provided");
    Assert.notEmpty(fileName, "File name for the report needs to be provided");
    Assert.notNull(data, "Report data need to be provided");
    
    const document = this.build(data);
    fs.writeFileSync(path.resolve(`${folder}/${fileName}.${this.extension()}`), document);
  }
}

module.exports = JSONReportGenerator;