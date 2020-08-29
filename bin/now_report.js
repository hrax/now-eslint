/* eslint-disable */

const fs = require("fs");

const prompt = require("prompt");
const colors = require("colors/safe");

try {
  require("dotenv").config();
} catch (e) {
  console.log(e);
}

const NowLinter = require("../src/NowLinter");
const NowReportGenerator = require("../src/NowReportGenerator");

// Check if current folder is initialized... fs works against cwd
const INITIALIZED = fs.existsSync("./.ENV") && fs.existsSync("./config.json") && fs.existsSync("./tables.json");
if (!INITIALIZED) {
  console.log(colors.red(`Folder "${process.cwd()}" is not initialized. Run "now-eslint setup" first.`));
  process.exit();
  return;
}

console.log(colors.yellow(`Reporting against instance ${process.env.SNOW_DOMAIN}\n`));

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

// TODO: check that the setup has been configured

prompt.start();

prompt.get(schema, (err, result) => {
  if (err) {
    return;
  }
  console.log("");
  
  const instance = {
    domain: process.env.SNOW_DOMAIN,
    username: process.env.SNOW_USERNAME,
    password: process.env.SNOW_PASSWORD
  };
  const config = require(process.cwd() + "/config.json") || {};
  const tables = require(process.cwd() + "/tables.json") || {};

  console.log(instance);
  return;

  config.query = result.query;
  config.title = result.title;

  const linter = new NowLinter(instance, config, tables);
  (async function() {
    const report = await linter.report();
    const generator = new NowReportGenerator(report)

    // always override
    // read template file
    const template = fs.readFileSync("./template.html");

    const html = generator.toHTML(template);

    // save
    fs.writeFileSync(`./${result.filename}.html`, html);

  })();
});