// Load the NowLoader
const {NowLoader} = require("@hrax/now-eslint");

// Configure connection object
const connection = {
  domain: "",
  username: "",
  password: ""
};

// Must, until the top-level awaits is enabled
(async () => {
  const loader = new NowLoader(connection.domain, connection.username, connection.password);
  // load table and their parent fields with type script
  const tables = await loader.fetchTableAndParentFieldData();
  // save the loaded table, to HDD for example for later use
  fs.writeFileSync("tables.json", JSON.stringify(tables));
})();