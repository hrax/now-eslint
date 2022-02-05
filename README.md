# NOW ESLint ![Test](https://github.com/hrax/now-eslint/workflows/Test/badge.svg) 

NodeJS CLI/Library to lint scripts in update set changes on Service Now instances based on the user table configuration. Offers independent lint configuration with possibility to utilize custom ESLint plugins compared to the solution provided by Service Now out-of-box.

Primary goal is to be utilized by user locally using CLI, however option to generate JSON should allow this to be utilized in mid server as an extension to automate release processes using Service Now instance.

Update sets need to be committed locally on the configured instance. Change in the committed update set is linted independently on the current version of the record on the instance. Update sets can be linted on instance utilizing custom/vanity url as long as the configuration allows for REST API access.

*For latest changes see [Patch Notes](#patch-notes).*

### 3rd party pesources
- **Calibri**; a sans-serif typeface household developed by Luc(as) de Groot in 2002-2004 and introduced to the general public in 2007 \([download](https://www.downloadfonts.io/calibri-font-family-free/)\)

> Minimum required NodeJS version to run `now-eslint` is 12.22

# NOW ESLint as CLI

## Installation

CLI is the primary usage of the package, and it is recommended to install the package globally using

```
npm i -g @hrax/now-eslint
```

**The global installation requires to have ESLint and all its required plugins installed globally as well.**

## Quickstart

If you already have `now-eslint` and ESLint installed, this short tutorial will show you how to get started in few easy steps.

### Step 0: Locate a directory for your reports

Let's create a new directory where you will execute the command and have the PDF report generated.

```
mkdir now-eslint-reports
cd now-eslint-reports
```

### Step 1: Create a profile for your ServiceNow instance

To be able to execute a scan you will need to create a profile for your ServiceNow instance. This will create a new directory named `.now-eslint-profiles` in your home directory where all profiles will be stored.

```
now-eslint profile quickstart
```

This will prompt you to provide URL to your ServiceNow instance, username and password that will be used to connect. See (Required instance access rights)[#required-instance-access-rights] for more details.

After that the command will try to test the connection to your instance and will download the basic configuration of the tables that will be eventually scanned - all tables that contain a field of type `script`, `script_plain` or `script_server`.

### Step 2: Copy your eslint configuration is into the folder

By default ESLint will look for any eslint configuration file, in the directory you are executing command in or any of its parents. Let's copy one into our `now-eslint-reports` folder.

### Step 3: Run the report command

Now, you should be ready to run your first update set scan and generate its ESLint report. Replace `[myupdateset]` with the name of your local update set on the instance in the following command.

```
now-eslint report quickstart -t "My quickstart report" -q "name=[myupdateset]" -f quickstart-report
```

Once executed, command will look for the profile named `quickstart` that we have created earlier. It will connect to the ServiceNow instance saved in the profile and will query for all update set changes which update set matches the encoded query `name=[myupdateset]`.

After all update set changes have been identified, command will select only those that belong to any of the configured tables in the profile and will perform a ESLint scan on the configured table fields and save the results into a report file named `quickstart-report.pdf`

### Step 4: Open and read the report

The folder where you executed report command should now contain a file named `quickstart-report.pdf`. You should be able to open it in any PDF reader or locally installed browser. You will find the list of all changes that were present in the update set and their linting results.

## Help

You are able to get a list of all subcommands and their help by adding `--help`
after the command such as:

```
now-eslint --help
now-eslint report --help
now-eslint profile --help
```

## ServiceNow instance profile customization

**TODO:**

# NOW ESLint as Library

## Installation

Library is the secondary usage of the package, and it is recommended to install the package into your project using

```
npm i @hrax/now-eslint
```

ESLint and its dependencies should be installed in your project as well.

## Examples

See [examples](https://github.com/hrax/now-eslint/blob/master/examples/) folder for more details on executing NowLinter as a library.

# Required instance access rights

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

# TODO/Nice to have

- TODO: report; i18n; allow for reports to be translated
- TODO: profile; allow basic color/font customization
- TODO: profile; allow extended report customization via separate json file in profile folder
- TODO: linter; allow to skip linting default non-calculated values
- TODO: linter; allow to mark and skip changes that have field "active" = false
- TODO: linter; allow to conditionally lint fields (e.g. if other_field is true/false or if other_field is empty/not empty)
- Nice to have: linter; custom parser for complex changes (e.g. `wf_workflow_version`) to be able to lint selected nested complex records

# Patch Notes
## v0.0.4

- **Updated `nodejs` engine to minimum supported NodeJS version 12.22**
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


## v0.0.3

- Updated ESLint to v7.8.1
- Removed use of deprecated ESLint CLI as a preparation for ESLint v8.  
  This resulted in change of property `cliEngine` with `eslint`. Running `now-eslint setup` in new folder is recommended; you can then copy the new generated `config.json` to the old folder or keep using the new one.
