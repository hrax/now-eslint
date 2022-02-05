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

// Configure global constants
const PROFILE_HOME = Profile.profilesHomeDirPath();

// Setup prompt
prompt.message = "";
prompt.delimiter = "";

// Helper methods
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

const debugWorkingDir = () => {
  console.debug("Working profiles home directory: " + colors.green(`'${PROFILE_HOME}'\n`));
};

const output = {outputError: (str, write) => write(colors.red(str))};

// Program setup; program is never meant to be run directly only as a subcommand
program.name("now-eslint profile")
  .description("CLI to create and update now-eslint profiles")
  .configureOutput(output);

// Default subcommand to create new profile
program.command("create", {isDefault: true})
  .description("create new profile for the ServiceNow instance (default)")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", validateProfileName)
  .option("-f, --force", "force override if profile with the name exists")
  .action(async function(name, options) {
    debugWorkingDir();

    if (Profile.exists(name) && options.force !== true) {
      program.error(`Profile with name '${name}' already exists, use --force option to override`, {exitCode: 1});
    }

    const schema = {
      properties: {
        domain: {
          description: colors.yellow("Enter the URL to the service now instance"),
          pattern: /^https?:\/\/.*?\/?$/,
          message: colors.red("Instance URL must start with 'http(s)://' and should end with '/'"),
          required: true
        },
        username: {
          description: colors.yellow("Username"),
          required: true
        },
        password: {
          description: colors.yellow("Password"),
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
          description: colors.yellow("Proxy connection string e.g. http://username:password@domain:port"),
          required: true,
          ask: () => {
            return prompt.history("useProxy").value === true;
          }
        }
      }
    };
    
    prompt.start();

    prompt.get(schema, async function(err, result) {
      if (err) {
        program.error(err);
      }

      const data = {
        "name": `${name}`,
        "domain": `${result.domain}`,
        "username": `${result.username}`,
        "password": `${result.password}`,
        "proxy": result.useProxy ? `${result.proxy}` : null
      };

      const profile = new Profile(data);
      const instance = profile.createInstance();

      console.info(colors.green(`Testing connection to the instance at '${profile.domain}' using username '${profile.username}'...`));
      const message = "Unable to connect to the instance, please verify the instance url, username and password.";
      try {
        const connected = await instance.testConnection();
        if (!connected) {
          program.error(message, {exitCode: 1});
        }

        console.info(colors.green(`Succesfully connected to the instance at '${profile.domain}'.\n`));
      } catch (err) {
        output.outputError(message, console.error);
        program.error(err, {exitCode: 1});
      }

      console.info(colors.green("Generating table configuration...\n"));
      const tables = await instance.requestTableAndParentFieldData();
      // Force skip workflow version parsing; TODO: custom XML parsing setup
      tables["wf_workflow_version"] = null;
      profile.tables = tables;

      console.info(colors.green("Saving the profile...\n"));
      Profile.save(profile, options.force === true);

      console.info(colors.green("Setup completed.\n"));
    });
  });

// subcommand to debug configuration of saved profile
program.command("debug")
  .description("debug existing profile by printing out saved configuration")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", validateProfileName)
  .option("-t, --test-connection", "test connection to the instance")
  .action(async function(name, options) {
    debugWorkingDir();

    if (!Profile.exists(name)) {
      program.error(`Profile with name '${name}' does not exist.`, {exitCode: 1});
    }

    const profile = Profile.load(name);
    console.debug(colors.green(`Profile name: '${profile.name}'`));
    console.debug(colors.green(`Profile domain: '${profile.domain}'`));
    console.debug(colors.green(`Profile username: '${profile.username}'`));
    console.debug(colors.green(`Profile proxy: '${profile.proxy || "N/A"}'\n`));

    if (options.testConnection === true) {
      const instance = profile.createInstance();
      const msg = "Unable to connect to the instance.";
      try {
        const connected = await instance.testConnection();
        if (!connected) {
          output.outputError(msg + "\n", console.error);
        }

        console.debug(colors.green("Succesfully connected to the instance.\n"));
      } catch (err) {
        output.outputError(msg + "\n", console.error);
      }
    }
    
    console.debug(colors.green(`Profile has tables: ${profile.tables.size !== 0}`));
    console.debug(colors.green(`Profile has resources: ${profile.resources.size !== 0}`));
    console.debug(colors.green(`Profile has colors: ${profile.colors.size !== 0}`));
    console.debug(colors.green(`Profile has eslint config: ${profile.eslint.size !== 0}`));
  });

// subcommand to update configuration of saved profile
// program.command("update")
//   .description("update existing profile of the ServiceNow instance")
//   .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", validateProfileName)
//   .option("-f, --force", "force update")
//   .action(async function(name, options) {
//     debugWorkingDir();

//     if (!NowProfile.exists(name)) {
//       program.error(`Profile with name '${name}' does not exist.`, {exitCode: 1});
//     }

//     program.error("NOT IMPLEMENTED", {exitCode: 1});
//   });

// subcommand to purge configuration of saved profile
program.command("purge")
  .description("purge single existing ServiceNow instance profile")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", validateProfileName)
  .option("-f, --force", "force purge")
  .action(async function(name, options) {
    debugWorkingDir();

    if (!Profile.exists(name)) {
      program.error(`Profile with name '${name}' does not exist.`, {exitCode: 1});
    }

    const schema = {
      properties: {
        confirm: {
          description: colors.yellow(`Are you sure you want to purge profile named '${name}'? Type 'PURGE' in uppercase to confirm.`),
          required: true,
          ask: () => {
            return options.force !== true;
          }
        }
      }
    };
    
    prompt.start();

    prompt.get(schema, async function(err, result) {
      if (err) {
        program.error(err);
      }

      // force = false & confirm != PURGE
      if (options.force !== true && result.confirm !== "PURGE") {
        program.error(`Purge of profile '${name}' not confirmed.`, {exitCode: 1});
      }

      Profile.purge(name);
      console.info(colors.green(`Profile named '${name}' succesfully purged.`));
    });
  });

// subcommand to purge configuration of ALL profile
program.command("purge-all")
  .description("purge all existing ServiceNow instance profiles")
  .option("-f, --force", "force purge all")
  .action(async function(options) {
    debugWorkingDir();

    const schema = {
      properties: {
        confirm: {
          description: colors.yellow("Are you sure you want to purge ALL saved profiles'? Type 'PURGE' in uppercase to confirm."),
          required: true,
          ask: () => {
            return options.force !== true;
          }
        }
      }
    };
    
    prompt.start();

    prompt.get(schema, async function(err, result) {
      if (err) {
        program.error(err);
      }

      // force = false & confirm != PURGE
      if (options.force !== true && result.confirm !== "PURGE") {
        program.error("Purge of all profiles not confirmed.", {exitCode: 1});
      }

      Profile.purgeHome();
      console.info(colors.green("All profiles succesfully purged."));
    });
  });

program.parseAsync(process.argv);