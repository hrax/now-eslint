
const NowLinter = require("./src/NowLinter");

const config = require("./config.json");
config.tables = {};

const linter = new NowLinter(config);
(async function() {
  linter.generate();
})();