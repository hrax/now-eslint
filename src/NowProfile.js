const fs = require("fs");

const Assert = require("./util/Assert");
const NowInstance = require("./now/NowInstance");
const NowRequest = require("./now/NowRequest");
const NowReportGenerator = require("./NowReportGenerator");

class NowProfile {
  constructor(options) {
    Assert.notNull(options, "Options cannot be null!");
    Assert.isObject(options, "Options needs to be an object!");
    
    Assert.notEmpty(options.name, "Profile name cannot be empty!");
    Assert.notEmpty(options.domain, "ServiceNow instance domain cannot be empty!");
    Assert.notEmpty(options.username, "ServiceNow instance username cannot be empty!");
    Assert.notEmpty(options.password, "ServiceNow instance password cannot be empty!");

    // Cleanup domain; remove ending SEPARATOR
    if (options.domain.endsWith("/")) {
      options.domain = options.domain.slice(0, -1);
    }

    const version = require("../package.json").version;
    const propertyConfig = {
      configurable: false,
      writable: false,
      enumerable: true
    };

    this.tables = Object.assign({}, options.tables || {});

    // helper
    const decode = function(value) {
      if (value == null || value === "" || !value.startsWith)  {
        return null;
      }

      if (!value.startsWith("$$$")) {
        return value;
      }
      return Buffer.from(value.substring(3), "base64").toString("utf8");
    };
    
    // Immutable properties
    Object.defineProperty(this, "name", Object.assign({}, propertyConfig, {value: options.name}));
    Object.defineProperty(this, "domain", Object.assign({}, propertyConfig, {value: options.domain}));
    Object.defineProperty(this, "username", Object.assign({}, propertyConfig, {value: options.username}));
    Object.defineProperty(this, "password", Object.assign({}, propertyConfig, {value: decode(options.password)}));
    Object.defineProperty(this, "proxy", Object.assign({}, propertyConfig, {value: decode(options.proxy) || null}));
    Object.defineProperty(this, "properties", Object.assign({}, propertyConfig, {value: options.properties ? new Map(Object.entries(options.properties)) : new Map()}));
    // Internal!
    Object.defineProperty(this, "version", Object.assign({}, propertyConfig, {value: options.version || version}));

    // Utilize version checker if necessary; prevent using old and potentially incompatible profiles
    if (this.version !== version) {
      throw new Error(`Unable to initialize profile version ${this.version} against version ${version}!`);
    }
  }

  createRequest() {
    return new NowRequest({
      domain: this.domain,
      username: this.username,
      password: this.password,
      proxy: this.proxy || null
    });
  }

  createInstance() {
    return new NowInstance(this.domain, this.username, this.password, this.proxy || null);
  }

  createReportGenerator(docDef) {
    // if (this.customGeneratorClassPath != null) {
    //   // require from current working directory or profile main directory
    //   const generator = require(`${this.customGeneratorClassPath}`);
    //   return new generator(docDef);
    // }
    return new NowReportGenerator(docDef);
  }

  setTables(tables) {
    this.tables = tables;
  }

  hasTable(table) {
    if (this.tables[table] != null) {
      return true;
    }
    return false;
  }

  getTableFields(table) {
    if (!this.hasTable(table)) {
      return [];
    }
    return this.tables[table].fields;
  }

  toJSON() {
    const encode = (value) => {
      if (value == null || value === "") {
        return null;
      }

      return ["$$$", Buffer.from(value, "utf8").toString("base64")].join("");
    };

    return {
      "name": this.name,
      "domain": this.domain,
      "username": this.username,
      "password": encode(this.password),
      "proxy": encode(this.proxy),
      "version": this.version,
      "properties": Object.fromEntries(this.properties.entries()),
      "tables": this.tables
    };
  }

  static loadProfile(profileName) {
    throw new Error("TODO:");
  }

  static saveProfile(profile) {
    const json = JSON.stringify(profile);
    const folderName = profile.name;


    throw new Error("TODO:");
  }
}

module.exports = NowProfile;