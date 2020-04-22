
const NowLinter = require("../src/NowLinter");

const config = require("./config.json");
const tables = require("./tables.json");

config.tables = tables;

const linter = new NowLinter(config);
(async function() {
  let changes = await linter.process();

  Object.values(changes).forEach((i) => {
    console.log("ID: " + i.id);
    console.log("Name: " + i.name);
    console.log("Action: " + i.action);
    console.log("Status: " + i.status);
    console.log("Updates: " + i.updateCount);

    console.log("");

    console.log("Reports: " + JSON.stringify(i.reports));

    console.log("");
  });
})();