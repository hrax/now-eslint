const Assert = require("./util/Assert");
const NowInstance = require("./now/NowInstance");
const NowReportGenerator = require("./NowReportGenerator");

class NowProfile {
  constructor(options) {
    Assert.notNull(options, "Options cannot be null!");
    Assert.isObject(options, "Options needs to be an object!");
    
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
    Object.defineProperty(this, "password", Object.assign({}, propertyConfig, {value: options.password}));
    Object.defineProperty(this, "generatorClassName", Object.assign({}, propertyConfig, {value: options.generatorClassName || null}));
    // Object.defineProperty(this, "tables", Object.assign({}, propertyConfig, {value: Object.assign({}, options.tables || {})}));
  }

  createInstance(proxy) {
    return new NowInstance(this.domain, this.username, this.password, proxy || null);
  }

  createGenerator(docDef) {
    if (this.generatorClassName != null) {
      // require from current working directory or profile main directory
      require(`./${this.generatorClassName}`);
      return new this.generatorClassName(docDef);
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
    return this.tables[table];
  }

  static loadProfile(profileName) {
    throw new Error("TODO:");
  }

  static saveProfile(profile) {
    throw new Error("TODO:");
  }
}

module.exports = NowProfile;