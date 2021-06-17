/* eslint-disable */
try {
  require("dotenv").config();
} catch (e) {}
const fs = require("fs");
const os = require("os");

const prompt = require("prompt");
const colors = require("colors/safe");

const NowProfile = require("../src/NowProfile");
const NowLinter = require("../src/NowLinter");

const profileHome = `${os.homedir()}/.now-eslint-profiles`;

prompt.message = "";
prompt.delimiter = "";

const schema = {
  properties: {
    profile: {
      description: colors.yellow("Enter the name of the profile to use"),
      required: true,
      message: colors.red("Given profile does not exists"),
      conform: (value) => {
        return fs.existsSync(`${profileHome}/profile_${value}/profile.json`);
      }
    },
    title: {
      description: colors.yellow("Enter the name of your report:"),
      required: true
    },
    filename: {
      description: colors.yellow("Enter the file name of your report (without an extension):"),
      pattern: /^[a-zA-Z0-9\-_]+$/,
      message: colors.red("File name must contain only lower case letters, numbers and dash (-) or underscore (_)"),
      required: true
    },
    query: {
      description: colors.yellow("Enter the query of the report:"),
      required: true
    }
  }
};

prompt.start();

prompt.get(schema, (err, result) => {
  if (err) {
    return;
  }

  const data = fs.readFileSync(`${profileHome}/profile_${result.profile}/profile.json`, "utf8");
  const profile = new NowProfile(JSON.parse(data));
  
  const options = {};
  options.query = result.query;
  options.title = result.title;

  const linter = new NowLinter(profile, options);
  (async function() {
    console.log(colors.green(`Fetching data from the instance`));
    await linter.fetch();

    console.log(colors.green(`Linting fetched data`));
    await linter.lint();
    
    console.log(colors.green(`Generating report '${result.filename}'`));
    const setup = require("../resources/pdfsetup");
    
    console.log(colors.green(`Saving report '${result.filename}.pdf'`));
    linter.report(`${process.cwd()}/${result.filename}.pdf`, setup)
  })();
});