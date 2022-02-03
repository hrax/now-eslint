/* eslint-disable no-console */
try {
  require("dotenv").config();
// eslint-disable-next-line no-empty
} catch (e) {}

// Load commander
const commander = require("commander");
const program = new commander.Command();

const colors = require("colors/safe");
const prompt = require("prompt");

const NowProfile = require("../src/NowProfile");

const PROFILE_HOME = NowProfile.profilesHomeDirPath();

prompt.message = "";
prompt.delimiter = "";

const validateProfileName = (value) => {
  const matches = /^[a-zA-Z0-9_\-]+$/.test(value);
  if (!matches) {
    throw new commander.InvalidArgumentError("'name' can only contain lowecase/uppercase letters, numbers, underscore and dash.");
  }
  return value;
};

program.name("now-eslint profile")
  .description("CLI to create and update now-eslint profiles")
  .configureOutput({outputError: (str, write) => write(colors.red(str))});

program.command("create", {isDefault: true})
  .description("create new profile for the ServiceNow instance (default)")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", validateProfileName)
  .option("-f, --force", "force override if profile with the name exists")
  .action(async function(name, options) {
    const schema = {
      properties: {
        domain: {
          description: colors.yellow("Enter the URL to the service now instance"),
          pattern: /^https:\/\/.*?\/?$/,
          message: colors.red("Instance URL must start with 'https://' and should end with '/'"),
          required: true
        },
        username: {
          description: colors.yellow("Enter username"),
          required: true
        },
        password: {
          description: colors.yellow("Enter password"),
          required: true,
          hidden: true,
          replace: "*"
        },
        useProxy: {
          description: colors.yellow("Use proxy to connect to the instance?"),
          type: "boolean",
          default: false
        },
        proxy: {
          description: colors.yellow("Proxy connection string (http://username:password@domain:port)"),
          required: true,
          ask: () => {
            return prompt.history("useProxy").value === true;
          }
        }
      }
    };
    
    prompt.start();

    prompt.get(schema, (err, result) => {
      if (err) {
        program.error(err, {exitCode: 1});
        return;
      }
      console.log(colors.green(`Will initialize profile in your homefolder on path '${PROFILE_HOME}'`) + "\n");

      console.log(colors.green("Setup completed"));
    });
  });

program.command("update")
  .description("update existing profile of the ServiceNow instance")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", validateProfileName)
  .option("-f, --force", "force update")
  .action(async function(options) {
    console.log(colors.red("TODO: update"));
  });

program.command("delete")
  .description("delete existing profile of the ServiceNow instance")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", validateProfileName)
  .option("-f, --force", "force delete")
  .action(async function(options) {
    console.log(colors.red("TODO: delete"));
  });

program.command("cleanup")
  .description("cleanup profile home directory of all existing profiles")
  .option("-f, --force", "force cleanup")
  .action(async function(options) {
    console.log(colors.red("TODO: cleanup"));
  });

program.parseAsync(process.argv);