import commander from "commander";

import * as helpers from "../helpers.js";

const viewCommand = new commander.Command("view")
  .argument("<name>", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", helpers.validateProfileName)
  .option("-t, --test-connection", "test connection to the instance")
  .action(async function(name, options) {
    // TODO:
  });
export {viewCommand};