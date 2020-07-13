
const NowLinter = require("./src/NowLinter");

const config = require("../conf/config.json");
const conn = require(".../conf/conn.json");
config.tables = {};

const linter = new NowLinter(conn, Object.assign({}, config));
(async function() {
  linter.generate();
})();