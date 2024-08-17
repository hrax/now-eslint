import dotenv from "dotenv";
import commander from "commander";

import * as helpers from "../helpers.js";
import * as ProfileManager from "../../core/ProfileManager.js";

// Initialize dotenv
try {
  dotenv.config();
// eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
} catch (err) {}

const program = new commander.Command("purge")
  .addOption(helpers.debugOption());

const PURGE_CONFIRM = "PURGE";

program
  .description("purge single existing ServiceNow instance profile")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", helpers.validateProfileName)
  .addOption(helpers.forceOption())
  .action(async function(name, options) {
    // TODO:
  });

program.command("all")
  .description("purge all existing ServiceNow instance profiles")
  .action(async function(options) {
    // TODO:
  });

program.parseAsync(process.argv);