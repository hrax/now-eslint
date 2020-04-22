
const fs = require("fs");
const NowLoader = require("../src/NowLoader");

const config = require("./config.json");

const loader = new NowLoader(config.domain, config.username, config.password);
(async function() {
  let tables = await loader.fetchTableConfigurationData();

  console.log("Tables entries: " + Object.keys(tables).length);

  // save output as JSON file
  fs.writeFileSync("tables.json", JSON.stringify(tables));
  //fs.writeFileSync("tables.txt", Object.keys(tables));
})();