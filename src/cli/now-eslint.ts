#!/usr/bin/env node
import { Command } from "commander";
import { outputError } from "./helpers.js";
import { PACKAGE_VERSION } from "../core/Package.js";

try {
  const program = new Command();
  program.name("now-eslint")
    .description("CLI to ESLint Service Now update sets")
    .version(PACKAGE_VERSION, "-v, --version", "output the current version")
    .executableDir("../src/cli")
    .configureOutput({outputError: outputError});
  
  program.command("profile", "ServiceNow profile command");
  program.command("report", "ServiceNow report command (default)", {isDefault: true});
  
  program.parseAsync(process.argv);
} catch (err) {
  outputError(err as string);
}