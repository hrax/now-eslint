
const fs = require("fs");
const NowLinter = require("../src/NowLinter");

const config = require("./config.json");
const tables = require("./tables.json");

config.tables = tables;

const linter = new NowLinter(config);
(async function() {
  //let changes = await linter.process();
  let response = await linter.loader.fetchUpdateXMLByUpdateSetQuery(config.query);

  response.records.forEach((record) => {
    console.log(record.sys_updated_on);
  });

  /* const json = linter.toJSON();
  fs.writeFileSync("to-json.json", JSON.stringify(json)); */
})();