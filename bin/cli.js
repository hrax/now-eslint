#!/usr/bin/env node
/* eslint-disable */
const colors = require("colors/safe");

const argv = Array.prototype.slice.call(process.argv, 2);

// args
switch (argv[0]) {
  case "version":
    const pkg = require("../package.json");
    console.log(colors.green(`Using now-eslint version ${pkg.version}`));
    break;
  case "setup":
    require("./now_setup.js");
    break;
  case "report":
    require("./now_report.js");
    break;
  default:
    const args = ["setup", "report", "version"]
    console.log(colors.yellow(`Available arguments are "${args.join(", ")}"`));
    break;
}