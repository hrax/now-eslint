/* eslint-disable no-console */
const prompt = require("prompt");
const fs = require("fs");
const NowLinter = require("../src/NowLinter.js");

prompt.message = "prompt: ";
prompt.delimiter = "";

const schema = {
  properties: {
    domain: {
      description: "Enter the URL to the service now instance:",
      pattern: /^https:\/\//,
      message: "Instance URL must start with 'https://'",
      required: true
    },
    username: {
      description: "Enter username:",
      required: true
    },
    password: {
      description: "Enter password:",
      required: true,
      hidden: true
    },
    // TODO: proxy setup here!
    testConnection: {
      description: "Do you want to test the connection to the instance?",
      type: "boolean",
      default: false
    },
    generateTables: {
      description: "Do you want to generate table data from the instance?",
      type: "boolean",
      default: false
    }
  }
};

prompt.start();

prompt.get(schema, (err, result) => {
  if (err) {
    console.log("Error occured, stoping.");
    console.log(err);
    return;
  }

  (async function() {
    let conn = {
      "domain": result.domain,
      "username": result.username,
      "password": result.password
    };

    // TODO: Test connection before saving it, allow to reset the prompt

    console.log("Generating instance connection configuration");
    fs.writeFileSync("./conf/instance.json", JSON.stringify(conn));

    console.log("Generating linter configuration");
    fs.copyFileSync("./conf/config.json-example", "./conf/config.json");

    console.log("Generating table configuration");
    if (result.generateTables) {
      // TODO: change this to NowLoader
      const linter = new NowLinter(conn, {}, {});
      await linter.generate();
    } else {
      fs.copyFileSync("./conf/tables.json-example", "./conf/tables.json");
    }
    console.log("Setup completed");
  })();
});