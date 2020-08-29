# NOW ESLint
CLI and script library to lint code in Update Set changes

## Repository setup

To be able to install or update packages from GitHub's NPM repository, you will need need to have following line added in the `.npmrc` file in your project or user profile directory

    @hrax:registry=https://npm.pkg.github.com/

Please note that the setup above will only work for packages under scope `@hrax`.

To be able to download any scoped package from GitHub, the repository setup needs to be as follows

    registry=https://npm.pkg.github.com/

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

Their usage is as follows

 * `.ENV` - This is where the connection information to your instance is saved
 * `config.json` - Tables and ESLint CLI configuration; tables in this file, override tables configured in `tables.json`
 * `tables.json` - Tables and field configuration, usually generated from the instance
 * `template.ejs` - HTML template used to generate the HTML Report

### Execution

To generate an update set report, you should execute following command in the same folder you have set up step earlier.

    now-eslint report

You will be guided through a series of questions to provide name, filename and update set query for your report.

## Library

### Installation

### Examples

## Required Instance Access Rights

We use Service Now REST API to read necessary information from the instance. Easiest setup would be to give the account `snc_read_only` and `admin` roles. If that is by any chance not possible, make sure account has read access to the following tables as well as access to the REST API.

#### Load table-field and table-parent information/setup CLI

- `sys_dictionary`  
fields:  
    - name
    - element
- `sys_db_object`  
fields:  
    - name
    - super_class.name

#### Fetch update set data/report CLI

- `sys_update_xml`  
fields:  
    - name
    - sys_id
    - action
    - sys_created_by
    - sys_created_on
    - sys_updated_by
    - sys_updated_on
    - type
    - target_name
    - update_set
    - payload
- `sys_update_set`  
fields:  
    - sys_id

## TODO/Nice to have

- TODO: HTTPs Proxy; unauthorized requests should not be rejected anymore
- TODO: Optimalize generated reports to minimize the file size
- TODO: Allow to mark and skip changes that have field "active" = false
- TODO: Allow to conditionally lint fields (e.g. if other_field is true/false or if other_field is empty/not empty)
- TODO: setup to run against specific eslint config not the project one!
- Nice to have: option to generate report as PDF
- Nice to have: generate table conditional field configuration based on dictionary dependent field?
- Nice to have: custom parse complex changes (e.g. workflow) to be able to lint selected nested complex records
