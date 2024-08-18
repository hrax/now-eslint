import commander from "commander";
import * as helpers from "../helpers.js";

const createCommand = new commander.Command("create")
  .description("create new profile for the ServiceNow instance")
  .argument("<name>", `name of the profile; ${helpers.PROFILE_HELP}`, helpers.validateProfileName)
  .option("--proxy", "set up proxy connection configuration")
  .addOption(helpers.forceOption())
  .addOption(helpers.debugOption());

createCommand.action(async function(name, options) {
  // TODO:!
});

export { createCommand };