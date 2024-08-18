import commander from "commander";
import { createCommand } from "./now-eslint-profile-create.js";
import { viewCommand } from "./now-eslint-profile-view.js";
import { purgeCommand } from "./now-eslint-profile-purge.js";

// Program setup; program is never meant to be run directly only as a subcommand
const profileCommand = new commander.Command("profile")
  .description("Command to manage now-eslint profiles")
  .addCommand(createCommand, {isDefault: true})
  .addCommand(viewCommand)
  .addCommand(purgeCommand);

export { profileCommand };