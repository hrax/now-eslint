const Assert = require("./util/Assert");
const NowInstance = require("./now/NowInstance");

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
    Object.defineProperty(this, "password", Object.assign({}, propertyConfig, {value: options.profile}));
    // Object.defineProperty(this, "tables", Object.assign({}, propertyConfig, {value: Object.assign({}, options.tables || {})}));
  }

  createInstance(proxy) {
    return new NowInstance(this.domain, this.username, this.password, proxy || null);
  }

  setTables() {}

  addTable() {}
  
  hasTable(table) {}

  getTableFields(table) {}

  getTableFieldDefault(table, field) {}
}

module.exports = NowProfile;