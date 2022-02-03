/* eslint-disable no-console */
// Initialize dotenv
try {
  require("dotenv").config();
// eslint-disable-next-line no-empty
} catch (e) {}

// Load commander
const commander = require("commander");
const program = new commander.Command();

// Load prompt & safe colors
const colors = require("colors/safe");
const prompt = require("prompt");

// Load local libraries
const NowProfile = require("../src/NowProfile");
const NowLinter = require("../src/NowLinter");

// Configure global constants
const PROFILE_HOME = NowProfile.profilesHomeDirPath();

// Setup prompt
prompt.message = "";
prompt.delimiter = "";

program.name("now-eslint report")
  .description("CLI to generate update set report from ServiceNow instance")
  .configureOutput({outputError: (str, write) => write(colors.red(str))})
  .argument("<profileName>")
  .option("-t, --title", "title of the report (in quotes for multiword titles)")
  .option("-f, --file-name", "file name of the report without extension; if not provided one will be generated from title")
  .option("-q, --query", "update set query to perform report on")
  // .option("--json", "generate report as JSON rather than PDF report")
  // .option("--with-json", "generate JSON for the PDF report; ignored if option --json is used")
  .action(async(profileName, options) => {
    const schema = {
      properties: {
        profile: {
          description: colors.yellow("Enter the name of the profile to use"),
          required: true,
          message: colors.red("Given profile does not exists"),
          conform: (value) => {
            return fs.existsSync(`${PROFILE_HOME}/profile_${value}/profile.json`);
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
          // .replace(/([^a-z0-9_-])/gi, "_").replace(/_{2,}/gi, "_").replace(/^_|_$/gi, "");
        },
        query: {
          description: colors.yellow("Enter the query of the report:"),
          required: true
        }
      }
    };
  });

return;


prompt.start();

prompt.get(schema, (err, result) => {
  if (err) {
    return;
  }

  const data = fs.readFileSync(`${PROFILE_HOME}/profile_${result.profile}/profile.json`, "utf8");
  const profile = new NowProfile(JSON.parse(data));
  
  const options = {};
  options.query = result.query;
  options.title = result.title;

  /*
  TODO:
  - If eslint config loads plugins from special directory, show warning
  - If eslint config overrides config file, show warning
   */

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