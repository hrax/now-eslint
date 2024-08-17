import dotenv from "dotenv";
import commander from "commander";

import * as helpers from "../helpers.js";

// Initialize dotenv
try {
  dotenv.config();
// eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
} catch (err) {}

try {
  const program = new commander.Command("create")
    .description("create new profile for the ServiceNow instance (default)")
    .argument("<name>", `name of the profile; ${helpers.PROFILE_HELP}`, helpers.validateProfileName)
    .option("-d, --domain <domain>", `the URL to the ServiceNow instance; ${helpers.DOMAIN_HELP}`, helpers.validateDomain)
    .option("--proxy", "proxy connection configuration")
    .addOption(helpers.forceOption())
    .addOption(helpers.debugOption())
    .action(async function(name, options) {
      // TODO:!
    });

  program.parseAsync(process.argv);
} catch (err) {
  helpers.outputError(`${err}`);
};