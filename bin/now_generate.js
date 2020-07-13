
const NowLinter = require("../src/NowLinter");

const config = require("../conf/config.json");
const conn = require("../conf/instance.json");

const linter = new NowLinter(conn, config, {});
(async function() {
  linter.generate();
})();