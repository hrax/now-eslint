
const NowLinter = require("./src/NowLinter");

const config = require("./config.json");
const conn = require("./conn.json");
config.tables = {};

const linter = new NowLinter(Object.assign({}, config, conn));
(async function() {
  linter.generate();
})();