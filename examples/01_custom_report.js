/* eslint-disable no-unused-vars */
// Deconstruct necessary objects
const {Profile, Linter} = require("../index.js");
const {AbstractReportGenerator} = require("../modules/generator/index.js");
// const {Profile, Linter} = require("@hrax/now-eslint");
// const {AbstractReportGenerator} = require("@hrax/now-eslint/generator");

// Dependencies for the custom generator
// eslint-disable-next-line 
const fs = require("fs");
const path = require("path");

class MyCustomReportGenerator extends AbstractReportGenerator {
  build(data) {
    // you can build your report here
    return null;
  }

  extension() {
    // report file extension
    return "docx";
  }

  save(folder, fileName, data) {
    const report = this.build(data);

    // write report to file system
    fs.writeFileSync(path.resolve(`${folder}/${fileName}.${this.extension()}`), report);
  }
}

/*
 * Configure profile object or load it from JSON using Profile.load
 * Other optional properties for profile data json:
 * - proxy; proxy connection string, should be in format http[s]://[username:password@]proxy.domain[:port]
 * - version; used internally to prevent old serialzed profiles to be initialized against incorrect (older/newer) version
 * - tables; list of configured tables with fields that should be scanned; see NowInstance#requestTableFieldData or NowInstance#requestTableAndParentFieldData
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
  title: "Sample Report",
  query: "name=Sample Update Set"
};

// Must, until the top-level awaits is enabled
(async() => {
  // Create necessary object instances
  const profile = new Profile(data);
  // If tables are not set in JSON data, we can set them later by using
  profile.tables = tables;

  // Set the tables inline or load them via await profile.loadInstanceTables()
  const linter = new Linter(profile, config);

  // Fetch configured changes and perform lint; each execution will clear previously linted changes
  await linter.process();
  
  // Generate PDF report
  linter.report(process.cwd(), "sample_report", new MyCustomReportGenerator());
})();