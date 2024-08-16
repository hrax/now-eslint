/* eslint-disable no-console */
import { InvalidArgumentError } from "commander";
import { red, green } from "colors/safe";
import { ProfileManager } from "../core/ProfileManager.js";

export const DOMAIN_REGEXP = /^https?:\/\/.*?\/?$/;
export const DOMAIN_HELP = "must start with 'http(s)://' and should end with '/'";
export const DOMAIN_ERROR = `ServiceNow instance URL ${DOMAIN_HELP}`;

export const PROFILE_HELP = "must contain lowecase/uppercase letters, numbers, underscore or dash";

export function validateDomain(value: string) {
  if (DOMAIN_REGEXP.test(value)) {
    return value;
  }
  throw new InvalidArgumentError(DOMAIN_ERROR);
}
export function validateProfileName(value: string) {
  if (ProfileManager.isProfileNameValid(value)) {
    return value;
  }
  throw new InvalidArgumentError(`Profile name ${PROFILE_HELP}`);
}
export function validateFileName(value: string) {
  if (ProfileManager.isProfileNameValid(value)) {
    return value;
  }
  throw new InvalidArgumentError("'file-name' can only contain lowecase/uppercase letters, numbers, underscore and dash.");
}
export function outputError(str: string, write = console.error) {
  write(`${red(str)}`);
}
export function outputInfo(str: string, write = console.info) {
  write(`${str}`);
}
export function outputDebug(str: string, write = console.debug) {
  write(`${str}`);
}
export function outputKeyValue(key: string, value: string, newLine = false, write = console.debug) {
  write(`${key}: ${green(value)}${newLine ? "\n" : ""}`);
}
export function boolYesNo(bool: boolean) {
  return bool === true ? "Yes" : "No";
}