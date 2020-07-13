
const NowLinter = require("./src/NowLinter");

const config = require("./config.json");
const conn = require("./conn.json");
const tables = require("./tables.json");
config.tables = Object.assign({}, tables, config.tables || {});

const linter = new NowLinter(Object.assign({}, config, conn));
(async function() {
  await linter.process(true);
  linter.report(true);
})();