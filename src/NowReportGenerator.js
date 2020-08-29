
const ejs = require("ejs");

class NowReportGenerator {
  constructor(report) {
    this._report = report;
  }

  toHTML(template) {
    return ejs.render(template, this._report);
  }
}

module.exports = NowReportGenerator;