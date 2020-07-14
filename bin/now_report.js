
const prompt = require("prompt");
const NowLinter = require("../src/NowLinter");

prompt.message = "";
prompt.delimiter = "";

const schema = {
  properties: {
    title: {
      description: "Enter the name of your report:",
      required: true
    },
    filename: {
      description: "Enter the file name of your report (without an extension):",
      pattern: /^[a-z0-9-]+$/,
      message: "File name must contain only lower case letters, numbers and  dash (-)",
      required: true
    },
    query: {
      description: "Enter the query of the report:",
      required: true
    }
  }
};

// TODO: check that the setup has been configured

prompt.start();

prompt.get(schema, (err, result) => {
  if (err) {
    return;
  }
  console.log("");

  const instance = require("../conf/instance.json");
  const config = require("../conf/config.json") || {};
  const tables = require("../conf/tables.json") || {};

  config.query = result.query;
  config.title = result.title;
  config.name = result.filename;

  const linter = new NowLinter(instance, config, tables);
  (async function() {
    await linter.process(true);
    linter.report(true);
  })();
});