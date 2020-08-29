
const ejs = require("ejs");

class NowReportGenerator {
  constructor(report) {
    this._report = report;
  }

  toHTMLReport(template) {
    return ejs.render(template, this._report);
  }
}

module.exports = NowReportGenerator;