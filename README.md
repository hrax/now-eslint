# now-eslint
NodeJS command to lint script update set changes on Service Now instances

## Installation

Execute `npm install` command to install all of the required dependencies.

Execute `npm link eslint` command to link the eslint dependency to your global eslint installation; local eslint dependency is not provided.

Rename config.json-example to config.json and modify it as follows:
- domain: url to the service now domain; must end with "/"
- username: username to connect as (it is best to use read only admin account; if not available role access to sys_update_set and sys_update_xml tables is needed)
- password: password of the username above
- query: Endoded query from sys_update_set list returning update sets to be linted
- name: file name that should be used to save the report as; without file extension, all reports are/will be HTML
- report: file name of the report template that should be used to generate a report
- tables: set of tables that should be additionally checked (extends the tables.json file)
- cliEngine: options for the ESLint CLIEngine as specified at https://eslint.org/docs/developer-guide/nodejs-api#cliengine
