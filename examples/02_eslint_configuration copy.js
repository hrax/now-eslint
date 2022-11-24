// Deconstruct necessary objects
const {Profile, Linter} = require("../index.js");
const {PDFReportGenerator} = require("../modules/generator/index.js");
// const {Profile, Linter} = require("@hrax/now-eslint");
// const {PDFReportGenerator} = require("@hrax/now-eslint/generator");

/*
 * Configure profile object or load it from JSON using Profile.loadProfile
 * Other optional properties for profile data json:
 * - proxy; proxy connection string, should be in format http[s]://[username:password@]proxy.domain[:port]
 * - tables; list of configured tables with fields that should be scanned; see NowInstance#requestTableFieldData or NowInstance#requestTableAndParentFieldData
 * - eslint;
 */
const data = {
  // Profile must have a name!
  name: "script",
  // Can use any address available, including vanity/custom URLs
  domain: "https://exampleinstance.service-now.com",
  // Self explanatory
  username: "",
  password: ""
};

// Tables to be linted, in format "table_name": {fields: [field1, field2]}
const tables = {
  "sys_script_include": {fields: ["script"]}
};

// Configuration of the linter
const config = {
  query: "Sample Report",
  title: "name=Sample Update Set"
};

// Must, until the top-level awaits is enabled
(async() => {
  // Create necessary object instances
  const profile = new Profile(data);
  // Set the tables inline or load them via await profile.loadInstanceTables()
  profile.tables = tables;

  // Configure ESLint 
  // See https://eslint.org/docs/developer-guide/nodejs-api#eslint-class for available options for profile.eslint property
  // You can additionally have eslint configuration file in the folder where you execute the command or user root folder
  profile.eslint = {
    "overrideConfig": null,
    "overrideConfigFile": null
  };

  // Create Linter instance with profile and config; instance is stateful 
  const linter = new Linter(profile, config);
  
  // Fetch configured changes and perform lint; each execution will clear previously linted changes
  await linter.process();
  
  // Generate PDF report
  linter.report(process.cwd(), "sample_report", new PDFReportGenerator());
})();