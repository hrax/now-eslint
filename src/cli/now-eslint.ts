#!/usr/bin/env node
import dotenv from "dotenv";
import { Command } from "commander";
import { outputError } from "./helpers.js";
import { PACKAGE_VERSION } from "../core/Package.js";

import { profileCommand } from "./subcommands/now-eslint-profile.js";
import { reportCommand } from "./subcommands/now-eslint-report.js";
// Initialize dotenv
try {
  dotenv.config();
// eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
} catch (err) {}

try {
  const program = new Command()
    .name("now-eslint")
    .description("CLI to ESLint Service Now update sets")
    .version(PACKAGE_VERSION, "-v, --version", "current version")
    .showHelpAfterError()
    .configureOutput({outputError: outputError})
    .addCommand(reportCommand, {isDefault: true})
    .addCommand(profileCommand);
  
  program.parseAsync(process.argv);
} catch (err) {
  outputError(err as string);
}