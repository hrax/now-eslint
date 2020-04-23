
const NowLinter = require("./src/NowLinter");

const config = require("./config.json");
const tables = require("./tables.json");

config.tables = Object.assign({}, tables, config.tables || {});

const linter = new NowLinter(config);
(async function() {
  await linter.process();
  linter.report();
})();