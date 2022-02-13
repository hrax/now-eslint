const fs = require("fs");
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

  save(path, data) {
    Assert.notEmpty(path, "Path for the save method needs to be provided!");
    const document = this.build(data);
    fs.writeFileSync(path, document);
  }
}

module.exports = JSONReportGenerator;