# NOW ESLint v1.0.0

NodeJS CLI/Library to lint scripts in update set changes on Service Now instances based on the user table configuration. Offers independent lint configuration with possibility to utilize custom ESLint plugins compared to the solution provided by Service Now out-of-box.

Primary goal is to be utilized by user locally using CLI, however option to generate JSON should allow this to be utilized in mid server as an extension to automate QA/release processes using Service Now instance.

Update sets need to be available locally (must be found in Local Update Sets table) on the configured instance. Changes in the provided update sets are linted independently on the current version of the record on the instance. Update sets can be linted on instance utilizing custom/vanity url as long as the configuration allows for REST API access.

*For latest changes see [Patch Notes](https://github.com/hrax/now-eslint/wiki/Patch-Notes).*

### 3rd party pesources
- **Calibri**; a sans-serif typeface household developed by Luc(as) de Groot in 2002-2004 and introduced to the general public in 2007 \([download](https://www.downloadfonts.io/calibri-font-family-free/)\)

**Minimum required NodeJS version to run `now-eslint` is 12.22**

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

Let's create a new directory named `now-eslint-reports` where you will execute the command and have the PDF report generated.

```
mkdir now-eslint-reports
cd now-eslint-reports
```

### Step 1: Create a profile for your ServiceNow instance

To be able to execute a scan you will need to create a profile for your ServiceNow instance. This will create a new directory named `.now-eslint-profiles` in your home directory where all profiles will be stored.

Let's name this profile `quickstart`.

```
now-eslint profile quickstart
```

This will prompt you to provide URL to your ServiceNow instance, username and password that will be used to connect and if needed you will be able to enter proxy connection URL. See [Required instance access rights](#required-instance-access-rights) for more details.

After that the command will try to test the connection to your instance and will download the basic configuration of the tables that will be eventually scanned - all tables that contain a field of type `script`, `script_plain` or `script_server`.

### Step 2: Copy your eslint configuration is into the folder

By default ESLint will look for any eslint configuration file, in the directory you are executing command in or any of its parents. Let's copy one into our `now-eslint-reports` folder.

### Step 3: Run the report command

Now, you should be ready to run your first update set scan and generate its ESLint report. Replace `[myupdateset]` with the name of your local update set on the instance in the following command.

```
now-eslint report quickstart -t "My quickstart report" -q "name=[myupdateset]" -f quickstart-report
```

Once executed, command will look for the profile named `quickstart` that we have created earlier. It will connect to the ServiceNow instance saved in the profile and will query for all update set changes whose update set matches the encoded query `name=[myupdateset]`.

After all update set changes have been identified, command will select only those that belong to any of the tables configured in the profile and will perform an ESLint scan on the table fields and save the results into a report file named `quickstart-report.pdf`

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

See NOW ESLint wiki [Customizing profile](https://github.com/hrax/now-eslint/wiki/Customizing-Profile).

# NOW ESLint as Library

## Installation

Library is the secondary usage of the package, and it is recommended to install the package into your project using

```
npm i @hrax/now-eslint
```

ESLint and its dependencies should be installed in your project as well.

## Examples

See [examples](https://github.com/hrax/now-eslint/blob/master/examples/) folder for more details on executing NowLinter as a library.