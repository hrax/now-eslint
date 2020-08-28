#!/usr/bin/env node
/* eslint-disable */

const fs = require("fs");

try {
  require("dotenv").config();
} catch (e) {}

var args = Array.prototype.slice.call(process.argv, 2);


// args
switch (args[0]) {
  case "init":
    console.log(`${process.cwd()}`);
    break;
  case "setup":
    require("./now_setup.js");
    break;
  case "report":
    require("./now_report.js");
    break;
  default:
    console.log(`Available areguments are "setup,report"`);
    break;
}