import * as commander from "commander";
import * as helpers from "../helpers.js";
import { CommandLogger } from "../helpers/CommandLogger.js";
import prompts, { PromptObject } from "prompts";
import profileManager from "../../core/ProfileManager.js";
// import { RESTClient } from "../../core/RESTClient.js";
import oauthClient from "../../core/OAuthClient.js";
import open, { apps } from "open";
import colors from "colors/safe.js";


const log = new CommandLogger();

const createCommand = new commander.Command("create")
  .configureOutput({
    outputError: CommandLogger.outputWarning
  })
  .description("create new profile for the ServiceNow instance")
  .argument("<name>", `name of the profile; ${helpers.PROFILE_HELP}`, helpers.validateProfileName)
  .option("--proxy", "set up proxy connection configuration")
  .addOption(helpers.forceOption())
  .addOption(CommandLogger.verboseOption())
  .addOption(CommandLogger.debugOption());

createCommand.action(async function(name, options) {
  log.fromOptions(options);

  log.debug(`Current working directory: ${process.cwd()}`);
  log.debug(`Profile home directory: ${profileManager.getHomePath()}`);
  log.verbose(`Setting up profile with name '${name}'\n`);

  const questions: PromptObject[] = [
    {
      type: () => options.proxy && "text",
      name: "proxy",
      message: "Enter proxy url"
    },
    {
      type: "text",
      name: "baseurl",
      message: "Enter Service Now instance url",
      validate: (value) => {
        try {
          const url = new URL("/", value);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            return "URL can start only with http(s)://";
          }
          return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          return "URL is not valid.";
        }
      },
      format: (value) => {
        return new URL("/", value).origin;
      }
    },
    {
      type: "select",
      name: "oauthtype",
      message: "How would you like to authenticate with Service Now instance?",
      choices: [
        {title: "OAuth with Code", value: "oauth-token"},
        {title: "OAuth with Username/Password", value: "oauth-password"}
      ],
      initial: 0
    },
    {
      type: "confirm",
      name: "createclient",
      message: "Would you like to create OAuth Client?"
    },
    {
      type: "text",
      name: "clientid",
      message: "Please enter OAuth client ID"
    },
    {
      type: "text",
      name: "clientsecret",
      message: "Please enter OAuth client secret"
    },
    {
      type: (prev, values) => values.oauthtype === "oauth-password" && "text",
      name: "username",
      message: "Please enter username to authenticate"
    },
    {
      type: (prev, values) => values.oauthtype === "oauth-password" && "password",
      name: "password",
      message: "Please enter password to authenticate"
    }
  ];

  let cancelled = false;
  const response = await prompts(questions, {
    onCancel() {
      cancelled = true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async onSubmit(prompt, answer, answers: any) {
      if (prompt.name === "createclient" && answer === true) {
        const newClient = oauthClient.getNewClientURL(answers.baseurl);
        log.verbose("Trying to open browser to create OAuth client");
        log.verbose(newClient.toString());
        await open(newClient.toString(), {app: {name: apps.browser}});
      }
    }
  });

  if (cancelled) {
    log.warning("Prompt cancelled");
    return;
  }
  log.info(JSON.stringify(response, undefined, 2));

  const profile = profileManager.fromData({
    name: name,
    baseUrl: response.baseurl,
    proxyUrl: options.proxy ? response.proxy : undefined,
    auth: {
      type: response.oauthtype,
      clientID: response.clientid,
      clientSecret: response.clientsecret,
      lastRetrieved: 0
    }
  });

  if (response.oauthtype === "oauth-password") {
    log.warning("Using username/password combination to authenticate with Service Now instance.");
    log.warning("Remember that provided user has to be logged on the instance and have interactive session.");
    log.warning(`!!! ${colors.underline("Username and password are not saved")}, to change user or authentication type run \`profile reauth\` !!!`);

    // TODO: handle errors
    // await oauth.requestTokenByUsername(profile, response.username, response.password);
  }

  // If oauth-token
  // Create http server
  // Open code url in browser
  // Receive code by server
  // Kill server

  // If oauth-password
  // Request token with username & password

  // const rest = new RESTClient(oauth);
});

export { createCommand };