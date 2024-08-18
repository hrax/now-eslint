import commander from "commander";
import * as helpers from "../helpers.js";

const reportCommand = new commander.Command("report")
  .description("Command to generate update set eslint report from Service Now instance")
  .configureOutput({outputError: helpers.outputError})
  .argument("<profileName>", `name of the profile; ${helpers.PROFILE_HELP}`, helpers.validateProfileName)
  .option("-t, --title <name>", "title of the report (in quotes if multiword)")
  .option("-f, --file-name <name>", "file name of the report without an extension", helpers.validateFileName)
  .option("-q, --query <query>", "update set query to perform report on (in quotes if multiword)")
  /*
    * .option("--json", "generate report as JSON rather than PDF report")
    * .option("--with-json", "generate JSON for the PDF report; ignored if option --json is used")
    * .option("--from-json <jsonPath>", "generate PDF report from provided JSON file; ignores all options")
    */
  .addOption(helpers.debugOption())
  .showHelpAfterError()
  .action(async(name, options) => {
  // TODO:
  });

export {reportCommand};