/* eslint-disable no-console */
const prompt = require("prompt");
const fs = require("fs");

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
      default: false,
      ask: function() {
        return false;
      }
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
  let conn = {
    "domain": result.domain,
    "username": result.username,
    "password": result.password
  };

  fs.writeFileSync("./conf/conn.json", JSON.stringify(conn));
  console.log("Connection setup generated");
});