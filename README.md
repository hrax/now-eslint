# NOW ESLint ![Test](https://github.com/hrax/now-eslint/workflows/Test/badge.svg) 

NodeJS CLI/Library to lint scripts in update set changes on Service Now instances based on the user table configuration. Offers independent lint configuration with possibility to utilize custom ESLint plugins compared to the solution provided by Service Now out-of-box.

Primary goal is to be utilized by user locally using CLI, however option to generate JSON should allow this to be utilized in mid server as an extension to automate release processes using Service Now instance.

Update sets need to be committed locally on the configured instance. Change in the committed update set is linted independently on the current version of the record on the instance. Update sets can be linted on instance utilizing custom/vanity url as long as the configuration allows for REST API access.

*For latest changes see [Patch Notes](#patch-notes).*

#### 3rd Party Resources
- **Calibri**; a sans-serif typeface household developed by Luc(as) de Groot in 2002-2004 and introduced to the general public in 2007 \([download](https://www.downloadfonts.io/calibri-font-family-free/)\)

> Minimum required NodeJS version to run `now-eslint` is 12.18

## CLI

### Installation

CLI is the primary usage of the package, and it is recommended to install the package globally using

```
npm i -g @hrax/now-eslint
```

**The global installation requires to have ESLint and all its required plugins installed globally as well.**

### Profile command

Setup for the CLI can be executed anywhere as the resulting profile will be saved in your home directory. Execute:

```
now-eslint setup
```

You will be guided through a series of questions to set up your profile, connection to the instance and proxy if needed.

After the command has succesfully completed, your home directory should contain folder `.now-eslint-profiles` with folder `profile_[yourprofilename]` which should contain 1 file: `profile.json`.

### Report

To generate an update set report, you should execute following command in the any folder where you have write rights to and want your report to be generated.

Update set changes are linted against `.eslintrc` present in the configured folder or in user's profile directory. You can specify custom ESLint config file by using `overrideConfigFile` in the `profile.json` `properties.eslint` property.

See example [A_02_customize_saved_profile.js](https://github.com/hrax/now-eslint/blob/master/examples/A_02_customize_saved_profile.js) for more information.

```
now-eslint report
```

You will be guided through a series of questions to provide name, filename and update set query (for example "name=Default") for your report.

Note that linter currently does not allow reporting on custom XML serialized Service Now records such as 'Workflows'. If you encounter such an error, you can specify the table to be skipped in the `profile.json` `tables` property.

### Profile Customization


## Library

### Installation

Library is the secondary usage of the package, and it is recommended to install the package into your project using

```
npm i @hrax/now-eslint
```

ESLint and its dependencies should be installed in your project as well.

### Examples

See [examples](https://github.com/hrax/now-eslint/blob/master/examples/) folder for more details on executing NowLinter as a library.

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

- TODO: i18n; allow for reports to be translated
- TODO: allow profile report customization via separate json file in profile folder
- TODO: Allow to skip linting default values
- TODO: Allow to mark and skip changes that have field "active" = false
- TODO: Allow to conditionally lint fields (e.g. if other_field is true/false or if other_field is empty/not empty)
- Nice to have: custom parse complex changes (e.g. workflow) to be able to lint selected nested complex records

## Patch Notes
### v0.0.4

- **Updated `nodejs` engine to minimum supported NodeJS version 12.18**
- Major refactoring and package separation (common ServiceNow objects vs Linter specific)
- better CLI using commander (see CLI section)
- Replaced xml-js with xmldom and xpath parsing of update xml payload as it is more precise
- Added proxy connection url, that can be used in case proxy connection is required (proxy setting per profile)
- Replaced HTML report with PDF (which decreased the report size as well)
- Added Profile class that is used per-instance profile separation
- Profile separation; profiles are stored in the current user home folder in folder `.now-eslint-profiles` and every profile folder has prefix `profile_`\
This can be overriden with `NOW_ESLINT_PROFILE_HOME` node environment variable
- ESLint can be configured per profile via 'eslint.json' placed in profile directory
- No resources copied to the profile
- Hopefully prepared the profiles for more customization


### v0.0.3

- Updated ESLint to v7.8.1
- Removed use of deprecated ESLint CLI as a preparation for ESLint v8.  
  This resulted in change of property `cliEngine` with `eslint`. Running `now-eslint setup` in new folder is recommended; you can then copy the new generated `config.json` to the old folder or keep using the new one.
