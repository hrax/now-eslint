
const update = require("./src/NowUpdateXML");
const loader = require("./src/NowLoader");
const linter = require("./src/NowLinter");
const generator = require("./src/NowReportGenerator");

module.exports = {
  "NowUpdateXMLAction": update.NowUpdateXMLAction,
  "NowUpdateXMLStatus": update.NowUpdateXMLStatus,
  "NowUpdateXML": update.NowUpdateXML,
  "NowLoader": loader,
  "NowLinter": linter,
  "NowReportGenerator": generator
};