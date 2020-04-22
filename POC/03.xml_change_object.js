
const UpdateXML = require("../src/UpdateXML").UpdateXML;
const NowLoader = require("../src/NowLoader");

const config = require("./config.json");
const ids = ["1f717b74db141010ccc9c4ab0b9619db", "1eacc80ddb181010ccc9c4ab0b96191d", "f1713774db141010ccc9c4ab0b96198e"];
const query = "sys_idIN40bc7db1db101010ccc9c4ab0b9619ce,985c79b1db101010ccc9c4ab0b9619d3";

const loader = new NowLoader(config.domain, config.username, config.password);
(async function() {
  let response = await loader.fetchByUpdateSetQuery(query);

  // Get records from the response
  let records = response.records;

  let changes = {};
  records.forEach((record) => {
    let change = new UpdateXML(record, true);
    changes[change.name] = change;
  });

  Object.values(changes).forEach((i) => {
    console.log("ID: " + i.id);
    console.log("Name: " + i.name);
    console.log("Action: " + i.action);

    console.log("");
  });
})();