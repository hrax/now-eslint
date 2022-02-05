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
const Profile = require("../src/Profile");
const NowLinter = require("../src/NowLinter");

// Configure global constants
const PROFILE_HOME = Profile.profilesHomeDirPath();

// Setup prompt
prompt.message = "";
prompt.delimiter = "";

/**
 * Validates if value matches profile name pattern
 * @param {String} value 
 * @returns value if value matches profile name pattern
 * @throws commander.InvalidArgumentError if value does not match
 */
const validateProfileName = (value) => {
  if (Profile.isProfileNameValid(value)) {
    return value;
  }
  throw new commander.InvalidArgumentError("'name' can only contain lowecase/uppercase letters, numbers, underscore and dash.");
};

const validateFileName = (value) => {
  if (Profile.isProfileNameValid(value)) {
    return value;
  }
  throw new commander.InvalidArgumentError("'file-name' can only contain lowecase/uppercase letters, numbers, underscore and dash.");
};

const debugWorkingDir = () => {
  console.debug("Working profiles home directory: " + colors.green(`'${PROFILE_HOME}'\n`));
};

program.name("now-eslint report")
  .description("CLI to generate update set report from ServiceNow instance")
  .configureOutput({outputError: (str, write) => write(colors.red(str))})
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", validateProfileName)
  .option("-t, --title <name>", "title of the report (in quotes for multiword titles)")
  .option("-f, --file-name <name>", "file name of the report without an extension", validateFileName)
  .option("-q, --query <query>", "update set query to perform report on")
  // .option("--json", "generate report as JSON rather than PDF report")
  // .option("--with-json", "generate JSON for the PDF report; ignored if option --json is used")
  .action(async(name, options) => {
    debugWorkingDir();

    if (!Profile.exists(name)) {
      program.error(`Profile with name '${name}' does not exists`, {exitCode: 1});
    }

    const schema = {
      properties: {
        title: {
          description: colors.yellow("Enter the name of your report:"),
          required: true,
          ask: () => {
            return options.title == null;
          }
        },
        fileName: {
          description: colors.yellow("Enter the file name of your report (without an extension):"),
          pattern: /^[a-zA-Z0-9\-_]+$/,
          message: colors.red("File name must contain only lower case letters, numbers and dash (-) or underscore (_)"),
          ask: () => {
            return options.fileName == null;
          }
        },
        query: {
          description: colors.yellow("Enter the query of the report:"),
          required: true,
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
      const data = {};
      data.query = options.query || result.query;
      data.title = options.title || result.title;

      const linter = new NowLinter(profile, data);
      
      console.info(colors.green(`Fetching data from the instance`));
      await linter.fetch();

      console.info(colors.green(`Linting fetched data`));
      await linter.lint();
      
      
      console.info(colors.green(`Generating report '${fileName}.pdf'`));
      linter.report(`${process.cwd()}/${fileName}.pdf`);

      console.info(colors.green(`Saved report '${fileName}.pdf'`));
    });
  });

program.parseAsync(process.argv);