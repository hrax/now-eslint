import commander from "commander";
import colors from "colors/safe";
import prompt from "prompt";
import * as ProfileManager from "../../core/ProfileManager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const profileCreateAction = async function(name: string, options: any) {
  const program = (this as commander.Command);
  debugWorkingDir();

  if (ProfileManager.exists(name) && options.force !== true) {
    program.error(`Profile with name '${name}' already exists, use --force option to override`, {exitCode: 1});
  }

  const schema = {
    properties: {
      domain: {
        description: colors.yellow("Enter the URL to the ServiceNow instance"),
        pattern: helpers.DOMAIN_REGEXP,
        message: colors.red(helpers.DOMAIN_ERROR),
        required: true,
        default: options.domain,
        ask: () => {
          return options.domain == null;
        }
      },
      authType: {
        description: "TODO: Authentication type",
        default: OAUTH_TYPE_TOKEN,
        ask: () => {
          return false;
        }
      },
      username: {
        description: colors.yellow("Enter username"),
        required: true,
        default: options.username,
        ask: () => {
          return options.authType !== OAUTH_TYPE_TOKEN;
        }
      },
      password: {
        description: colors.yellow("Enter password"),
        required: (options.authType !== OAUTH_TYPE_TOKEN),
        hidden: true,
        replace: "*",
        ask: () => {
          return options.authType !== OAUTH_TYPE_TOKEN;
        }
      },
      proxy: {
        description: colors.yellow("Enter proxy connection string e.g. http://username:password@domain:port"),
        required: true,
        ask: () => {
          return options.proxy === true;
        }
      }
    }
  };

  prompt.start();

  prompt.get(schema, async function(err, result) {
    if (err != null) {
      program.error(`${err}`, {exitCode: 1});
    }

    const data = {
      "name": `${name}`,
      "domain": `${result.domain}`,
      "username": `${result.username}`,
      "password": `${result.password}`,
      "proxy": result.useProxy ? `${result.proxy}` : null
    };

    const profile = new Profile(data);
    const instance = profile.createInstance();

    helpers.outputInfo(`Testing connection to the instance at '${profile.domain}' using username '${profile.username}'...\n`);

    const message = "Unable to connect to the instance, please verify the instance url, username, password and role access.";
    try {
      const connected = await instance.testConnection();
      if (!connected) {
        program.error(message, {exitCode: 1});
      }

      helpers.outputInfo(`Succesfully connected to the instance at '${profile.domain}'.\n`);
    } catch (err) {
      helpers.outputError(message);
      program.error(`${err}`, {exitCode: 1});
    }

    helpers.outputInfo("Generating table configuration...\n");
    await profile.loadInstanceTables();
    // Force skip workflow version parsing; TODO: custom XML parsing setup
    profile.tables["wf_workflow_version"] = null;

    helpers.outputInfo("Saving the profile...\n");
    Profile.save(profile, options.force === true);

    helpers.outputInfo("Profile setup completed.");
  });
};