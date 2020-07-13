# now-eslint
NodeJS command to lint script update set changes on Service Now instances

## Download

- Download [latest development version](https://github.com/hrax/now-eslint/archive/master.zip) or check [releases](https://github.com/hrax/now-eslint/releases) for the latest available release

## Installation

Execute `npm install` command to install all of the required dependencies.

Execute `npm link eslint` command to link the eslint dependency to your global eslint installation; local eslint dependency is not provided. (ESLint version tested: v5.16.0)

## Setup

Execute `npm run setup` command to setup connection to the instance and to generate default linter configuration.

After the setup has been completed you have an option to set additonal configuration in `config.json`:
- `template`: file name of the report template that should be used to generate a report; report template must be located in templates folder, be a html file and must be specified without the extension
- `tables`: set of tables that should be additionally checked (extends the tables.json file); optional can be removed from the configuration
- `cliEngine`: options for the [ESLint CLIEngine](https://eslint.org/docs/developer-guide/nodejs-api#cliengine); optional can be removed from the configuration

## Execution

Execute `npm run report` command to run and generate your report. Report command will save generated HTML report as well as the report data in JSON format, so they can be processed later if necessary.

## CLI Access

CLI uses NOW REST API to read necessary information. Easiest setup would be to give the account `snc_read_only` and `admin` roles. If that is by any chance not possible, make sure account has read access to the following tables.

### report CLI

- `sys_update_xml`
- `sys_update_set`

### setup CLI

- `sys_dictionary`
- `sys_db_object`

## TODO/Nice to have

- TODO: HTTPs Proxy; unauthorized requests should not be rejected anymore
- TODO: Optimalize generated reports to minimize the file size
- TODO: Check if the specified template exists
- TODO: Allow to mark and skip changes that have field "active" = false
- Nice to have: option to generate report as PDF
- Nice to have: generate each report into special folder
- Nice to have: instance profiles
