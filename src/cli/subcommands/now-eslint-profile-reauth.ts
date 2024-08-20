/* eslint-disable @stylistic/js/max-len */
import * as commander from "commander";

import * as helpers from "../helpers.js";
import { CommandLogger } from "../helpers/CommandLogger.js";
import prompts, { PromptObject } from "prompts";
import profileManager, { Profile } from "../../core/ProfileManager.js";

const log = new CommandLogger();
const reauthCommand = new commander.Command("reauth")
  .configureOutput({
    outputError: CommandLogger.outputWarning
  })
  .description("Command to reauthenticate against Service Now instance. Use -u to change the authentication type; if username/password are used, they can be changed via this command")
  .argument("[name]", "name of the profile to set up (lowecase/uppercase letters, numbers, underscore and dash)", helpers.validateProfileName)
  .option("-t, --oauth-type", "Update authentication type")
  .option("-i, --client-id", "Update client id and client secret")
  .option("-s, --client-secret", "Update client secret")
  // FIXME: .option("-u, --update-user", "Update authentication user")
  .action(async function(name, options) {
    let profile: Profile | null = null;
    if (name != null) {
      if (!profileManager.profileExists(name)) {
        log.error(`Selected profile with name '${name}' does not exists.`);
        return;
      }
      profile = await profileManager.loadProfile(name);
    }

    const questions: PromptObject[] = [
      {
        type: () => name == null && "select",
        name: "name",
        message: "Please select profile",
        choices: profileManager.listProfiles().map((info) => {
          return {
            title: `${info.name} (${info.baseUrl})`,
            value: info.name
          };
        }),
        initial: 0,
        format: async(value) => {
          profile = await profileManager.loadProfile(value);
          return value;
        }
      },
      {
        type: () => options.oauthType === true && "select",
        name: "oauthtype",
        message: "How would you like to authenticate with Service Now instance?",
        choices: [
          {title: "OAuth with Code", value: "oauth-token"},
          {title: "OAuth with Username/Password", value: "oauth-password"}
        ],
        initial: 0
      },
      {
        type: (prev, values) => (values.oauthtype === "oauth-token" || (options.clientID === true && profile?.getOAuthType() === "oauth-token")) && "text",
        name: "clienid",
        message: "Please enter OAuth client ID"
      },
      {
        type: (prev, values) => (values.oauthtype === "oauth-token" || ((options.clientID === true || options.clientSecret === true) && profile?.getOAuthType() === "oauth-token")) && "text",
        name: "clientsecret",
        message: "Please enter OAuth client secret"
      },
      {
        type: (prev, values) => (values.oauthtype === "oauth-password" || (values.oauthtype !== "oauth-token" && profile?.getOAuthType() === "oauth-password")) && "text",
        name: "username",
        message: "Please enter username to authenticate"
      },
      {
        type: (prev, values) => (values.oauthtype === "oauth-password" || (values.oauthtype !== "oauth-token" && profile?.getOAuthType() === "oauth-password")) && "password",
        name: "password",
        message: "Please enter password to authenticate"
      }
    ];

    const response = await prompts(questions);
    log.info(JSON.stringify(response, undefined, 2));
  });
export {reauthCommand};