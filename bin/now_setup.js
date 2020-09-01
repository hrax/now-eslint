/* eslint-disable no-console */
const fs = require("fs");

const prompt = require("prompt");
const colors = require("colors/safe");

const NowLoader = require("../src/NowLoader.js");

// Check if current folder is initialized... fs works against cwd
const INITIALIZED = fs.existsSync("./.ENV") && fs.existsSync("./config.json") && fs.existsSync("./tables.json") && fs.existsSync("./template.ejs");

prompt.message = "";
prompt.delimiter = "";

console.log(colors.green(`Will initialize folder on current path '${process.cwd()}'`) + "\n");

const schema = {
  properties: {
    override: {
      description: colors.yellow("Current folder is already initialized, do you want to override?"),
      type: "boolean",
      default: true,
      ask: () => {
        return INITIALIZED;
      }
    },
    domain: {
      description: colors.green("Enter the URL to the service now instance:"),
      pattern: /^https:\/\/.*?\/?$/,
      message: colors.red("Instance URL must start with 'https://' and should end with '/'"),
      required: true,
      ask: () => {
        return !INITIALIZED || prompt.history("override").value;
      }
    },
    username: {
      description: colors.green("Enter username:"),
      required: true,
      ask: () => {
        return !INITIALIZED || prompt.history("override").value;
      }
    },
    password: {
      description: colors.green("Enter password:"),
      required: true,
      hidden: true,
      ask: () => {
        return !INITIALIZED || prompt.history("override").value;
      }
    },
    // TODO: proxy setup here!
    testConnection: {
      description: colors.green("Do you want to test the connection to the instance?"),
      type: "boolean",
      default: true,
      ask: () => {
        return !INITIALIZED || prompt.history("override").value;
      }
    },
    generateTables: {
      description: colors.green("Do you want to generate table data from the instance?"),
      type: "boolean",
      default: true,
      ask: () => {
        return !INITIALIZED || prompt.history("override").value;
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

  if (!result.override) {
    return;
  }

  (async function() {
    const conn = {
      "domain": result.domain,
      "username": result.username,
      "password": result.password
    };
    if (!conn.domain.endsWith("/")) {
      conn.domain = conn.domain + "/";
    }
    const loader = new NowLoader(result.domain, result.username, result.password);

    if (result.testConnection) {
      console.log("Testing connection to the instance.");
      let message = "Unable to connect to the instance, please verify the instance url, username and password.";
      try {
        let connected = await loader.testConnection();
        if (!connected) {
          console.log(message);
          // End
          return;
        }

        console.log("Succesfully connected to the instance.\n");
      } catch (err) {
        console.log(message);
        console.log(err);
        return;
      }
    }

    // DOTENV
    const DOTENV = `SNOW_DOMAIN=${conn.domain}
SNOW_USERNAME=${conn.username}
SNOW_PASSWORD=${conn.password}`;
    fs.writeFileSync("./.ENV", DOTENV);

    console.log("Generating linter configuration");
    fs.copyFileSync(require.resolve("../resources/config.json"), "./config.json");

    console.log("Generating table configuration");
    if (result.generateTables) {
      const tables = await loader.fetchTableAndParentFieldData();
      fs.writeFileSync("./tables.json", JSON.stringify(tables));
    } else {
      fs.copyFileSync(require.resolve("../resources/tables.json"), "./tables.json");
    }

    fs.copyFileSync(require.resolve("../resources/template-slim.ejs"), "./template.ejs");

    console.log("Setup completed");
  })();
});