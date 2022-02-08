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
const helpers = require("./cli-helpers");

// Load local libraries
const Profile = require("../src/Profile");

// Configure global constants
const PROFILE_HOME = Profile.profilesHomeDirPath();

// Setup prompt
prompt.message = "";
prompt.delimiter = "";

const debugWorkingDir = () => {
  helpers.outputKeyValue("Working profiles home directory", `${PROFILE_HOME}`, true);
};

// Program setup; program is never meant to be run directly only as a subcommand
program.name("now-eslint profile")
  .description("CLI to create and update now-eslint profiles")
  .configureOutput({outputError: helpers.outputError})
  .showHelpAfterError();

// Default subcommand to create new profile
const create = program.command("create", {isDefault: true})
  .description("create new profile for the ServiceNow instance (default)")
  .argument("<name>", `name of the profile; ${helpers.PROFILE_HELP}`, helpers.validateProfileName)
  .option("-d, --domain <domain>", `the URL to the ServiceNow instance; ${helpers.DOMAIN_HELP}`, helpers.validateDomain)
  .option("-u, --username <username>", "username used to connect")
  .option("--no-proxy", "skip proxy configuration")
  .option("-f, --force", "force override if profile with the name exists");
create.action(async function(name, options) {
  debugWorkingDir();

  if (Profile.exists(name) && options.force !== true) {
    program.error(`Profile with name '${name}' already exists, use --force option to override`, {exitCode: 1});
  }

  const schema = {
    properties: {
      domain: {
        description: colors.yellow("Enter the URL to the ServiceNow instance"),
        pattern: helpers.DOMAIN_REGEXP,
        message: colors.red(helpers.DOMAIN_ERROR),
        required: true,
        default: options.domain,
        ask: () => {
          return options.domain == null;
        }
      },
      username: {
        description: colors.yellow("Enter username"),
        required: true,
        default: options.username,
        ask: () => {
          return options.username == null;
        }
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
        default: false,
        ask: () => {
          return options.proxy;
        }
      },
      proxy: {
        description: colors.yellow("Enter proxy connection string e.g. http://username:password@domain:port"),
        required: true,
        ask: () => {
          return options.proxy && prompt.history("useProxy").value === true;
        }
      }
    }
  };
  
  prompt.start();

  prompt.get(schema, async function(err, result) {
    if (err) {
      program.error(err, {exitCode: 1});
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

    helpers.outputInfo(`Testing connection to the instance at '${profile.domain}' using username '${profile.username}'...\n`);

    const message = "Unable to connect to the instance, please verify the instance url, username and password.";
    try {
      const connected = await instance.testConnection();
      if (!connected) {
        program.error(message, {exitCode: 1});
      }

      helpers.outputInfo(`Succesfully connected to the instance at '${profile.domain}'.\n`);
    } catch (err) {
      helpers.outputError(message);
      program.error(err, {exitCode: 1});
    }

    helpers.outputInfo("Generating table configuration...\n");
    const tables = await instance.requestTableAndParentFieldData();
    // Force skip workflow version parsing; TODO: custom XML parsing setup
    tables["wf_workflow_version"] = null;
    profile.tables = tables;

    helpers.outputInfo("Saving the profile...\n");
    Profile.save(profile, options.force === true);

    helpers.outputInfo("Profile setup completed.");
  });
});

// subcommand to debug configuration of saved profile
const debug = program.command("debug")
  .description("debug existing profile by printing out saved configuration")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", helpers.validateProfileName)
  .option("-t, --test-connection", "test connection to the instance");
debug.action(async function(name, options) {
  debugWorkingDir();

  if (!Profile.exists(name)) {
    program.error(`Profile with name '${name}' does not exist.`, {exitCode: 1});
  }

  const profile = Profile.load(name);
  helpers.outputKeyValue("Profile name", profile.name);
  helpers.outputKeyValue("Profile domain", profile.domain);
  helpers.outputKeyValue("Profile username", profile.username);
  helpers.outputKeyValue("Profile proxy", `${profile.proxy || "No"}\n`);

  if (options.testConnection === true) {
    const instance = profile.createInstance();
    const msg = "Unable to connect to the instance.";
    try {
      const connected = await instance.testConnection();
      if (!connected) {
        helpers.outputError(msg + "\n");
      }

      helpers.outputInfo("Succesfully connected to the instance.\n");
    } catch (err) {
      helpers.outputError(msg + "\n");
    }
  }
  
  helpers.outputKeyValue("Profile has tables", helpers.boolYesNo(profile.tables.size !== 0));
  helpers.outputKeyValue("Profile has resources", helpers.boolYesNo(profile.resources.size !== 0));
  helpers.outputKeyValue("Profile has colors", helpers.boolYesNo(profile.colors.size !== 0));
  helpers.outputKeyValue("Profile has eslint config", helpers.boolYesNo(profile.eslint.size !== 0));
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
const purge = program.command("purge")
  .description("purge single existing ServiceNow instance profile")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", helpers.validateProfileName)
  .option("-f, --force", "force purge");
purge.action(async function(name, options) {
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
      program.error(err, {exitCode: 1});
    }

    // force = false & confirm != PURGE
    if (options.force !== true && result.confirm !== "PURGE") {
      program.error(`Purge of profile '${name}' not confirmed.`, {exitCode: 1});
    }

    Profile.purge(name);
    helpers.outputInfo(`Profile named '${name}' succesfully purged.`);
  });
});

// subcommand to purge configuration of ALL profile
const purgeAll = program.command("purge-all")
  .description("purge all existing ServiceNow instance profiles")
  .option("-f, --force", "force purge all");
purgeAll.action(async function(options) {
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
      program.error(err, {exitCode: 1});
    }

    // force = false & confirm != PURGE
    if (options.force !== true && result.confirm !== "PURGE") {
      program.error("Purge of all profiles not confirmed.", {exitCode: 1});
    }

    Profile.purgeHome();
    helpers.outputInfo("All profiles succesfully purged.");
  });
});

program.parseAsync(process.argv);