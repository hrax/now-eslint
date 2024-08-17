#!/usr/bin/env node
import { Command } from "commander";
import { outputError } from "./helpers.js";
import { PACKAGE_VERSION } from "../core/Package.js";

try {
  const program = new Command()
    .name("now-eslint")
    .description("CLI to ESLint Service Now update sets")
    .version(PACKAGE_VERSION, "-v, --version", "current version")
    .executableDir("./")
    .configureOutput({outputError: outputError});
  
  program.command("profile");
  program.command("report", {isDefault: true});
  
  program.parseAsync(process.argv);
} catch (err) {
  outputError(err as string);
}