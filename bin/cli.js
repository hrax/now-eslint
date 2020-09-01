#!/usr/bin/env node
/* eslint-disable */
var args = Array.prototype.slice.call(process.argv, 2);

// args
switch (args[0]) {
  case "setup":
    require("./now_setup.js");
    break;
  case "report":
    require("./now_report.js");
    break;
  default:
    console.log(`Available arguments are "setup,report"`);
    break;
}