#!/usr/bin/env node
const commander = require("commander");
const program = new commander.Command();
const pkg = require("../package.json");
const helpers = require("./cli-helpers");

program.name("now-eslint")
  .description("CLI to ESLint Service Now update sets")
  .version(pkg.version, "-v, --version", "output the current version")
  .configureOutput({outputError: helpers.outputError});

program.command("profile", "ServiceNow instance profile command");
program.command("report", "ServiceNow update set report command (default)", {isDefault: true});

program.parseAsync(process.argv);