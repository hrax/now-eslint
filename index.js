
const NowUpdateXML = require("./src/NowUpdateXML");

module.exports = {
  "NowRequest": require("./src/NowRequest"),
  "NowInstance": require("./src/NowInstance"),
  "NowUpdateXMLAction": NowUpdateXML.NowUpdateXMLAction,
  "NowUpdateXMLStatus": NowUpdateXML.NowUpdateXMLStatus,
  "NowUpdateXML": NowUpdateXML.NowUpdateXML,
  "NowLinter": require("./src/NowLinter"),
  "NowReportGenerator": require("./src/NowReportGenerator")
};