/* eslint-disable no-console */
const fs = require("fs");

const prompt = require("prompt");
const colors = require("colors/safe");

const NowProfile = require("../src/NowProfile");
const NowInstance = require("../src/now/NowInstance");

prompt.message = "";
prompt.delimiter = "";

const profileHome = NowProfile.HOME_DIR;

console.log(colors.green(`Will initialize profile in your homefolder on path '${profileHome}'`) + "\n");

const schema = {
  properties: {
    name: {
      description: colors.yellow("Enter the name of the profile"),
      required: true,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "Profile name must consist of lowercase/uppercase letters, numbers or underscore characters."
    },
    override: {
      description: colors.yellow("Profile with the specified name already exists, do you want to override?"),
      type: "boolean",
      default: true,
      ask: () => {
        const profile = prompt.history("name").value;
        return fs.existsSync(`${profileHome}/profile_${profile}`);
      },
      conform: (value) => {
        // It makes no sense to configure profile, if it already exists and we do not override
        if (value === false) {
          process.exit();
          return false;
        }
        return true;
      }
    },
    domain: {
      description: colors.yellow("Enter the URL to the service now instance"),
      pattern: /^https:\/\/.*?\/?$/,
      message: colors.red("Instance URL must start with 'https://' and should end with '/'"),
      required: true
    },
    username: {
      description: colors.yellow("Enter username"),
      required: true
    },
    password: {
      description: colors.yellow("Enter password"),
      required: true,
      hidden: true,
      replace: "*"
    },
    useProxy: {
      description: colors.yellow("Use proxy to connect to the instance?"),
      type: "boolean",
      default: false
    },
    proxy: {
      description: colors.yellow("Proxy connection string (http://username:password@domain:port)"),
      required: true,
      ask: () => {
        return prompt.history("useProxy").value === true;
      }
    }
  }
};

/*
TODO:
 - Prompt: Ask if the user wants to have plugins loaded from global NPM install folder
 - Prompt: Ask if user wants to use .eslintrc file loaded from the profile's folder
*/

prompt.start();

prompt.get(schema, (err, result) => {
  if (err) {
    console.log(colors.red("Error occured, stoping."));
    console.log(colors.red(err));
    process.exit();
    return;
  }

  (async function() {
    const data = {
      "name": `${result.name}`,
      "domain": `${result.domain}`,
      "username": `${result.username}`,
      "password": `${result.password}`,
      "proxy": result.useProxy ? `${result.proxy}` : null
    };
    
    const profile = new NowProfile(data);
    const instance = profile.createInstance();

    console.log(colors.green("Testing connection to the instance."));
    const message = "Unable to connect to the instance, please verify the instance url, username and password.";
    try {
      const connected = await instance.testConnection();
      if (!connected) {
        console.log(colors.red(message));
        // End
        process.exit();
        return;
      }

      console.log(colors.green("Succesfully connected to the instance.\n"));
    } catch (err) {
      console.log(colors.red(message));
      console.log(colors.red(err));
      process.exit();
      return;
    }
    
    // TODO: config.eslint.overrideConfigFile = `${os.homedir()}/.eslintrc`;

    console.log(colors.green("Generating table configuration"));
    const tables = await instance.requestTableAndParentFieldData();
    // Force skip workflow version parsing, until we have custom XML parsin setup
    tables["wf_workflow_version"] = null;
    profile.setTables(tables);

    // TODO: NowProfile.saveProfile(profile);
    console.log(colors.green("Saving the profile"));

    if (!fs.existsSync(`${profileHome}`)) {
      fs.mkdirSync(`${profileHome}`);
    }

    const profilePath = `${profileHome}/profile_${result.name}`;
    if (result.override) {
      // Just to be sure force reset
      console.log(colors.green(`Deleting old profile on ${profilePath} to allow for override.`));
      fs.rmdirSync(profilePath, {recursive: true});
    }
    
    fs.mkdirSync(profilePath);

    const json = JSON.stringify(profile);
    fs.writeFileSync(`${profilePath}/profile.json`, json);
    
    console.log(colors.green("Setup completed"));
  })();
});