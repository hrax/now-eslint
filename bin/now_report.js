/* eslint-disable */
try {
  require("dotenv").config();
} catch (e) {}
const fs = require("fs");

const prompt = require("prompt");
const colors = require("colors/safe");

const NowProfile = require("../src/NowProfile");
const NowLinter = require("../src/NowLinter");

// // Check if current folder is initialized... fs works against cwd
// const INITIALIZED = fs.existsSync("./.ENV") && fs.existsSync("./config.json") && fs.existsSync("./tables.json") && fs.existsSync("./template.ejs");
// if (!INITIALIZED) {
//   console.log(colors.red(`Folder '${process.cwd()}' is not initialized. Run "now-eslint setup" first.`));
//   return;
// }

// TODO: check that the setup has been configured
/*
Current folder needs to have following files:
- profile.json (profile setup + tables to scan + TODO: eslint additional properties)
- pdfsetup.js (es6 module with PDF generator basic configuration and content)
- test custom generator class
- test fonts!
*/

let data = null;
try {
  data = require(`${process.cwd()}/profile.json`);
} catch (e) {
  console.log(colors.red(`Unable to load profile data from  '${process.cwd()}/profile.json'. Error: ${e.message || e}`));
  return; 
}
const profile = new NowProfile(data);

prompt.message = "";
prompt.delimiter = "";

const schema = {
  properties: {
    title: {
      description: "Enter the name of your report:",
      required: true
    },
    filename: {
      description: "Enter the file name of your report (without an extension):",
      pattern: /^[a-zA-Z0-9\-_]+$/,
      message: "File name must contain only lower case letters, numbers and dash (-) or underscore (_)",
      required: true
    },
    query: {
      description: "Enter the query of the report:",
      required: true
    }
  }
};

prompt.start();

prompt.get(schema, (err, result) => {
  if (err) {
    return;
  }
  
  const options = {};
  options.query = result.query;
  options.title = result.title;

  const linter = new NowLinter(profile, options);
  (async function() {
    console.log(colors.yellow(`Fetching data from the instance`));
    await linter.fetch();

    console.log(colors.yellow(`Linting fetched data`));
    await linter.lint();
    
    console.log(colors.yellow(`Generating report '${options.title}'`));
    const setup = require("../resources/pdfsetup");
    console.log(colors.yellow(`Saving report '${result.filename}.pdf'`));
    linter.report(`${process.cwd()}/${result.filename}.pdf`, setup)
  })();
});