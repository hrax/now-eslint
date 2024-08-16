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
const helpers = require("./helpers.js");

// Load local libraries
const Profile = require("../linter/Profile.js");
const Linter = require("../linter/Linter.js");
const PDFReportGenerator = require("../generator/PDFReportGenerator.js");
// const DocxReportGenerator = require("../generator/DocxReportGenerator.js");

// Configure global constants
const PROFILE_HOME = Profile.profilesHomeDirPath();

// Setup prompt
prompt.message = "";
prompt.delimiter = "";

const debugWorkingDir = () => {
  helpers.outputKeyValue("Working profiles home directory", `${PROFILE_HOME}`, true);
};

const report = program.name("now-eslint report")
  .description("CLI to generate update set report from ServiceNow instance")
  .configureOutput({outputError: helpers.outputError})
  .argument("<profileName>", `name of the profile; ${helpers.PROFILE_HELP}`, helpers.validateProfileName)
  .option("-t, --title <name>", "title of the report (in quotes if multiword)")
  .option("-f, --file-name <name>", "file name of the report without an extension", helpers.validateFileName)
  .option("-q, --query <query>", "update set query to perform report on (in quotes if multiword)")
  // .option("--json", "generate report as JSON rather than PDF report")
  // .option("--with-json", "generate JSON for the PDF report; ignored if option --json is used")
  // .option("--from-json <jsonPath>", "generate PDF report from provided JSON file; ignores all options")
  .showHelpAfterError()
  .addHelpText("after", `
  
  Example call:
  now-eslint report <profileName>
  now-eslint report <profileName> -t "My title" -q "name=My Update Set" -f report`);

report.action(async(name, options) => {
  debugWorkingDir();

  if (!Profile.exists(name)) {
    program.error(`Profile with name '${name}' does not exists`, {exitCode: 1});
  }

  const schema = {
    properties: {
      title: {
        description: colors.yellow("Enter the name of your report:"),
        required: true,
        default: options.title,
        ask: () => {
          return options.title == null;
        }
      },
      fileName: {
        description: colors.yellow("Enter the file name of your report (without an extension):"),
        pattern: /^[a-zA-Z0-9\-_]+$/,
        message: colors.red("File name must contain only lower case letters, numbers and dash (-) or underscore (_)"),
        default: options.fileName,
        ask: () => {
          return options.fileName == null;
        }
      },
      query: {
        description: colors.yellow("Enter the query of the report:"),
        required: true,
        default: options.query,
        ask: () => {
          return options.query == null;
        }
      }
    }
  };

  prompt.start();

  prompt.get(schema, async function(err, result) {
    if (err) {
      program.error(err);
    }

    const fileName = options.fileName || result.fileName;
    const profile = Profile.load(name);
    const data = {
      title: result.title,
      query: result.query
    };

    const linter = new Linter(profile, data);
    const generator = new PDFReportGenerator();
    // const generator = new DocxReportGenerator();
    
    helpers.outputInfo("Fetching data from the instance");
    await linter.fetch();

    helpers.outputInfo("Linting fetched data");
    await linter.lint();
    
    helpers.outputInfo(`Generating report '${fileName}.${generator.extension()}'`);
    linter.report(process.cwd(), fileName, generator);

    helpers.outputInfo(`Saved report '${fileName}.${generator.extension()}'`);
  });
});
  
program.parseAsync(process.argv);