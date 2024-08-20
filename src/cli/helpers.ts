/* eslint-disable no-console */
import { InvalidArgumentError, Option } from "commander";
import * as ProfileManager from "../core/ProfileManager.js";

export const DOMAIN_REGEXP = /^https?:\/\/.*?\/?$/;
export const DOMAIN_HELP = "must start with 'http(s)://' and can end with '/'";
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

export function forceOption(): Option {
  return new Option("--force");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isForce(options: any): boolean {
  return options.force === true;
}

export function boolYesNo(bool: boolean) {
  return bool === true ? "Yes" : "No";
}