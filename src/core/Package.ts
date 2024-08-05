const { name, version } = require("../../package.json");

export class Package {

  static readonly NAME = name;
  static readonly VERSION = version;

}