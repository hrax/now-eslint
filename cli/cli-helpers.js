const {InvalidArgumentError} = require("commander");

const colors = require("colors/safe");

const Profile = require("../src/Profile");

const DOMAIN_REGEXP = /^https?:\/\/.*?\/?$/;
const DOMAIN_HELP = "must start with 'http(s)://' and should end with '/'";
const DOMAIN_ERROR = `ServiceNow instance URL ${DOMAIN_HELP}`;

const PROFILE_HELP = "must contain lowecase/uppercase letters, numbers, underscore and dash";

module.exports = {
  DOMAIN_REGEXP: DOMAIN_REGEXP,
  DOMAIN_HELP: DOMAIN_HELP,
  DOMAIN_ERROR: DOMAIN_ERROR,
  validateDomain: (value) => {
    if (DOMAIN_REGEXP.test(value)) {
      return value;
    }
    throw new InvalidArgumentError(DOMAIN_ERROR);
  },

  PROFILE_HELP: PROFILE_HELP,
  /**
   * Validates if value matches profile name pattern
   * @param {String} value 
   * @returns value if value matches profile name pattern
   * @throws InvalidArgumentError if value does not match
   */
  validateProfileName: (value) => {
    if (Profile.isProfileNameValid(value)) {
      return value;
    }
    throw new InvalidArgumentError(`Profile name ${PROFILE_HELP}`);
  },
  validateFileName: (value) => {
    if (Profile.isProfileNameValid(value)) {
      return value;
    }
    throw new InvalidArgumentError("'file-name' can only contain lowecase/uppercase letters, numbers, underscore and dash.");
  },

  outputError: (str, write = console.error) => {
    write(`${colors.red(str)}`);
  },
  outputInfo: (str, write = console.info) => {
    write(`${str}`);
  },
  outputDebug: (str, write = console.debug) => {
    write(`${str}`);
  },
  outputKeyValue: (key, value, newLine = false, write = console.debug) => {
    write(`${key}: ${colors.green(value)}${newLine ? "\n" : ""}`);
  },
  boolYesNo: (bool) => {
    return bool === true ? "Yes" : "No";
  }
};