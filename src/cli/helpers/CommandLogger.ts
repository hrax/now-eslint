/* eslint-disable no-console */
import { Option } from "commander";
import colors from "colors/safe.js";

export class CommandLogger {
  private _debug = false;
  private _verbose = false;
  private out = console;

  setDebug(debug?: boolean): CommandLogger {
    this._debug = debug ?? false;
    return this;
  }
  isDebug(): boolean {
    return this._debug;
  }
  setVerbose(verbose?: boolean): CommandLogger {
    if (this.isDebug() && verbose === true) {
      this.debug("Debug is on, verbose will be ignored");
      return this;
    };
    this._verbose = verbose ?? false;
    return this;
  }
  isVerbose(): boolean {
    return this._verbose;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromOptions(options: any): void {
    this.setDebug(options.debug)
      .setVerbose(options.verbose);
  }
  debug(message: string): void {
    if (this.isDebug()) {
      CommandLogger.outputDebug(message);
    }
  }
  verbose(message: string): void {
    if (this.isVerbose() || this.isDebug()) {
      CommandLogger.outputInfo(message);
    }
  }
  info(message: string): void {
    CommandLogger.outputInfo(message);
  }
  warning(message: string): void {
    CommandLogger.outputWarning(message);
  }
  error(message: string): void {
    CommandLogger.outputError(message);
  }

  static debugOption(description?: string): Option {
    return new Option("--debug", description ?? "Print debug details of the command execution");
  }
  static verboseOption(description?: string): Option {
    return new Option("--verbose", description ?? "Print details about command execution");
  }
  
  static outputWarning(str: string, write = console.error): void {
    write(`${colors.yellow(str)}`);
  }
  static outputError(str: string, write = console.error): void {
    write(`${colors.red(str)}`);
  }
  static outputInfo(str: string, write = console.info): void {
    write(`${str}`);
  }
  static outputDebug(str: string, write = console.debug): void {
    write(`[DEBUG] ${str}`);
  }
  static outputKeyValue(key: string, value: string, newLine = false): void {
    CommandLogger.outputInfo(`${key}: ${colors.green(value)}${newLine ? "\n" : ""}`);
  }
}