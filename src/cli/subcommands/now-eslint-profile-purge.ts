import * as commander from "commander";

import * as helpers from "../helpers.js";
import { CommandLogger } from "../helpers/CommandLogger.js";

const PURGE_CONFIRM = "PURGE";

const purgeCommand = new commander.Command("purge")
  .configureOutput({
    outputError: CommandLogger.outputWarning
  })
  .description("purge single existing ServiceNow instance profile")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", helpers.validateProfileName)
  .addOption(CommandLogger.debugOption())
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