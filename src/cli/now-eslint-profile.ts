/* eslint-disable no-console */
import dotenv from "dotenv";
import commander from "commander";
import colors from "colors/safe";
import prompt from "prompt";

import * as helpers from "./helpers.js";
import { ProfileManager, OAuthType } from "../core/ProfileManager.js";
import { profileCreateAction } from "./actions/profile-actions.js";

// Initialize dotenv
try {
  dotenv.config();
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty, @stylistic/js/brace-style
} catch (err) {}

// Setup prompt
prompt.message = "";
prompt.delimiter = "";

// Configure global constants
const PROFILE_HOME = ProfileManager.profilesHomeDirPath();
const OAUTH_TYPE_TOKEN: OAuthType = "oauth-token";


const debugWorkingDir = () => {
  helpers.outputKeyValue("Working profiles home directory", `${PROFILE_HOME}`, true);
};

const program = new commander.Command();
// Program setup; program is never meant to be run directly only as a subcommand
program.name("now-eslint profile")
  .description("CLI to create and update now-eslint profiles")
  .configureOutput({outputError: helpers.outputError})
  .showHelpAfterError();

// Default subcommand to create new profile
program.command("create", {isDefault: true})
  .description("create new profile for the ServiceNow instance (default)")
  .argument("<name>", `name of the profile; ${helpers.PROFILE_HELP}`, helpers.validateProfileName)
  .option("-d, --domain <domain>", `the URL to the ServiceNow instance; ${helpers.DOMAIN_HELP}`, helpers.validateDomain)
  .option("--proxy", "proxy connection configuration")
  // .option("-t --token", "Authentication type OAuth token via OAuth code")
  // .option("-u --user", "Authentication type OAuth token via username and password")
  .option("-f, --force", "force override if profile with the name exists")
  .addHelpText("after", `
  
  Required read-only user access (tables):
  sys_update_xml
  sys_update_set
  sys_dictionary
  sys_db_object

  Example call:
  now-eslint profile create <profileName> -d "https://example.service-now.com" 
  now-eslint profile create <profileName> -d "https://example.service-now.com" --proxy`)
  .action(profileCreateAction);

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