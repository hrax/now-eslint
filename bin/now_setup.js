/* eslint-disable no-console */
const prompt = require("prompt");
const fs = require("fs");
const NowLoader = require("../src/NowLoader.js");

prompt.message = "prompt: ";
prompt.delimiter = "";

const schema = {
  properties: {
    domain: {
      description: "Enter the URL to the service now instance:",
      pattern: /^https:\/\/.*?\/$/,
      message: "Instance URL must start with 'https://' and must end with '/'",
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
      default: false,
      ask: function() {
        return false;
      }
    },
    generateTables: {
      description: "Do you want to generate table data from the instance?",
      type: "boolean",
      default: true
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
    const conn = {
      "domain": result.domain,
      "username": result.username,
      "password": result.password
    };
    const loader = new NowLoader(result.domain, result.username, result.password);

    // TODO: Test connection before saving it, allow to reset the prompt
    if (result.testConnection) {
      let message = "Unable to connect to the instance";
      try {
        let connected = await loader.testConnection();
        if (!connected) {
          console.log(message);
          // End
          return;
        }
      } catch (err) {
        console.log(message);
        console.log(err);
        return;
      }
    }

    console.log("Generating instance connection configuration");
    fs.writeFileSync("./conf/instance.json", JSON.stringify(conn));

    console.log("Generating linter configuration");
    fs.copyFileSync("./conf/config.json-example", "./conf/config.json");

    console.log("Generating table configuration");
    if (result.generateTables) {
      const fields = await loader.fetchTableFieldData();
      const parents = await loader.fetchTableParentData();
      const tables = {};
      const getParentFields = function(table, fields, parents, toReturn) {
        toReturn = toReturn || [];
        if (fields[table] != null) {
          toReturn = toReturn.concat(fields[table]);
          if (parents[table]) {
            return getParentFields(parents[table], fields, parents, toReturn);
          }
        }

        // Return unique set as array
        return [...new Set(toReturn)];
      };

      Object.keys(fields).forEach(table => {
        tables[table] = getParentFields(table, fields, parents);
      });

      fs.writeFileSync("./conf/tables.json", JSON.stringify(tables));
    } else {
      fs.copyFileSync("./conf/tables.json-example", "./conf/tables.json");
    }

    console.log("Setup completed");
  })();
});