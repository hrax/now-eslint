
const fs = require("fs");
const ejs = require("ejs");

const NowLinter = require("../src/NowLinter");

const config = require("./config.json");
const tables = require("./tables.json");

config.tables = tables;

const linter = new NowLinter(config);
(async function() {
  await linter.process();
  const data = linter.toJSON();

  ejs.renderFile("../template/template.html", data, (err, html) => {
    fs.writeFileSync(config.name + ".html", html);
  });
})();