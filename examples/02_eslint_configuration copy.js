/* eslint-disable */
// Deconstruct necessary objects
const {Profile, NowLinter} = require("../index");
// const {Profile, NowLinter} = require("@hrax/now-eslint");

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
  query: "",
  title: ""
};

// Must, until the top-level awaits is enabled
(async () => {
  // Create necessary object instances
  const profile = new Profile(data);
  // If tables are not set in JSON data, we can set them later by using
  profile.tables = tables;

  // Configure ESLint
  // See https://eslint.org/docs/developer-guide/nodejs-api#eslint-class for available options for eslint property
  profile.eslint = {
    "overrideConfig": null,
    "overrideConfigFile": null,
  };

  // Create NowLinter instance with profile and config; instance is stateful 
  const linter = new NowLinter(profile, config);
  
  // Fetch configured changes and perform lint; each execution will clear previously linted changes
  await linter.process();
  
  // Generate PDF report
  linter.report(`${process.cwd()}/myreport.pdf`);
})();