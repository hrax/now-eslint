module.exports = {
  NOW: require("./src/now/now"),
  AbstractReportGenerator: require("./src/generator/AbstractReportGenerator"),
  PDFReportGenerator: require("./src/generator/PDFReportGenerator"),
  JSONReportGenerator: require("./src/generator/JSONReportGenerator"),
  Profile: require("./src/Profile"),
  NowLinter: require("./src/NowLinter"),
  UpdateXMLScan: require("./src/UpdateXMLScan")
};