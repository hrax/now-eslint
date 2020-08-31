# NOW ESLint

![Build/Test Master](https://github.com/hrax/now-eslint/workflows/Build/Test%20Master/badge.svg) 

NodeJS CLI/Library to lint scripts in update set changes on Service Now instances based on the user table configuration. Offers independent lint configuration with possibility to utilize custom ESLint plugins compared to the solution provided by Service Now out-of-box.

Primary goal is to be utilized by user locally using CLI, however option to generate JSON should allow this to be utilized in mid server as an extension to automate release processes using Service Now instance.

Update sets need to be committed locally on the configured instance. Change in the committed update set is linted independently on the current version of the record on the instance. Update sets can be linted on instance utilizing custom/vanity url as long as the configuration allows for REST API access.

## CLI

### Installation

CLI is the primary usage of the package, and it is recommended to install the package globally using

```
npm i -g @hrax/now-eslint
```

The global installation required to have eslint and all its required plugins installed globally as well.

### Setup

Setup for the CLI should be executed in the folder where you want your reports to be generated. Once you have selected the folder, execute command

```
now-eslint setup
```

You will be guided through a series of questions to set up your connection to the instance, test it and have a possibility of a table structure to be generated directly from the configured instance.

After the command has been completed, the folder you executed it in, should now contain 4 files: `.ENV`, `config.json`, `tables.json` and `template.ejs`.

Their usage is as follows

 * `.ENV` - This is where the connection information to your instance is saved
 * `config.json` - Tables and ESLint CLI configuration; tables in this file, override tables configured in `tables.json`
 * `tables.json` - Tables and field configuration, usually generated from the instance
 * `template.ejs` - HTML template used to generate the HTML Report. You can update this file as you wish to change the visual or functionality of the generated report

### Execution

To generate an update set report, you should execute following command in the same folder you have set up step earlier.

Update set changes are linted against `.eslintrc` present in the configured folder or in user's profile directory. You can specify custom ESLint CLI config file by using `configFile` in the `config.json` `cliEngine` property.

```
now-eslint report
```

You will be guided through a series of questions to provide name, filename and update set query for your report.

Note that linter currently does not allow reporting on custom XML serialized Service Now records such as 'Workflows'. If you encounter such an error, you can specify the table to be skipped in the `config.json` `tables` property.

## Library

### Installation

Library is the secondary usage of the package, and it is recommended to install the package into your project using

```
npm i @hrax/now-eslint
```

ESLint and its dependencies should be installed in your project as well.

### Examples

```javascript
// Load the linter
const {NowLinter} = require("@hrax/now-eslint");

// Configure connection object
const connection = {
  domain: "",
  username: "",
  password: ""
};

// Configuration of the linter, only title and query is mandatory
const config = {
  title: "",
  query: "",
  tables: {},
  cliEngine: {}
};

// Tables to be linted, in format "table_name"; [field1, field2]
const tables = {
  "sys_script_include": ["script"]
};

// Must, until the top-level awaits is enabled
(async () => {
  const linter = new NowLinter(connection, config, tables);
  // the JSON report on the updates in the update sets
  const report = await linter.report();
})();
```

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
