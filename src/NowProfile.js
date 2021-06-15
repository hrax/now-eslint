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
    
    // Immutable properties
    Object.defineProperty(this, "name", Object.assign({}, propertyConfig, {value: options.name}));
    Object.defineProperty(this, "domain", Object.assign({}, propertyConfig, {value: options.domain}));
    Object.defineProperty(this, "username", Object.assign({}, propertyConfig, {value: options.username}));
    Object.defineProperty(this, "password", Object.assign({}, propertyConfig, {
      value: options.password.startsWith("$$$") ? Buffer.from(options.password.substring(3), "base64").toString("utf8") : options.password
    }));
    Object.defineProperty(this, "proxy", Object.assign({}, propertyConfig, {
      value: options.proxy != null && options.proxy.startsWith("$$$") ? Buffer.from(options.proxy.substring(3), "base64").toString("utf8") : options.proxy || null
    }));
    Object.defineProperty(this, "customGeneratorClassPath", Object.assign({}, propertyConfig, {value: options.customGeneratorClassPath || null}));
    Object.defineProperty(this, "version", Object.assign({}, propertyConfig, {value: options.version || version}));
    // TODO: Profile properties, that can be extended in ESLint, which should include ESLint configuration, maybe move generatorclasspath into these properties as well
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
    if (this.customGeneratorClassPath != null) {
      // require from current working directory or profile main directory
      const generator = require(`${this.customGeneratorClassPath}`);
      return new generator(docDef);
    }
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
    return {
      "name": this.name,
      "domain": this.domain,
      "username": this.username,
      "password": "$$$" + Buffer.from(this.password, "utf8").toString("base64"),
      "proxy": this.proxy == null ? null : "$$$" + Buffer.from(this.proxy, "utf8").toString("base64"),
      "customGeneratorClassPath": this.customGeneratorClassPath,
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