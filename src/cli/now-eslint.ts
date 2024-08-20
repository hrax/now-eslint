#!/usr/bin/env node
import dotenv from "dotenv";
import { Command } from "commander";
import { PACKAGE_VERSION } from "../core/Package.js";

import { CommandLogger } from "./helpers/CommandLogger.js";
import { profileCommand } from "./subcommands/now-eslint-profile.js";
import { reportCommand } from "./subcommands/now-eslint-report.js";
// Initialize dotenv
try {
  dotenv.config();
} catch (err) {
  CommandLogger.outputError(`[ERROR] Unknown error occured\n${(err as Error).stack || err}`);
}

const program = new Command()
  .name("now-eslint")
  .description("CLI to ESLint Service Now update sets")
  .version(PACKAGE_VERSION, "-v, --version", "current version")
  .showHelpAfterError()
  .configureOutput({
    outputError: CommandLogger.outputWarning
  })
  .addCommand(reportCommand, {isDefault: true})
  .addCommand(profileCommand);

program.parseAsync(process.argv)
  .catch((err) => CommandLogger.outputError(`[ERROR] Unknown error occured\n${err.stack || err}`));