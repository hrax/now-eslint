# NOW ESLint
NodeJS CLI to lint script update set changes on Service Now instances based on the user table configuration. Offers independent lint configuration with possibility to utilize custom ESLint plugins compared to the solution provided by Service Now out-of-box.

Primary goal is to be utilized by user locally from their own PC, however option to generate JSON should allow this to be utilized in mid server as an extension to automate release processes using Service Now instance.

Update sets need to be committed locally on the configured instance. Change in the committed update set is linted independently on the current version of the record on the instance. Update sets can be linted on instance utilizing custom/vanity url as long as the configuration allows for REST API access.

## Download

- Download [latest development version](https://github.com/hrax/now-eslint/archive/master.zip) or check [releases](https://github.com/hrax/now-eslint/releases) for the latest available release

## Installation

Execute `npm install` command to install all of the required dependencies.

Execute `npm link eslint` command to link the eslint dependency to your global eslint installation; local eslint dependency is not provided. (ESLint version tested: v5.16.0)

## Setup

Execute `npm run setup` command to setup connection to the instance and to generate default linter configuration.

After the setup has been completed you have an option to set additonal configuration in `conf/config.json`:
- `template`: file name of the report template that should be used to generate a report; report template must be located in templates folder, be a html file and must be specified without the extension
- `tables`: set of tables that should be additionally checked (extends the `conf/tables.json` file); optional can be removed from the configuration
- `cliEngine`: options for the [ESLint CLIEngine](https://eslint.org/docs/developer-guide/nodejs-api#cliengine); optional can be removed from the configuration

## Execution

Execute `npm run report` command to run and generate your report. Report command will save generated HTML report as well as the report data in JSON format, so they can be processed later if necessary.

## CLI Access

CLI uses NOW REST API to read necessary information. Easiest setup would be to give the account `snc_read_only` and `admin` roles. If that is by any chance not possible, make sure account has read access to the following tables as well as access to the REST API.

### report CLI

- `sys_update_xml`
- `sys_update_set`

### setup CLI

- `sys_dictionary`
- `sys_db_object`

## TODO/Nice to have

- TODO: TESTS, TESTS, TESTS, TESTS, TESTS, TESTS, TESTS, TESTS!!!
- TODO: HTTPs Proxy; unauthorized requests should not be rejected anymore
- TODO: Optimalize generated reports to minimize the file size
- TODO: Check if the specified template exists
- TODO: Allow to mark and skip changes that have field "active" = false
- TODO: Allow to conditionally lint fields (e.g. if other_field is true/false or if other_field is empty/not empty)
- Nice to have: option to generate report as PDF
- Nice to have: generate each report into special folder
- Nice to have: instance profiles
- Nice to have: generate table conditional field configuration based on dictionary dependent field?
- Nice to have: custom parse complex changes (e.g. workflow) to be able to lint selected nested complex records
