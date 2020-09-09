#!/usr/bin/env node
/* eslint-disable */
const args = Array.prototype.slice.call(process.argv, 2);

// args
switch (args[0]) {
  case "version":
    const pkg = require("../package.json");
    console.log(`Using now-eslint version ${pkg.version}`);
    break;
  case "setup":
    require("./now_setup.js");
    break;
  case "report":
    require("./now_report.js");
    break;
  default:
    console.log(`Available arguments are "setup,report,version"`);
    break;
}