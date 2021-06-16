# NOW ESLint ![Test](https://github.com/hrax/now-eslint/workflows/Test/badge.svg) 

NodeJS CLI/Library to lint scripts in update set changes on Service Now instances based on the user table configuration. Offers independent lint configuration with possibility to utilize custom ESLint plugins compared to the solution provided by Service Now out-of-box.

Primary goal is to be utilized by user locally using CLI, however option to generate JSON should allow this to be utilized in mid server as an extension to automate release processes using Service Now instance.

Update sets need to be committed locally on the configured instance. Change in the committed update set is linted independently on the current version of the record on the instance. Update sets can be linted on instance utilizing custom/vanity url as long as the configuration allows for REST API access.

*For latest changes see [Patch Notes](#patch-notes).*

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

After the command has been completed, the folder you executed it in, should now contain 1 file: `profile.json`.

### Execution

To generate an update set report, you should execute following command in the same folder you have set up step earlier.

Update set changes are linted against `.eslintrc` present in the configured folder or in user's profile directory. You can specify custom ESLint config file by using `overrideConfigFile` in the `config.json` `eslint` property.

```
now-eslint report
```

You will be guided through a series of questions to provide name, filename and update set query (for example "name=Default") for your report.

Note that linter currently does not allow reporting on custom XML serialized Service Now records such as 'Workflows'. If you encounter such an error, you can specify the table to be skipped in the `config.json` `tables` property.

## Library

### Installation

Library is the secondary usage of the package, and it is recommended to install the package into your project using

```
npm i @hrax/now-eslint
```

ESLint and its dependencies should be installed in your project as well.

### Examples

see Examples folder

## Required Instance Access Rights

We use Service Now REST API to read necessary information from the instance. Easiest setup would be to give the account `snc_read_only` and `admin` roles. If that is by any chance not possible, make sure account has read access to the following tables as well as access to the REST API.

#### Load table-field and table-parent information/setup CLI

- `sys_dictionary`  
fields:  
    - name
    - element
    - default_value
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

- TODO: Allow to skip linting default values
- TODO: Allow to mark and skip changes that have field "active" = false
- TODO: Allow to conditionally lint fields (e.g. if other_field is true/false or if other_field is empty/not empty)
- TODO: setup to run against specific eslint config not the project one!
- Nice to have: custom parse complex changes (e.g. workflow) to be able to lint selected nested complex records

## Patch Notes
### v0.0.4

- Updated nodejs engine to support NodeJS v12
- Major refactoring and package separation (common ServiceNow objects v Linter specific)
- Replaced xml-js with xmldom and xpath parsing of update xml payload as it is more precise
- Added proxy connection url, that can be used in case proxy connection is required (proxy setting per profile)
- Replaced HTML report with PDF (which decreased the report size as well)
- Added NowProfile class that will be later used per-instance profile separation
- Updated current cli to work for CWD profile setup (will be refactored to profile separation)


### v0.0.3

- Updated ESLint to v7.8.1
- Removed use of deprecated ESLint CLI as a preparation for ESLint v8.  
  This resulted in change of property `cliEngine` with `eslint`. Running `now-eslint setup` in new folder is recommended; you can then copy the new generated `config.json` to the old folder or keep using the new one.
