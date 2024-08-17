import commander from "commander";
import * as helpers from "./helpers.js";

try {
  // Program setup; program is never meant to be run directly only as a subcommand
  const program = new commander.Command("profile")
    .description("Command to manage now-eslint profiles")
    .configureOutput({outputError: helpers.outputError})
    .executableDir("subcommands")
    .showHelpAfterError();

  program.command("create", {isDefault: true});
  program.command("view");
  program.command("purge");

  program.parseAsync(process.argv);
} catch (err) {
  helpers.outputError(`${err}`);
};