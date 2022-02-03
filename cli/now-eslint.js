#!/usr/bin/env node
const commander = require("commander");
const program = new commander.Command();
const colors = require("colors/safe");
const pkg = require("../package.json");

program.name("now-eslint")
  .description("CLI to ESLint Service Now update sets")
  .version(pkg.version, "-v, --version", "output the current version")
  .configureOutput({outputError: (str, write) => write(colors.red(str))});

program.command("profile", "ServiceNow instance profile command");

program.command("report", "ServiceNow update set report command (default)", {isDefault: true});
  

program.parseAsync(process.argv);