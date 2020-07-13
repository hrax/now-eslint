
const NowLinter = require("./src/NowLinter");

const config = require("../conf/config.json");
const conn = require("../conf/conn.json");
const tables = require("../conf/tables.json");
config.tables = Object.assign({}, tables, config.tables || {});

const linter = new NowLinter(conn, Object.assign({}, config));
(async function() {
  await linter.process(true);
  linter.report(true);
})();