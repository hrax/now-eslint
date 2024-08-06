const { name, version, description } = require("../../package.json");

export class Package {
  static readonly NAME = name;
  static readonly VERSION = version;
  static readonly DESCRIPTION = description;
}