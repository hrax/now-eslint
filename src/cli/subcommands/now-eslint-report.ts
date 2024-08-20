import * as commander from "commander";
import * as helpers from "../helpers.js";
import prompts, { PromptObject } from "prompts";
import { CommandLogger } from "../helpers/CommandLogger.js";


const reportCommand = new commander.Command("report")
  .configureOutput({
    outputError: CommandLogger.outputWarning
  })
  .description("Command to generate update set eslint report from Service Now instance")
  .argument("<profileName>", `name of the profile; ${helpers.PROFILE_HELP}`, helpers.validateProfileName)
  // .option("-t, --title <name>", "title of the report (in quotes if multiword)")
  // .option("-n, --file-name <name>", "file name of the report without an extension", helpers.validateFileName)
  // .option("-q, --query <query>", "update set query to perform report on (in quotes if multiword)")
  /*
    * .option("--json", "generate report as JSON rather than PDF report")
    * .option("--with-json", "generate JSON for the PDF report; ignored if option --json is used")
    * .option("--from-json <jsonPath>", "generate PDF report from provided JSON file; ignores all options")
    */
  .addOption(CommandLogger.verboseOption())
  .addOption(CommandLogger.debugOption())
  .showHelpAfterError()
  .action(async(profile, options) => {
  // TODO:
    const questions: PromptObject[] = [
      {
        type: "text",
        name: "title",
        message: "Title of the report"
      },
      {
        type: "text",
        name: "filename",
        message: "File name of the report"
      },
      {
        type: "text",
        name: "query",
        message: "Update set query"
      }
    ];

    const response = await prompts(questions);
    CommandLogger.outputInfo(JSON.stringify(response, undefined, 2));
  });

export {reportCommand};