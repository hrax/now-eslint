# NOW ESLint
Library and CLI to lint code in Update Set changes

## Repository setup


## CLI

### Installation

If the primary usage of the package will be CLI, it is recommended to install the package globally using

    npm i -g @hrax/now-eslint

The global installation required to have eslint and all its required plugins installed globally as well.

### Setup

Setup for the CLI should be executed in the folder where you want your reports to be generated. Once you have selected the folder, execute command

    now-eslint setup

You will be guided through a series of questions to set up your connection to the instance, test it and have a possibility of a table structure to be generated directly from the configured instance.

After the command has been completed, the folder you executed it in, should now contain 4 files: `.ENV`, `config.json`, `tables.json` and `template.ejs`.

### Execution

Execute `npm run report` command to run and generate your report. Report command will save generated HTML report as well as the report data in JSON format, so they can be processed later if necessary.

### CLI Access

CLI uses NOW REST API to read necessary information. Easiest setup would be to give the account `snc_read_only` and `admin` roles. If that is by any chance not possible, make sure account has read access to the following tables as well as access to the REST API.

#### report CLI

- `sys_update_xml`
- `sys_update_set`

#### setup CLI

- `sys_dictionary`
- `sys_db_object`


## Library

### Installation

### Examples

## TODO/Nice to have

- TODO: TESTS, TESTS, TESTS, TESTS, TESTS, TESTS, TESTS, TESTS!!!
- TODO: HTTPs Proxy; unauthorized requests should not be rejected anymore
- TODO: Optimalize generated reports to minimize the file size
- TODO: Check if the specified template exists
- TODO: Allow to mark and skip changes that have field "active" = false
- TODO: Allow to conditionally lint fields (e.g. if other_field is true/false or if other_field is empty/not empty)
- TODO: setup to run against specific eslint config not the project one!
- Nice to have: option to generate report as PDF
- Nice to have: generate each report into special folder
- Nice to have: instance profiles
- Nice to have: generate table conditional field configuration based on dictionary dependent field?
- Nice to have: custom parse complex changes (e.g. workflow) to be able to lint selected nested complex records
