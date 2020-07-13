# now-eslint
NodeJS command to lint script update set changes on Service Now instances

## Download

- Download [latest development version](https://github.com/hrax/now-eslint/archive/master.zip) or check [releases](https://github.com/hrax/now-eslint/releases) for the latest available release

## Installation

Execute `npm install` command to install all of the required dependencies.

Execute `npm link eslint` command to link the eslint dependency to your global eslint installation; local eslint dependency is not provided. (ESLint version tested: v5.16.0)

## Setup

Execute `npm run setup` command to setup connection to the instance.

Rename `config.json-example` to `config.json` and modify it as follows:
- `query`: Endoded query from sys_update_set list returning update sets to be linted
- `title`: The tile of the report
- `name`: file name that should be used to save the report as; without file extension, all reports are in HTML
- `template`: file name of the report template that should be used to generate a report; report template must be located in templates folder, be a html file and must be specified without the extension
- `tables`: set of tables that should be additionally checked (extends the tables.json file); optional can be removed from the configuration
- `cliEngine`: options for the [ESLint CLIEngine](https://eslint.org/docs/developer-guide/nodejs-api#cliengine); optional can be removed from the configuration

Execute `npm run generate` command to generate basic set of table configuration for the configured instance or use `tables.json-example` as sample table configuration.

## Execution

To run the ESLint on the selected set of update sets on configured instance you will need following:
- Modify property `query` in `config.json` to match the update sets you want to check
- Modify property `title` in `config.json` to match set the title of your report
- Modify property `name` in `config.json` to match the name under which you want to save your report
- (optional) Modify property `template` in `config.json` to match the name of the template used to render the report

Execute `npm run report` command to run and generate your report. Report command will save generated HTML report as well as the report data in JSON format, so they can be processed later if necessary.

## Command Table Access

### report

- `sys_update_xml`
- `sys_update_set`

### generate

- `sys_dictionary`

## TODO/Nice to have

- TODO: HTTPs Proxy; unauthorized requests should not be rejected anymore
- TODO: Optimalize generated reports to minimize the file size
- TODO: Check if the specified template exists
- TODO: Backup old report if the same name report exists
- TODO: Allow to mark and skip changes that have field "active" = false
- Nice to have: option to generate report as PDF
- Nice to have: generate each report into special folder
