/* eslint-disable */
// Load the linter
const {NowLinter} = require("@hrax/now-eslit");

// Configure connection object
const connection = {
  domain: "",
  username: "",
  password: ""
};

// Configuration of the linter, only title and query is mandatory
const config = {
  title: "",
  query: "",
  tables: {},
  cliEngine: {}
};

// Tables to be linted, in format "table_name"; [field1, field2]
const tables = {};

// Must, until the top-level awaits is enabled
(async () => {
  const linter = new NowLinter(connection, config, tables);
  // the JSON report on the updates in the update sets
  const report = await linter.report();
})();