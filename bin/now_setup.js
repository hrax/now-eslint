/* eslint-disable no-console */
const fs = require("fs");
const os = require("os");

const prompt = require("prompt");
const colors = require("colors/safe");

const NowProfile = require("../src/NowProfile");

// Check if current folder is initialized... fs works against cwd
//const INITIALIZED = fs.existsSync("./.ENV") && fs.existsSync("./config.json") && fs.existsSync("./tables.json") && fs.existsSync("./template.ejs");

prompt.message = "";
prompt.delimiter = "";

console.log(colors.green(`Will initialize folder on current path '${process.cwd()}'`) + "\n");

// TODO: force testConnection and force table generation!
const schema = {
  properties: {
    // override: {
    //   description: colors.yellow("Current folder is already initialized, do you want to override?"),
    //   type: "boolean",
    //   default: true,
    //   ask: () => {
    //     return INITIALIZED;
    //   }
    // },
    domain: {
      description: colors.green("Enter the URL to the service now instance"),
      pattern: /^https:\/\/.*?\/?$/,
      message: colors.red("Instance URL must start with 'https://' and should end with '/'"),
      required: true
      // ask: () => {
      //   return !INITIALIZED || prompt.history("override").value;
      // }
    },
    username: {
      description: colors.green("Enter username"),
      required: true
      // ask: () => {
      //   return !INITIALIZED || prompt.history("override").value;
      // }
    },
    password: {
      description: colors.green("Enter password"),
      required: true,
      hidden: true
      // ask: () => {
      //   return !INITIALIZED || prompt.history("override").value;
      // }
    },
    // TODO: proxy setup here!
    proxy: {
      description: colors.green("Proxy connection string (http://username:password@domain:port); leave empty if none"),
      required: false
    },
    testConnection: {
      description: colors.green("Do you want to test the connection to the instance?"),
      type: "boolean",
      default: true
      // ask: () => {
      //   return !INITIALIZED || prompt.history("override").value;
      // }
    },
    generateTables: {
      description: colors.green("Do you want to generate table data from the instance?"),
      type: "boolean",
      default: true
      // ask: () => {
      //   return !INITIALIZED || prompt.history("override").value;
      // }
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
    const data = {
      "name": "cwdprofile",
      "domain": `${result.domain}`,
      "username": `${result.username}`,
      "password": `${result.password}`,
      "proxy": result.proxy ? `${result.proxy}` : null
    };
    
    const profile = new NowProfile(data);
    const instance = profile.createInstance();

    if (result.testConnection) {
      console.log("Testing connection to the instance.");
      let message = "Unable to connect to the instance, please verify the instance url, username and password.";
      try {
        let connected = await instance.testConnection();
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
    
    // TODO: config.eslint.overrideConfigFile = `${os.homedir()}/.eslintrc`;

    console.log("Generating table configuration");
    const tables = await instance.fetchTableAndParentFieldData();
    // Force skip workflow version parsing, until we have custom XML parsin setup
    tables["wf_workflow_version"] = null;
    profile.setTables(tables);

    /// TODO: NowProfile.saveProfile(profile);
    const json = JSON.stringify(profile);
    fs.writeFileSync("./profile.json", json);
    
    console.log("Generating linter configuration");
    // const config = require("../resources/config.json");
    // fs.writeFileSync("./config.json", JSON.stringify(config));

    // console.log("Generating PDF configuration");
    // fs.copyFileSync(require.resolve("../resources/pdfsetup.js"), "./pdfsetup.js");

    console.log("Setup completed");
  })();
});