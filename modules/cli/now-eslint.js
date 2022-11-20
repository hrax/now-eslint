#!/usr/bin/env node
const commander = require("commander");
const program = new commander.Command();
const {version} = require("../../package.json");
const {outputError} = require("./helpers.js");

program.name("now-eslint")
  .description("CLI to ESLint Service Now update sets")
  .version(version, "-v, --version", "output the current version")
  // .executableDir("../modules/cli")
  .configureOutput({outputError: outputError});

program.command("profile", "ServiceNow instance profile command");
program.command("report", "ServiceNow update set report command (default)", {isDefault: true});

program.parseAsync(process.argv);