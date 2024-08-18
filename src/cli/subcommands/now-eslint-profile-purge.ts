import commander from "commander";

import * as helpers from "../helpers.js";

const PURGE_CONFIRM = "PURGE";

const purgeCommand = new commander.Command("purge")
  .description("purge single existing ServiceNow instance profile")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", helpers.validateProfileName)
  .addOption(helpers.debugOption())
  .addOption(helpers.forceOption())
  .action(async function(name, options) {
    // TODO:
  });

purgeCommand.command("all")
  .description("purge all existing ServiceNow instance profiles")
  .action(async function(options) {
    // TODO:
  });

export {purgeCommand};